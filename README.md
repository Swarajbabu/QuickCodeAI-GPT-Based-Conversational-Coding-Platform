# QuickCodeAI-GPT

A full-stack conversational coding assistant built with Express, React 19, Vite, and Node.js, powered by Groq and OpenAI API. QuickCodeAI-GPT provides a modern ChatGPT-style interface for interactive AI-powered conversations with persistent in-memory chat history (zero database setup required).

## Features

- 💬 Real-time AI chat powered by Groq / OpenAI (`qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`, or `gpt-4o-mini`)
- 📝 In-Memory session chat history (zero database setup required)
- 🗂️ Multiple conversation threads (create, switch, rename, delete)
- ✨ Markdown rendering with syntax-highlighted code blocks
- ⌨️ Typing animation for AI responses
- 🌓 High-contrast White & Black design with instant theme toggle
- 📱 Fully responsive (mobile, tablet, desktop)
- 🔔 Toast notifications for errors and status updates
- 🚀 Production-ready for cloud deployment (Render, Vercel, Railway, Docker)

## Tech Stack

- **Frontend**: React 19, Vite, React Markdown, Rehype Highlight
- **Backend**: Node.js, Express 5
- **Storage**: In-Memory Store (Zero Database Required)
- **AI**: Groq API / OpenAI API

---

## Local Development

### Prerequisites

- Node.js 18+
- Groq API Key ([console.groq.com](https://console.groq.com)) or OpenAI API Key ([platform.openai.com](https://platform.openai.com))

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd SigmaGPT-main
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**:
   Create `Backend/.env` (use `Backend/.env.example` as a template):
   ```ini
   GROQ_API_KEY=gsk_your_groq_api_key_here
   PORT=8081
   AI_MODEL=qwen/qwen3.8-27b
   ```

4. **Run locally**:
   - Backend:
     ```bash
     npm run dev:backend
     ```
   - Frontend:
     ```bash
     npm run dev:frontend
     ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Deployment

### Option 1: Render (Recommended — Unified 1-Click / Single Web Service)

Deploy the entire fullstack app as a single service on [Render.com](https://render.com) (Frontend and Backend together, zero CORS hassle):

1. Push your repository to GitHub / GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Connect your repository.
4. Configure the service settings:
   - **Name**: `quickcodeai-gpt`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `GROQ_API_KEY` = *your Groq API key* (or `OPENAI_API_KEY`)
   - `AI_MODEL` = `qwen/qwen3.8-27b` (optional, defaults to `llama-3.3-70b-versatile`)
6. Click **Deploy Web Service**.
7. Once deployed, Render provides an HTTPS URL (e.g. `https://quickcodeai-gpt.onrender.com`).

*(Alternatively, connect your repository and Render will automatically detect the included [`render.yaml`](render.yaml) blueprint).*

---

### Option 2: Split Deployment (Frontend on Vercel + Backend on Render/Railway)

#### A. Deploy Backend (Render or Railway)
1. In Render/Railway, create a new Web Service pointing to your repo.
2. Root Directory: `Backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables:
   - `NODE_ENV` = `production`
   - `GROQ_API_KEY` = *your Groq API key*
   - `FRONTEND_URL` = `https://your-frontend.vercel.app`
6. Note down your backend URL (e.g. `https://my-backend.onrender.com`).

#### B. Deploy Frontend (Vercel)
1. In [Vercel Dashboard](https://vercel.com/), click **Add New** → **Project** and import your repository.
2. Set **Root Directory** to `Frontend`.
3. Framework Preset: **Vite**.
4. Environment Variables:
   - `VITE_API_URL` = `https://my-backend.onrender.com` *(your backend URL, no trailing slash)*
5. Click **Deploy**.

---

### Option 3: Docker Deployment

QuickCodeAI-GPT includes a multi-stage production [`Dockerfile`](Dockerfile):

1. **Build Docker Image**:
   ```bash
   docker build -t quickcodeai-gpt .
   ```

2. **Run Container**:
   ```bash
   docker run -d -p 8080:8080 -e GROQ_API_KEY="your_api_key_here" -e NODE_ENV="production" quickcodeai-gpt
   ```

3. Access the app at [http://localhost:8080](http://localhost:8080).

---

## Environment Variables Reference

### Backend (`Backend/.env`)

| Variable | Description | Required | Default |
|---|---|---|---|
| `GROQ_API_KEY` | Groq API Key | Yes* | - |
| `OPENAI_API_KEY` | OpenAI API Key (alternative to Groq) | Yes* | - |
| `PORT` | Server listening port | No | `8080` (assigned automatically by cloud hosts) |
| `NODE_ENV` | Environment mode (`production` / `development`) | No | `development` |
| `AI_MODEL` | AI Model identifier | No | `qwen/qwen3.8-27b` or `llama-3.3-70b-versatile` |
| `FRONTEND_URL` | Allowed origin(s) for CORS (comma-separated). Leave empty for unified deployment. | No | - |

*\* At least one of `GROQ_API_KEY` or `OPENAI_API_KEY` is required.*

### Frontend (`Frontend/.env`)

| Variable | Description | Required | Default |
|---|---|---|---|
| `VITE_API_URL` | Remote Backend API URL. Leave empty for unified deployment. | No | `""` (relative paths `/api/...`) |

---

## License

MIT
