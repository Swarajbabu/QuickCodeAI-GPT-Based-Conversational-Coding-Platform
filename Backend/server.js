import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import chatRoutes from "./routes/chat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Early warning for environment variables
if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI environment variable is missing! MongoDB connection may fail.");
}
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
        // Allow requests with no origin or matching configured origins, or all in non-production
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
    res.json({ status: "ok", service: "QuickCodeAI-GPT API" });
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

// Connect to MongoDB first, then start server
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
};

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 QuickCodeAI-GPT server running on port ${PORT}`);
    });
};

startServer();
