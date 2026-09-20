import { useState } from "react";
import "./AdminLogin.css";

function AdminLogin({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your admin email.");
      return;
    }

    try {
      setLoading(true);

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

      const data = await response.json();

      if (!response.ok) {
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
      );
    } finally {
      setLoading(false);
    }
  }

  return (
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