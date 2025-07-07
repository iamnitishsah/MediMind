# 🩺 MediMind - AI-Powered Medical Prescription Management System

MediMind is a comprehensive medical clinic management system that leverages artificial intelligence to streamline prescription generation and patient management. The platform consists of a modern web application with AI-powered prescription generation capabilities.

## 🌟 Features

### 🤖 AI-Powered Prescription Generation
- Generate medical prescriptions using advanced AI algorithms
- Input patient symptoms and get intelligent diagnosis and medication recommendations
- Editable prescriptions with customizable medications, dosages, and instructions
- Professional prescription formatting with print functionality

### 👥 Patient Management
- Complete patient database with search functionality
- Patient profiles with medical history and allergies
- Create, read, update, and delete patient records
- Responsive patient dashboard with modern UI

### 🔐 User Authentication & Authorization
- Secure JWT-based authentication system
- Doctor registration with medical specialization
- Protected routes and API endpoints
- Session management with refresh tokens

### 📱 Modern User Interface
- Responsive design optimized for all devices
- Beautiful glassmorphism UI with gradient backgrounds
- Toast notifications for user feedback
- Loading states and smooth animations

## 🏗️ System Architecture

```
MediMind/
├── MediMind-Frontend/     # Next.js React Application
├── MediMind-Backend/      # Django REST API
└── MediMind-AI/          # AI Prescription Generation Service
```

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with modern design
- **State Management**: React Hooks
- **Notifications**: React Hot Toast

### Backend (Django REST Framework)
- **Framework**: Django 4.x with DRF
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens
- **API**: RESTful endpoints
- **CORS**: Enabled for frontend integration

### AI Service (Python)
- **Framework**: Flask/FastAPI
- **AI Engine**: Custom medical AI model
- **Integration**: REST API for prescription generation
- **Input**: Patient data + symptoms
- **Output**: Diagnosis + medication recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- pip (Python package manager)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MediMind
```

### 2. Setup Backend (Django)
```bash
cd MediMind-Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Setup AI Service
```bash
cd MediMind-AI
pip install -r requirements.txt
python app.py
```

### 4. Setup Frontend (Next.js)
```bash
cd MediMind-Frontend
npm install
npm run dev
```

### 5. Environment Configuration
Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_AI_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /users/register/` - Doctor registration
- `POST /users/login/` - User login
- `POST /users/refresh/` - Refresh JWT token
- `GET /users/me/` - Get current user profile

### Patient Management
- `GET /patients/` - List all patients (with search)
- `POST /patients/` - Create new patient
- `GET /patients/{id}/` - Get patient details
- `PUT /patients/{id}/` - Update patient
- `DELETE /patients/{id}/` - Delete patient

### Prescription Management
- `GET /prescriptions/` - List prescriptions
- `POST /prescriptions/` - Create prescription
- `GET /prescriptions/{id}/` - Get prescription details

### AI Prescription Generation
- `POST /generate_prescription` - Generate AI prescription

## 🎨 UI Components

### Pages
- **Dashboard** - Patient overview and quick actions
- **Patient List** - Searchable patient directory
- **Patient Details** - Individual patient management
- **Create Patient** - New patient registration form
- **Generate Prescription** - AI-powered prescription creation
- **Authentication** - Login and registration forms

### Key Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern Styling** - Glassmorphism effects and gradients
- **Interactive Elements** - Hover effects and smooth transitions
- **Form Validation** - Real-time validation with error messages
- **Loading States** - Skeleton loaders and spinners

## 🔧 Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend Framework | Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend Framework | Django REST Framework |
| Database | SQLite / PostgreSQL |
| Authentication | JWT Tokens |
| AI Service | Python Flask/FastAPI |
| Deployment | Vercel (Frontend) / Railway (Backend) |

## 📱 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Patient Management
![Patient Management](screenshots/patients.png)

### Prescription Generator
![Prescription Generator](screenshots/prescription.png)

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Django's built-in password hashing
- **CORS Protection** - Configured CORS for API security
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Prevention** - Django ORM protection
- **XSS Prevention** - React's built-in XSS protection

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Backend (Railway/Heroku)
```bash
# Configure production settings
pip install gunicorn
# Deploy using platform-specific instructions
```

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_AI_URL=https://your-ai-service.com

# Backend
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=your-database-url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write clean, documented code
- Test all API endpoints
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@medimind.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🔮 Future Enhancements

- [ ] **Advanced AI Models** - Integration with more sophisticated medical AI
- [ ] **Telemedicine** - Video consultation capabilities
- [ ] **Mobile App** - React Native mobile application
- [ ] **Analytics Dashboard** - Prescription and patient analytics
- [ ] **Multi-language Support** - Internationalization
- [ ] **Electronic Health Records** - Full EHR integration
- [ ] **Appointment Scheduling** - Calendar integration
- [ ] **Laboratory Integration** - Lab results management

## 🏥 Medical Disclaimer

**Important**: MediMind is a software tool designed to assist healthcare professionals. All AI-generated prescriptions and diagnoses should be reviewed and approved by licensed medical professionals before patient administration. This software is not a substitute for professional medical judgment and should be used as a supportive tool only.

---

<div align="center">
  <p>Built with ❤️ for healthcare professionals</p>
  <p>© 2025 MediMind. All rights reserved.</p>
</div>