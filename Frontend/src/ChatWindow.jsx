import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "./config.js";

function ChatWindow() {
    const {
        prompt, setPrompt,
        reply, setReply,
        currThreadId,
        setPrevChats, setNewChat,
        newChat, sidebarOpen, setSidebarOpen,
        theme, toggleTheme,
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
        el.style.height = Math.min(el.scrollHeight, 180) + "px";
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
            const response = await fetch(`${API_BASE_URL}/api/chat`, options);
            let res = null;
            try {
                res = await response.json();
            } catch {
                // If response wasn't valid JSON (e.g. proxy timeout/502), fallback to status message
            }

            if (!response.ok) {
                throw new Error(res?.error || `Server error (${response.status}). Please check backend.`);
            }

            if (!res?.reply) {
                throw new Error("Empty reply received from AI server. Please try again.");
            }

            setReply(res.reply);
        } catch (err) {
            console.error("Chat error:", err);
            addToast(err.message || "Failed to get AI response. Please check server.", "error");
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
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const suggestions = [
        {
            icon: "fa-code",
            title: "Algorithm Implementation",
            text: "Write a high-performance Python script to find all prime numbers up to N using the Sieve of Eratosthenes"
        },
        {
            icon: "fa-react",
            title: "React Architecture",
            text: "Explain how React 19 Actions and useActionState work with an interactive form example"
        },
        {
            icon: "fa-bug",
            title: "Debugging & Review",
            text: "What are the most common causes of memory leaks in Node.js event listeners, and how do you fix them?"
        },
        {
            icon: "fa-database",
            title: "Database Query",
            text: "Write an optimized MongoDB aggregation pipeline to group orders by month and compute revenue"
        }
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
                        <span className="navbar-brand-name">QuickCodeAI</span>
                        <div className="model-badge">
                            <span className="model-pulse"></span>
                            <span>Groq · Qwen 3.8</span>
                        </div>
                    </div>
                </div>

                <div className="navbar-right" ref={dropdownRef}>
                    {/* Theme Toggle Button */}
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light (white)' : 'dark (black)'} background`}
                    >
                        <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                        <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>

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
                            <div className="dropdown-header">
                                <span className="dropdown-user-name">Developer</span>
                                <span className="dropdown-user-role">Free Tier</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button
                                className="dropdown-item"
                                role="menuitem"
                                onClick={() => {
                                    toggleTheme();
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                                Switch to {theme === 'dark' ? 'Light (White)' : 'Dark (Black)'}
                            </button>
                            <button
                                className="dropdown-item"
                                role="menuitem"
                                onClick={() => {
                                    addToast("Settings coming soon!", "info");
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <i className="fa-solid fa-gear"></i>
                                Preferences
                            </button>
                            <div className="dropdown-divider"></div>
                            <button
                                className="dropdown-item dropdown-item-muted"
                                role="menuitem"
                                onClick={() => {
                                    addToast("Session is local", "info");
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Chat area */}
            <div className="chat-area" ref={chatAreaRef}>
                {newChat ? (
                    <div className="empty-state">
                        <div className="empty-state-badge">
                            <div className="empty-state-icon">
                                <i className="fa-solid fa-terminal"></i>
                            </div>
                        </div>

                        <h1 className="empty-state-title">What would you like to build?</h1>
                        <p className="empty-state-desc">
                            Ask me to write code, review architecture, debug issues, or explain complex technical concepts.
                        </p>

                        <div className="suggestion-grid">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className="suggestion-card"
                                    onClick={() => handleSuggestionClick(s.text)}
                                >
                                    <div className="suggestion-card-header">
                                        <div className="suggestion-icon">
                                            <i className={`fa-solid ${s.icon}`}></i>
                                        </div>
                                        <span className="suggestion-title">{s.title}</span>
                                        <i className="fa-solid fa-arrow-up-right-from-square suggestion-arrow"></i>
                                    </div>
                                    <p className="suggestion-snippet">{s.text}</p>
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
                        <span className="loading-text">Generating code solution...</span>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="chat-input-area">
                <div className="input-container">
                    <div className="input-wrapper">
                        <textarea
                            ref={textareaRef}
                            placeholder="Ask QuickCodeAI anything about your code..."
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
                            title="Send message"
                        >
                            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-arrow-up'}`}></i>
                        </button>
                    </div>
                    <div className="input-footer">
                        <span>Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for a new line</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;