import "./Chat.css";
import { useContext, useState, useEffect, useCallback } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

/**
 * Wrapper component that adds a copy button to code blocks
 */
function CodeBlock({ children, className, ...props }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const code = extractText(children);
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement("textarea");
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Check if this is a code block (inside <pre>) vs inline code
    const isBlock = className || (typeof children === "string" && children.includes("\n"));

    if (!isBlock) {
        return <code className={className} {...props}>{children}</code>;
    }

    return (
        <div className="code-block-wrapper">
            <button
                className={`copy-code-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                aria-label="Copy code"
            >
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <code className={className} {...props}>{children}</code>
        </div>
    );
}

/** Recursively extract text from React children */
function extractText(children) {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) return children.map(extractText).join("");
    if (children?.props?.children) return extractText(children.props.children);
    return "";
}

/**
 * Single message bubble component
 */
function MessageBubble({ role, content, isTyping = false }) {
    return (
        <div className={`message-row ${role === "user" ? "user-row" : "ai-row"}`}>
            <div className={`message-avatar ${role === "user" ? "user-avatar-small" : "ai-avatar"}`}>
                <i className={`fa-solid ${role === "user" ? "fa-user" : "fa-bolt"}`}></i>
            </div>
            <div className="message-content">
                {role === "user" ? (
                    <div className="user-message">{content}</div>
                ) : (
                    <div className="ai-message">
                        <ReactMarkdown
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                                code: CodeBlock
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

function Chat() {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    // Word-by-word typing animation for the latest reply
    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        if (!prevChats?.length) return;

        const words = reply.split(" ");
        let idx = 0;

        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) clearInterval(interval);
        }, 30);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    if (newChat || !prevChats?.length) {
        return null;
    }

    // All messages except the last one (which may be the typing one)
    const previousMessages = prevChats.slice(0, -1);
    const lastMessage = prevChats[prevChats.length - 1];

    return (
        <div className="messages-container">
            {/* Render all previous messages normally */}
            {previousMessages.map((chat, idx) => (
                <MessageBubble
                    key={idx}
                    role={chat.role}
                    content={chat.content}
                />
            ))}

            {/* Last message — either typing animation or full render */}
            {lastMessage && (
                lastMessage.role === "assistant" && latestReply !== null ? (
                    <MessageBubble
                        key="typing"
                        role="assistant"
                        content={latestReply}
                        isTyping={true}
                    />
                ) : (
                    <MessageBubble
                        key="last"
                        role={lastMessage.role}
                        content={lastMessage.content}
                    />
                )
            )}
        </div>
    );
}

export default Chat;