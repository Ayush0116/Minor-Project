
import React, { useRef, useState, useEffect } from "react";
import {
  BrainCircuit,
  User,
  Paperclip,
  Send,
  Sparkles,
  ArrowUpRight,
  FileText,
  Image,
  Camera,
} from "lucide-react";
import "./chatbot.css";
import LeftNavbar from "../Navbar/left-navbar/leftnavbar";

const API_URL =
  `${import.meta.env.VITE_AI_API_BASE_URL || "http://127.0.0.1:8000"}/api/ai/chatbot`;

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    text: "Welcome to Career Curator AI! I'm here to help with your career, skills, projects, resumes, and interview preparation. What would you like help with?",
    time: "Just now",
  },
];

const QUICK_PROMPTS = [
  "What career suits me?",
  "Improve my skills",
  "Find my next step",
];

const Chatbot = () => {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const textareaRef = useRef(null);
  const chatAreaRef = useRef(null);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop =
        chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const formatTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      console.log("Selected File:", file);
      setError(
        "File selected. File analysis is not connected to the chatbot API yet."
      );
    }

    e.target.value = "";
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setError("");

    e.target.style.height = "24px";
    e.target.style.height =
      Math.min(e.target.scrollHeight, 130) + "px";
  };

  const sendMessage = async (messageText = input) => {
    const message = messageText.trim();

    if (!message || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: message,
      time: formatTime(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "The chatbot could not respond. Please try again.";

        throw new Error(detail);
      }

      if (!data.success || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The chatbot returned an empty response. Please try again.");
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.reply.trim(),
          time: formatTime(),
        },
      ]);
    } catch (err) {
      console.error("Chatbot request failed:", err);

      setError(
        err.message ||
          "Unable to connect to Career Curator AI. Please check whether the AI server is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <>
      <LeftNavbar />

      <div className="chat-container">
        {/* ================= TOP AI HEADER ================= */}
        <div className="chat-topbar">
          <div className="ai-status">
            <div className="ai-avatar-small">
              <Sparkles size={17} />
            </div>
            <div>
              <div className="ai-name">
                Curator AI
                <span className="online-dot"></span>
              </div>
              <div className="ai-status-text">
                Your personal career companion
              </div>
            </div>
          </div>

          <div className="ai-powered">
            <Sparkles size={13} />
            AI Career Guide
          </div>
        </div>

        {/* ================= CHAT AREA ================= */}
        <div className="chat-area" ref={chatAreaRef}>
          {/* Welcome */}
          <div className="welcome-block">
            <div className="welcome-icon">
              <Sparkles size={22} />
            </div>
            <h1>Let's shape your career.</h1>
            <p>
              Tell me what you're working towards, and I'll help you find the
              smartest next step.
            </p>
          </div>

          {/* DYNAMIC MESSAGES */}
          {messages.map((message) => (
            <div
              className={`chat-row ${
                message.role === "user" ? "user-row" : ""
              }`}
              key={message.id}
            >
              {message.role === "assistant" && (
                <div className="icon ai-icon">
                  <BrainCircuit size={19} />
                </div>
              )}

              <div
                className={`message-wrapper ${
                  message.role === "user" ? "user-wrapper" : ""
                }`}
              >
                <div
                  className={`message-meta ${
                    message.role === "user" ? "user-meta" : ""
                  }`}
                >
                  <span>
                    {message.role === "user" ? "You" : "Curator AI"}
                  </span>
                  <span>{message.time}</span>
                </div>

                <div
                  className={`chat-message ${
                    message.role === "user" ? "user" : "ai"
                  }`}
                >
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {message.text}
                  </p>
                </div>
              </div>

              {message.role === "user" && (
                <div className="icon user-icon">
                  <User size={19} />
                </div>
              )}
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {isLoading && (
            <div className="typing-row">
              <div className="typing-avatar">
                <BrainCircuit size={15} />
              </div>
              <div className="typing-bubble">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <small>Curator AI is thinking...</small>
            </div>
          )}

          {error && (
            <div className="chat-row">
              <div className="icon ai-icon">
                <BrainCircuit size={19} />
              </div>
              <div className="message-wrapper">
                <div className="chat-message ai">
                  <p role="alert">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= INPUT AREA ================= */}
        <div className="chat-input-area">
          <div className="quick-prompts">
            <span>Try asking</span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="input-box" onSubmit={handleSubmit}>
            <div className="attachment-wrapper">
              <button
                className="icon-btn"
                type="button"
                aria-label="Attach"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={isLoading}
              >
                <Paperclip size={19} />
              </button>

              {/* ATTACHMENT MENU */}
              {showAttachMenu && (
                <div className="attachment-menu">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                  >
                    <div className="attachment-menu-icon file">
                      <FileText size={18} />
                    </div>
                    <div>
                      <strong>File</strong>
                      <span>Upload a document</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      photoInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                  >
                    <div className="attachment-menu-icon photo">
                      <Image size={18} />
                    </div>
                    <div>
                      <strong>Photo</strong>
                      <span>Choose from photos</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      cameraInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                  >
                    <div className="attachment-menu-icon camera">
                      <Camera size={18} />
                    </div>
                    <div>
                      <strong>Camera</strong>
                      <span>Take a new photo</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* HIDDEN FILE INPUTS */}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileSelect}
            />
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileSelect}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={handleFileSelect}
            />

            {/* TEXTAREA */}
            <textarea
              ref={textareaRef}
              rows="1"
              value={input}
              placeholder="Ask Curator AI anything about your career..."
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            {/* SEND */}
            <button
              className="send-btn"
              type="submit"
              aria-label="Send message"
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>

          <div className="input-hint">
            Curator AI can help with careers, skills, resumes and learning paths.
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
