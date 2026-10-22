import { useState } from "react";

import "./Register.css";



const API_ROOT = "http://127.0.0.1:8000";



export default function Register({ onRegistered, onBackToLogin, onLogin }) {

  const [form, setForm] = useState({

    name: "",

    email: "",

    phone: "",

    country: "",

    username: "",

    password: "",

    confirm_password: "",

  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");



  function updateField(event) {

    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));

    setError("");

    setSuccess("");

  }



  async function handleSubmit(event) {

    event.preventDefault();

    setError("");

    setSuccess("");



    if (!acceptedTerms) {

      setError("Please agree to the Terms of Service and Privacy Policy.");

      return;

    }

    if (form.password.length < 8) {

      setError("Password must contain at least 8 characters.");

      return;

    }

    if (!/[A-Z]/.test(form.password)) {

      setError("Password must contain at least one uppercase letter.");

      return;

    }

    if (!/[^A-Za-z0-9]/.test(form.password)) {

      setError("Password must contain at least one special character.");

      return;

    }

    if (form.password !== form.confirm_password) {

      setError("Passwords do not match.");

      return;

    }



    setLoading(true);

    try {

      const response = await fetch(`${API_ROOT}/api/auth/register`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(form),

      });



      let data;

      try {

        data = await response.json();

      } catch {

        throw new Error("The server returned an invalid response.");

      }



      if (!response.ok) {

        const detail = data?.detail;

        throw new Error(

          detail?.message ||

          (typeof detail === "string" ? detail : "") ||

          data?.message ||

          "Registration failed. Please check your details and try again."

        );

      }



      setSuccess(data?.message || "Account details accepted. Check your email for the verification code.");

      if (onRegistered) {

        onRegistered({

          email: form.email,

          developmentOtp: data?.development_otp || data?.otp || null,

          response: data,

        });

      }

    } catch (err) {

      setError(err.message || "Unable to connect to the server. Please try again.");

    } finally {

      setLoading(false);

    }

  }



  return (

    <main className="waypoint-register-page">

      <div className="waypoint-register-background" aria-hidden="true" />

      <div className="waypoint-register-overlay" aria-hidden="true" />



      <header className="waypoint-register-site-brand">

        <div className="waypoint-register-brand-mark" aria-hidden="true">⚓</div>

        <div className="waypoint-register-site-brand-text">

          <strong>Waypoint</strong>

          <span>MARITIME BROKERAGE</span>

        </div>

      </header>



      <div className="waypoint-register-trust-note">

        <span />

        Trusted by global traders<br />and logistics professionals

      </div>



      <section className="waypoint-register-intro">

        <div className="waypoint-register-eyebrow">CREATE YOUR ACCOUNT <i /></div>

        <h1>Join the Future<br />of Maritime Trade</h1>

        <p className="waypoint-register-intro-copy">

          Get intelligent route insights, real-time weather updates, port information and seamless quotation management — all in one platform.

        </p>



        <div className="waypoint-register-benefits">

          <div className="waypoint-register-benefit">

            <span className="waypoint-register-benefit-icon" aria-hidden="true">◎</span>

            <div><strong>Global Route Intelligence</strong><p>Explore optimal shipping routes</p></div>

          </div>

          <div className="waypoint-register-benefit">

            <span className="waypoint-register-benefit-icon" aria-hidden="true">☁</span>

            <div><strong>Real-time Weather Data</strong><p>Plan safer and smarter voyages</p></div>

          </div>

          <div className="waypoint-register-benefit">

            <span className="waypoint-register-benefit-icon" aria-hidden="true">♜</span>

            <div><strong>Connected Port Network</strong><p>Access key ports worldwide</p></div>

          </div>

          <div className="waypoint-register-benefit">

            <span className="waypoint-register-benefit-icon" aria-hidden="true">▥</span>

            <div><strong>Digital Quotation Management</strong><p>Faster, transparent and efficient</p></div>

          </div>

        </div>



        <div className="waypoint-register-map-caption">

          <span className="waypoint-register-compass" aria-hidden="true">✥</span>

          <span>SAFER ROUTES<br />BRIGHTER POSSIBILITIES</span>

        </div>

      </section>



      <section className="waypoint-register-card" aria-labelledby="waypoint-register-title">

        <header className="waypoint-register-card-brand">

          <div className="waypoint-register-brand-mark small" aria-hidden="true">⚓</div>

          <div className="waypoint-register-site-brand-text">

            <strong>Waypoint</strong>

            <span>MARITIME BROKERAGE</span>

          </div>

          <span className="waypoint-register-step">STEP 1 OF 2</span>

        </header>



        <div className="waypoint-register-card-heading">

          <h2 id="waypoint-register-title">Create your account</h2>

          <p>Join Waypoint and unlock smarter, faster and safer maritime brokerage solutions.</p>

        </div>



        {error && <div className="waypoint-register-message error" role="alert"><span>!</span>{error}</div>}

        {success && <div className="waypoint-register-message success" role="status"><span>✓</span>{success}</div>}



        <form onSubmit={handleSubmit} className="waypoint-register-form">

          <div className="waypoint-register-grid">

            <label className="waypoint-register-field">

              <span>Full Name</span>

              <span className="waypoint-register-input-wrap"><i aria-hidden="true">♙</i><input name="name" value={form.name} onChange={updateField} placeholder="Enter your full name" autoComplete="name" required minLength={2} maxLength={100} /></span>

            </label>

            <label className="waypoint-register-field">

              <span>Email Address</span>

              <span className="waypoint-register-input-wrap"><i aria-hidden="true">✉</i><input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" autoComplete="email" required /></span>

            </label>

            <label className="waypoint-register-field">

              <span>Phone Number</span>

              <span className="waypoint-register-input-wrap"><i aria-hidden="true">♧</i><input name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="+91 98765 43210" autoComplete="tel" required minLength={10} maxLength={15} /></span>

            </label>

            <label className="waypoint-register-field">

              <span>Country</span>

              <span className="waypoint-register-input-wrap"><i aria-hidden="true">◎</i>

                <select name="country" value={form.country} onChange={updateField} required>

                  <option value="">Select your country</option>

                  <option>India</option><option>United States</option><option>United Kingdom</option><option>United Arab Emirates</option><option>Singapore</option><option>Australia</option><option>Canada</option><option>Germany</option><option>Netherlands</option><option>Japan</option><option>Other</option>

                </select>

              </span>

            </label>

          </div>



          <label className="waypoint-register-field full">

            <span>Username</span>

            <span className="waypoint-register-input-wrap"><i aria-hidden="true">♙</i><input name="username" value={form.username} onChange={updateField} placeholder="Choose a username" autoComplete="username" required minLength={3} maxLength={30} /></span>

          </label>



          <label className="waypoint-register-field full">

            <span>Password</span>

            <span className="waypoint-register-input-wrap">

              <i aria-hidden="true">♙</i>

              <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateField} placeholder="Create a strong password" autoComplete="new-password" required minLength={8} maxLength={100} />

              <button type="button" className="waypoint-register-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "◉" : "◎"}</button>

            </span>

            <small className="waypoint-register-hint">At least 8 characters, one uppercase letter and one special character.</small>

          </label>



          <label className="waypoint-register-field full">

            <span>Confirm Password</span>

            <span className="waypoint-register-input-wrap">

              <i aria-hidden="true">♙</i>

              <input name="confirm_password" type={showConfirmPassword ? "text" : "password"} value={form.confirm_password} onChange={updateField} placeholder="Confirm your password" autoComplete="new-password" required />

              <button type="button" className="waypoint-register-eye" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>{showConfirmPassword ? "◉" : "◎"}</button>

            </span>

          </label>



          <label className="waypoint-register-terms">

            <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />

            <span className="waypoint-register-checkbox" aria-hidden="true" />

            <span>I agree to the <a href="/terms" onClick={(event) => event.preventDefault()}>Terms of Service</a> and <a href="/privacy" onClick={(event) => event.preventDefault()}>Privacy Policy</a></span>

          </label>



          <button className="waypoint-register-submit" type="submit" disabled={loading}>

            {loading ? "SENDING VERIFICATION CODE…" : "SEND VERIFICATION CODE"}

            {!loading && <span aria-hidden="true">→</span>}

          </button>

        </form>



        <div className="waypoint-register-login">

          <span>Already have an account?</span>

          <button type="button" onClick={onLogin || onBackToLogin}>Login here</button>

        </div>



        <footer className="waypoint-register-security">

          <span aria-hidden="true">♢</span>

          <p>Your information is secure and will only be used for account verification.</p>

        </footer>

      </section>



      <div className="waypoint-register-mobile-caption">WAYPOINT <span>•</span> CONNECTING GLOBAL TRADE</div>

    </main>

  );

}
