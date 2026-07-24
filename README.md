# QuickCodeAI-GPT

A full-stack conversational coding assistant built with the MERN stack (MongoDB, Express, React, Node.js) and powered by the OpenAI API. QuickCodeAI-GPT provides a modern ChatGPT-style interface for interactive AI-powered conversations with persistent chat history.

## Features


- 💬 Real-time AI chat powered by OpenAI GPT-4o-mini
- 📝 Persistent chat history with MongoDB
- 🗂️ Multiple conversation threads (create, switch, delete)
- ✨ Markdown rendering with syntax-highlighted code blocks
- ⌨️ Typing animation for AI responses
- 🌙 Modern dark theme UI
- 📱 Fully responsive (mobile, tablet, desktop)
- 🔔 Toast notifications for errors and status updates

## Tech Stack

- **Frontend**: React 19, Vite, React Markdown, Rehype Highlight
- **Backend**: Node.js, Express 5, Mongoose
- **Database**: MongoDB
- **AI**: OpenAI API (GPT-4o-mini)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd Backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd Frontend
   npm install
   ```
4. Create `Backend/.env` from the template:
   ```bash
   cp Backend/.env.example Backend/.env
   ```
5. Fill in your `OPENAI_API_KEY` and `MONGODB_URI` in `Backend/.env`

### Running the App

**Backend** (runs on port 8080):
```bash
cd Backend
npm run dev
```

**Frontend** (runs on port 5173):
```bash
cd Frontend
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/quickcodeai_gpt` |
| `OPENAI_API_KEY` | Your OpenAI API key | *(required)* |
| `PORT` | Backend server port | `8080` |

## License

MIT
