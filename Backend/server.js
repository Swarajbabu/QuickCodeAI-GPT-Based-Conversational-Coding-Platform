import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));

// Routes
app.use("/api", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "QuickCodeAI-GPT API" });
});

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
