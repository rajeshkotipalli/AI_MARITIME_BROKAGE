import { useState } from "react";

const API_ROOT = "http://127.0.0.1:8000";

function OTPVerification({
  email,
  developmentOtp,
  onVerified,
  onBack,
}) {
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();

    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must contain 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_ROOT}/api/auth/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            otp: otp.trim(),
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        const message =
          data?.detail?.message ||
          "OTP verification failed.";

        setError(message);

        return;
      }

      if (data.success) {
        // Save login token
        localStorage.setItem(
          "waypoint_token",
          data.access_token
        );

        // Save user information
        localStorage.setItem(
          "waypoint_user",
          JSON.stringify(data.user)
        );

        onVerified(data);
      }
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        "Unable to connect to the server. " +
        "Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* ==========================================
            BRAND
        ========================================== */}

        <div className="auth-brand">

          <div className="auth-brand__icon">
            ⚓
          </div>

          <div>
            <h1>Waypoint</h1>

            <p>
              MARITIME BROKERAGE
            </p>
          </div>

        </div>


        {/* ==========================================
            HEADING
        ========================================== */}

        <div className="auth-heading">

          <span>
            TWO-STEP VERIFICATION
          </span>

          <h2>
            Verify your identity
          </h2>

          <p>
            Enter the 6-digit verification
            code sent to your registered
            email address.
          </p>

        </div>


        {/* ==========================================
            EMAIL DISPLAY
        ========================================== */}

        <div className="otp-email">

          <span>
            Verification email
          </span>

          <strong>
            {email}
          </strong>

        </div>


        {/* ==========================================
            DEVELOPMENT OTP
        ========================================== */}

        {developmentOtp && (

          <div className="otp-demo">

            <span>
              DEVELOPMENT MODE
            </span>

            <strong>
              OTP: {developmentOtp}
            </strong>

            <small>
              This OTP is displayed only
              for local testing.
            </small>

          </div>

        )}


        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (

          <div className="auth-error">

            <span>
              ⚠
            </span>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* ==========================================
            OTP FORM
        ========================================== */}

        <form
          className="auth-form"
          onSubmit={handleVerify}
        >

          <div className="auth-field">

            <label>
              6-Digit OTP
            </label>

            <input
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => {

                const value =
                  e.target.value
                    .replace(/\D/g, "");

                setOtp(value);

                setError("");

              }}
              autoComplete="one-time-code"
            />

          </div>


          <button
            type="submit"
            className="auth-button"
            disabled={
              loading ||
              otp.length !== 6
            }
          >

            {loading
              ? "VERIFYING..."
              : "VERIFY OTP"}

          </button>

        </form>


        {/* ==========================================
            BACK TO LOGIN
        ========================================== */}

        <div className="auth-switch">

          <span>
            Entered the wrong account?
          </span>

          <button
            type="button"
            onClick={onBack}
          >
            Back to login
          </button>

        </div>


        {/* ==========================================
            SECURITY
        ========================================== */}

        <div className="auth-security">

          <span>
            🔐
          </span>

          <p>
            Two-step verification adds an
            additional security layer before
            accessing the Waypoint dashboard.
          </p>

        </div>

      </div>

    </div>
  );
}

export default OTPVerification;