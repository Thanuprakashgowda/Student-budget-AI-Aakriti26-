# StudentBudgetAI 🎓💸

A full-stack, AI-powered personal finance tracker designed specifically for college and university students. Built tightly around modern MERN stack principles with advanced interactive features, ensuring students remain financially healthy while working towards Sustainable Development Goals (SDGs).

## ✨ Features
- **Real-time Budget Dashboard**: Keep an eagle-eye on your monthly category budgets.
- **Student-Specific Categories**: Track 'Study', 'Transport', 'Food', 'Entertainment', and create **Infinite Custom Categories** seamlessly via our dynamic form wizard.
- **Voice AI Expense Logging**: "Spent 50 bucks on coffee" — state your expenses out loud using SpeechRecognition and let the system instantly categorize and log it.
- **Generative AI Chatbot (Google Gemini)**: Ask questions about your personal spending (`"Am I spending too much on transport?"`) and get deeply contextual, localized financial assistance powered by Google Gemini AI. The chatbot retains conversational history securely in your local browser storage.
- **PDF Export Engine**: Generate sleek, official bank-statement style PDF reports of all your combined transactions right from the dashboard at the click of a single button.
- **Gamified Rewards System**: Earn points and maintain streaks to keep tracking fun!

## 🚀 Tech Stack
- Frontend: React.js, Recharts, jsPDF
- Backend: Node.js, Express.js, Socket.IO
- Database: MongoDB (Mongoose)
- AI Integration: `@google/generative-ai` (Gemini Flash)

## 🔧 Installation & Setup

1. **Clone & Install Dependencies**
```bash
# In the api/server directory
cd server
npm install

# In the client directory
cd ../client
npm install
```

2. **Environment Variables**
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studentbudgetai
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_google_gemini_api_key
```

3. **Start the Development Servers**
You will need two terminals running simultaneously:
```bash
# Terminal 1 - Start the backend
cd server
npm start

# Terminal 2 - Start the frontend
cd client
npm start
```
The application will launch on `http://localhost:3000`.
