# File: python/analyze_complaint.py
import os
import sys
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Add your existing functions here (from your original code)
from fir_generator import extract_details, identify_missing_details, determine_applicable_sections, generate_detailed_questions

# Load API key
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def main():
    # Get complaint file path from command line argument
    complaint_file = sys.argv[1]
    
    with open(complaint_file, 'r', encoding='utf-8') as f:
        user_complaint = f.read()
    
    # Extract structured data from the complaint
    extracted_data = extract_details(user_complaint)
    
    # Add applicable sections
    theft_type = extracted_data.get('type_of_theft', 'Unknown')
    extracted_data['applicable_sections'] = determine_applicable_sections(theft_type)
    
    # Identify missing details
    missing_fields = identify_missing_details(extracted_data)
    
    # Generate follow-up questions
    follow_up_questions = generate_detailed_questions(extracted_data)
    
    # Create a unified set of questions
    all_questions = []
    
    # Add missing fields questions
    for field, question in missing_fields.items():
        all_questions.append({
            "field": field,
            "question": question
        })
    
    # Add follow-up questions, avoiding duplicates
    question_count = 0
    for question in follow_up_questions:
        # Check if this question is too similar to an existing one
        is_duplicate = False
        for existing_question in all_questions:
            # Simple check for similarity - if questions share multiple words
            common_words = set(question.lower().split()) & set(existing_question["question"].lower().split())
            if len(common_words) >= 3:  # If 3+ words match, consider it similar
                is_duplicate = True
                break
        
        if not is_duplicate:
            field_name = f"detail_{question_count}"
            all_questions.append({
                "field": field_name,
                "question": question
            })
            question_count += 1
    
    # Return the results as JSON
    result = {
        "extractedData": extracted_data,
        "questions": all_questions
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()

