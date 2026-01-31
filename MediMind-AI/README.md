# MediMind-AI — Prescription Generator API (Gemini + FastAPI)

A small FastAPI service that takes basic patient intake information and uses **Google Gemini** (via LangChain) to generate a structured **diagnosis + prescription** response as JSON.

> Important: This repository is a prototype/demo. The API can generate incorrect or unsafe medical content. Read the **Safety / Medical Disclaimer** section before using.

---

## What this service does

- Exposes a single HTTP endpoint: `POST /generate_prescription`
- Validates a minimal payload (name/age/gender/allergies/medical_history/symptoms)
- Calls Gemini via LangChain
- Parses the model output into a Pydantic schema:
  - `diagnosis` (string)
  - `notes` (string)
  - `prescription_items` (list of `{ medicine, dosage, instructions }`)

---

## Tech stack

- **FastAPI** + **Uvicorn**
- **LangChain** + **langchain-google-genai**
- **Pydantic v2** for typed response parsing
- **python-dotenv** for local configuration
- **loguru** for logging

---

## Project structure

- `app/main.py` — FastAPI app setup, CORS, router registration
- `app/routes/prescription.py` — HTTP route `POST /generate_prescription`
- `app/services/prescription.py` — payload validation + LLM invocation
- `app/core/config.py` — loads env vars (`.env`) and validates required config
- `app/core/llm.py` — prompt + Gemini model + JSON output parsing chain
- `app/models/prescription.py` — Pydantic schemas for the JSON response

---

## Setup

### Prerequisites

- Python 3.10+ (recommended: 3.11/3.12)
- A Google Gemini API key

### Install

Create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Configuration

This service loads environment variables via `.env` (through `python-dotenv`).

Create a `.env` file in the repo root:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Environment variables

| Variable | Required | Description                                                           |
|---|---:|-----------------------------------------------------------------------|
| `GEMINI_API_KEY` | yes | Gemini API key. The app raises at startup if missing.                 |
| `GEMINI_MODEL` | recommended | Gemini model name passed to the client (example: `gemini-2.5-flash`). |


---

## Run locally

Start the API with Uvicorn:

```bash
uvicorn app.main:app --reload
```

Default dev URL:
- http://127.0.0.1:8000

Interactive API docs:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

CORS note:
- CORS is currently configured to allow all origins (`*`) in `app/main.py`.

---

## API

### `POST /generate_prescription`

Generates a structured prescription JSON from patient intake details.

#### Request body

JSON object with **all** required fields:

- `name` (string)
- `age` (number or string; forwarded to the LLM)
- `gender` (string)
- `allergies` (string)
- `medical_history` (string)
- `symptoms` (string)

Example:

```bash
curl -X POST "http://127.0.0.1:8000/generate_prescription" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Doe",
    "age": 34,
    "gender": "male",
    "allergies": "penicillin",
    "medical_history": "asthma",
    "symptoms": "fever, sore throat, cough"
  }'
```

#### Successful response (200)

The response is parsed into the `Prescription` schema:

```json
{
  "diagnosis": "...",
  "notes": "...",
  "prescription_items": [
    {
      "medicine": "...",
      "dosage": "...",
      "instructions": "..."
    }
  ]
}
```

#### Error responses

- `400 {"error": "Invalid JSON"}` — request body is not valid JSON
- `400 {"error": "Missing required fields"}` — any required field is missing
- `500 {"error": "Internal server error"}` — unhandled server-side exception

---

## Troubleshooting

### `EnvironmentError: GEMINI_API_KEY not set in environment`

Set `GEMINI_API_KEY` in your shell environment or in a `.env` file in the repository root.

### Gemini model initialization errors

- Confirm `GEMINI_MODEL` is set to a valid model name for your account/region.
- Confirm your API key is active and has access to Gemini.

### JSON parsing / schema errors

The service uses a strict JSON parser (`JsonOutputParser`) bound to the Pydantic `Prescription` model. If Gemini returns malformed JSON or a mismatched structure, the request may fail.

---

## Safety / Medical Disclaimer (read this)

This project can generate medical-sounding output, including medication suggestions. It is **not** a substitute for professional medical judgment.

- Do **not** use this system to make real-world diagnosis or treatment decisions.
- Outputs may be incomplete, incorrect, inappropriate, or dangerous.
- Any result must be reviewed and approved by a licensed clinician before use.
- If this is used in any workflow involving patients, you are responsible for compliance, privacy, auditing, and safety controls.

---