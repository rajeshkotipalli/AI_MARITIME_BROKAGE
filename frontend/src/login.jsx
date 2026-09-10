import { useState } from "react";

const API_ROOT = "http://127.0.0.1:8000";

function Login({ onLoginSuccess, onRegister }) {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function handleLogin(e) {

    e.preventDefault();

    setError("");

    if (!username.trim()) {

      setError(
        "Please enter your username."
      );

      return;
    }

    if (!password) {

      setError(
        "Please enter your password."
      );

      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_ROOT}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username:
              username.trim(),

            password:
              password,
          }),
        }
      );

      const data =
        await response.json();


      if (!response.ok) {

        const message =
          data?.detail?.message ||
          "Login failed.";

        setError(message);

        return;
      }


      // ------------------------------------------
      // LOGIN CREDENTIALS CORRECT
      // ------------------------------------------

      if (
        data.success &&
        data.requires_2fa
      ) {

        onLoginSuccess({

          email:
            data.email,

          developmentOtp:
            data.development_otp,

        });

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        "Unable to connect to the server. "
        + "Make sure the backend is running."
      );

    } finally {

      setLoading(false);

    }
  }


  return (

    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-brand">

          <div className="auth-brand__icon">
            ⚓
          </div>

          <div>

            <h1>
              Waypoint
            </h1>

            <p>
              MARITIME BROKERAGE
            </p>

          </div>

        </div>


        {/* TITLE */}

        <div className="auth-heading">

          <span>
            SECURE ACCESS
          </span>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to access your
            maritime route intelligence
            dashboard.
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div className="auth-error">

            <span>⚠</span>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* LOGIN FORM */}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          <div className="auth-field">

            <label>
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              autoComplete="username"
            />

          </div>


          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              autoComplete="current-password"
            />

          </div>


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "VERIFYING..."
              : "LOGIN"}

          </button>

        </form>


        {/* REGISTER */}

        <div className="auth-switch">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={onRegister}
          >
            Create account
          </button>

        </div>


        {/* SECURITY */}

        <div className="auth-security">

          <span>🔒</span>

          <p>
            Your credentials are
            protected with secure
            password hashing and
            two-step verification.
          </p>

        </div>

      </div>

    </div>

  );
}

export default Login;