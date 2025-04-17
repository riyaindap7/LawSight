# File: python/generate_fir.py
import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai

# Add your existing functions here (from your original code)
from fir_generator import generate_legal_narrative, create_fir_document, determine_applicable_sections

# Load API key
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def main():
    # Get data file path and output path from command line arguments
    data_file = sys.argv[1]
    output_path = sys.argv[2]
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.loads(f.read())
    
    extracted_data = data["extractedData"]
    additional_info = data["additionalInfo"]
    
    # Generate narrative for FIR
    narrative = generate_legal_narrative(extracted_data, additional_info)
    
    # Create the Word document
    output_file = create_fir_document(narrative, {**extracted_data, **additional_info}, output_path)
    
    # Prepare summary for frontend
    summary = {
        "complainant_name": extracted_data.get('complainant_name', additional_info.get('complainant_name', 'Not specified')),
        "type_of_theft": extracted_data.get('type_of_theft', 'Not specified'),
        "date_time": extracted_data.get('date_time', additional_info.get('date_time', 'Not specified')),
        "location": extracted_data.get('location', additional_info.get('location', 'Not specified')),
        "applicable_sections": extracted_data.get('applicable_sections', determine_applicable_sections(extracted_data.get('type_of_theft', 'Unknown')))
    }
    
    # Return the results as JSON
    print(json.dumps(summary))

if __name__ == "__main__":
    main()