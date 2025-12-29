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
      <div className="chatbot-fab" onClick={() => setOpen(!open)}>
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            Foodie Assistant
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about food..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;
