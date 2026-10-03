# 🏥 Medicare-AI

### AI-Powered Smart Healthcare Assistance & Management Platform

Medicare-AI is a full-stack healthcare assistance platform designed to make healthcare management more **accessible, intelligent, organized, and user-friendly**.

The platform combines **AI assistance, symptom analysis, medical record management, health monitoring, medication management, doctor discovery, appointment booking, QR-based appointment verification, emergency support, and role-based access control** into one unified system.

> ⚠️ **Medical Disclaimer:** Medicare-AI is designed as a healthcare assistance and decision-support platform. It does not replace qualified medical professionals, medical diagnosis, or emergency medical services.

---

## ✨ Features

### 🤖 AI Health Assistant

* AI-powered healthcare conversation interface
* Multi-turn conversation support
* Health-related guidance and explanations
* Conversation history
* Wellness insights
* Designed to simplify complex healthcare information

### 🩺 Symptom Analysis

* Symptom search and autocomplete
* Symptom analysis API
* Symptom history
* Symptom relationship/graph exploration
* Designed to provide informational health guidance

### 👨‍⚕️ Doctor Discovery

* Browse available doctors
* Doctor specialization
* Qualification and experience
* Hospital/clinic information
* Doctor verification status
* Doctor availability and appointment slots

### 📅 Smart Appointment Management

* Book appointments with doctors
* View upcoming and previous appointments
* Appointment details
* Appointment status management
* Doctor availability slots
* Prevention of invalid doctor/appointment selections
* QR code generation for appointments

### 📱 QR Appointment Verification

Doctors and authorized clinic staff can verify appointment QR codes.

Verification confirms:

* Appointment validity
* Appointment ID
* Appointment code
* Patient name
* Doctor name
* Appointment date
* Appointment time
* Appointment status

Example verification response:

```json
{
  "verified": true,
  "appointment_id": 4,
  "appointment_code": "APT-FE486B7C",
  "patient_name": "Test Patient",
  "doctor_name": "Dr. Sarah Sharma",
  "date": "2026-10-02",
  "time": "09:00",
  "status": "confirmed"
}
```

### 💊 Medication Management

* Add medications
* View medications
* Update medication information
* Delete medications
* Log medication intake
* Medication adherence support

### ❤️ Health Metrics

Supports health metric recording and analysis, including:

* Heart rate
* Blood pressure
* Blood glucose
* Temperature
* Weight
* Sleep
* Hydration
* Activity

The platform also provides health metric summaries for monitoring trends.

### 📄 Medical Records

* Upload health records
* View medical records
* Retrieve individual records
* Delete records
* Designed to support future AI-powered medical report analysis

### 🚨 Emergency Support

* Emergency profile
* Emergency contact information
* Blood group information
* Allergy information
* Emergency alert triggering

### 🔔 Notifications

* User notifications
* Mark notification as read
* Mark all notifications as read
* Delete notifications

### 🎮 Health Gamification

* Health activity points
* Streak tracking
* Highest streak
* Health achievement badges

Example badges include:

```text
Health Pioneer
Profile Initialized
```

### 🔐 Security & Authentication

* JWT-based authentication
* Password hashing
* OAuth2 Password Flow
* Role-Based Access Control (RBAC)
* Patient and doctor roles
* Protected API endpoints
* Audit logging
* Account activation/deactivation support

### 👥 User Roles

#### Patient

Patients can:

* Register and log in
* Manage their profile
* View health dashboard
* Find doctors
* View available slots
* Book appointments
* View appointments
* Manage medications
* Track health metrics
* Access health records
* Use AI healthcare assistance

#### Doctor

Doctors can:

* Register and log in
* Manage doctor profile
* Configure availability
* View appointment information
* Verify appointment QR codes
* Access doctor-specific functionality

#### Admin

The platform also provides administrative APIs for:

* User management
* System statistics
* Doctor verification
* Audit logs
* System-wide notifications

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       User / Patient    │
                    │       Doctor / Admin    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │       Vite + UI         │
                    └────────────┬────────────┘
                                 │
                              REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      FastAPI Backend    │
                    │      Authentication     │
                    │      Business Logic     │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       │  Database   │    │ AI Services │    │ DSA Modules │
       │   SQLite    │    │ AI Features │    │ HashMap/Trie│
       └─────────────┘    └─────────────┘    └─────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* JavaScript
* React Router
* Tailwind CSS
* Lucide React

## Backend

* Python
* FastAPI
* Uvicorn
* SQLAlchemy
* Pydantic
* JWT Authentication
* OAuth2
* bcrypt

## Database

* SQLite
* SQLAlchemy ORM

## AI / Intelligent Features

* AI-powered healthcare assistant
* Symptom analysis
* Wellness insights
* Medical report analysis architecture
* Health data analysis

## Data Structures & Algorithms

The project also incorporates DSA concepts for selected backend functionality, including:

* HashMap
* Trie
* Caching
* Search/autocomplete concepts
* Data indexing

---

# 📁 Project Structure

```text
Medicare-AI/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── dsa/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── seed.py
│   │
│   ├── tests/
│   ├── uploads/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── docs/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Python 3.10+
* Node.js 18+
* npm
* Git

---

# ⚙️ Backend Setup

Open a terminal in the project root.

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```text
.env
```

Use `.env.example` as the template.

Example:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./medicare.db
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> Never commit your real `.env` file or production secrets to GitHub.

---

## ▶️ Start Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/api/health
```

API documentation:

```text
http://127.0.0.1:8000/api/docs
```

OpenAPI specification:

```text
http://127.0.0.1:8000/api/openapi.json
```

---

# 💻 Frontend Setup

Open a second terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

> For this React/Vite application, use `npm run dev` instead of VS Code Live Server.

---

# 🔑 Authentication

Medicare-AI uses JWT-based authentication.

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

### Current User

```http
GET /api/auth/me
```

### Logout

```http
POST /api/auth/logout
```

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

The project also exposes OAuth2 password authentication through:

```text
/api/auth/token
```

This allows protected endpoints to be tested directly through Swagger UI.

---

# 📚 API Modules

The backend currently provides APIs for:

```text
Authentication
Patients
Doctors
Appointments
Medications
Health Metrics
Health Records
Symptoms
AI Health Assistant
Notifications
Emergency Mode
Admin Operations
Gamification
DSA Diagnostics
```

---

# 🧪 API Testing

Swagger UI can be used to test the APIs interactively.

Open:

```text
http://127.0.0.1:8000/api/docs
```

Example workflow:

```text
Register Patient
      ↓
Login
      ↓
Authorize Swagger
      ↓
Get Patient Profile
      ↓
Find Doctors
      ↓
Check Doctor Slots
      ↓
Book Appointment
      ↓
Receive Appointment QR
      ↓
Doctor Login
      ↓
Verify QR
```

The appointment QR verification flow has been tested successfully with role-based authorization.

---

# 🔐 Role-Based Access Control

Medicare-AI protects sensitive operations based on user roles.

Example:

```text
Patient
   │
   ├── Patient Dashboard
   ├── Health Records
   ├── Medications
   ├── Appointments
   └── Health Metrics

Doctor
   │
   ├── Doctor Dashboard
   ├── Appointments
   ├── Availability
   └── QR Verification

Admin
   │
   ├── User Management
   ├── Doctor Verification
   ├── Audit Logs
   ├── System Statistics
   └── Broadcast Notifications
```

Unauthorized access is rejected by the backend rather than relying only on frontend restrictions.

---

# 🧠 DSA Integration

One of the goals of Medicare-AI is to combine modern healthcare software with fundamental computer science concepts.

The project includes a dedicated DSA module containing functionality related to:

* HashMap-based caching
* Trie-based search/autocomplete concepts
* Efficient lookup
* Data indexing
* Diagnostic information about DSA components

API:

```http
GET /api/dsa/status
```

---

# 🛡️ Security Considerations

The project follows several security practices:

* Password hashing with bcrypt
* JWT authentication
* OAuth2 password flow
* Role-based authorization
* Protected API endpoints
* Audit logging
* Environment variables for secrets
* Input validation using Pydantic
* Account activation checks

### Never commit:

```text
.env
*.db
JWT tokens
API keys
Passwords
Private credentials
Real patient information
```

---

# 🧑‍⚕️ Healthcare Privacy

This project is intended primarily for **educational, development, demonstration, and research purposes**.

Do not upload real patient medical records, personally identifiable information, passwords, or other confidential healthcare data to the repository.

For production deployment, additional security, privacy, compliance, monitoring, encryption, access control, and clinical validation would be required.

---

# 🗺️ Development Roadmap

Future improvements include:

* [ ] Complete production-grade AI healthcare assistant
* [ ] Advanced medical report/PDF analysis
* [ ] OCR support for scanned medical reports
* [ ] English/Hindi multilingual interface
* [ ] Voice-based healthcare assistant
* [ ] Speech-to-text and text-to-speech
* [ ] Advanced health analytics
* [ ] Medication reminder notifications
* [ ] Appointment reminder notifications
* [ ] Improved emergency alert integrations
* [ ] Doctor-patient consultation workflow
* [ ] Real-time notifications
* [ ] Production database support
* [ ] Docker-based deployment
* [ ] Cloud deployment
* [ ] Automated testing and CI/CD
* [ ] Enhanced security and privacy controls

---

# 📊 Current Backend Verification

The following core workflows have been tested successfully:

| Feature                      | Status |
| ---------------------------- | ------ |
| Patient Registration         | ✅      |
| Doctor Registration          | ✅      |
| Patient Login                | ✅      |
| Doctor Login                 | ✅      |
| JWT Authentication           | ✅      |
| OAuth2 Swagger Authorization | ✅      |
| Patient Profile              | ✅      |
| Patient Dashboard            | ✅      |
| Doctor Listing               | ✅      |
| Doctor Availability          | ✅      |
| Appointment Booking          | ✅      |
| Appointment Details          | ✅      |
| Appointment Listing          | ✅      |
| QR Code Generation           | ✅      |
| Doctor QR Verification       | ✅      |
| Role-Based Access Control    | ✅      |

---

# 🎯 Project Objective

The objective of Medicare-AI is to create a unified healthcare assistance platform where users can manage important healthcare activities from a single interface.

The project focuses on combining:

```text
Artificial Intelligence
        +
Healthcare Management
        +
Web Development
        +
Data Structures & Algorithms
        +
Security
        +
User-Friendly Design
```

into one integrated platform.

---

# 👨‍💻 Developer

**Abhishek Anand Tiwari**

B.Tech Computer Science & Engineering

Interests:

* Software Engineering
* Artificial Intelligence
* Machine Learning
* Full-Stack Development
* Data Structures & Algorithms

---

# 📄 License

This project is intended for educational and development purposes.

A suitable open-source license can be added before public distribution.

---

## ⚠️ Disclaimer

Medicare-AI does not provide a substitute for professional medical advice, diagnosis, or treatment.

Users should consult qualified healthcare professionals for medical decisions.

For emergencies, contact the appropriate local emergency medical service immediately.
