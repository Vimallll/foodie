import React, { useState } from "react";
import "./ChatbotPopup.css";
import { sendChatMessage } from "../../services/api";

const ChatbotPopup = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await sendChatMessage(message);

      const botMsg = {
        sender: "bot",
        text: res.data.reply || "Sorry, I didn't understand.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error. Try again later." },
      ]);
    }

    setMessage("");
  };

  return (
    <>
      {/* Floating Button */}
      <div 
        className={`chatbot-fab ${open ? 'active' : ''}`} 
        onClick={() => setOpen(!open)}
        title="Chat with us"
      >
        {!open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
            <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="chatbot-header-text">
                <div className="chatbot-title">Foodie Assistant</div>
                <div className="chatbot-subtitle">We typically reply in a few minutes</div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div className="welcome-icon">👋</div>
                <div className="welcome-text">Hi! I'm here to help you find delicious food. What would you like to order today?</div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.sender}`}
              >
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <div className="chatbot-input-wrapper">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="chatbot-input-field"
              />
              <button 
                onClick={handleSend} 
                className="chatbot-send-btn"
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;
