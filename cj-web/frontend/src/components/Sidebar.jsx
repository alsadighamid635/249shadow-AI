import { useLang } from "../context/LangContext.jsx";

function BrandMark() {
  return (
    <svg className="sidebar-logo-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.8 20 6v5.3c0 5.1-3.4 8.5-8 10-4.6-1.5-8-4.9-8-10V6l8-3.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m8.5 12.1 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SessionIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}

export default function Sidebar({
  open, sessions, activeId, onNew, onSwitch, onDelete,
  user, isAdmin, onLogout, onAdminClick, stats,
}) {
  const { t, lang, setLang } = useLang();
  const username = user?.username || "";
  const initials = username.trim().slice(0, 1).toLocaleUpperCase() || "D";

  return (
    <aside className={`sidebar${open ? "" : " closed"}`} dir={t.dir} aria-label={t.navigation}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <BrandMark />
          <span className="sidebar-logo-text">Delta-Security</span>
        </div>
        {stats?.total_vectors != null && (
          <span className="sidebar-stat-pill" title={t.learningSources}>{stats.total_vectors} {t.vectors}</span>
        )}
      </div>

      <button className="btn-new-chat" type="button" onClick={onNew} title={t.newChat}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>{t.newChat}</span>
      </button>

      <div className="sidebar-section-title">{t.conversations}</div>
      <div className="session-list" role="list" aria-label={t.conversations}>
        {sessions.length === 0 && <div className="session-empty">{t.noConversations}</div>}
        {sessions.map(session => {
          const title = session.title && session.title !== "New Chat" ? session.title : t.newChat;
          const active = session.id === activeId;
          return (
            <div key={session.id} className={`session-item${active ? " active" : ""}`} role="listitem">
              <button
                className="session-select"
                type="button"
                onClick={() => onSwitch(session.id)}
                title={title}
                aria-label={`${t.openConversation}: ${title}`}
                aria-current={active ? "page" : undefined}
              >
                <SessionIcon />
                <span className="session-title">{title}</span>
              </button>
              <button
                className="session-del"
                type="button"
                onClick={() => onDelete(session.id)}
                title={t.deleteConversation}
                aria-label={`${t.deleteConversation}: ${title}`}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4.5 7h15M9 7V4.5h6V7m-8.5 0 .8 13h9.4l.8-13M10 10.5v6m4-6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        {isAdmin && (
          <button className="sidebar-btn-admin" type="button" onClick={onAdminClick} title={t.adminPanel}>
            <span className="sidebar-btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5 19 6v5c0 4.4-2.8 7.4-7 9-4.2-1.6-7-4.6-7-9V6l7-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </span>
            <span>{t.adminPanel}</span>
          </button>
        )}
        <div className="sidebar-footer-divider" />
        <div className="sidebar-user-row">
          <div className="sidebar-user-info">
            <span className="sidebar-user-avatar" aria-hidden="true">{initials}</span>
            <div className="sidebar-user-details">
              <span className="sidebar-username">{username}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <div className="sidebar-user-actions">
            <button
              className="sidebar-btn-icon-only"
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              title={lang === "ar" ? t.switchToEnglish : t.switchToArabic}
              aria-label={lang === "ar" ? t.switchToEnglish : t.switchToArabic}
            >
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <button
              className="sidebar-btn-logout"
              type="button"
              onClick={onLogout}
              title={t.logoutTooltip}
              aria-label={t.logoutTooltip}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M10 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H10M14 8l4 4-4 4m4-4H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
