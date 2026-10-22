import { useState } from "react";

const API_ROOT = "http://127.0.0.1:8000";

function Register({ onRegisterSuccess, onLogin }) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    username: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  function handleChange(e) {

    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }


  async function handleRegister(e) {

    e.preventDefault();

    setError("");

    // ------------------------------------------
    // FRONTEND VALIDATION
    // ------------------------------------------

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!form.country.trim()) {
      setError("Please enter your country.");
      return;
    }

    if (!form.username.trim()) {
      setError("Please choose a username.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_ROOT}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
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


      // ------------------------------------------
      // BACKEND ERROR
      // ------------------------------------------

      if (!response.ok) {

        const message =
          data?.detail?.message ||
          "Registration failed.";

        setError(message);

        return;
      }


      // ------------------------------------------
      // SUCCESS
      // ------------------------------------------

      if (data.success) {

        onRegisterSuccess({

          email: data.email,

          developmentOtp:
            data.development_otp,

        });

      }

    } catch (error) {

      console.error(
        "Registration error:",
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

      <div className="auth-card auth-card--register">

        {/* ==========================================
            BRAND
        ========================================== */}

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


        {/* ==========================================
            HEADING
        ========================================== */}

        <div className="auth-heading">

          <span>
            CREATE ACCOUNT
          </span>

          <h2>
            Join Waypoint
          </h2>

          <p>
            Create your secure account
            to access maritime route
            intelligence.
          </p>

        </div>


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
            REGISTER FORM
        ========================================== */}

        <form
          className="auth-form"
          onSubmit={handleRegister}
        >

          {/* NAME */}

          <div className="auth-field">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />

          </div>


          {/* EMAIL */}

          <div className="auth-field">

            <label>
              Gmail / Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />

          </div>


          {/* PHONE */}

          <div className="auth-field">

            <label>
              Mobile Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter mobile number"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />

          </div>


          {/* COUNTRY */}

          <div className="auth-field">

            <label>
              Country
            </label>

            <input
              type="text"
              name="country"
              placeholder="Enter your country"
              value={form.country}
              onChange={handleChange}
              autoComplete="country-name"
            />

          </div>


          {/* USERNAME */}

          <div className="auth-field">

            <label>
              Username
            </label>

            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />

          </div>


          {/* PASSWORD */}

          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="auth-field">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirm_password"
              placeholder="Re-enter your password"
              value={form.confirm_password}
              onChange={handleChange}
              autoComplete="new-password"
            />

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "CREATING ACCOUNT..."
              : "CREATE ACCOUNT"}

          </button>

        </form>


        {/* ==========================================
            LOGIN LINK
        ========================================== */}

        <div className="auth-switch">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onLogin}
          >
            Sign in
          </button>

        </div>


        {/* ==========================================
            SECURITY MESSAGE
        ========================================== */}

        <div className="auth-security">

          <span>
            🔒
          </span>

          <p>
            Your password is securely
            hashed. Two-step verification
            will be required to access
            your account.
          </p>

        </div>

      </div>

    </div>

  );
}

export default Register;