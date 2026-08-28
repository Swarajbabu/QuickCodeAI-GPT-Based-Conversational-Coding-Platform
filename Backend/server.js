import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import chatRoutes from "./routes/chat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Early warning for environment variables
if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    console.warn("⚠️ Neither GROQ_API_KEY nor OPENAI_API_KEY is configured. AI response generation will fail.");
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// Routes
app.use("/api", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "QuickCodeAI-GPT API",
        storage: "in-memory"
    });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../Frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return next();
        }
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// Start server directly in In-Memory mode without MongoDB
app.listen(PORT, () => {
    console.log(`🚀 QuickCodeAI-GPT server running on port ${PORT} (In-Memory Storage Mode — Zero Database Required)`);
});
