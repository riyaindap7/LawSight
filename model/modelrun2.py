import json
import pickle
import torch
import re
import os
import string
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import argparse
from nltk.corpus import stopwords
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer

# Download NLTK resources (uncomment first time)
# nltk.download('stopwords')
# nltk.download('punkt')

# Hardcoded path to model directory
MODEL_DIR = "./Model"  # Change this to your model's directory path
THRESHOLD = 0.3  # Minimum confidence to consider a section

# Legal domain keywords and valid input criteria
LEGAL_KEYWORDS = [
    'accused', 'victim', 'complainant', 'theft', 'assault', 'fraud', 'criminal', 'offence',
    'offense', 'crime', 'police', 'fir', 'charge', 'court', 'law', 'illegal', 'murder',
    'robbery', 'injured', 'complaint', 'violation', 'cheating', 'forcibly', 'custody',
    'arrest', 'bail', 'stolen', 'forgery', 'kidnap', 'threat', 'damage', 'property',
    'case', 'section', 'ipc', 'crpc', 'evidence', 'witness', 'testified', 'injured',
    'allegation', 'alleged', 'report', 'investigation', 'prosecute', 'defendant'
]

def parse_arguments():
    parser = argparse.ArgumentParser(description='Predict IPC sections using trained Legal BERT model')
    parser.add_argument('--interactive', action='store_true', help='Run in interactive mode for multiple predictions')
    parser.add_argument('--case_text', type=str, default=None, help='Case text for prediction')
    return parser.parse_args()


def preprocess_text(text):
    """Preprocess text while retaining important legal references."""
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'\s+', ' ', text).strip()  # Normalize spaces
    return text


def is_valid_case_description(text):
    """
    Determines if the input text is likely a valid case description.
    Returns a tuple (is_valid, reason) where reason explains why it's invalid if applicable.
    """
    # Check minimum length (arbitrary threshold)
    if len(text.split()) < 10:
        return False, "Text is too short to be a valid case description."
   
    # Check if it contains legal keywords
    contains_legal_terms = any(keyword in text.lower() for keyword in LEGAL_KEYWORDS)
    if not contains_legal_terms:
        return False, "Text doesn't contain legal terminology."
   
    # Calculate stopword ratio - high ratio might indicate meaningless text
    try:
        stop_words = set(stopwords.words('english'))
        words = [word.lower() for word in text.split() if word.isalpha()]
        stopword_ratio = sum(1 for word in words if word in stop_words) / len(words) if words else 0
       
        if stopword_ratio > 0.7:  # Arbitrary threshold
            return False, "Text contains too many stopwords and not enough content."
    except:
        # If NLTK resources not available, skip this check
        pass
   
    # Check for repetitive text
    words = [word.lower() for word in text.split() if word.strip()]
    if len(words) > 5:
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.3:  # If less than 30% of words are unique, probably repetitive
            return False, "Text contains repetitive patterns, not likely a case description."
   
    # Check if it's just names or places (one-word tokens)
    words = [w for w in text.split() if w.strip() and w.strip() not in string.punctuation]
    if all(len(w) < 5 for w in words) and len(words) < 15:
        return False, "Input appears to be names or short phrases, not a case description."
   
    # If we passed all checks, consider it valid
    return True, ""


def load_model(model_dir=MODEL_DIR):
    """Load trained model, tokenizer, and label encoder."""
    print(f"Loading model from {model_dir}...")
   
    latest_model_file = os.path.join(model_dir, "./Model/latest_model.txt")
    if not os.path.exists(latest_model_file):
        raise FileNotFoundError(f"Latest model file {latest_model_file} not found")
   
    with open(latest_model_file, "r") as f:
        latest_model_path = f.read().strip()
   
    if not os.path.exists(latest_model_path):
        raise FileNotFoundError(f"Model path {latest_model_path} is invalid")
   
    # Load metadata & label encoder
    with open(os.path.join(latest_model_path, "metadata.json"), "r") as f:
        metadata = json.load(f)
    with open(os.path.join(latest_model_path, "mlb.pkl"), "rb") as f:
        mlb = pickle.load(f)
   
    # Load model & tokenizer - using AutoModelForSequenceClassification to be compatible with Legal BERT
    model = AutoModelForSequenceClassification.from_pretrained(latest_model_path, num_labels=metadata["num_labels"], problem_type="multi_label_classification")
    tokenizer = AutoTokenizer.from_pretrained(latest_model_path)
   
    print(f"Model loaded successfully from {latest_model_path}")
    print(f"Trained for {metadata['epoch']} epochs with accuracy: {metadata['accuracy']:.4f}")
   
    return model, tokenizer, mlb


def predict_ipc_sections(model, tokenizer, mlb, case_text, device, max_length=512):
    """Predict top 5 IPC sections for a given case."""
    # First validate if this is a legitimate case description
    is_valid, reason = is_valid_case_description(case_text)
    if not is_valid:
        return [], reason
   
    # Proceed with prediction
    model.eval()
    processed_text = preprocess_text(case_text)
   
    encoding = tokenizer(processed_text, padding='max_length', truncation=True, max_length=max_length, return_tensors='pt')
    inputs = {key: val.to(device) for key, val in encoding.items()}
   
    with torch.no_grad():
        outputs = model(**inputs)
   
    probabilities = torch.sigmoid(outputs.logits).cpu().numpy()[0]
   
    # Get top 5 sections above threshold
    ranked_sections = sorted(
        [(mlb.classes_[i], float(probabilities[i])) for i in range(len(probabilities)) if probabilities[i] > THRESHOLD],
        key=lambda x: x[1], reverse=True
    )[:5]  # Take top 5
   
    return ranked_sections, "Valid case description detected."


def display_predictions(predictions, reason=""):
    """Display predictions in a structured format."""
    # Check if predictions is empty due to invalid input
    if isinstance(predictions, list) and not predictions and reason:
        print(f"\n❌ {reason}")
        return
   
    if not predictions:
        print("\n❌ No IPC sections predicted for this case (all below threshold)")
        return
   
    print("\n🔍 Top 5 Predicted IPC Sections:")
    print("-" * 60)
    print(f"{'IPC Section':<30} {'Confidence':<15} {'Bar'}")
    print("-" * 60)
   
    for section, prob in predictions:
        bar_length = int(prob * 20)
        bar = "█" * bar_length
        print(f"{section:<30} {prob:.4f} ({prob*100:.1f}%)  {bar}")
   
    print("-" * 60)


def main():
    args = parse_arguments()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
   
    try:
        model, tokenizer, mlb = load_model()
        model.to(device)
        print(f"Model loaded with {len(mlb.classes_)} IPC sections")
    except Exception as e:
        print(f"Error loading model: {e}")
        return
   
    if args.interactive or not args.case_text:
        print("\n===== IPC Section Predictor =====")
        print("Enter case details to predict relevant IPC sections.")
        print("Type 'exit', 'quit', or 'q' to quit.")
        print("=" * 35)
       
        while True:
            print("\nEnter case description:")
            case_text = input("> ")
           
            if case_text.lower() in ['exit', 'quit', 'q']:
                print("Exiting...")
                break
           
            if not case_text.strip():
                print("Please enter a valid case description")
                continue
           
            predictions, reason = predict_ipc_sections(model, tokenizer, mlb, case_text, device)
            display_predictions(predictions, reason)
    else:
        predictions, reason = predict_ipc_sections(model, tokenizer, mlb, args.case_text, device)
        display_predictions(predictions, reason)


if __name__ == "__main__":
    main()