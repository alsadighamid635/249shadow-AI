import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useLang } from "../context/LangContext.jsx";

function formatTime(timestamp, lang) {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleTimeString(lang === "ar" ? "ar" : "en", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function parseSource(source) {
  const value = typeof source === "string" ? source : String(source ?? "");
  const labelMatch = value.match(/^\[(.+?)\]/);
  const urlMatch = value.match(/\((.+?)\)$/);
  return {
    label: labelMatch?.[1] ?? value,
    url: urlMatch?.[1] ?? "#",
  };
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.8 20 6v5.3c0 5.1-3.4 8.5-8 10-4.6-1.5-8-4.9-8-10V6l8-3.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m8.5 12.1 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PersonMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 20c.5-3.2 2.8-5 6.5-5s6 1.8 6.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const CODE_RENDERER = {
  code({ inline, className, children, ...props }) {
    const language = /language-(\w+)/.exec(className || "")?.[1];
    if (!inline && language) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{ borderRadius: "8px", fontSize: "13px" }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },
};

function AttachmentPreview({ attachment }) {
  if (!attachment) return null;
  const isImage = attachment.type?.startsWith("image/");
  let typeLabel = "FILE";
  if (attachment.type === "application/pdf") typeLabel = "PDF";
  else if (attachment.type === "text/plain") typeLabel = "TXT";
  else if (attachment.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") typeLabel = "DOCX";
  else if (isImage) typeLabel = "IMG";

  return (
    <div className="msg-attachment">
      {isImage && attachment.preview ? (
        <img src={attachment.preview} alt={attachment.name} className="msg-attachment-img" />
      ) : (
        <div className="msg-attachment-doc">
          <span className="msg-attachment-icon" aria-hidden="true">{typeLabel}</span>
          <span className="msg-attachment-name">{attachment.name}</span>
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const { t, lang } = useLang();
  const { role, content, confidence, sources, timestamp, attachment } = message;
  const isUser = role === "user";
  const confidenceLabels = {
    high: t.confident,
    medium: t.partial,
    low: t.learning,
  };

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="message-avatar" role="img" aria-label="Delta-Security">
          <BrandMark />
        </div>
      )}
      <div className="message-body">
        <div className="message-bubble">
          {isUser ? (
            <>
              {attachment && <AttachmentPreview attachment={attachment} />}
              {content && <span dir="auto">{content}</span>}
            </>
          ) : (
            <div className="markdown" dir="auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={CODE_RENDERER}>
                {content || ""}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div className="message-meta">
          <span className="message-time">{formatTime(timestamp, lang)}</span>
          {!isUser && confidence && (
            <span className={`confidence-badge ${confidence}`} title={t.confidenceLabel}>
              {confidenceLabels[confidence] ?? confidence}
            </span>
          )}
        </div>
        {!isUser && Array.isArray(sources) && sources.length > 0 && (
          <div className="message-sources" aria-label={t.sources}>
            {sources.map((source, index) => {
              const { label, url } = parseSource(source);
              return (
                <a
                  key={`${index}-${url}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="source-link"
                  aria-label={`${t.source}: ${label}`}
                >
                  {label}
                </a>
              );
            })}
          </div>
        )}
      </div>
      {isUser && (
        <div className="message-avatar user-avatar" role="img" aria-label={t.you}>
          <PersonMark />
        </div>
      )}
    </div>
  );
}
