import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import fs from "fs";
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

// Parse allowed origins from FRONTEND_URL (supports comma-separated origins)
const frontendUrls = (process.env.FRONTEND_URL || "")
    .split(",")
    .map(url => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    ...frontendUrls
];

app.use(cors({
    origin: (origin, callback) => {
        // 1. Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        // 2. Allow any origin in non-production environments
        // 3. Allow wildcard '*' if configured
        // 4. Allow matching origin from allowedOrigins
        // 5. In unified mode (no custom FRONTEND_URL set), allow incoming origin
        if (
            !origin ||
            process.env.NODE_ENV !== "production" ||
            allowedOrigins.includes("*") ||
            allowedOrigins.includes(origin) ||
            frontendUrls.length === 0
        ) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
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
    console.log("Ok");
});

// Serve frontend static files in production or if dist directory exists
const distPath = path.join(__dirname, "../Frontend/dist");
const distExists = fs.existsSync(distPath);

if (process.env.NODE_ENV === "production" || distExists) {
    if (distExists) {
        app.use(express.static(distPath));
        // Fallback for Single Page Application routing (Express 5 compatible)
        app.use((req, res, next) => {
            if (req.path.startsWith("/api")) {
                return res.status(404).json({ error: "API route not found" });
            }
            if (req.method === "GET") {
                return res.sendFile(path.join(distPath, "index.html"));
            }
            next();
        });
    } else {
        console.warn("⚠️ Production mode is active but Frontend/dist was not found. Please run 'npm run build'.");
    }
}

// Start server directly in In-Memory mode without MongoDB
const server = app.listen(PORT, () => {
    console.log(`🚀 QuickCodeAI-GPT server running on port ${PORT} (In-Memory Storage Mode — Zero Database Required)`);
});

// Graceful shutdown handling for container and cloud platforms
const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
