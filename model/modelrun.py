# import json
# import torch
# import re
# import os
# from transformers import BertTokenizer, BertForSequenceClassification
# import pickle

# def preprocess_text(text):
#     text = text.lower()
#     text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
#     text = re.sub(r'\s+', ' ', text).strip()
#     return text

# def load_latest_model():
#     latest_model_path = "model/latest_model.txt"

#     if os.path.exists(latest_model_path):
#         with open(latest_model_path, "r") as f:
#             model_path = f.read().strip()
#         print(f"Using latest model from: {model_path}")
#         return model_path
#     else:
#         print("Error: latest_model.txt not found! Please enter model path manually.")
#         return input("Enter the model directory path: ").strip()

# def load_model(model_path):
#     print(f"Loading model from {model_path}...")

#     with open(f"{model_path}/metadata.json", "r") as f:
#         metadata = json.load(f)

#     with open(f"{model_path}/mlb.pkl", "rb") as f:
#         mlb = pickle.load(f)

#     # Check if model.safetensors exists
#     safetensors_path = os.path.join(model_path, "model.safetensors")
#     if os.path.exists(safetensors_path):
#         model = BertForSequenceClassification.from_pretrained(model_path, num_labels=len(mlb.classes_), 
#                                                                problem_type="multi_label_classification",
#                                                                use_safetensors=True)  # Correct way to load SafeTensors
#     else:
#         raise FileNotFoundError(f"Error: model.safetensors is missing in {model_path}.")

#     tokenizer = BertTokenizer.from_pretrained(model_path)

#     return model, tokenizer, mlb


# def predict_ipc_sections(model, tokenizer, mlb, complaint_text, device, max_length=512):
#     model.eval()
#     complaint_text = preprocess_text(complaint_text)
    
#     encoding = tokenizer(
#         complaint_text, 
#         padding='max_length', 
#         truncation=True, 
#         max_length=max_length, 
#         return_tensors='pt'
#     )
    
#     inputs = {key: val.to(device) for key, val in encoding.items()}

#     with torch.no_grad():
#         outputs = model(**inputs)
    
#     preds = torch.sigmoid(outputs.logits).cpu().numpy()[0]
#     threshold = 0.5
#     predicted_labels = [mlb.classes_[i] for i, val in enumerate(preds) if val > threshold]
#     predicted_probs = {mlb.classes_[i]: float(val) for i, val in enumerate(preds) if val > threshold}
    
#     return predicted_labels, predicted_probs

# def main():
#     model_dir = load_latest_model()
#     model, tokenizer, mlb = load_model(model_dir)
    
#     device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#     model.to(device)
    
#     while True:
#         complaint_text = input("\nEnter the complaint text (or type 'exit' to quit): ")
#         if complaint_text.lower() == 'exit':
#             print("Exiting...")
#             break
        
#         predicted_labels, predicted_probs = predict_ipc_sections(model, tokenizer, mlb, complaint_text, device)
        
#         if predicted_labels:
#             print("\nPredicted IPC Sections:")
#             for label in predicted_labels:
#                 print(f"- {label} (Confidence: {predicted_probs[label]:.4f})")
#         else:
#             print("\nNo IPC Sections detected with confidence > 0.5.")

# if __name__ == "__main__":
#     main()







import json
import pickle
import torch
import re
import os
from transformers import BertTokenizer, BertForSequenceClassification
import argparse

# Hardcoded path to model directory
MODEL_DIR = "./Model"  # Change this to your model's directory path
THRESHOLD = 0.3  # Minimum confidence to consider a section


def parse_arguments():
    parser = argparse.ArgumentParser(description='Predict IPC sections using trained BERT model')
    parser.add_argument('--interactive', action='store_true', help='Run in interactive mode for multiple predictions')
    parser.add_argument('--case_text', type=str, default=None, help='Case text for prediction')
    return parser.parse_args()


def preprocess_text(text):
    """Preprocess text while retaining important legal references."""
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'\s+', ' ', text).strip()  # Normalize spaces
    return text


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
    
    # Load model & tokenizer
    model = BertForSequenceClassification.from_pretrained(latest_model_path, num_labels=metadata["num_labels"], problem_type="multi_label_classification")
    tokenizer = BertTokenizer.from_pretrained(latest_model_path)
    
    print(f"Model loaded successfully from {latest_model_path}")
    print(f"Trained for {metadata['epoch']} epochs with accuracy: {metadata['accuracy']:.4f}")
    
    return model, tokenizer, mlb


def predict_ipc_sections(model, tokenizer, mlb, case_text, device, max_length=512):
    """Predict top 5 IPC sections for a given case."""
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
    
    return ranked_sections


def display_predictions(predictions):
    """Display predictions in a structured format."""
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
            
            predictions = predict_ipc_sections(model, tokenizer, mlb, case_text, device)
            display_predictions(predictions)
    else:
        predictions = predict_ipc_sections(model, tokenizer, mlb, args.case_text, device)
        display_predictions(predictions)


if __name__ == "__main__":
    main()