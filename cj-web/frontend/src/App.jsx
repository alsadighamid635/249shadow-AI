import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatWindow from "./components/ChatWindow.jsx";
import InputBar from "./components/InputBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AuthPage from "./components/AuthPage.jsx";
import AdminPage from "./components/AdminPage.jsx";
import { useLang } from "./context/LangContext.jsx";
import {
  sendMessage, loadHistory, loadSessions, deleteSession, loadStats,
  fetchMe, getToken, clearToken, AuthError,
} from "./api.js";

const ADMIN_USERNAME = "249shadow";

function getOrCreateSessionId() {
  const key = "cj_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.8 20 6v5.3c0 5.1-3.4 8.5-8 10-4.6-1.5-8-4.9-8-10V6l8-3.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m8.5 12.1 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const { t, lang, setLang } = useLang();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionId, setSessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 640);
  const [showAdmin, setShowAdmin] = useState(false);
  const [stats, setStats] = useState({});

  const isAdmin = user && user.username?.toLowerCase() === ADMIN_USERNAME.toLowerCase();

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setMessages([]);
    setSessions([]);
    setShowAdmin(false);
    setError(null);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    setHistoryLoading(true);
    loadHistory(sessionId)
      .then(data => { if (active) setMessages(data.messages || []); })
      .catch(() => { if (active) setMessages([]); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [sessionId, user]);

  useEffect(() => {
    if (!user) return;
    loadSessions().then(data => setSessions(data.sessions || []));
    loadStats().then(setStats);
  }, [user]);

  async function handleSend(text, attachment = null) {
    setError(null);
    const rawFile = attachment?.raw ?? null;
    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      attachment: attachment
        ? { name: attachment.name, type: attachment.type, preview: attachment.preview }
        : null,
    };
    setMessages(previous => [...previous, userMsg]);
    setLoading(true);
    try {
      const data = await sendMessage(text, sessionId, rawFile);
      setMessages(previous => [...previous, {
        role: "assistant",
        content: data.reply,
        confidence: data.confidence,
        sources: data.sources,
        timestamp: new Date().toISOString(),
      }]);
      loadSessions().then(result => setSessions(result.sessions || []));
    } catch (err) {
      if (err instanceof AuthError) {
        logout();
        return;
      }
      setError(err?.message && typeof err.message === "string"
        ? err.message
        : t.unexpectedError);
    } finally {
      setLoading(false);
    }
  }

  function switchSession(id) {
    setSessionId(id);
    sessionStorage.setItem("cj_session_id", id);
    setError(null);
    if (window.innerWidth <= 640) setSidebarOpen(false);
  }

  function newChat() {
    const id = uuidv4();
    sessionStorage.setItem("cj_session_id", id);
    setSessionId(id);
    setMessages([]);
    setError(null);
    if (window.innerWidth <= 640) setSidebarOpen(false);
  }

  async function removeSession(id) {
    try {
      await deleteSession(id);
      if (id === sessionId) newChat();
      setSessions(previous => previous.filter(session => session.id !== id));
    } catch (err) {
      setError(err?.message || t.deleteConversationError);
    }
  }

  if (!authChecked) {
    return <div className="app-layout app-loading" aria-label={t.loadingAccount}><div className="loading-mark"><BrandMark /></div></div>;
  }
  if (!user) return <AuthPage onAuthenticated={setUser} />;

  return (
    <div className="app-layout" dir={t.dir}>
      {sidebarOpen && window.innerWidth <= 640 && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label={t.closeNavigation}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        activeId={sessionId}
        onNew={newChat}
        onSwitch={switchSession}
        onDelete={removeSession}
        user={user}
        isAdmin={isAdmin}
        onLogout={logout}
        onAdminClick={() => setShowAdmin(true)}
        stats={stats}
      />

      <main className="main-area">
        <header className="topbar">
          <button
            className="btn-menu"
            type="button"
            onClick={() => setSidebarOpen(open => !open)}
            aria-label={sidebarOpen ? t.closeNavigation : t.openNavigation}
            title={sidebarOpen ? t.closeNavigation : t.openNavigation}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <BrandMark />
          <span className="topbar-title">Delta-Security</span>
          <span className="topbar-badge">{t.cybersecurityAssistant}</span>
          <div className="topbar-right">
            {stats.total_vectors != null && (
              <span className="topbar-stats">{stats.total_vectors} {t.vectors}</span>
            )}
            <button
              className="btn-lang"
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              title={lang === "ar" ? t.switchToEnglish : t.switchToArabic}
              aria-label={lang === "ar" ? t.switchToEnglish : t.switchToArabic}
            >
              {lang === "ar" ? "EN" : "ع"}
            </button>
          </div>
        </header>

        {error && (
          <div className="chat-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label={t.dismissError} title={t.dismissError}>×</button>
          </div>
        )}

        <ChatWindow
          messages={messages}
          loading={loading || historyLoading}
          suggestions={t.suggestions}
          onSuggestion={handleSend}
        />
        <InputBar onSend={handleSend} disabled={loading || historyLoading} />
      </main>

      {showAdmin && <AdminPage onClose={() => setShowAdmin(false)} currentUser={user} />}
    </div>
  );
}
