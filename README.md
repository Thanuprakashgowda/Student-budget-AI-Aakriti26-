# StudentBudgetAI 🎓💸

A full-stack, AI-powered personal finance tracker designed specifically for college and university students. Built tightly around modern MERN stack principles with advanced interactive features, ensuring students remain financially healthy while working towards Sustainable Development Goals (SDGs).

## ✨ Features
- **Real-time Budget Dashboard**: Keep an eagle-eye on your monthly category budgets with live sync.
- **🔒 Transparent Data Encryption**: Industry-standard **AES-256-CBC field-level encryption** for sensitive data (`amount`, `description`). Data is encrypted before storage and seamlessly decrypted for your dashboard.
- **📱 WhatsApp Logging & Commands**: Log expenses instantly via WhatsApp (e.g., `150 chai`). Use the `delete` command to remove your most recent entry, and get friendly AI greetings.
- **⚙️ Editable Budgets & Scoped Overview**: Set your own monthly category limits from the dashboard. Your view remains clean by only showing active categories you've spent in.
- **Generative AI Chatbot (Google Gemini)**: Ask questions about your personal spending (`"Am I spending too much on transport?"`) and get deeply contextual financial assistance.
- **Voice AI Expense Logging**: State your expenses out loud using SpeechRecognition and let the system categorize it.
- **PDF Export Engine**: Generate official bank-statement style PDF reports.
- **Student-Specific Categories**: Dedicated categories for 'Study', 'Transport', 'Food', 'Entertainment', plus custom categories.

## 🚀 Tech Stack
- Frontend: React.js, Recharts, jsPDF, Socket.IO Client
- Backend: Node.js, Express.js, Socket.IO, Twilio SDK
- Encryption: `crypto` (AES-256-CBC)
- Database: MongoDB (Mongoose)
- AI Integration: `@google/generative-ai` (Gemini Flash)

## 🔧 Installation & Setup

1. **Clone & Install Dependencies**
```bash
# Install root dependencies
npm install

# Build environment (using concurrently)
npm run dev
```

2. **Environment Variables**
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studentbudgetai
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_google_gemini_api_key

# Encryption Security
ENCRYPTION_KEY=32_byte_hex_key_here

# WhatsApp (Twilio)
TWILIO_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

3. **Start Development**
```bash
# From the root directory
npm run dev
```
The application will launch on `http://localhost:3000`. WhatsApp webhooks can be tested via `node server/mock_whatsapp.js`.
