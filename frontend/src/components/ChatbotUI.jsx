import React, { useState, useEffect, useRef } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import "./ChatbotUI.css";

const TypingText = ({ text, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timer);
        } else {
            setIsComplete(true);
        }
    }, [currentIndex, text, speed]);

    return (
        <span className={isComplete ? "" : "typing-animation"}>
            {displayedText}
            {!isComplete && <span className="typing-cursor">|</span>}
        </span>
    );
};

export default function ChatbotUI() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatStarted, setChatStarted] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        const apiHistory = messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
        }));

        try {
            const res = await fetch(`${apiUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, history: apiHistory }),
            });

            const data = await res.json();

            const aiMessage = {
                sender: "ai",
                text: data.reply || "SERA didn’t respond.",
                image: data.image || null,
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { sender: "ai", text: "⚠️ Error: Could not connect to the AI server.", isError: true },
            ]);
        }

        setLoading(false);
    };

    const handleContactDeveloper = () => {
        window.open("https://www.messenger.com/e2ee/t/9899403416776668", "_blank");
    };

    return (
        <div className="chatbot-container">
            {!chatStarted ? (
                <div className="intro-screen">
                    <h1 className="intro-title">Welcome to SERA AI</h1>
                    <p className="intro-desc">
                        Meet <span className="highlight">SERA AI</span> — your smart assistant powered by Gemini-2.5-flash.
                        Whether you need answers, ideas, or just a friendly chat, SERA AI is ready to assist you.
                    </p>

                    <button className="start-btn" onClick={() => setChatStarted(true)}>
                        Start Chat
                    </button>

                    <div className="social-icons">
                        <a href="https://www.facebook.com/gerardo.sapida.1" target="_blank" rel="noopener noreferrer">
                            <FaFacebook />
                        </a>
                        <a href="https://x.com/jr39170" target="_blank" rel="noopener noreferrer">
                            <FaTwitter />
                        </a>
                        <a href="https://github.com/ggs2000" target="_blank" rel="noopener noreferrer">
                            <FaGithub />
                        </a>
                        <a href="https://www.instagram.com/jayr24__/" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a>
                    </div>

                    <footer className="intro-footer">SERA AI | Copyright © 2025.</footer>
                </div>
            ) : (
                <div className="chat-screen">
                    <div className="messages">
                        {messages.length === 0 ? (
                            <p className="empty-text">Say hello to SERA AI!</p>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`message - row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
                                >
                                    {msg.sender === "ai" && (
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/4712/4712104.png"
                                            alt="AI Avatar"
                                            className="avatar"
                                        />
                                    )}

                                    <div
                                        className={`message - bubble ${msg.sender === "user" ? "user-msg" : "ai-msg"}`}
                                    >

                                        {msg.sender === 'ai' ? (
                                            <TypingText text={msg.text} speed={30} />
                                        ) : (
                                            msg.text
                                        )}

                                        {msg.image && (
                                            <div className="image-container">
                                                <img
                                                    src={msg.image}
                                                    alt="AI Response"
                                                    className="chat-image"
                                                />
                                            </div>
                                        )}


                                        {msg.isError && (
                                            <button className="contact-btn" onClick={handleContactDeveloper}>
                                                Contact Developer
                                            </button>
                                        )}
                                    </div>

                                    {msg.sender === "user" && (
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                            alt="User Avatar"
                                            className="avatar user-avatar"
                                        />
                                    )}
                                </div>
                            ))
                        )}
                        {loading && <p className="thinking-text"></p>}
                    </div>

                    <div className="input-bar">
                        <input
                            type="text"
                            placeholder="Ask SERA..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button onClick={handleSend} disabled={loading}>
                            <IoSend size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
