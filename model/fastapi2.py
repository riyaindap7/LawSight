
import json
import pickle
import torch
import os
import re
import logging
import numpy as np
import faiss
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi.middleware.cors import CORSMiddleware
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

# Initialize FastAPI app
app = FastAPI()
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.101:3000"
]
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=origins,  # Allow requests from the frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
# MODEL_DIR = "./Model/bert_ipc_classifier_epoch12_acc0.9799"
MODEL_DIR = "./Model"
SIMILARITY_MODEL_DIR = "C:/Users/Sachi/OneDrive/Desktop/lawsight/LawSight/model/Case_Prediction/SimilarityModel"
THRESHOLD = 0.3
IPC_DESCRIPTIONS_FILE = "ipc_labels.json"

# Logger setup
logging.basicConfig(level=logging.INFO)

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


def load_ipc_model():
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

    logging.info(f"✅ IPC Section Prediction Model loaded successfully from {latest_model_path}")
    return model, tokenizer, mlb


try:
    ipc_model, ipc_tokenizer, ipc_mlb = load_ipc_model()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ipc_model.to(device)
    logging.info(f"✅ IPC Section Prediction model initialized with {len(ipc_mlb.classes_)} IPC sections")
except Exception as e:
    logging.error(f"❌ IPC model loading failed: {e}")
    ipc_model, ipc_tokenizer, ipc_mlb = None, None, None

# Replace your current CaseSimilarityModel class with this updated version

class CaseSimilarityModel:
    def __init__(self, embedding_model_name="sentence-transformers/LaBSE"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.embedding_model = SentenceTransformer(embedding_model_name, device=str(self.device))
        self.case_database = {
            'ids': [],
            'texts': [],
            'ipc_sections': [],
            'metadata': [],
            'embeddings': []
        }
        self.index = None
        self.embedding_dim = None
        self.config = None  # Will store configuration loaded from model directory
        
        # These will be determined during load()
        self.use_text_embeddings = True
        self.use_ipc_embeddings = False  # Default to False, will update based on config
        self.ipc_mlb = None  # Will be loaded if needed

    def load(self, model_dir):
        try:
            # Load configuration
            config_path = os.path.join(model_dir, "config.json")
            if os.path.exists(config_path):
                with open(config_path, "r") as f:
                    self.config = json.load(f)
                    self.use_text_embeddings = self.config.get('use_text_embeddings', True)
                    self.use_ipc_embeddings = self.config.get('use_ipc_embeddings', False)
                    logging.info(f"Loaded config - use_text_embeddings: {self.use_text_embeddings}, use_ipc_embeddings: {self.use_ipc_embeddings}")
            else:
                logging.warning(f"Config file not found at {config_path}, using defaults")
                self.config = {
                    'use_text_embeddings': True,
                    'use_ipc_embeddings': False
                }

            # Load case database
            case_database_path = os.path.join(model_dir, "case_database.pkl")
            embeddings_path = os.path.join(model_dir, "embeddings.npy")
            index_path = os.path.join(model_dir, "case_index.faiss")

            if not os.path.exists(case_database_path):
                raise FileNotFoundError(f"⚠️ Case database file {case_database_path} not found!")
            if not os.path.exists(embeddings_path):
                raise FileNotFoundError(f"⚠️ Embeddings file {embeddings_path} not found!")
            if not os.path.exists(index_path):
                raise FileNotFoundError(f"⚠️ FAISS index file {index_path} not found!")

            with open(case_database_path, "rb") as f:
                self.case_database = pickle.load(f)

            embeddings = np.load(embeddings_path)
            self.case_database['embeddings'] = embeddings.tolist()
            
            # Load the IPC multilabel binarizer if needed
            if self.use_ipc_embeddings and 'ipc_mlb_path' in self.config:
                ipc_mlb_path = os.path.join(model_dir, self.config['ipc_mlb_path'])
                if os.path.exists(ipc_mlb_path):
                    with open(ipc_mlb_path, "rb") as f:
                        self.ipc_mlb = pickle.load(f)
                    logging.info(f"Loaded IPC multilabel binarizer with {len(self.ipc_mlb.classes_)} classes")
                else:
                    logging.warning(f"IPC multilabel binarizer not found at {ipc_mlb_path}, IPC embeddings disabled")
                    self.use_ipc_embeddings = False

            # Load FAISS index
            self.index = faiss.read_index(index_path)
            self.embedding_dim = self.index.d
            
            # Check if embedding dimension matches expected dimension
            if 'embedding_dim' in self.config and self.config['embedding_dim'] != self.embedding_dim:
                logging.warning(f"Config embedding dimension ({self.config['embedding_dim']}) doesn't match index dimension ({self.embedding_dim})")
            
            # Test embedding generation
            test_text = "Test embedding dimension"
            test_embed = self.get_combined_embedding(test_text)
            logging.info(f"Test embedding dimension: {test_embed.shape[0]}, Index dimension: {self.embedding_dim}")
            
            if test_embed.shape[0] != self.embedding_dim:
                logging.error(f"⚠️ Embedding model produces vectors of dimension {test_embed.shape[0]}, but index expects {self.embedding_dim}")
                # We'll handle dimension mismatches in the find_similar_cases method
            
            logging.info(f"✅ Case similarity model loaded successfully from {model_dir}")
            
        except Exception as e:
            logging.error(f"❌ Error loading case similarity model: {e}")
            raise HTTPException(status_code=500, detail=f"Error loading similarity model: {e}")
    
    def get_text_embedding(self, text):
        """Get text embedding from the SentenceTransformer model"""
        if not self.use_text_embeddings:
            return np.array([])
            
        with torch.no_grad():
            embedding = self.embedding_model.encode(text, convert_to_tensor=True)
            embedding = embedding.cpu().numpy()
        return embedding
    
    def get_ipc_embedding(self, text, ipc_sections=None):
        """Get IPC section embedding"""
        if not self.use_ipc_embeddings or self.ipc_mlb is None:
            return np.array([])
            
        # If IPC sections are provided, use them
        if ipc_sections is not None:
            predicted_labels = ipc_sections
        else:
            # We don't have an IPC prediction model here, so just use empty labels
            # In a complete implementation, you should add the IPC prediction here
            predicted_labels = []
        
        # Create one-hot encoding using the MLBinarizer
        ipc_vector = np.zeros(len(self.ipc_mlb.classes_))
        for label in predicted_labels:
            if label in self.ipc_mlb.classes_:
                idx = np.where(self.ipc_mlb.classes_ == label)[0][0]
                ipc_vector[idx] = 1
                
        return ipc_vector
    
    def get_combined_embedding(self, text, ipc_sections=None):
        """Combine text and IPC embeddings based on configuration"""
        embeddings = []
        
        # Add text embedding if enabled
        if self.use_text_embeddings:
            text_embedding = self.get_text_embedding(text)
            if text_embedding.size > 0:
                embeddings.append(text_embedding)
            
        # Add IPC embedding if enabled
        if self.use_ipc_embeddings and self.ipc_mlb is not None:
            ipc_vector = self.get_ipc_embedding(text, ipc_sections)
            if ipc_vector.size > 0:
                embeddings.append(ipc_vector)
            
        # Concatenate embeddings
        if not embeddings:
            raise ValueError("Neither text nor IPC embeddings are enabled.")
            
        combined = np.concatenate(embeddings)
        return combined


    def resize_embedding(self, embedding, target_dim):
        """
        Resize embedding to match target dimension using a more sophisticated approach.
        """
        current_dim = embedding.shape[0]

        if current_dim == target_dim:
            return embedding

        if current_dim < target_dim:
            # Calculate padding on each side
            padding = target_dim - current_dim
            # Create padding array with small random noise instead of zeros
            # This helps prevent artificial clustering of padded embeddings
            pad_noise = np.random.normal(0, 0.01, padding)
            # Normalize the noise to have similar magnitude as original embedding
            if np.linalg.norm(embedding) > 0:
                pad_noise = pad_noise * (np.linalg.norm(embedding) / np.linalg.norm(pad_noise)) * 0.01
            return np.concatenate([embedding, pad_noise])
        else:
            # If we need to reduce dimensions, use PCA-like approach to preserve variance
            # For simplicity, we'll use the first target_dim components
            # In production, consider using actual PCA or other dimension reduction techniques
            return embedding[:target_dim]


    def find_similar_cases(self, query_text, top_k=5):
        if self.index is None or self.index.ntotal == 0:
            raise HTTPException(status_code=500, detail="⚠️ Similarity model index is not built or empty!")

        try:
            # Generate combined embedding for the query
            query_embedding = self.get_combined_embedding(query_text)
            
            # Check for dimension mismatch
            if query_embedding.shape[0] != self.embedding_dim:
                logging.warning(f"Query embedding dimension {query_embedding.shape[0]} doesn't match index dimension {self.embedding_dim}")
                query_embedding = self.resize_embedding(query_embedding, self.embedding_dim)
                logging.info(f"Resized query embedding to match index dimension {self.embedding_dim}")
            
            query_embedding = np.expand_dims(query_embedding, axis=0).astype('float32')

            # Search the FAISS index
            distances, indices = self.index.search(query_embedding, top_k)
            results = []
            for idx, distance in zip(indices[0], distances[0]):
                if idx < len(self.case_database['ids']):
                    # Get case details
                    case_id = self.case_database['ids'][idx]
                    case_text = self.case_database['texts'][idx]
                    
                    # Get IPC sections if available
                    ipc_sections = []
                    if 'ipc_sections' in self.case_database and idx < len(self.case_database['ipc_sections']):
                        ipc_sections = self.case_database['ipc_sections'][idx]
                    
                    # Get metadata if available
                    metadata = {}
                    if 'metadata' in self.case_database and idx < len(self.case_database['metadata']):
                        metadata = self.case_database['metadata'][idx]
                    
                    # Calculate similarity score
                    similarity = 1 / (1 + distance)
                    
                    results.append({
                        "case_id": case_id,
                        "case_text": case_text,
                        "ipc_sections": ipc_sections,
                        "metadata": metadata,
                        "similarity": float(similarity)
                    })
            
            # Sort by similarity (highest first)
            results.sort(key=lambda x: x['similarity'], reverse=True)
            return results
            
        except Exception as e:
            logging.error(f"❌ Error during similarity search: {e}")
            raise HTTPException(status_code=500, detail=f"Similarity search failed: {str(e)}")



# Legal keyword validation
def is_valid_case_description(text):
    if len(text.split()) < 10:
        return False, "⚠️ Text is too short to be a valid case description."

    legal_keywords = {
    # Original legal terms
    'accused', 'victim', 'complainant', 'theft', 'assault', 'fraud', 'criminal',
    'crime', 'police', 'fir', 'charge', 'court', 'law', 'murder', 'robbery',
    'arrest', 'bail', 'stolen', 'forgery', 'kidnap', 'threat', 'damage', 'case',
    'section', 'ipc', 'crpc', 'evidence', 'witness', 'investigation',
    'killed', 'dead', 'knife', 'gun', 'shot', 'beat', 'beaten', 'fight',
    'quarrel', 'argument', 'screaming', 'shouting', 'blood', 'bloodstained',
    'ran away', 'escaped', 'hurt', 'injury', 'injured', 'attack', 'attacked',
    'death', 'body', 'lying', 'unconscious', 'property dispute', 'revenge',
    'revenge attack', 'dispute', 'fight over land', 'molested', 'touched',
    'harassed', 'abused', 'misbehaved', 'intimidated', 'pushed', 'slapped',
    'hit', 'choked', 'strangled', 'broken into', 'entered forcefully',
    'came with a weapon', 'weapon', 'dangerous', 'killing', 'burned', 'acid',
    'threw acid', 'harmed', 'life threat', 'tried to kill', 'unwanted touch',
    'forcefully entered', 'destroyed', 'vandalized', 'suspicious activity',
    'ran off', 'ran from scene', 'seen running', 'seen escaping',"stabbed"
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


# Text preprocessing
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation but keep words & spaces
    text = re.sub(r'\s+', ' ', text).strip()  # Normalize spaces
    return text


# Initialize Case Similarity Model
try:
    similarity_model = CaseSimilarityModel()
    similarity_model.load(SIMILARITY_MODEL_DIR)
except Exception as e:
    logging.error(f"❌ Case similarity model loading failed: {e}")
    similarity_model = None

# Pydantic models for request validation
class CaseRequest(BaseModel):
    text: str

class SimilarityRequest(BaseModel):
    query_text: str
    top_k: int = 5

# API Endpoint for IPC Section Prediction
@app.post("/predict/ipc")
async def predict_ipc(case: CaseRequest):
    if not ipc_model or not ipc_tokenizer or not ipc_mlb:
        raise HTTPException(status_code=500, detail="⚠️ IPC model not loaded properly!")

    is_valid, reason = is_valid_case_description(case.text)
    if not is_valid:
        return {"error": reason}
    
    ipc_model.eval()
    processed_text = preprocess_text(case.text)
    encoding = ipc_tokenizer(processed_text, padding='max_length', truncation=True, max_length=512, return_tensors='pt')
    inputs = {key: val.to(device) for key, val in encoding.items()}

    with torch.no_grad():
        outputs = ipc_model(**inputs)

    probabilities = torch.sigmoid(outputs.logits).cpu().numpy()[0]
    ranked_sections = sorted(
        [(ipc_mlb.classes_[i], float(probabilities[i])) for i in range(len(probabilities)) if probabilities[i] > THRESHOLD],
        key=lambda x: x[1], reverse=True
    )[:5]

    print("🔍 Ranked Sections:", ranked_sections)  # Debugging
    print("==========================================")
    print("🔍 Available IPC Description Keys:", list(ipc_descriptions.keys()))
    
    result_with_descriptions = []

    for sec, conf in ranked_sections:
        print("\n==========================================\n")
        print("sec : ", sec)
        print("\n==========================================\n")
        print("conf : ", conf)
        print("\n==========================================\n")
        new_sec = re.findall(r"\d+[A-Z]?", sec)[0]
        print("new_sec : ", new_sec)
        print("\n==========================================\n")
        
        section_key = sec.split(" in ")[0]  # Ensure the key format matches JSON structure
        
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


# @app.post("/predict/similar")
# async def predict_similar_cases(request: SimilarityRequest):
#     if not similarity_model:
#         raise HTTPException(status_code=500, detail="⚠️ Similarity model not loaded properly!")

#     try:
#         results = similarity_model.find_similar_cases(request.query_text, top_k=request.top_k)
        
#         # Format results to maintain compatibility with original API
#         formatted_results = []
#         for result in results:
#             formatted_result = {
#                 "case_id": result["case_id"],
#                 "case_text": result["case_text"],
#                 "similarity": result["similarity"]
#             }
            
#             # Add optional fields if they exist and have content
#             if "ipc_sections" in result and result["ipc_sections"]:
#                 formatted_result["ipc_sections"] = result["ipc_sections"]
                
#             if "metadata" in result and result["metadata"]:
#                 formatted_result["metadata"] = result["metadata"]
                
#             formatted_results.append(formatted_result)
            
#         return {"similar_cases": formatted_results}
#     except Exception as e:
#         logging.error(f"❌ Error in predict_similar_cases: {e}")
#         raise HTTPException(status_code=500, detail=str(e))



@app.post("/predict/similar")
async def predict_similar_cases(request: SimilarityRequest):
    if not similarity_model:
        raise HTTPException(status_code=500, detail="⚠️ Similarity model not loaded properly!")

    # Add validation check
    is_valid, reason = is_valid_case_description(request.query_text)
    if not is_valid:
        return {"error": reason}

    try:
        results = similarity_model.find_similar_cases(request.query_text, top_k=request.top_k)
        
        # Format results to maintain compatibility with original API
        formatted_results = []
        for result in results:
            formatted_result = {
                "case_id": result["case_id"],
                "case_text": result["case_text"],
                "similarity": result["similarity"]
            }
            
            # Add optional fields if they exist and have content
            if "ipc_sections" in result and result["ipc_sections"]:
                formatted_result["ipc_sections"] = result["ipc_sections"]
                
            if "metadata" in result and result["metadata"]:
                formatted_result["metadata"] = result["metadata"]
                
            formatted_results.append(formatted_result)
            
        return {"similar_cases": formatted_results}
    except Exception as e:
        logging.error(f"❌ Error in predict_similar_cases: {e}")
        raise HTTPException(status_code=500, detail=str(e))


















