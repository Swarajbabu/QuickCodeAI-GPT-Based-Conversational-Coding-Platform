import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useCallback } from 'react';
import { v1 as uuidv1 } from "uuid";

function App() {
    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);
    const [currThreadId, setCurrThreadId] = useState(uuidv1());
    const [prevChats, setPrevChats] = useState([]);
    const [newChat, setNewChat] = useState(true);
    const [allThreads, setAllThreads] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Toast notification system
    const addToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const providerValues = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads,
        sidebarOpen, setSidebarOpen,
        addToast
    };

    return (
        <div className='app'>
            <MyContext.Provider value={providerValues}>
                <Sidebar />
                <ChatWindow />

                {/* Mobile overlay */}
                <div
                    className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />

                {/* Toast notifications */}
                <div className="toast-container" role="status" aria-live="polite">
                    {toasts.map(toast => (
                        <div
                            key={toast.id}
                            className={`toast toast-${toast.type}`}
                            onClick={() => removeToast(toast.id)}
                        >
                            <i className={`fa-solid ${
                                toast.type === 'error' ? 'fa-circle-exclamation' :
                                toast.type === 'success' ? 'fa-circle-check' :
                                'fa-circle-info'
                            }`}></i>
                            <span>{toast.message}</span>
                        </div>
                    ))}
                </div>
            </MyContext.Provider>
        </div>
    );
}

export default App;
