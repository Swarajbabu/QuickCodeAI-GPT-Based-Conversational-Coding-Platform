import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const {
        allThreads, setAllThreads,
        currThreadId, setCurrThreadId,
        setNewChat, setPrompt, setReply,
        setPrevChats, sidebarOpen, setSidebarOpen,
        addToast
    } = useContext(MyContext);

    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState("");

    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8081/api/thread");
            if (!response.ok) throw new Error("Failed to fetch");
            const res = await response.json();
            const filteredData = res.map(thread => ({
                threadId: thread.threadId,
                title: thread.title
            }));
            setAllThreads(filteredData);
        } catch (err) {
            console.error("Failed to load threads:", err);
            addToast("Failed to load chat history", "error");
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setSidebarOpen(false);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(`http://localhost:8081/api/thread/${newThreadId}`);
            if (!response.ok) throw new Error("Failed to fetch");
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
            setSidebarOpen(false);
        } catch (err) {
            console.error("Failed to load thread:", err);
            addToast("Failed to load conversation", "error");
        }
    };

    const deleteThread = async (e, threadId) => {
        e.stopPropagation();
        try {
            const response = await fetch(`http://localhost:8081/api/thread/${threadId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Failed to delete");

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            addToast("Chat deleted", "success");

            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.error("Failed to delete thread:", err);
            addToast("Failed to delete chat", "error");
        }
    };

    const startRename = (e, threadId, currentTitle) => {
        e.stopPropagation();
        setRenamingId(threadId);
        setRenameValue(currentTitle);
    };

    const submitRename = async (threadId) => {
        if (!renameValue.trim()) {
            setRenamingId(null);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/thread/${threadId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: renameValue.trim() })
            });
            if (!response.ok) throw new Error("Failed to rename");

            setAllThreads(prev =>
                prev.map(t => t.threadId === threadId ? { ...t, title: renameValue.trim() } : t)
            );
            addToast("Chat renamed", "success");
        } catch (err) {
            console.error("Failed to rename:", err);
            addToast("Failed to rename chat", "error");
        }
        setRenamingId(null);
    };

    const handleRenameKeyDown = (e, threadId) => {
        if (e.key === "Enter") {
            submitRename(threadId);
        } else if (e.key === "Escape") {
            setRenamingId(null);
        }
    };

    return (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Chat history">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <i className="fa-solid fa-bolt"></i>
                    </div>
                    <span className="brand-text">QuickCodeAI</span>
                </div>
                <button
                    className="new-chat-btn"
                    onClick={createNewChat}
                    aria-label="Create new chat"
                >
                    <i className="fa-solid fa-plus"></i>
                    New Chat
                </button>
            </div>

            {/* Thread list */}
            <div className="thread-list-section">
                {allThreads.length > 0 && (
                    <div className="thread-list-label">Recent Chats</div>
                )}
                <ul className="thread-list">
                    {allThreads.length === 0 ? (
                        <li className="thread-empty">
                            <i className="fa-regular fa-comments"></i>
                            <p>No conversations yet</p>
                        </li>
                    ) : (
                        allThreads.map((thread) => (
                            <li
                                key={thread.threadId}
                                className={`thread-item ${thread.threadId === currThreadId ? 'active' : ''}`}
                                onClick={() => changeThread(thread.threadId)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && changeThread(thread.threadId)}
                                aria-label={`Open chat: ${thread.title}`}
                                aria-current={thread.threadId === currThreadId ? 'true' : undefined}
                            >
                                <i className="fa-regular fa-message thread-icon"></i>
                                {renamingId === thread.threadId ? (
                                    <input
                                        className="rename-input"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => handleRenameKeyDown(e, thread.threadId)}
                                        onBlur={() => submitRename(thread.threadId)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                        aria-label="Rename chat"
                                    />
                                ) : (
                                    <span className="thread-title">{thread.title}</span>
                                )}
                                <div className="thread-actions">
                                    <button
                                        className="thread-action-btn"
                                        onClick={(e) => startRename(e, thread.threadId, thread.title)}
                                        aria-label={`Rename chat: ${thread.title}`}
                                        title="Rename"
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button
                                        className="thread-action-btn delete-btn"
                                        onClick={(e) => deleteThread(e, thread.threadId)}
                                        aria-label={`Delete chat: ${thread.title}`}
                                        title="Delete"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <p>Powered by <span className="footer-brand">QuickCodeAI-GPT</span></p>
            </div>
        </aside>
    );
}

export default Sidebar;