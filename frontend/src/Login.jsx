import { useState } from "react";
import "./login.css";

const API_ROOT = "http://127.0.0.1:8000";

function Login({ onLoginSuccess, onRegister, onAdminLogin, onBackHome, onForgotPassword }) {
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem("waypoint_remembered_username") || "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  function goBackHome() {
    if (typeof onBackHome === "function") {
      onBackHome();
      return;
    }
    // Fallback for setups that render this component without the callback.
    window.location.assign("/");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_ROOT}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.detail?.message || data?.detail || data?.message || "Login failed. Please check your details.");
        return;
      }

      if (data.success && data.requires_2fa) {
        try {
          if (rememberMe) localStorage.setItem("waypoint_remembered_username", username.trim());
          else localStorage.removeItem("waypoint_remembered_username");
        } catch {
          // Login should still work when browser storage is unavailable.
        }
        onLoginSuccess?.({ email: data.email, developmentOtp: data.development_otp });
      } else if (data.success) {
        onLoginSuccess?.(data);
      } else {
        setError(data?.message || "Unable to continue sign in. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-shade" aria-hidden="true" />

      <header className="auth-topbar">
        <button className="auth-brand" type="button" onClick={goBackHome} aria-label="Waypoint home">
          <span className="auth-brand__mark">W</span>
          <span className="auth-brand__copy">
            <strong>WAYPOINT <em>AI</em></strong>
            <small>MARITIME BROKERAGE</small>
          </span>
        </button>
        <button className="auth-home-link" type="button" onClick={goBackHome}>
          <span aria-hidden="true">⌂</span> Back to Home
        </button>
      </header>

      <div className="auth-layout">
        <section className="auth-story" aria-label="Waypoint platform information">
          <p className="auth-kicker"><span /> SMARTER ROUTES <b>•</b> SAFER SHIPMENTS <b>•</b> GLOBAL TRADE</p>
          <h1>Welcome to<br />Waypoint <span>AI</span></h1>
          <p className="auth-story__intro">
            Sign in to access intelligent route planning, real-time weather insights,
            connected port information and freight quotation tools.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <span className="auth-benefit__icon" aria-hidden="true">⚓</span>
              <div><strong>AI Route Planning</strong><p>Find efficient, cost-aware shipping routes</p></div>
            </div>
            <div className="auth-benefit">
              <span className="auth-benefit__icon" aria-hidden="true">☁</span>
              <div><strong>Live Weather Intelligence</strong><p>Understand conditions before you sail</p></div>
            </div>
            <div className="auth-benefit">
              <span className="auth-benefit__icon" aria-hidden="true">⌘</span>
              <div><strong>Connected Ports</strong><p>Explore ports and transshipment links</p></div>
            </div>
            <div className="auth-benefit">
              <span className="auth-benefit__icon" aria-hidden="true">▤</span>
              <div><strong>Digital Quotations</strong><p>Keep freight requests organised in one place</p></div>
            </div>
          </div>
          <div className="auth-story-footer"><span /> BUILT FOR SMARTER MARITIME DECISIONS</div>
        </section>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card__brand">
            <span className="auth-card__mark">W</span>
            <span><strong>WAYPOINT <em>AI</em></strong><small>MARITIME BROKERAGE</small></span>
          </div>

          <div className="auth-heading">
            <span className="auth-heading__eyebrow">SECURE ACCESS</span>
            <h2 id="auth-title">Sign In</h2>
            <p>Welcome back! Sign in to continue.</p>
          </div>

          {error && <div className="auth-error" role="alert"><span aria-hidden="true">!</span><p>{error}</p></div>}

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-field">
              <span>Username</span>
              <span className="auth-input-wrap"><span className="auth-input-icon" aria-hidden="true">♙</span>
                <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
              </span>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <span className="auth-input-wrap"><span className="auth-input-icon" aria-hidden="true">▣</span>
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                <button className="auth-show-password" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
              </span>
            </label>

            <div className="auth-form-options">
              <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /><span>Remember username</span></label>
              {onForgotPassword && <button type="button" className="auth-text-link" onClick={onForgotPassword}>Forgot password?</button>}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? <><span className="auth-button__spinner" /> Signing in…</> : <>Sign In <span aria-hidden="true">→</span></>}
            </button>
          </form>

          <div className="auth-register-row"><span>Don't have an account?</span><button type="button" onClick={onRegister}>Register now <span aria-hidden="true">→</span></button></div>

          {onAdminLogin && <>
            <div className="auth-divider"><span /> <p>ADMINISTRATORS</p> <span /></div>
            <button type="button" className="auth-admin-button" onClick={onAdminLogin}>
              <span className="auth-admin-icon" aria-hidden="true">♙</span>
              <span className="auth-admin-copy"><strong>Admin Portal</strong><small>Secure administrator access</small></span>
              <span className="auth-admin-arrow" aria-hidden="true">↗</span>
            </button>
          </>}

          <p className="auth-security"><span aria-hidden="true">▣</span> Your account is protected with secure authentication and two-step verification.</p>
        </section>
      </div>
      <footer className="auth-bottom-note"><span>WAYPOINT AI</span><span>Route intelligence · Weather · Ports · Quotations</span><span>© 2026 Waypoint AI</span></footer>
    </main>
  );
}

export default Login;
