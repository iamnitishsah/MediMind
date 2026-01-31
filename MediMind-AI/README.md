# 🩺 MediMind-AI Prescription Generator

This is a FastAPI that uses **Google Gemini (via LangChain)** to generate medical diagnoses and prescriptions based on patient data.

---

## 🚀 Features

- Accepts patient data in JSON format
- Uses Google Gemini (via LangChain) for generating diagnosis and prescriptions
- Returns structured JSON output with medicines and instructions
- Built with FastAPI and Pydantic for easy integration and validation

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/iamnitishsah/MediMind/MediMind-AI.git
cd MediMind-AI
````

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Requirements:**

```
fastapi
uvicorn[standard]
python-dotenv
pydantic
langchain
langchain-core
langchain-google-genai
```

### 3. Add Environment Variables

Create a `.env` file and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_google_api_key_here
```

### 4. Run the FastAPI Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Deployed Domain URL
```
https://medimind-ai.onrender.com
```

---

## 📡 API Documentation

### 🔹 Endpoint: `POST /generate_prescription`

Generate a medical diagnosis and prescription from patient input.

#### ✅ Request Headers

| Key          | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

---

#### 📥 Request Body (JSON)

| Field             | Type   | Description                       | Required |
| ----------------- | ------ | --------------------------------- | -------- |
| `name`            | string | Patient's full name               | ✅        |
| `age`             | int    | Patient's age                     | ✅        |
| `gender`          | string | Male/Female/Other                 | ✅        |
| `allergies`       | string | Known allergies (comma-separated) | ✅        |
| `medical_history` | string | Medical history summary           | ✅        |
| `symptoms`        | string | Current symptoms                  | ✅        |

#### Example Request:

```json
{
  "name": "John Smith",
  "age": 45,
  "gender": "Male",
  "allergies": "Penicillin, Shellfish",
  "medical_history": "Hypertension, Type 2 Diabetes",
  "symptoms": "Persistent cough, shortness of breath, and fatigue"
}
```

---

#### 📤 Response (200 OK)

```json
{
  "diagnosis": "Chronic Bronchitis",
  "notes": "Patient advised to avoid allergens and rest. Follow-up in 1 week.",
  "prescription_items": [
    {
      "medicine": "Salbutamol",
      "dosage": "2 puffs every 4-6 hours as needed",
      "instructions": "Use with inhaler; shake well before use"
    },
    {
      "medicine": "Paracetamol",
      "dosage": "500 mg every 6 hours",
      "instructions": "Take after meals to avoid gastric upset"
    }
  ]
}
```

---

#### ❌ Error Responses

* **400 Bad Request**

```json
{
  "error": "Missing required fields"
}
```

* **500 Internal Server Error**

```json
{
  "error": "Error message from LangChain/Gemini"
}
```

---

## 🧪 Testing with Postman

1. Select `POST` method.
2. URL: `http://your-domain.com/generate_prescription`
3. Headers: `Content-Type: application/json`
4. Body: raw JSON as shown above
5. Click **Send** to get AI-generated prescription.

---

## 📌 Notes

* Model used: `gemini-2.5-pro` via `langchain-google-genai`
* Output is validated using Pydantic models.
* This is a prototype and not a substitute for medical advice.
