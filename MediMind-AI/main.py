from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import uvicorn

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

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY not set in environment")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", google_api_key=GOOGLE_API_KEY)

chain = prompt | llm | parser

app = FastAPI(title="Prescription Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate_prescription")
async def generate_prescription(request: Request):
    try:
        data = await request.json()
    except Exception as e:
        return JSONResponse(content={"error": f"Invalid JSON: {e}"}, status_code=400)

    required_fields = ["name", "age", "gender", "allergies", "medical_history", "symptoms"]
    if not all(field in data for field in required_fields):
        return JSONResponse(content={"error": "Missing required fields"}, status_code=400)

    try:
        result = chain.invoke(data)
        if hasattr(result, "dict"):
            return JSONResponse(content=result.dict())
        else:
            return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)