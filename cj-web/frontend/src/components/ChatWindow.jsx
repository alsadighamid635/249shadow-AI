import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import { useLang } from "../context/LangContext.jsx";

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.8 20 6v5.3c0 5.1-3.4 8.5-8 10-4.6-1.5-8-4.9-8-10V6l8-3.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m8.5 12.1 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatWindow({ messages, loading, suggestions, onSuggestion }) {
  const { t } = useLang();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <section className="chat-window" aria-label={t.conversation}>
        <div className="chat-empty">
          <div className="chat-empty-icon"><BrandMark /></div>
          <h2>Delta-Security</h2>
          <p>{t.chatDesc}</p>
          <div className="suggestions-label">{t.tryAsking}</div>
          <div className="chat-suggestions">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                className="chat-suggestion"
                type="button"
                onClick={() => onSuggestion(suggestion)}
                title={`${t.ask}: ${suggestion}`}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3.8v16.4M3.8 12h16.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-window" aria-label={t.conversation} aria-live="polite">
      {messages.map((message, index) => (
        <MessageBubble key={`${message.timestamp || "message"}-${index}`} message={message} />
      ))}
      {loading && (
        <div className="message-row assistant" role="status" aria-label={t.generatingResponse}>
          <div className="message-avatar" aria-hidden="true"><BrandMark /></div>
          <div className="message-body">
            <div className="message-bubble">
              <div className="typing-indicator" aria-hidden="true">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span className="sr-only">{t.generatingResponse}</span>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </section>
  );
}
