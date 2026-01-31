# 🩺 MediMind — AI‑Powered Prescription + Patient Management (Full‑Stack Monorepo)

MediMind is a full‑stack clinic workflow app for doctors to:

- register/login (JWT)
- manage patients
- generate AI‑assisted prescriptions (Gemini via a FastAPI service)
- save prescriptions (with nested prescription items) in the backend

> Medical disclaimer: This project can generate medical‑sounding content. It is a **demo/prototype** and must not be used for real clinical decisions without qualified review and safety controls.

---

## Monorepo structure

```
MediMind/
├── MediMind-Frontend/   # Next.js (App Router) UI
├── MediMind-Backend/    # Django + DRF API (JWT auth)
└── MediMind-AI/         # FastAPI service that calls Gemini and returns JSON
```

---

## Tech stack (as implemented)

### Frontend
- Next.js **15.x** (React **19**)
- TypeScript
- Tailwind CSS
- `react-hot-toast`

### Backend
- Django **5.2**
- Django REST Framework
- JWT via `djangorestframework-simplejwt`
- DB config via `dj-database-url`
- CORS via `django-cors-headers`
- Static files via WhiteNoise

### AI service
- FastAPI + Uvicorn
- LangChain + `langchain-google-genai`
- Pydantic v2 response schema parsing

---

## How the system fits together

1. **Frontend** authenticates with **Backend** (`/users/login/`) and stores the JWT.
2. **Frontend** fetches doctor profile (`/users/me/`) and doctor’s patients (`/patients/doc<id>/`).
3. For AI generation, **Frontend** calls **AI service** (`POST /generate_prescription`).
4. After review/edits, **Frontend** saves the prescription to **Backend** (`POST /prescriptions/`).

---

## Quickstart (local dev)

You’ll run **3 servers** in 3 terminals:

- Backend: Django API (recommended: `http://127.0.0.1:8000`)
- AI service: FastAPI (recommended: `http://127.0.0.1:8001` to avoid a port clash)
- Frontend: Next.js (default: `http://localhost:3000`)

### Prerequisites
- Node.js 18+ (recommended: 20+)
- Python 3.10+ (recommended: 3.11/3.12)

---

## 1) Backend setup (Django + DRF)

### Install

```bash
cd MediMind-Backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Environment

Create `MediMind-Backend/.env`:

```bash
cat > .env << 'EOF'
DJANGO_SECRET_KEY=dev-secret
DJANGO_DEBUG=True

# IMPORTANT:
# The backend currently uses dj-database-url and expects DATABASE_URL.
# If you want SQLite locally, see the note below.
DATABASE_URL=
EOF
```

#### Database note (important)
In `MediMind-Backend/MediMind/settings.py`, the default database is loaded from `DATABASE_URL` and sets `ssl_require=True`.

- For production Postgres this is great.
- For local development, this may break typical local Postgres URLs (no SSL).
- A SQLite configuration block exists in the file but is commented out.

If you want an out‑of‑the‑box local run with SQLite, uncomment the SQLite `DATABASES = {...}` block and comment out the Postgres `dj_database_url.config(...)` block.

### Migrate + run

```bash
python manage.py migrate
python manage.py runserver
```

Backend will be at:
- `http://127.0.0.1:8000/`

Admin (if you create a superuser):
- `http://127.0.0.1:8000/nitish/`

---

## 2) AI service setup (FastAPI + Gemini)

### Install

```bash
cd MediMind-AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Environment

Create `MediMind-AI/.env`:

```bash
cat > .env << 'EOF'
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
EOF
```

### Run

The service defaults to port 8000 in many examples, so run it on **8001** locally to avoid colliding with Django:

```bash
uvicorn app.main:app --reload --port 8001
```

AI service will be at:
- `http://127.0.0.1:8001/`
- Docs: `http://127.0.0.1:8001/docs`

---

## 3) Frontend setup (Next.js)

### Install

```bash
cd MediMind-Frontend
npm install
```

### Environment

Create `MediMind-Frontend/.env.local`:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_AI_URL=http://127.0.0.1:8001
EOF
```

### Run

```bash
npm run dev
```

Frontend will be at:
- `http://localhost:3000/`

---

## API reference (actual implemented routes)

### Backend (Django)
Base URL: `NEXT_PUBLIC_BASE_URL` (example: `http://127.0.0.1:8000`)

#### Auth / Users
- `POST /users/register/` — register doctor (public)
- `POST /users/login/` — JWT login (public, SimpleJWT)
- `POST /users/refresh/` — refresh JWT (public, SimpleJWT)
- `GET /users/me/` — current user profile (auth)

Auth header for protected routes:
- `Authorization: Bearer <access_token>`

#### Patients
- `GET /patients/?search=<text>` — list patients (auth)
- `POST /patients/` — create patient (auth)
- `GET /patients/doc<doctor_id>/` — list patients by doctor (auth)
- `GET /patients/<id>/` — patient detail (auth)
- `PUT/PATCH /patients/<id>/` — update (auth)
- `DELETE /patients/<id>/` — delete (auth)

#### Prescriptions
- `GET /prescriptions/` — list prescriptions (auth)
- `POST /prescriptions/` — create prescription (auth)

Prescription create expects nested `prescription_items`.

Example request body:

```json
{
  "patient": 1,
  "symptoms": "fever, sore throat",
  "diagnosis": "viral pharyngitis",
  "notes": "hydration, rest",
  "prescription_items": [
    {"medicine": "Paracetamol", "dosage": "500mg", "instructions": "Twice daily after meals"}
  ]
}
```

---

### AI service (FastAPI)
Base URL: `NEXT_PUBLIC_AI_URL` (example: `http://127.0.0.1:8001`)

- `POST /generate_prescription`

Request body:

```json
{
  "name": "Alex Doe",
  "age": 34,
  "gender": "male",
  "allergies": "penicillin",
  "medical_history": "asthma",
  "symptoms": "fever, sore throat, cough"
}
```

Response:

```json
{
  "diagnosis": "...",
  "notes": "...",
  "prescription_items": [
    {"medicine": "...", "dosage": "...", "instructions": "..."}
  ]
}
```

---

## Frontend scripts

From `MediMind-Frontend/package.json`:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

---

## Common issues / troubleshooting

### Backend fails to start: database misconfiguration
If `DATABASE_URL` is empty/invalid, Django may fail to connect.

Fix options:
- Provide a valid Postgres `DATABASE_URL` (recommended for production), or
- Switch to SQLite for local dev by uncommenting the SQLite `DATABASES` block in `MediMind-Backend/MediMind/settings.py`.

### Port conflict (8000 already in use)
Both Django and FastAPI commonly run on 8000.

- Keep Django on `8000`
- Run AI on `8001` (`uvicorn ... --port 8001`)
- Set `NEXT_PUBLIC_AI_URL=http://127.0.0.1:8001`

### CORS
- Backend currently allows all origins via `CORS_ALLOW_ALL_ORIGINS = True`.
- AI service also allows all origins (`allow_origins=['*']`).

This is convenient for development but not recommended for production.

---


## Security + privacy notes

- JWT access tokens are required for most backend routes (`IsAuthenticated` is global by default).
- Don’t store real patient data in dev/demo environments.
- Lock down CORS, secrets, and database credentials before deploying.

---

## License

MIT — see `LICENSE`.

---

## Medical disclaimer

MediMind is a software prototype designed to assist clinicians. AI output may be incomplete, incorrect, or unsafe.

- Always validate outputs clinically.
- Do not rely on this system as a substitute for medical judgment.
- Ensure compliance with privacy regulations and internal policies.

