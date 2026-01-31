from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.prescription import Prescription
from app.core.config import GOOGLE_API_KEY, GEMINI_MODEL
from loguru import logger

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

logger.info("Initializing Gemini model")

llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL,
    google_api_key=GOOGLE_API_KEY
)

logger.info("Gemini Model initialized")

chain = prompt | llm | parser