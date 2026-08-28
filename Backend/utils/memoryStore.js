/**
 * QuickCodeAI-GPT — In-Memory Thread & Chat Store
 * Stores conversations in server memory during the active session.
 * Zero database required (no MongoDB or external services needed).
 */

const threads = new Map();

export const getAllThreads = () => {
    return Array.from(threads.values()).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
};

export const getThread = (threadId) => {
    return threads.get(threadId) || null;
};

export const saveUserMessage = (threadId, message) => {
    let thread = threads.get(threadId);
    if (!thread) {
        thread = {
            threadId,
            title: message.trim().substring(0, 100),
            messages: [{ role: "user", content: message.trim() }],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        threads.set(threadId, thread);
    } else {
        thread.messages.push({ role: "user", content: message.trim() });
        thread.updatedAt = new Date();
    }
    return thread;
};

export const saveAssistantReply = (threadId, reply) => {
    const thread = threads.get(threadId);
    if (thread) {
        thread.messages.push({ role: "assistant", content: reply });
        thread.updatedAt = new Date();
    }
    return thread;
};

export const renameThread = (threadId, title) => {
    const thread = threads.get(threadId);
    if (!thread) return null;
    thread.title = title.trim();
    thread.updatedAt = new Date();
    return thread;
};

export const deleteThread = (threadId) => {
    return threads.delete(threadId);
};

export const clearAllThreads = () => {
    threads.clear();
};

export default {
    getAllThreads,
    getThread,
    saveUserMessage,
    saveAssistantReply,
    renameThread,
    deleteThread,
    clearAllThreads
};
