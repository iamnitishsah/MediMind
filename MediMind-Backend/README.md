# MediMind Backend (Django + DRF)

Backend API for **MediMind**, a lightweight clinical workflow service that lets doctors:

- register/login (JWT)
- manage patients
- create prescriptions with one or more prescription items

This repo is a Django project using Django REST Framework (DRF) and SimpleJWT.

---

## Tech stack

- **Python** 3.x
- **Django** 5.2
- **Django REST Framework**
- **JWT auth** via `djangorestframework-simplejwt`
- **PostgreSQL** (recommended/production) via `dj-database-url` + `psycopg`
- **WhiteNoise** for static file serving
- **django-cors-headers** for CORS

Key dependencies live in `requirements.txt`.

---

## Project layout

- `manage.py` — Django entrypoint
- `MediMind/` — project config
  - `settings.py` — settings, DB configuration, DRF/JWT config
  - `urls.py` — root URL routing
- `users/` — registration + profile
- `patients/` — patient CRUD
- `prescriptions/` — prescriptions + nested prescription items
- `db.sqlite3` — local SQLite database file (present in repo, but DB config defaults to `DATABASE_URL`)

---

## Local development setup (macOS / zsh)

### 1) Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2) Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3) Configure environment variables

This project loads environment variables using `python-dotenv` (see `MediMind/settings.py`).

Create a `.env` file in the repo root:

```bash
cat > .env << 'EOF'
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True

# Database (recommended: Postgres)
# Example:
# DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
DATABASE_URL=
EOF
```

Notes:
- `DATABASE_URL` is **required** by the current `DATABASES` setting.
- The DB config enforces `ssl_require=True`, which is great for production but can break some local Postgres setups.
  - If you want SQLite locally, there’s a commented-out SQLite `DATABASES` block in `MediMind/settings.py`.

### 4) Run migrations

```bash
python manage.py migrate
```

### 5) Create a superuser (optional, for admin)

```bash
python manage.py createsuperuser
```

### 6) Run the server

```bash
python manage.py runserver
```

Server runs at:

- http://127.0.0.1:8000/

---

## Configuration

### Environment variables

| Variable | Default | Purpose |
|---|---:|---|
| `DJANGO_SECRET_KEY` | `djangorestframeworkkeyformedimind` | Django secret key |
| `DJANGO_DEBUG` | `True` | Enables/disables debug mode |
| `DATABASE_URL` | (no default) | Database connection string |

### CORS / CSRF

- `CORS_ALLOW_ALL_ORIGINS = True` (all origins allowed)
- `CSRF_TRUSTED_ORIGINS` includes:
  - `https://medimind-295g.onrender.com`
  - `https://code-clinqo-rosy.vercel.app`
  - `http://localhost:3000`

---

## Authentication

This API uses **JWT**.

### Obtain token

`POST /users/login/`

Returns:
- `access`
- `refresh`

### Refresh token

`POST /users/refresh/`

### Auth header

For protected endpoints, send:

- `Authorization: Bearer <access_token>`

By default, DRF permissions are `IsAuthenticated` globally (see `REST_FRAMEWORK` in `MediMind/settings.py`).

---

## API Reference

Root routing is defined in `MediMind/urls.py`:

- `/users/` → `users.urls`
- `/patients/` → `patients.urls`
- `/prescriptions/` → `prescriptions.urls`
- `/nitish/` → Django admin

### Users

Base path: `/users/`

#### Register

- `POST /users/register/`
- Permission: **public** (`AllowAny`)

Body (serializer fields):
- `first_name`, `last_name`
- `username`
- `email`
- `specialization` (stored on `UserProfile`)
- `license_number` (unique, stored on `UserProfile`)
- `password`, `password2`

Creates:
- `django.contrib.auth.models.User`
- `users.UserProfile` (OneToOne)

#### Login (JWT)

- `POST /users/login/`
- Permission: public

#### Refresh (JWT)

- `POST /users/refresh/`
- Permission: public

#### Current user profile

- `GET /users/me/`
- Permission: authenticated

Returns a `UserProfile` representation which nests user fields.

---

### Patients

Base path: `/patients/`

#### List patients

- `GET /patients/`
- Permission: authenticated

Supports query param:
- `search` — filters by `name` or `gender` (case-insensitive)

Response uses `PatientListSerializer` with:
- `id`, `name`, `age`, `gender`, `doctor`

> Note: the current implementation lists **all** patients in the database, not just the logged-in doctor’s patients.

#### Create patient

- `POST /patients/`
- Permission: authenticated

Body fields:
- `name` (min 2 chars; normalized to title case)
- `age` (0–150)
- `gender` (`Male` / `Female` / `Other`)
- `allergies` (optional)
- `medical_history` (optional)

The `doctor` field is set automatically to `request.user.profile`.

#### Retrieve / update / delete patient

- `GET /patients/<id>/`
- `PUT/PATCH /patients/<id>/`
- `DELETE /patients/<id>/`
- Permission: authenticated

Update returns a JSON envelope:

- `{ "message": "Patient updated successfully", "patient": { ... } }`

Delete returns:

- `{ "message": "Patient \"<name>\" deleted successfully" }`

#### List patients by doctor id

- `GET /patients/doc<doctor>/`
- Permission: authenticated

Example:
- `/patients/doc3/` lists patients where `Patient.doctor_id == 3`.

---

### Prescriptions

Base path: `/prescriptions/`

#### List prescriptions

- `GET /prescriptions/`
- Permission: authenticated

> Note: the current implementation lists **all** prescriptions in the database.

#### Create prescription (with items)

- `POST /prescriptions/`
- Permission: authenticated

Body fields:
- `patient` (patient id)
- `symptoms` (text)
- `diagnosis` (text)
- `notes` (optional)
- `prescription_items` (array)
  - each item: `medicine`, `dosage`, `instructions`

The `doctor` is set automatically to `request.user.profile`.

---

## Data model summary

### `users.UserProfile`

- `user` → OneToOne to Django `User`
- `specialization` → choice field, default `General Medicine`
- `license_number` → unique string

### `patients.Patient`

- `name`, `age`, `gender`
- `allergies`, `medical_history` (optional)
- `doctor` → FK to `users.UserProfile`

### `prescriptions.Prescription`

- `prescription_date` (auto)
- `doctor` → FK to `users.UserProfile`
- `patient` → FK to `patients.Patient`
- `symptoms`, `diagnosis`, `notes`

### `prescriptions.PrescriptionItem`

- `prescription` → FK to `Prescription` (related name `prescription_items`)
- `medicine`, `dosage`, `instructions`

---

## Admin

Django admin is mounted at:

- `/nitish/`

Create a superuser and log in there to inspect data.

---

## Testing

This repo includes per-app `tests.py` files (`users/tests.py`, `patients/tests.py`, `prescriptions/tests.py`).

Run tests:

```bash
python manage.py test
```

---

## Production / deployment notes

- The project includes `gunicorn` and `whitenoise` in `requirements.txt`, which are commonly used for deployment.
- `ALLOWED_HOSTS` includes `medimind-295g.onrender.com` and also `*`.
- Static files are configured with:
  - `STATIC_ROOT = <repo>/staticfiles`
  - `STATICFILES_STORAGE = whitenoise.storage.CompressedManifestStaticFilesStorage`

Typical deployment steps:

1. Set `DJANGO_DEBUG=False`
2. Set a strong `DJANGO_SECRET_KEY`
3. Provide a production `DATABASE_URL`
4. Run migrations on deploy
5. Collect static files:

```bash
python manage.py collectstatic --noinput
```
