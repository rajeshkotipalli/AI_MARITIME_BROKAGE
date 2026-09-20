import { useState } from "react";
import "./AdminOTP.css";

function AdminOTP({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

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
          "OTP verification failed."
        );
      }

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
    } finally {
      setLoading(false);
    }
  }

  return (
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