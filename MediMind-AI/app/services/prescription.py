from app.core.llm import chain
from loguru import logger


REQUIRED_FIELDS = [
    "name",
    "age",
    "gender",
    "allergies",
    "medical_history",
    "symptoms",
]


def generate_prescription_service(data: dict):
    if not all(field in data for field in REQUIRED_FIELDS):
        logger.warning("Missing required fields")
        raise ValueError("Missing required fields")

    logger.info("Invoking LLM chain")
    result = chain.invoke(data)
    logger.info("LLM invocation successful")

    return result
