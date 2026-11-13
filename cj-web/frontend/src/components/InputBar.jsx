import { useState, useRef, useEffect, useId } from "react";
import { useLang } from "../context/LangContext.jsx";

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_DOC_BYTES = 5 * 1024 * 1024;

function fileLabel(type) {
  if (type === "application/pdf") return "PDF";
  if (type === "text/plain") return "TXT";
  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
  if (type?.startsWith("image/")) return "IMG";
  return "FILE";
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function InputBar({ onSend, disabled }) {
  const { t } = useLang();
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState("");
  const textareaRef = useRef(null);
  const inputId = useId();

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [value]);

  function submit() {
    const text = value.trim();
    if ((!text && !attachment) || disabled) return;
    const message = text || `${t.analyseFile} ${attachment.name}`;
    const selectedAttachment = attachment;
    setValue("");
    setAttachment(null);
    setFileError("");
    onSend(message, selectedAttachment);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  async function handleFileChange(event) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    const contentType = picked.type || "";
    if (!ALLOWED_MIME.has(contentType)) {
      setFileError(t.fileTypeError);
      return;
    }
    const isImage = contentType.startsWith("image/");
    const limit = isImage ? MAX_IMAGE_BYTES : MAX_DOC_BYTES;
    if (picked.size > limit) {
      setFileError(`${t.fileSizeError} ${isImage ? "3 MB" : "5 MB"}.`);
      return;
    }
    setFileError("");
    let preview = null;
    if (isImage) {
      try {
        preview = await readAsDataURL(picked);
      } catch {
        preview = null;
      }
    }
    setAttachment({ raw: picked, name: picked.name, type: contentType, size: picked.size, preview });
  }

  function removeAttachment() {
    setAttachment(null);
    setFileError("");
  }

  const canSend = !disabled && (value.trim().length > 0 || attachment !== null);

  return (
    <div className="input-area">
      {attachment && (
        <div className="attach-preview">
          {attachment.preview && <img src={attachment.preview} alt="" className="attach-thumb" />}
          <span className="attach-icon" aria-hidden="true">{fileLabel(attachment.type)}</span>
          <span className="attach-name">{attachment.name}</span>
          <span className="attach-size">{humanSize(attachment.size)}</span>
          <button
            className="attach-remove"
            type="button"
            onClick={removeAttachment}
            title={t.removeFile}
            aria-label={t.removeFile}
          >
            ×
          </button>
        </div>
      )}

      {fileError && <div className="attach-error" role="alert">{fileError}</div>}

      <div className="input-wrap">
        <input
          id={inputId}
          type="file"
          className="file-input-visually-hidden"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={disabled}
          aria-label={t.attachTitle}
        />
        <label htmlFor={inputId} className={`btn-attach${disabled ? " btn-attach--disabled" : ""}`} title={t.attachTitle}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m8.5 12.5 6.8-6.8a3.2 3.2 0 0 1 4.5 4.5l-8.9 8.9a5 5 0 0 1-7.1-7.1l8.4-8.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </label>
        <textarea
          ref={textareaRef}
          className="input-field"
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={attachment ? t.inputWithFile : t.inputPlaceholder}
          aria-label={t.messageInputLabel}
          rows={1}
          disabled={disabled}
          dir="auto"
        />
        <button
          className="btn-send"
          type="button"
          onClick={submit}
          disabled={!canSend}
          title={t.sendMessage}
          aria-label={t.sendMessage}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12 20 4l-5 16-3.2-6.8L4 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m11.8 13.2 4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="input-hint">{t.inputHint}</div>
    </div>
  );
}
