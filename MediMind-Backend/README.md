# MediMind API Documentation

A comprehensive REST API for medical clinic management system built with Django REST Framework.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Endpoints](#api-endpoints)
  - [User Management](#user-management)
  - [Patient Management](#patient-management)
  - [Prescription Management](#prescription-management)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Status Codes](#status-codes)

## Overview

MediMind is a medical clinic management API that allows healthcare professionals to:
- Register and authenticate as doctors
- Manage patient records
- Create and manage prescriptions
- Track medical history and patient information

## Authentication

The API uses JWT (JSON Web Token) authentication. Most endpoints require authentication except for user registration and login.

### Authentication Headers
```
Authorization: Bearer <your_jwt_token>
```

### Token Lifecycle
- **Access Token Lifetime**: 60 minutes
- **Refresh Token Lifetime**: 7 days
- **Refresh Token Rotation**: Enabled

## Deployed Domain URL
```
https://medimind-backend-veby.onrender.com
```

## API Endpoints

### User Management

#### Register Doctor
Register a new doctor account.

**Endpoint:** `POST /users/register/`  
**Authentication:** Not required

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "secure_password123",
  "password2": "secure_password123",
  "specialization": "Cardiology",
  "license_number": "MD123456"
}
```

**Available Specializations:**
- General Medicine
- Cardiology
- Endocrinology
- Gastroenterology
- Nephrology
- Pulmonology
- Rheumatology
- Infectious Disease
- Hematology
- Oncology
- Geriatrics
- Neurology
- Psychiatry
- Pediatrics
- Obstetrics and Gynecology
- Dermatology
- Orthopedics
- Urology
- Ophthalmology
- Otolaryngology (ENT)
- Family Medicine
- Emergency Medicine

**Response (201 Created):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john.doe@example.com"
}
```

#### Login
Authenticate and receive JWT tokens.

**Endpoint:** `POST /users/login/`  
**Authentication:** Not required

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "secure_password123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /users/refresh/`  
**Authentication:** Not required

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Get Current User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /users/me/`
**Authentication:** Required

**Response (200 OK):**

```json
{
  "user": {
    "first_name": "Nitish",
    "last_name": "Kumar",
    "username": "iamnitishsah",
    "email": "iamnitishsah12@gmail.com"
  },
  "specialization": "Neurology",
  "license_number": "123BT0791"
}
```
---

### Patient Management

#### List Patients
Get a list of all patients with optional search functionality.

**Endpoint:** `GET /patients/`  
**Authentication:** Required

**Query Parameters:**
- `search` (optional): Search by name or gender

**Examples:**
```
GET /patients/
GET /patients/?search=John
GET /patients/?search=Male
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Smith",
    "age": 35,
    "gender": "Male"
  },
  {
    "id": 2,
    "name": "Jane Doe",
    "age": 28,
    "gender": "Female"
  }
]
```

#### Create Patient
Add a new patient to the system.

**Endpoint:** `POST /patients/`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Smith",
  "age": 35,
  "gender": "Male",
  "allergies": "Penicillin, Shellfish",
  "medical_history": "Hypertension, Type 2 Diabetes"
}
```

**Response (201 Created):**
```json
{
  "message": "Patient created successfully",
  "patient": {
    "id": 1,
    "name": "John Smith",
    "age": 35,
    "gender": "Male",
    "allergies": "Penicillin, Shellfish",
    "medical_history": "Hypertension, Type 2 Diabetes"
  }
}
```

#### Get Patient Details
Retrieve detailed information about a specific patient.

**Endpoint:** `GET /patients/<int:id>/`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Smith",
  "age": 35,
  "gender": "Male",
  "allergies": "Penicillin, Shellfish",
  "medical_history": "Hypertension, Type 2 Diabetes"
}
```

#### Update Patient
Update patient information (full or partial update).

**Endpoint:** `PUT /patients/<int:id>/` or `PATCH /patients/<int:id>/`  
**Authentication:** Required

**Request Body (PUT - full update):**
```json
{
  "name": "John Smith Jr",
  "age": 36,
  "gender": "Male",
  "allergies": "Penicillin, Shellfish, Nuts",
  "medical_history": "Hypertension, Type 2 Diabetes, High Cholesterol"
}
```

**Request Body (PATCH - partial update):**
```json
{
  "age": 36,
  "allergies": "Penicillin, Shellfish, Nuts"
}
```

**Response (200 OK):**
```json
{
  "message": "Patient updated successfully",
  "patient": {
    "id": 1,
    "name": "John Smith Jr",
    "age": 36,
    "gender": "Male",
    "allergies": "Penicillin, Shellfish, Nuts",
    "medical_history": "Hypertension, Type 2 Diabetes, High Cholesterol"
  }
}
```

#### Delete Patient
Remove a patient from the system.

**Endpoint:** `DELETE /patients/<int:id>/`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "Patient \"John Smith Jr\" deleted successfully"
}
```

### Prescription Management

#### List Prescriptions
Get a list of all prescriptions.

**Endpoint:** `GET /prescriptions/`  
**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "prescription_date": "2025-06-19",
    "doctor": 1,
    "patient": 1,
    "symptoms": "Chest pain, shortness of breath",
    "diagnosis": "Angina pectoris",
    "notes": "Patient advised to follow up in 2 weeks",
    "prescription_items": [
      {
        "medicine": "Aspirin",
        "dosage": "81mg daily",
        "instructions": "Take with food in the morning"
      },
      {
        "medicine": "Metoprolol",
        "dosage": "50mg twice daily",
        "instructions": "Take with or without food"
      }
    ]
  }
]
```

#### Create Prescription
Create a new prescription for a patient.

**Endpoint:** `POST /prescriptions/`  
**Authentication:** Required

**Request Body:**
```json
{
  "patient": 1,
  "symptoms": "Chest pain, shortness of breath",
  "diagnosis": "Angina pectoris",
  "notes": "Patient advised to follow up in 2 weeks",
  "prescription_items": [
    {
      "medicine": "Aspirin",
      "dosage": "81mg daily",
      "instructions": "Take with food in the morning"
    },
    {
      "medicine": "Metoprolol",
      "dosage": "50mg twice daily",
      "instructions": "Take with or without food"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "prescription_date": "2025-06-19",
  "doctor": 1,
  "patient": 1,
  "symptoms": "Chest pain, shortness of breath",
  "diagnosis": "Angina pectoris",
  "notes": "Patient advised to follow up in 2 weeks",
  "prescription_items": [
    {
      "medicine": "Aspirin",
      "dosage": "81mg daily",
      "instructions": "Take with food in the morning"
    },
    {
      "medicine": "Metoprolol",
      "dosage": "50mg twice daily",
      "instructions": "Take with or without food"
    }
  ]
}
```

## Data Models

### User Profile
```json
{
  "user": "User ID (Foreign Key)",
  "specialization": "Medical specialization",
  "license_number": "Unique medical license number"
}
```

### Patient
```json
{
  "id": "Primary Key",
  "name": "Patient full name (2-100 characters)",
  "age": "Age (0-150)",
  "gender": "Male/Female/Other",
  "allergies": "Known allergies (optional)",
  "medical_history": "Medical history (optional)"
}
```

### Prescription
```json
{
  "id": "Primary Key",
  "prescription_date": "Auto-generated date",
  "doctor": "Doctor ID (Foreign Key to UserProfile)",
  "patient": "Patient ID (Foreign Key)",
  "symptoms": "Patient symptoms",
  "diagnosis": "Medical diagnosis",
  "notes": "Additional notes (optional)",
  "prescription_items": "Array of prescription items"
}
```

### Prescription Item
```json
{
  "medicine": "Medicine name",
  "dosage": "Dosage information",
  "instructions": "Usage instructions"
}
```

## Error Handling

### Validation Errors
**Status Code:** 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": {
    "field_name": ["Error message"]
  }
}
```

### Authentication Errors
**Status Code:** 401 Unauthorized

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Errors
**Status Code:** 403 Forbidden

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Not Found Errors
**Status Code:** 404 Not Found

```json
{
  "detail": "Not found."
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Validation or request error |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error - Server error |

## Validation Rules

### Patient Validation
- **Name**: Minimum 2 characters, automatically titlecased
- **Age**: Between 0 and 150
- **Gender**: Must be 'Male', 'Female', or 'Other'

### User Registration Validation
- **Email**: Required and must be valid email format
- **Password**: Must pass Django's password validation
- **Password Confirmation**: Must match the password field
- **License Number**: Required, maximum 50 characters, must be unique
- **Username**: Must be unique

### Prescription Validation
- **Patient**: Must be a valid patient ID
- **Doctor**: Automatically set to the authenticated user's profile
- **Prescription Items**: At least one item is recommended

## Notes

- All timestamps are in Asia/Kolkata timezone.
- CORS is enabled for all origins (development setting)
- SQLite database is used (suitable for development)
- JWT tokens are used for authentication
- The API follows RESTful conventions
- All authenticated endpoints require a valid JWT token in the Authorization header