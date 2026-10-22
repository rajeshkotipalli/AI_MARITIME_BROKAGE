import { useState } from "react";
import "./OTPVerification.css";

const API_ROOT = "http://127.0.0.1:8000";

export default function OTPVerification({ email, developmentOtp, onVerified, onBack }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_ROOT}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data?.detail?.message ||
          (typeof data?.detail === "string" ? data.detail : "") ||
          "OTP verification failed."
        );
      }

      if (!data?.success) {
        throw new Error(data?.message || "OTP verification failed.");
      }

      if (data.access_token) {
        localStorage.setItem("waypoint_token", data.access_token);
      }
      if (data.user) {
        localStorage.setItem("waypoint_user", JSON.stringify(data.user));
      }

      onVerified(data);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(
        err.message || "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="user-otp-page">
      <div className="user-otp-photo" aria-hidden="true" />
      <div className="user-otp-vignette" aria-hidden="true" />
      <div className="user-otp-route user-otp-route-one" aria-hidden="true" />
      <div className="user-otp-route user-otp-route-two" aria-hidden="true" />

      <section className="user-otp-card" aria-labelledby="user-otp-title">
        <header className="user-otp-brand">
          <div className="user-otp-anchor" aria-hidden="true">⚓</div>
          <div className="user-otp-brand-text">
            <span className="user-otp-brand-name">Waypoint</span>
            <span className="user-otp-brand-tagline">MARITIME BROKERAGE</span>
          </div>
          <span className="user-otp-step">STEP 2 OF 2</span>
        </header>

        <div className="user-otp-heading">
          <span className="user-otp-kicker"><i /> SECURE SIGN-IN</span>
          <h1 id="user-otp-title">Verify your identity</h1>
          <p>One quick check before you get back to moving global trade.</p>
        </div>

        <div className="user-otp-email">
          <span className="user-otp-email-icon" aria-hidden="true">✉</span>
          <div>
            <span>Verification email</span>
            <strong>{email || "Email address unavailable"}</strong>
          </div>
          <span className="user-otp-verified" aria-label="Email selected">✓</span>
        </div>

        {developmentOtp && (
          <div className="user-otp-dev">
            <span>LOCAL DEVELOPMENT CODE</span>
            <strong>{developmentOtp}</strong>
            <small>Displayed for local testing only.</small>
          </div>
        )}

        {error && (
          <div className="user-otp-error" role="alert">
            <span>!</span><p>{error}</p>
          </div>
        )}

        <form className="user-otp-form" onSubmit={handleVerify}>
          <div className="user-otp-label-line">
            <label htmlFor="user-otp-code">6-digit verification code</label>
            <span>{otp.length}/6</span>
          </div>

          <div className="user-otp-code-wrap">
            <input
              id="user-otp-code"
              className="user-otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              disabled={loading}
              autoFocus
              aria-label="Six digit verification code"
            />
          </div>

          <div className="user-otp-progress" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} className={index < otp.length ? "filled" : ""} />
            ))}
          </div>

          <button className="user-otp-submit" type="submit" disabled={loading || otp.length !== 6}>
            {loading ? "VERIFYING CODE…" : "VERIFY & CONTINUE"}
            {!loading && <span aria-hidden="true">↗</span>}
          </button>
        </form>

        <div className="user-otp-back">
          <span>Entered the wrong account?</span>
          <button type="button" onClick={onBack} disabled={loading}>Back to login</button>
        </div>

        <footer className="user-otp-security">
          <span aria-hidden="true">♙</span>
          <p>Your verification code is private. Never share it with anyone, including Waypoint staff.</p>
        </footer>
      </section>

      <div className="user-otp-bottom-note"><span /> GLOBAL ROUTES, BRIGHTER POSSIBILITIES</div>
    </main>
  );
}
