import express from "express";
import Thread from "../models/Thread.js";
import getAIResponse from "../utils/openai.js";

const router = express.Router();

// Get all threads (sorted by most recently updated)
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.error("Failed to fetch threads:", err.message);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get messages for a specific thread
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);
    } catch (err) {
        console.error("Failed to fetch chat:", err.message);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId });

        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.error("Failed to delete thread:", err.message);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Rename a thread
router.patch("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const thread = await Thread.findOneAndUpdate(
            { threadId },
            { title: title.trim(), updatedAt: new Date() },
            { new: true }
        );

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json({ success: "Thread renamed successfully", thread });
    } catch (err) {
        console.error("Failed to rename thread:", err.message);
        res.status(500).json({ error: "Failed to rename thread" });
    }
});

// Send a message and get AI response
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message || !message.trim()) {
        return res.status(400).json({ error: "threadId and message are required" });
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            // Create a new thread
            thread = new Thread({
                threadId,
                title: message.trim().substring(0, 100),
                messages: [{ role: "user", content: message.trim() }]
            });
        } else {
            thread.messages.push({ role: "user", content: message.trim() });
        }

        // Build conversation history for OpenAI (send full context)
        const conversationHistory = thread.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const assistantReply = await getAIResponse(conversationHistory);

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        res.json({ reply: assistantReply });
    } catch (err) {
        console.error("Chat error:", err.message);

        // Provide specific error messages for common OpenAI failures
        if (err.message.includes("rate limit")) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment and try again." });
        }
        if (err.message.includes("invalid") || err.message.includes("API key")) {
            return res.status(401).json({ error: "Invalid API key. Please check your configuration." });
        }

        res.status(500).json({ error: "Failed to get AI response. Please try again." });
    }
});

export default router;