from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
load_dotenv()

class PrescriptionItem(BaseModel):
    medicine: str = Field(description="Name of the medicine")
    dosage: str = Field(description="Dosage instructions")
    instructions: str = Field(description="Administration instructions")

class Prescription(BaseModel):
    diagnosis: str = Field(description="Medical diagnosis")
    notes: str = Field(description="Additional notes for the patient")
    prescription_items: list[PrescriptionItem] = Field(description="List of prescribed medicines")

parser = JsonOutputParser(pydantic_object=Prescription)

prompt = ChatPromptTemplate.from_template(
    "You are a medical AI assistant. Given the following patient information, provide a diagnosis and a prescription.\n"
    "Patient Information:\n"
    "Name: {name}\n"
    "Age: {age}\n"
    "Gender: {gender}\n"
    "Allergies: {allergies}\n"
    "Medical History: {medical_history}\n"
    "Symptoms: {symptoms}\n\n"
    "Please provide the response in JSON format with the following structure:\n"
    "{{\n"
    "  \"diagnosis\": \"<diagnosis>\",\n"
    "  \"notes\": \"<notes>\",\n"
    "  \"prescription_items\": [\n"
    "    {{\n"
    "      \"medicine\": \"<medicine>\",\n"
    "      \"dosage\": \"<dosage>\",\n"
    "      \"instructions\": \"<instructions>\"\n"
    "    }},\n"
    "    ...\n"
    "  ]\n"
    "}}"
    "Do not include any disclaimers or statements indicating that the information is for educational purposes or requires physician confirmation."
)

import os
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY not set in environment")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", google_api_key=GOOGLE_API_KEY)


chain = prompt | llm | parser

app = Flask(__name__)
CORS(app)

@app.route('/generate_prescription', methods=['POST'])
def generate_prescription():
    data = request.json
    required_fields = ["name", "age", "gender", "allergies", "medical_history", "symptoms"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        result = chain.invoke(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)