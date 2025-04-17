import json
import pickle
import torch
import os
import re
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi.middleware.cors import CORSMiddleware
from nltk.corpus import stopwords
import nltk

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MODEL_DIR = "./Model"
THRESHOLD = 0.3
IPC_DESCRIPTIONS_FILE = "ipc_labels.json"

# Logger setup
logging.basicConfig(level=logging.INFO)

# Ensure stopwords are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load IPC Descriptions
def load_ipc_descriptions():
    try:
        with open(IPC_DESCRIPTIONS_FILE, 'r', encoding="utf-8") as f:
            ipc_descriptions = json.load(f)
        logging.info("✅ IPC descriptions loaded successfully.")
        return ipc_descriptions
    except Exception as e:
        logging.error(f"❌ Error loading IPC descriptions: {e}")
        raise HTTPException(status_code=500, detail="IPC descriptions loading failed")

ipc_descriptions = load_ipc_descriptions()

# Load model
def load_model():
    logging.info(f"🔄 Loading model from {MODEL_DIR}...")
    latest_model_file = os.path.join(MODEL_DIR, "./Model/latest_model.txt")
    
    if not os.path.exists(latest_model_file):
        raise FileNotFoundError(f"⚠️ Latest model file {latest_model_file} not found!")

    with open(latest_model_file, "r") as f:
        latest_model_path = f.read().strip()

    if not os.path.exists(latest_model_path):
        raise FileNotFoundError(f"⚠️ Model path {latest_model_path} is invalid!")

    with open(os.path.join(latest_model_path, "metadata.json"), "r") as f:
        metadata = json.load(f)
    with open(os.path.join(latest_model_path, "mlb.pkl"), "rb") as f:
        mlb = pickle.load(f)

    model = AutoModelForSequenceClassification.from_pretrained(
        latest_model_path, num_labels=metadata["num_labels"], problem_type="multi_label_classification"
    )
    tokenizer = AutoTokenizer.from_pretrained(latest_model_path)

    logging.info(f"✅ Model loaded successfully from {latest_model_path}")
    return model, tokenizer, mlb

try:
    model, tokenizer, mlb = load_model()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    logging.info(f"✅ Model initialized with {len(mlb.classes_)} IPC sections")
except Exception as e:
    logging.error(f"❌ Model loading failed: {e}")
    model, tokenizer, mlb = None, None, None

# Pydantic model for request validation
class CaseRequest(BaseModel):
    text: str

# Text preprocessing
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation but keep words & spaces
    text = re.sub(r'\s+', ' ', text).strip()  # Normalize spaces
    return text

# Legal keyword validation
def is_valid_case_description(text):
    if len(text.split()) < 10:
        return False, "⚠️ Text is too short to be a valid case description."

    legal_keywords = {
        'accused', 'victim', 'complainant', 'theft', 'assault', 'fraud', 'criminal',
        'crime', 'police', 'fir', 'charge', 'court', 'law', 'murder', 'robbery',
        'arrest', 'bail', 'stolen', 'forgery', 'kidnap', 'threat', 'damage', 'case',
        'section', 'ipc', 'crpc', 'evidence', 'witness', 'investigation'
    }
    
    words_in_text = set(text.lower().split())
    contains_legal_terms = bool(words_in_text & legal_keywords)

    if not contains_legal_terms:
        return False, "⚠️ Text does not contain sufficient legal terminology."
    
    stop_words = set(stopwords.words('english'))
    words = [word for word in words_in_text if word.isalpha()]
    
    stopword_ratio = sum(1 for word in words if word in stop_words) / len(words) if words else 0
    if stopword_ratio > 0.7:
        return False, "⚠️ Text contains too many stopwords and lacks substance."

    return True, ""

# IPC Section Prediction
def predict_ipc_sections(case_text):
    if not model or not tokenizer or not mlb:
        raise HTTPException(status_code=500, detail="⚠️ Model not loaded properly!")

    is_valid, reason = is_valid_case_description(case_text)
    if not is_valid:
        return {"error": reason}
    
    model.eval()
    processed_text = preprocess_text(case_text)
    encoding = tokenizer(processed_text, padding='max_length', truncation=True, max_length=512, return_tensors='pt')
    inputs = {key: val.to(device) for key, val in encoding.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    probabilities = torch.sigmoid(outputs.logits).cpu().numpy()[0]
    ranked_sections = sorted(
        [(mlb.classes_[i], float(probabilities[i])) for i in range(len(probabilities)) if probabilities[i] > THRESHOLD],
        key=lambda x: x[1], reverse=True
    )[:5]

    print("🔍 Ranked Sections:", ranked_sections)  # Debugging
    print("==========================================")
    print("🔍 Available IPC Description Keys:", list(ipc_descriptions.keys()))
    result_with_descriptions = []

    


    for sec, conf in ranked_sections:
        print("\n==========================================\n")
        print("sec : " , sec)
        print("\n==========================================\n")
        print("conf : " , conf)
        print("\n==========================================\n")
        new_sec = re.findall(r"\d+[A-Z]?", sec)[0]
        print("new_sec : " , new_sec)
        print("\n==========================================\n")
        # section_key = f"Section {sec}"  # Ensure the key format matches JSON structure
        section_key = sec.split(" in ")[0] # Ensure the key format matches JSON structure
        # section_key = sec.split(" in ")[0]
        
        if section_key in ipc_descriptions:
            title = ipc_descriptions[section_key].get("title", "⚠️ Title not available.")
            description = ipc_descriptions[section_key].get("description", "⚠️ Description not available.")
        else:
            title = "⚠️ Title not available."
            description = "⚠️ Description not available."

        result_with_descriptions.append({
            "section": sec,
            "confidence": round(conf, 4),
            "title": title,
            "description": description
        })

    print("Final Results:", result_with_descriptions)  # Debugging

    return {"sections": result_with_descriptions}


# API Endpoint
@app.post("/predict")
async def predict(case: CaseRequest):
    return predict_ipc_sections(case.text)






# ====================================== Tanmay's Case Prediction CODE ======================================

