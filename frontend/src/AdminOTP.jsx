import { useState } from "react";
import "./AdminOTP.css";

function AdminOTP({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

<<<<<<< HEAD
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the complete 6-digit security code.");
=======
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
>>>>>>> origin/master
      return;
    }

    try {
      setLoading(true);
<<<<<<< HEAD
      const response = await fetch("http://127.0.0.1:8000/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
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
=======

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.message ||
          data.detail ||
>>>>>>> origin/master
          "OTP verification failed."
        );
      }

<<<<<<< HEAD
      if (!data?.success) {
        throw new Error(data?.message || "Invalid OTP.");
      }

      localStorage.setItem("waypoint_admin_token", data.access_token);
      localStorage.setItem("waypoint_admin_user", JSON.stringify(data.admin));

      onVerified({ token: data.access_token, user: data.admin });
    } catch (err) {
      setError(err.message || "Something went wrong.");
=======
      if (!data.success) {
        throw new Error(
          data.message || "Invalid OTP."
        );
      }

      // Save the ADMIN JWT
      localStorage.setItem(
        "waypoint_admin_token",
        data.access_token
      );

      // Save admin information
      localStorage.setItem(
        "waypoint_admin_user",
        JSON.stringify(data.admin)
      );

      // Pass normalized data to App.jsx
      onVerified({
        token: data.access_token,
        user: data.admin,
      });

    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
>>>>>>> origin/master
    } finally {
      setLoading(false);
    }
  }

  return (
<<<<<<< HEAD
    <main className="admin-otp-page">
      <section className="admin-otp-layout" aria-labelledby="admin-otp-title">
        <aside className="admin-otp-visual">
          <div className="admin-otp-photo" aria-hidden="true" />
          <div className="admin-otp-photo-overlay" aria-hidden="true" />
          <div className="admin-otp-visual-content">
            <div className="admin-otp-mini-brand">
              <span>⚓</span>
              <div><strong>WAYPOINT</strong><small>MARITIME BROKERAGE</small></div>
            </div>
            <div className="admin-otp-visual-message">
              <span className="admin-otp-visual-line" />
              <p>SECURE ACCESS.<br />SMARTER OPERATIONS.<br />SAFER SEAS AHEAD.</p>
            </div>
            <div className="admin-otp-visual-bottom">
              <span className="admin-otp-live-dot" />
              <span>ADMINISTRATIVE NETWORK</span>
            </div>
          </div>
        </aside>

        <section className="admin-otp-form-panel">
          <header className="admin-otp-brand">
            <div className="admin-otp-anchor" aria-hidden="true">⚓</div>
            <div className="admin-otp-brand-text">
              <span className="admin-otp-brand-name">Waypoint</span>
              <span className="admin-otp-brand-tagline">MARITIME BROKERAGE</span>
            </div>
            <span className="admin-otp-badge">ADMIN PORTAL</span>
          </header>

          <div className="admin-otp-heading">
            <span className="admin-otp-kicker"><i /> PRIVILEGED ACCESS</span>
            <h1 id="admin-otp-title">Confirm administrator access</h1>
            <p>Enter the six-digit code sent to your administrator email address.</p>
          </div>

          <div className="admin-otp-email">
            <span className="admin-otp-email-icon" aria-hidden="true">✉</span>
            <div>
              <span>Verification email</span>
              <strong>{email || "Email address unavailable"}</strong>
            </div>
            <span className="admin-otp-verified" aria-label="Email selected">✓</span>
          </div>

          {error && (
            <div className="admin-otp-error" role="alert">
              <span>!</span><p>{error}</p>
            </div>
          )}

          <form className="admin-otp-form" onSubmit={handleSubmit}>
            <div className="admin-otp-label-line">
              <label htmlFor="admin-otp-code">6-digit security code</label>
              <span>{otp.length}/6</span>
            </div>

            <div className="admin-otp-cells">
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} className={index < otp.length ? "filled" : index === otp.length ? "active" : ""}>
                  {otp[index] || "•"}
                </span>
              ))}
              <input
                id="admin-otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                disabled={loading}
                autoFocus
                aria-label="Six digit administrator security code"
              />
            </div>

            <div className="admin-otp-progress" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} className={index < otp.length ? "filled" : ""} />
              ))}
            </div>

            <button className="admin-otp-submit" type="submit" disabled={loading || otp.length !== 6}>
              {loading ? "VERIFYING ADMIN ACCESS…" : "VERIFY & OPEN DASHBOARD"}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </form>

          <button className="admin-otp-back" type="button" onClick={onBack} disabled={loading}>
            <span aria-hidden="true">←</span> Use another account
          </button>

          <footer className="admin-otp-security">
            <span aria-hidden="true">♙</span>
            <p>This one-time code expires shortly and can only be used once. Never share it with anyone.</p>
          </footer>
        </section>
      </section>
      <p className="admin-otp-caption">WAYPOINT <span>•</span> ADMINISTRATIVE ACCESS</p>
    </main>
  );
}

export default AdminOTP;
=======
    <div className="admin-otp-page">

      <div className="admin-otp-card">

        <div className="admin-otp-icon">
          🔐
        </div>

        <h1>Verify Admin Access</h1>

        <p className="admin-otp-subtitle">
          Enter the 6-digit OTP sent to
        </p>

        <p className="admin-otp-email">
          {email}
        </p>

        <form onSubmit={handleSubmit}>

          <label htmlFor="admin-otp">
            Verification Code
          </label>

          <input
            id="admin-otp"
            type="text"
            inputMode="numeric"
            maxLength="6"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

              setOtp(value);
            }}
            disabled={loading}
            autoFocus
          />

          {error && (
            <div className="admin-otp-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
          >
            {loading
              ? "Verifying..."
              : "Verify & Enter Dashboard"}
          </button>

        </form>

        <button
          type="button"
          className="admin-otp-back"
          onClick={onBack}
          disabled={loading}
        >
          ← Use another email
        </button>

        <div className="admin-otp-security">
          🛡️ This verification code expires
          shortly and can only be used once.
        </div>

      </div>

    </div>
  );
}

export default AdminOTP;
>>>>>>> origin/master
