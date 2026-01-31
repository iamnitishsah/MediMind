import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL")

if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY not set in environment")