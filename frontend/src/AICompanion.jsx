
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AICompanion.css";

const API_BASE = "http://localhost:5000";
const MAX_MESSAGE_LENGTH = 2000;

const starterSuggestions = [
  "I'm feeling stressed today.",
  "Help me organize my thoughts.",
  "Give me a short calming activity.",
  "I want to reflect on how my day went."
];

function AICompanion() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const requestInProgress = useRef(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  // Scroll to the latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Load saved conversation history
  const loadChatHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/chat/history`,
        {
          method: "GET",
          credentials: "include"
        }
      );

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load your conversation."
        );
      }

      if (Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((item, index) => ({
            id: item.id ?? `history-${index}`,
            sender: item.sender === "user" ? "user" : "assistant",
            message: String(item.message ?? ""),
            created_at: item.created_at ?? null
          }))
        );
      }
    } catch (err) {
      setError(
        err.message || "Unable to load your conversation history."
      );
    } finally {
      setLoadingHistory(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Send a message to the backend
  const sendMessage = async (messageText = input) => {
    const trimmedMessage = String(messageText).trim();

    if (
      !trimmedMessage ||
      trimmedMessage.length > MAX_MESSAGE_LENGTH ||
      requestInProgress.current ||
      loadingHistory
    ) {
      return;
    }

    requestInProgress.current = true;
    setLoading(true);
    setInput("");
    setError("");

    const temporaryId = `temp-${Date.now()}-${Math.random()}`;

    const userMessage = {
      id: temporaryId,
      sender: "user",
      message: trimmedMessage,
      created_at: new Date().toISOString()
    };

    // Keep previous messages for conversation context
    const previousMessages = messages;

    setMessages((current) => [
      ...current,
      userMessage
    ]);

    try {
      // The backend adds the current message separately.
      // Send only previous messages to avoid duplication.
      const conversation = previousMessages
        .filter(
          (item) =>
            item.sender === "user" ||
            item.sender === "assistant"
        )
        .slice(-10)
        .map((item) => ({
          role: item.sender,
          content: item.message
        }));

      const response = await fetch(
        `${API_BASE}/api/chat`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: trimmedMessage,
            conversation
          })
        }
      );

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        typeof data.response !== "string"
      ) {
        throw new Error(
          data.message ||
          "The AI Companion could not respond."
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        sender: "assistant",
        message: data.response,
        created_at: new Date().toISOString()
      };

      setMessages((current) => [
        ...current,
        assistantMessage
      ]);
    } catch (err) {
      // Remove the temporary message if the request failed
      setMessages((current) =>
        current.filter(
          (item) => item.id !== temporaryId
        )
      );

      setError(
        err.message ||
        "Something went wrong while contacting the AI Companion."
      );
    } finally {
      requestInProgress.current = false;
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle chat form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  // Format message timestamps
  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <div className="ai-companion-page">
      <main className="ai-companion-main">

        {/* INTRO */}
        <section className="ai-companion-intro">
          <div className="ai-intro-copy">
            <span className="ai-companion-eyebrow">
              PSYTECH AI COMPANION
            </span>

            <h1>
              A space to pause,
              <br />
              reflect, and talk.
            </h1>

            <p>
              Organize your thoughts, reflect on your
              feelings, and explore simple wellbeing
              activities at your own pace.
            </p>
          </div>

          <div className="ai-companion-status">
            <span className="ai-status-dot" />
            Ready to chat
          </div>
        </section>

        {/* CHAT WORKSPACE */}
        <section className="ai-companion-workspace">

          {/* CHAT CARD */}
          <div className="ai-chat-card">

            {/* CHAT HEADER */}
            <div className="ai-chat-header">
              <div className="ai-chat-title">
                <div
                  className="ai-chat-avatar"
                  aria-hidden="true"
                >
                  P
                </div>

                <div>
                  <h2>AI Companion</h2>
                  <span>
                    Supportive wellbeing conversation
                  </span>
                </div>
              </div>

              <div className="ai-online-label">
                <span />
                Available
              </div>
            </div>

            {/* CHAT MESSAGES */}
            <div
              className="ai-chat-messages"
              role="log"
              aria-label="Conversation"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {loadingHistory ? (
                <div className="ai-chat-loading">
                  <span className="ai-spinner" />
                  <p>Loading your conversation...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="ai-empty-state">
                  <div className="ai-empty-avatar">
                    P
                  </div>

                  <h3>
                    Hello, welcome to your space.
                  </h3>

                  <p>
                    You can talk about your day, reflect
                    on your thoughts, or ask for a simple
                    wellbeing activity. Start with
                    whatever feels comfortable.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`ai-message-row ${message.sender}`}
                  >
                    {message.sender === "assistant" && (
                      <div
                        className="ai-message-avatar"
                        aria-hidden="true"
                      >
                        P
                      </div>
                    )}

                    <div
                      className={`ai-message-content ${message.sender}`}
                    >
                      <div
                        className={`ai-message ${message.sender}`}
                      >
                        {message.message}
                      </div>

                      {message.created_at && (
                        <span className="ai-message-time">
                          {formatTime(message.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* TYPING INDICATOR */}
              {loading && (
                <div className="ai-message-row assistant">
                  <div
                    className="ai-message-avatar"
                    aria-hidden="true"
                  >
                    P
                  </div>

                  <div className="ai-message assistant ai-typing-bubble">
                    <span
                      className="typing-message"
                      aria-label="AI is typing"
                    >
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                className="ai-chat-error"
                role="alert"
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {/* MESSAGE INPUT */}
            <form
              className="ai-chat-input-area"
              onSubmit={handleSubmit}
            >
              <label
                className="ai-sr-only"
                htmlFor="ai-chat-input"
              >
                Message AI Companion
              </label>

              <input
                ref={inputRef}
                id="ai-chat-input"
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Type what's on your mind..."
                disabled={loading || loadingHistory}
                maxLength={MAX_MESSAGE_LENGTH}
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingHistory ||
                  !input.trim() ||
                  input.length > MAX_MESSAGE_LENGTH
                }
                aria-label="Send message"
                title="Send message"
              >
                <span aria-hidden="true">↑</span>
              </button>
            </form>

            <div className="ai-input-note">
              General wellbeing support only — not a
              substitute for professional mental health care.
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="ai-companion-sidebar">

            {/* STARTER PROMPTS */}
            <div className="ai-side-card">
              <span className="ai-side-label">
                START A CONVERSATION
              </span>

              <h3>Not sure what to say?</h3>

              <p>
                Choose a prompt to begin your reflection.
              </p>

              <div className="ai-prompt-list">
                {starterSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={loading || loadingHistory}
                  >
                    <span>{suggestion}</span>
                    <b aria-hidden="true">→</b>
                  </button>
                ))}
              </div>
            </div>

            {/* ABOUT AI COMPANION */}
            <div className="ai-side-card ai-boundary-card">
              <span className="ai-side-label">
                ABOUT AI COMPANION
              </span>

              <h3>Designed for wellbeing</h3>

              <ul>
                <li>
                  Helps with reflection and organizing thoughts.
                </li>

                <li>
                  Can suggest general wellbeing activities.
                </li>

                <li>
                  Does not diagnose mental health conditions.
                </li>

                <li>
                  Does not prescribe medication or treatment.
                </li>
              </ul>

              <div className="ai-boundary-note">
                If you need extra support, consider speaking
                with a trusted adult or a qualified professional.
              </div>

              <Link to="/professional-help">
                Explore Professional Help →
              </Link>
            </div>
          </aside>
        </section>

        {/* BOTTOM CARDS */}
        <section className="ai-companion-bottom">

          {/* JOURNAL CARD */}
          <div className="ai-bottom-card">
            <div
              className="ai-bottom-icon"
              aria-hidden="true"
            >
              ✎
            </div>

            <div className="ai-bottom-copy">
              <h3>Reflect through journaling</h3>

              <p>
                Write down your thoughts and keep a
                personal record of your reflections.
              </p>
            </div>

            <Link to="/journal">
              Open Journal →
            </Link>
          </div>

          {/* WELLNESS STUDIO CARD */}
          <div className="ai-bottom-card">
            <div
              className="ai-bottom-icon"
              aria-hidden="true"
            >
              ◌
            </div>

            <div className="ai-bottom-copy">
              <h3>Try a wellness activity</h3>

              <p>
                Explore guided activities for grounding,
                relaxation, reflection, and focus.
              </p>
            </div>

            <Link to="/wellness-studio">
              Open Studio →
            </Link>
          </div>
        </section>

        {/* DISCLAIMER */}
        <p className="ai-companion-disclaimer">
          PsyTech is a mental wellbeing and self-reflection
          platform. The AI Companion provides general
          supportive information and does not replace
          qualified professional care. If you feel unsafe
          or need urgent help, contact a trusted adult or
          local emergency support.
        </p>
      </main>
    </div>
  );
}

export default AICompanion;