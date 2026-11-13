import { useState, useMemo, useRef, useCallback } from "react";
import { signup, login, setToken } from "../api.js";
import { useLang } from "../context/LangContext.jsx";
import AdminLogin from "./AdminLogin.jsx";

function calcStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(password)) score++;
  return score;
}

function isStrongPassword(password) {
  return calcStrength(password) === 5;
}

const SECRET_CLICKS = 7;
const SECRET_WINDOW = 8000;

function Mark({ small = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={small ? "icon-small" : ""}>
      <path d="M12 2.8 20 6v5.3c0 5.1-3.4 8.5-8 10-4.6-1.5-8-4.9-8-10V6l8-3.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m8.5 12.1 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldIcon({ name }) {
  const paths = {
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.5-3.2 2.8-5 6.5-5s6 1.8 6.5 5" /></>,
    mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 5.8L19.5 7" /></>,
    lock: <><rect x="4.5" y="10" width="15" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    eye: <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 6.2c.5-.1.9-.2 1.4-.2 6.1 0 9.5 6 9.5 6a15 15 0 0 1-3 3.6M6.2 6.8C3.8 8.4 2.5 12 2.5 12s3.4 6 9.5 6c.8 0 1.6-.1 2.3-.4" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AuthPage({ onAuthenticated }) {
  const { t, lang, setLang } = useLang();
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [secretPulse, setSecretPulse] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const strength = useMemo(() => calcStrength(password), [password]);

  const handleSecretClick = useCallback(() => {
    clickCountRef.current += 1;
    setSecretPulse(true);
    window.setTimeout(() => setSecretPulse(false), 400);
    window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(() => { clickCountRef.current = 0; }, SECRET_WINDOW);
    if (clickCountRef.current >= SECRET_CLICKS) {
      clickCountRef.current = 0;
      window.clearTimeout(clickTimerRef.current);
      setShowAdminLogin(true);
    }
  }, []);

  function resetFields() {
    setError(null);
    setPassword("");
    setConfirm("");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    resetFields();
  }

  function strengthLabel(score) {
    if (score <= 1) return t.pwWeak;
    if (score <= 2) return t.pwFair;
    if (score <= 3) return t.pwGood;
    return t.pwStrong;
  }

  function strengthClass(score) {
    if (score <= 1) return "pw-weak";
    if (score <= 2) return "pw-fair";
    if (score <= 3) return "pw-good";
    return "pw-strong";
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError(t.fillLoginFields);
      return;
    }
    setBusy(true);
    try {
      const data = await login(identifier.trim(), password);
      setToken(data.token, remember);
      onAuthenticated(data);
    } catch (err) {
      setError(err.message || t.loginError);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    setError(null);
    if (!username.trim() || !email.trim() || !password) {
      setError(t.fillAll);
      return;
    }
    if (!isStrongPassword(password)) {
      setError(t.passwordWeak);
      return;
    }
    if (password !== confirm) {
      setError(t.passwordsNoMatch);
      return;
    }
    setBusy(true);
    try {
      const data = await signup(username.trim(), email.trim(), password);
      setToken(data.token, remember);
      onAuthenticated(data);
    } catch (err) {
      setError(err.message || t.signupError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page" dir={t.dir}>
      <button
        className="auth-lang-toggle"
        type="button"
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        title={lang === "ar" ? t.switchToEnglish : t.switchToArabic}
        aria-label={lang === "ar" ? t.switchToEnglish : t.switchToArabic}
      >
        {lang === "ar" ? "EN" : "ع"}
      </button>

      <section className="auth-brand" aria-label="Delta-Security">
        <div className="auth-brand-glow" aria-hidden="true" />
        <div className="auth-brand-mark"><Mark /></div>
        <h1 className="auth-brand-title">Delta-Security</h1>
        <p className="auth-brand-tag">{t.brandTag}</p>
        <div className="auth-brand-divider" />
        <p className="auth-brand-desc">{t.brandDesc}<br />{t.brandSub}</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <header className="auth-header">
            <h2>{t.welcomeTo}</h2>
            <h1>{t.authTitle}</h1>
            <p>{mode === "login" ? t.loginTitle : t.signupTitle}</p>
          </header>

          {error && <div className="auth-error" role="alert">{error}</div>}

          {mode === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label className="auth-field">
                <span className="auth-field-icon"><FieldIcon name="user" /></span>
                <input
                  type="text"
                  placeholder={t.usernameOrEmail}
                  aria-label={t.usernameOrEmail}
                  value={identifier}
                  onChange={event => setIdentifier(event.target.value)}
                  autoComplete="username"
                  disabled={busy}
                />
              </label>
              <label className="auth-field">
                <span className="auth-field-icon"><FieldIcon name="lock" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordLabel}
                  aria-label={t.passwordLabel}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={busy}
                />
                <button
                  type="button"
                  className="auth-field-toggle"
                  onClick={() => setShowPassword(visible => !visible)}
                  title={showPassword ? t.hidePassword : t.showPassword}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  aria-pressed={showPassword}
                >
                  <FieldIcon name={showPassword ? "eyeOff" : "eye"} />
                </button>
              </label>
              <div className="auth-row">
                <label className="auth-remember">
                  <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />
                  {t.rememberMe}
                </label>
                <button type="button" className="auth-link" onClick={() => setError(t.forgotContact)}>
                  {t.forgotPassword}
                </button>
              </div>
              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? t.loggingIn : t.loginBtn}
              </button>
              <div className="auth-divider"><span>{t.orDivider}</span></div>
              <button type="button" className="auth-secondary" onClick={() => switchMode("signup")}>
                {t.createAccount}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup}>
              <label className="auth-field">
                <span className="auth-field-icon"><FieldIcon name="user" /></span>
                <input
                  type="text"
                  placeholder={t.usernameLabel}
                  aria-label={t.usernameLabel}
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                  autoComplete="username"
                  dir="auto"
                  disabled={busy}
                />
              </label>
              <label className="auth-field">
                <span className="auth-field-icon"><FieldIcon name="mail" /></span>
                <input
                  type="email"
                  placeholder={t.emailLabel}
                  aria-label={t.emailLabel}
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={busy}
                />
              </label>
              <label className="auth-field">
                <span className="auth-field-icon"><FieldIcon name="lock" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordMin}
                  aria-label={t.passwordMin}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                />
                <button
                  type="button"
                  className="auth-field-toggle"
                  onClick={() => setShowPassword(visible => !visible)}
                  title={showPassword ? t.hidePassword : t.showPassword}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  aria-pressed={showPassword}
                >
                  <FieldIcon name={showPassword ? "eyeOff" : "eye"} />
                </button>
              </label>
              {password.length > 0 && (
                <div className="pw-strength-wrap" aria-live="polite">
                  <div className="pw-strength-bar" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map(segment => (
                      <div key={segment} className={`pw-strength-seg ${segment <= strength ? strengthClass(strength) : ""}`} />
                    ))}
                  </div>
                  <span className={`pw-strength-label ${strengthClass(strength)}`}>{strengthLabel(strength)}</span>
                </div>
              )}
              <p className="pw-hint">{t.pwHint}</p>
              <label className="auth-field">
                <span className="auth-field-icon"><FieldIcon name="lock" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.confirmPassword}
                  aria-label={t.confirmPassword}
                  value={confirm}
                  onChange={event => setConfirm(event.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                />
              </label>
              <label className="auth-remember">
                <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />
                {t.rememberMe}
              </label>
              <button type="submit" className="auth-submit" disabled={busy || !isStrongPassword(password)}>
                {busy ? t.creatingAccount : t.signupBtn}
              </button>
              <div className="auth-divider"><span>{t.orDivider}</span></div>
              <button type="button" className="auth-secondary" onClick={() => switchMode("login")}>
                {t.haveAccount}
              </button>
            </form>
          )}

          <p className="auth-footer">
            <button
              className={`secret-trigger${secretPulse ? " activated" : ""}`}
              type="button"
              onClick={handleSecretClick}
              aria-label={t.adminAccessTrigger}
              title={t.adminAccessTrigger}
            />
            {t.footer}
          </p>
        </div>
      </section>

      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} onAuthenticated={onAuthenticated} />
      )}
    </div>
  );
}
