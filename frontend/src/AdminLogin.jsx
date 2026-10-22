<<<<<<< HEAD

import { useState } from "react";
import "./AdminLogin.css";

const API_ROOT = "http://127.0.0.1:8000";

=======
import { useState } from "react";
import "./AdminLogin.css";

>>>>>>> origin/master
function AdminLogin({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
<<<<<<< HEAD
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
=======

    setError("");

    if (!email.trim()) {
>>>>>>> origin/master
      setError("Please enter your admin email.");
      return;
    }

    try {
      setLoading(true);

<<<<<<< HEAD
      const response = await fetch(`${API_ROOT}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });
=======
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );
>>>>>>> origin/master

      const data = await response.json();

      if (!response.ok) {
<<<<<<< HEAD
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : data.detail?.message;

        throw new Error(detail || "Admin login failed.");
      }

      if (!data.success) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
=======
        throw new Error(
          data.detail || "Admin login failed."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Unable to send OTP."
        );
      }

      onLoginSuccess(data);

    } catch (err) {
      setError(
        err.message || "Something went wrong."
>>>>>>> origin/master
      );
    } finally {
      setLoading(false);
    }
  }

  return (
<<<<<<< HEAD
    <main className="admin-login-page">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-brand"
          onClick={onBack}
          aria-label="Back to user login"
        >
          <span className="admin-brand-icon">⚓</span>
          <span className="admin-brand-copy">
            <strong>Waypoint</strong>
            <small>MARITIME BROKERAGE</small>
          </span>
        </button>

        <div className="admin-topbar-right">
          <span className="admin-topbar-status">
            <span className="admin-status-dot" />
            ADMINISTRATOR ACCESS
          </span>
          <span className="admin-topbar-divider" />
          <span>SECURE</span>
          <span className="admin-nav-dot">•</span>
          <span>MONITOR</span>
          <span className="admin-nav-dot">•</span>
          <span>MANAGE</span>
        </div>
      </header>

      <div className="admin-login-layout">
        <section className="admin-showcase">
          <div className="admin-showcase-content">
            <span className="admin-eyebrow">ADMIN PORTAL</span>

            <h1>
              Command the
              <br />
              Maritime Platform
            </h1>

            <p className="admin-showcase-description">
              Manage users, monitor platform activity, oversee route
              intelligence, and keep Waypoint AI running securely
              and efficiently.
            </p>

            <div className="admin-feature-list">
              <article className="admin-feature-card">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 19V11h5v8M11 19V5h5v14M18 19v-6h3v6M2 22h20" />
                  </svg>
                </div>
                <div>
                  <h3>Platform Analytics</h3>
                  <p>Track usage, quotations, and system performance.</p>
                </div>
              </article>

              <article className="admin-feature-card">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="9" cy="7" r="4" />
                    <path d="M2 21v-2a7 7 0 0 1 14 0v2H2ZM17 4a4 4 0 0 1 0 7M19 14a6 6 0 0 1 3 5v2h-3" />
                  </svg>
                </div>
                <div>
                  <h3>User Management</h3>
                  <p>Manage user accounts and access permissions.</p>
                </div>
              </article>

              <article className="admin-feature-card">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 17h18l-3 4H7l-4-4ZM5 17l2-8h9l4 8M9 9l1-4h5l2 4M2 13h4M19 13h3M10 13h3M6 4l2 2M19 5l-2 2" />
                  </svg>
                </div>
                <div>
                  <h3>Route &amp; Data Oversight</h3>
                  <p>Monitor routes, weather data, and port information.</p>
                </div>
              </article>

              <article className="admin-feature-card">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m12 2 9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4Z" />
                    <path d="m8 12 3 3 5-6" />
                  </svg>
                </div>
                <div>
                  <h3>System Security</h3>
                  <p>Protect administrative operations with OTP verification.</p>
                </div>
              </article>
            </div>
          </div>

          <div className="admin-stats-strip">
            <div>
              <strong>ROUTES</strong>
              <span>Intelligence</span>
            </div>
            <div>
              <strong>PORTS</strong>
              <span>Connectivity</span>
            </div>
            <div>
              <strong>QUOTES</strong>
              <span>Management</span>
            </div>
            <div>
              <strong>ACCESS</strong>
              <span>Protected</span>
            </div>
          </div>
        </section>

        <section className="admin-login-panel">
          <div className="admin-login-card">
            <div className="admin-lock-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                <circle cx="12" cy="14" r="1" />
              </svg>
            </div>

            <span className="admin-restricted-label">
              RESTRICTED ACCESS
            </span>

            <h2>Admin Portal</h2>

            <p className="admin-form-description">
              Sign in with your registered admin email to receive
              a one-time verification code.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="admin-email">ADMIN EMAIL</label>

              <div className="admin-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="admin-email"
                  type="email"
                  placeholder="Enter your admin email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="admin-login-error" role="alert">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="admin-submit-button"
                disabled={loading}
              >
                <span>
                  {loading ? "Sending verification code..." : "Send Verification Code"}
                </span>
                {!loading && <span className="admin-submit-arrow">→</span>}
                {loading && <span className="admin-spinner" />}
              </button>
            </form>

            <div className="admin-divider">
              <span />
              SECURE ACCESS
              <span />
            </div>

            <div className="admin-security-card">
              <div className="admin-security-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m12 2 9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4Z" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
              </div>
              <p>
                Administrator access is protected with email
                verification and a one-time password. Only authorized
                personnel can access this portal.
              </p>
            </div>

            <button
              type="button"
              className="admin-back-button"
              onClick={onBack}
              disabled={loading}
            >
              <span className="admin-back-arrow">←</span>
              Back to User Login
            </button>
          </div>

          <p className="admin-panel-footer">
            WAYPOINT AI <span>•</span> ADMINISTRATION
          </p>
        </section>
      </div>
    </main>
  );
}

export default AdminLogin;
=======
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-header">

          <div className="admin-icon">
            🔐
          </div>

          <h1>Admin Portal</h1>

          <p>
            Secure access to Waypoint AI
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <label htmlFor="admin-email">
            Admin Email
          </label>

          <input
            id="admin-email"
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending OTP..."
              : "Continue"}
          </button>

        </form>

        <button
          type="button"
          className="admin-back-button"
          onClick={onBack}
          disabled={loading}
        >
          ← Back to User Login
        </button>

        <div className="admin-security-note">
          <span>🛡️</span>

          <span>
            Admin access requires email verification
            with a one-time password.
          </span>
        </div>

      </div>

    </div>
  );
}

export default AdminLogin;
>>>>>>> origin/master
