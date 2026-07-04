# 🚀 CareerLens AI

> AI-powered Resume Intelligence Platform that analyzes resumes against job descriptions, generates ATS match scores, identifies skill gaps, suggests personalized learning roadmaps, and creates AI-enhanced resumes using Google's Gemini API.

## ✨ Features

- 📄 Resume PDF Parsing
- 🎯 ATS Match Score
- 🧠 Skill Gap Analysis
- 💡 AI Resume Suggestions
- 📈 Personalized Learning Roadmap
- 💬 Technical & Behavioral Interview Questions
- 🔄 Resume Regeneration
- 📝 AI Conversation History
- 🔐 JWT Authentication
- 📧 Email OTP Verification
- 🚫 Token Blacklisting (Secure Logout)

---

## 🤖 AI Workflow

Resume + Job Description
        │
        ▼
PDF Parsing
        │
        ▼
Gemini AI Analysis
        │
        ├── ATS Match Score
        ├── Skill Gap Analysis
        ├── Missing Keywords
        ├── Resume Improvements
        ├── Technical Questions
        ├── Behavioral Questions
        └── Personalized Learning Roadmap
        │
        ▼
Conversation Stored in MongoDB

---

## 🔒 Security

- JWT Authentication
- Secure Password Hashing (bcrypt)
- Email OTP Verification
- Token Blacklisting (Logout Security)
- Cookie-based Authentication
- Input Validation using Zod
- Environment Variable Protection

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- SCSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT
- Gemini API
- Nodemailer
- Multer
- Puppeteer
- PDF-Parse
- Zod

---

## 📂 Environment Variables

```env
Create a `.env` file inside the **server** folder.

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_super_secret_key

# Email Configuration (Nodemailer)

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_google_app_password

🚀 Installation
git clone https://github.com/your-username/North-Star-ai.git

cd Backend
npm install
npm run dev

cd ../Frontend
npm install
npm run dev

👨‍💻 Author

Ravindra Choudhary

Full Stack Developer | MERN | AI Integration | Backend Engineering

⭐ If you found this project useful, consider giving it a star.
