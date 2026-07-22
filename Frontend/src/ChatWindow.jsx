import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";

function ChatWindow() {
    const {
        prompt, setPrompt,
        reply, setReply,
        currThreadId,
        setPrevChats, setNewChat,
        newChat, sidebarOpen, setSidebarOpen,
        addToast
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const chatAreaRef = useRef(null);
    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);

    // Auto-scroll to bottom when new messages appear
    const scrollToBottom = () => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [reply, loading]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-resize textarea
    const handleTextareaChange = (e) => {
        setPrompt(e.target.value);
        const el = e.target;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 150) + "px";
    };

    const getReply = async () => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || loading) return;

        setLoading(true);
        setNewChat(false);

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: trimmedPrompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();

            if (!response.ok) {
                throw new Error(res.error || "Failed to get response");
            }

            setReply(res.reply);
        } catch (err) {
            console.error("Chat error:", err);
            addToast(err.message || "Failed to get AI response. Please try again.", "error");
            // Don't update prevChats on error — leave the conversation as-is
        }

        setLoading(false);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    // Append new chat to prevChats when reply arrives
    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => ([
                ...prevChats,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]));
        }
        setPrompt("");
    }, [reply]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            getReply();
        }
    };

    const handleSuggestionClick = (text) => {
        setPrompt(text);
        // Focus the textarea
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const suggestions = [
        { icon: "fa-code", text: "Write a Python function to sort a list" },
        { icon: "fa-lightbulb", text: "Explain async/await in JavaScript" },
        { icon: "fa-bug", text: "Debug this code snippet for me" },
        { icon: "fa-rocket", text: "Help me optimize a SQL query" }
    ];

    return (
        <div className="chat-window">
            {/* Navbar */}
            <nav className="navbar" role="banner">
                <div className="navbar-left">
                    <button
                        className="menu-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <div className="navbar-title">
                        QuickCodeAI-GPT
                        <span className="model-badge">GPT-4o mini</span>
                    </div>
                </div>

                <div className="navbar-right" ref={dropdownRef}>
                    <button
                        className="user-avatar"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-label="User menu"
                        aria-expanded={isDropdownOpen}
                    >
                        <i className="fa-solid fa-user"></i>
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown" role="menu">
                            <button className="dropdown-item" role="menuitem" onClick={() => {
                                addToast("Settings coming soon!", "info");
                                setIsDropdownOpen(false);
                            }}>
                                <i className="fa-solid fa-gear"></i>
                                Settings
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" role="menuitem" onClick={() => {
                                addToast("Authentication coming soon!", "info");
                                setIsDropdownOpen(false);
                            }}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Chat area */}
            <div className="chat-area" ref={chatAreaRef}>
                {newChat ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <i className="fa-solid fa-bolt"></i>
                        </div>
                        <h2>How can I help you today?</h2>
                        <p>Ask me anything about coding, debugging, or software development.</p>
                        <div className="suggestion-chips">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className="suggestion-chip"
                                    onClick={() => handleSuggestionClick(s.text)}
                                >
                                    <i className={`fa-solid ${s.icon}`}></i>
                                    {s.text}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-area-inner">
                        <Chat />
                    </div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="loading-indicator">
                        <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span className="loading-text">Thinking...</span>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="chat-input-area">
                <div className="input-container">
                    <div className="input-wrapper">
                        <textarea
                            ref={textareaRef}
                            placeholder="Ask anything..."
                            value={prompt}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            aria-label="Chat message input"
                            disabled={loading}
                        />
                        <button
                            className="send-btn"
                            onClick={getReply}
                            disabled={!prompt.trim() || loading}
                            aria-label="Send message"
                        >
                            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-arrow-up'}`}></i>
                        </button>
                    </div>
                    <div className="input-footer">
                        <p>QuickCodeAI-GPT can make mistakes. Verify important information.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;