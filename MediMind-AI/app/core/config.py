import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")

if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY not set in environment")