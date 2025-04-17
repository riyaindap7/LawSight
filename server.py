from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import json

app = FastAPI()

# Load model and tokenizer
model_path = "model/bert_ipc_classifier_epoch12_acc0.9799"
model = BertForSequenceClassification.from_pretrained(model_path)
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Load IPC labels
with open("ipc_labels.json") as f:
    ipc_labels = json.load(f)

class ComplaintRequest(BaseModel):
    complaint: str

@app.post("/predict")
def predict(data: ComplaintRequest):
    tokens = tokenizer(data.complaint, return_tensors="pt", truncation=True, padding=True, max_length=512)
    
    with torch.no_grad():
        outputs = model(**tokens)
        probabilities = torch.sigmoid(outputs.logits).squeeze().tolist()

    # Apply threshold (e.g., 0.5)
    threshold = 0.3
    predicted_labels = [label for prob, label in zip(probabilities, ipc_labels) if prob > threshold]

    return {"sections": [{"section": sec, "description": ipc_labels[sec]} for sec in predicted_labels]}

