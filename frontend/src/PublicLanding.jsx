import "./PublicLanding.css";

const features = [
  { icon: "⌁", title: "Route Planning", text: "Find efficient shipping routes and compare transit estimates with route data." },
  { icon: "☼", title: "Weather Intelligence", text: "Understand changing conditions and weather risks before you plan." },
  { icon: "⚓", title: "Connected Ports", text: "Explore global ports and discover useful shipping connections." },
  { icon: "▤", title: "Digital Quotations", text: "Turn route decisions into structured freight quotation requests." },
  { icon: "▥", title: "Operations Dashboard", text: "Keep searches, quotations and activity together in one workspace." },
];

const steps = [
  { number: "01", icon: "⌕", title: "Choose your ports", text: "Set origin, destination, cargo type and shipment details." },
  { number: "02", icon: "⌁", title: "Compare route options", text: "Review available routes, transit times and distance metrics." },
  { number: "03", icon: "☁", title: "Check conditions", text: "Explore weather context and connected-port information." },
  { number: "04", icon: "▤", title: "Request a quotation", text: "Carry your shipment into the quotation workflow and track it later." },
];

const testimonials = [
  { initials: "AS", name: "Aarav Sharma", role: "Logistics professional", quote: "Having route options and transit details together makes it easier to compare a shipment." },
  { initials: "PK", name: "Priya Kumar", role: "Shipping analyst", quote: "The route, port and weather information belongs in one clear planning workflow." },
  { initials: "RK", name: "Ravi K.", role: "Engineering student", quote: "Waypoint makes maritime planning concepts easier to explore in one place." },
];

function PublicLanding({ onLogin, onRegister }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="wl-page">
      <header className="wl-nav">
        <a className="wl-brand" href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home"); }} aria-label="Waypoint AI home">
          <span className="wl-brand-mark">W</span><span>WAYPOINT <b>AI</b></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}>Home</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo("features"); }}>Features</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo("how-it-works"); }}>How It Works</a>
          <a href="#why-waypoint" onClick={(e) => { e.preventDefault(); scrollTo("why-waypoint"); }}>Why Waypoint</a>
          <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollTo("testimonials"); }}>Reviews</a>
        </nav>
        <div className="wl-nav-actions">
          <button className="wl-login" onClick={onLogin}>Login</button>
          <button className="wl-register" onClick={onRegister}>Register <span>↗</span></button>
        </div>
      </header>

      <section className="wl-hero" id="home">
        <div className="wl-hero-copy">
          <p className="wl-kicker"><span /> AI-POWERED MARITIME INTELLIGENCE</p>
          <h1>Smarter Maritime Decisions for a <em>Connected World.</em></h1>
          <p className="wl-hero-description">Plan safer routes, monitor changing conditions, discover connected ports, and request freight quotations — all in one intelligent platform.</p>
          <div className="wl-hero-actions">
            <button className="wl-primary" onClick={onRegister}>Get Started <span>→</span></button>
            <button className="wl-secondary" onClick={() => scrollTo("features")}>Explore Waypoint <span>↗</span></button>
          </div>
          <div className="wl-hero-checks"><span>⚓ &nbsp; AI Route Planning</span><span>☁ &nbsp; Real-time Weather</span><span>◎ &nbsp; Global Port Insights</span><span>▤ &nbsp; Digital Quotations</span></div>
        </div>
        <div className="wl-hero-caption"><span className="wl-caption-dot" /> A clearer view of global shipping</div>
      </section>

      <section className="wl-features-section" id="features">
        <div className="wl-section-heading">
          <p className="wl-section-kicker">KEY FEATURES</p>
          <h2>Everything you need for<br />smarter maritime planning.</h2>
          <p>Real-world maritime information, brought together in one practical workspace.</p>
        </div>
        <div className="wl-features">
          {features.map((feature) => <article className="wl-feature-card" key={feature.title}><div className="wl-feature-icon">{feature.icon}</div><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
        </div>
      </section>

      <section className="wl-why" id="why-waypoint">
        <div className="wl-why-copy"><p className="wl-section-kicker">WHY WAYPOINT</p><h2>Built for the Future<br />of Global Trade.</h2><p>Bring route information, weather context, connected ports and commercial workflows into one place — and make better-informed shipping decisions.</p><button className="wl-light-outline" onClick={() => scrollTo("how-it-works")}>Learn More <span>→</span></button></div>
        <div className="wl-stats"><div><span>⚓</span><strong>870+</strong><small>Maritime Routes*</small></div><div><span>◎</span><strong>180+</strong><small>Connected Ports*</small></div><div><span>☁</span><strong>24/7</strong><small>Weather Intelligence</small></div><div><span>▥</span><strong>Global</strong><small>Maritime Coverage</small></div><p>*Illustrative figures; confirm against the live platform data before publishing.</p></div>
      </section>

      <section className="wl-how" id="how-it-works">
        <div className="wl-section-heading"><p className="wl-section-kicker">HOW IT WORKS</p><h2>From route search to <em>clearer decisions.</em></h2><p>A simple workflow designed around the way maritime planning happens.</p></div>
        <div className="wl-steps">{steps.map((step) => <article key={step.number}><div className="wl-step-top"><span>{step.number}</span><i>{step.icon}</i></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
        <button className="wl-primary wl-how-cta" onClick={onRegister}>Start exploring <span>→</span></button>
      </section>

      <section className="wl-testimonials" id="testimonials">
        <div className="wl-testimonial-intro"><p className="wl-section-kicker">COMMUNITY VOICES</p><h2>What Our Users Say</h2><p>Feedback helps us make maritime planning clearer and more useful.</p><small>Preview testimonials — replace with verified user feedback before publishing.</small></div>
        <div className="wl-review-grid">{testimonials.map((item) => <article className="wl-review-card" key={item.name}><div className="wl-review-person"><span>{item.initials}</span><div><strong>{item.name}</strong><small>{item.role}</small><b aria-label="Sample five-star rating">★★★★★</b></div></div><p>“{item.quote}”</p></article>)}</div>
      </section>

      <footer className="wl-footer">
        <div className="wl-footer-brand"><a className="wl-brand" href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}><span className="wl-brand-mark">W</span><span>WAYPOINT <b>AI</b></span></a><p>Smarter maritime decisions start here.</p></div>
        <div className="wl-footer-column"><strong>Product</strong><button onClick={() => scrollTo("features")}>Features</button><button onClick={() => scrollTo("how-it-works")}>How It Works</button><button onClick={() => scrollTo("why-waypoint")}>Why Waypoint</button></div>
        <div className="wl-footer-column"><strong>Explore</strong><button onClick={onLogin}>Login</button><button onClick={onRegister}>Create an account</button><button onClick={() => scrollTo("testimonials")}>Reviews</button></div>
        <div className="wl-footer-note"><span>© {new Date().getFullYear()} Waypoint AI</span><small>Maritime intelligence platform</small></div>
      </footer>
    </main>
  );
}

export default PublicLanding;
