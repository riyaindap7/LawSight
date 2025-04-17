from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import pickle
import torch
import os
import re
import logging
from pydantic import BaseModel, validator
from transformers import BertTokenizer, BertForSequenceClassification

# Initialize FastAPI
app = FastAPI()

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Hardcoded path to model directory
MODEL_DIR = "./model/Model"
THRESHOLD = 0.3  # Minimum confidence threshold

# Setup logging
logging.basicConfig(level=logging.INFO)

# Load IPC descriptions
def load_ipc_descriptions():
    try:
        with open('ipc_labels.json', 'r', encoding="utf-8") as f:
            ipc_descriptions = json.load(f)
        logging.info("✅ IPC descriptions loaded successfully.")
        return ipc_descriptions
    except Exception as e:
        logging.error(f"❌ Error loading IPC descriptions: {e}")
        raise HTTPException(status_code=500, detail="IPC descriptions loading failed")

# Load the model and tokenizer
def load_model():
    try:
        latest_model_file = os.path.join(MODEL_DIR, "latest_model.txt")
        if not os.path.exists(latest_model_file):
            raise FileNotFoundError("Latest model file not found")
        
        with open(latest_model_file, "r") as f:
            latest_model_path = f.read().strip()
        
        if not os.path.exists(latest_model_path):
            raise FileNotFoundError("Model path is invalid")
        
        with open(os.path.join(latest_model_path, "metadata.json"), "r") as f:
            metadata = json.load(f)
        
        with open(os.path.join(latest_model_path, "mlb.pkl"), "rb") as f:
            mlb = pickle.load(f)
        
        model = BertForSequenceClassification.from_pretrained(
            latest_model_path, num_labels=metadata["num_labels"], problem_type="multi_label_classification"
        )
        tokenizer = BertTokenizer.from_pretrained(latest_model_path)
        
        logging.info("✅ Model and tokenizer loaded successfully.")
        return model, tokenizer, mlb

    except Exception as e:
        logging.error(f"❌ Error loading model: {e}")
        raise HTTPException(status_code=500, detail="Model loading failed")

# Load model & tokenizer on startup
model, tokenizer, mlb = load_model()
ipc_descriptions = load_ipc_descriptions()
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Request model input structure
class CaseInput(BaseModel):
    case_text: str

    @validator('case_text')
    def case_text_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Case text cannot be empty')
        return v

# Preprocess function
def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ✅ Function to extract the correct IPC section key
def clean_section_key(raw_section):
    match = re.search(r"(Section \d+)", raw_section, re.IGNORECASE)
    return match.group(1) if match else raw_section  # Return cleaned key if found, otherwise original

# Predict IPC sections
def predict_ipc_sections(case_text: str):
    try:
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
        
        logging.info(f"🟢 Raw ranked sections: {ranked_sections}")
        
        result = []
        for raw_section, prob in ranked_sections:
            section_key = clean_section_key(raw_section)  # ✅ Extract "Section <number>"
            
            logging.info(f"🔍 Looking up IPC section: {section_key}")  # Debugging log
            
            ipc_info = ipc_descriptions.get(section_key, None)
            if ipc_info:
                title = ipc_info.get("title", "No title available.")
                description = ipc_info.get("description", "No description available.")
                logging.info(f"✅ Found IPC section: {section_key} - Title: {title}, Description: {description}")
            else:
                title, description = "No title available.", "No description available."
                logging.warning(f"⚠️ No description found for IPC section: {section_key}")
            
            result.append({
                "section": section_key,
                "title": title,
                "description": description,
                "probability": prob
            })
        
        logging.info("✅ Predictions made successfully.")
        return result

    except Exception as e:
        logging.error(f"❌ Error making predictions: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")

# API endpoint
@app.post("/predict")
def get_ipc_sections(case: CaseInput):
    predictions = predict_ipc_sections(case.case_text)
    
    if not predictions:
        return {"message": "No IPC sections found", "sections": []}
    
    return {"sections": predictions}
