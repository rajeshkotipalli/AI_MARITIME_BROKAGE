import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OperationsDashboard.css";

const API_URL = "http://127.0.0.1:8000";

const SERVICES = [
  "Overall Experience",
  "Route Planning",
  "Weather Intelligence",
  "Connected Ports",
  "Quotation Service",
  "Waypoint AI",
  "Operations Dashboard",
];

function OperationsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    review: "",
    service_area: "Overall Experience",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const token = localStorage.getItem("waypoint_token");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login to view the operations dashboard.");
        return;
      }

      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.detail?.message ||
            data?.detail ||
            "Unable to load dashboard analytics."
        );
      }

      setAnalytics(data);
    } catch (err) {
      console.error("Dashboard analytics error:", err);
      setError(err?.message || "Unable to load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewLoading(true);
      setReviewError("");

      if (!token) return;

      const response = await fetch(`${API_URL}/api/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.detail?.message ||
            data?.detail ||
            "Unable to load customer feedback."
        );
      }

      setReviews(data);

      if (data.my_review) {
        setReviewForm({
          rating: Number(data.my_review.rating || 0),
          title: data.my_review.title || "",
          review: data.my_review.review || "",
          service_area: data.my_review.service_area || "Overall Experience",
        });
      }
    } catch (err) {
      console.error("Review loading error:", err);
      setReviewError(err?.message || "Unable to load reviews.");
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewMessage("");
    setReviewError("");

    if (!reviewForm.rating) {
      setReviewError("Please select a rating from 1 to 5.");
      return;
    }

    if (reviewForm.review.trim().length < 10) {
      setReviewError("Please write at least 10 characters.");
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(reviewForm),
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.detail?.message ||
            data?.detail ||
            "Unable to submit your review."
        );
      }

      const notificationNote = data?.admin_notification_sent === false
        ? " Your review was saved; the administrator portal will still receive it."
        : " The Waypoint AI team has been notified.";
      setReviewMessage((data.message || "Thank you for your feedback.") + notificationNote);
      await loadReviews();
    } catch (err) {
      setReviewError(err?.message || "Unable to submit your review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const dashboard = analytics || {};
  const summary = dashboard.summary || {};
  const routeAnalytics = dashboard.route_analytics || {};
  const quotationAnalytics = dashboard.quotation_analytics || {};

  const recentSearches = Array.isArray(dashboard.recent_searches)
    ? dashboard.recent_searches
    : [];
  const recentQuotations = Array.isArray(dashboard.recent_quotations)
    ? dashboard.recent_quotations
    : [];
  const searchedRoutes = Array.isArray(routeAnalytics.most_searched_routes)
    ? routeAnalytics.most_searched_routes
    : [];

  const status = quotationAnalytics.status || {};
  const pending = Number(status.Pending || status.pending || 0);
  const approved = Number(status.Approved || status.approved || 0);
  const rejected = Number(status.Rejected || status.rejected || 0);
  const totalQuotations = Number(
    summary.total_quotations || quotationAnalytics.total || pending + approved + rejected
  );

  const approvalRate =
    totalQuotations > 0
      ? Math.round((approved / totalQuotations) * 100)
      : 0;

  const maxSearches = Math.max(
    1,
    ...searchedRoutes.map((item) => Number(item.searches || 0))
  );

  const routeBars = searchedRoutes.slice(0, 6);
  const ratingDistribution = reviews?.distribution || {};
  const averageRating = Number(reviews?.average_rating || 0);

  const reviewStars = useMemo(
    () => Array.from({ length: 5 }, (_, index) => index + 1),
    []
  );

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loader-ring" />
          <span>WAYPOINT OPERATIONS</span>
          <h2>Loading command center</h2>
          <p>Collecting route, quotation and network intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <span className="dashboard-error__icon">!</span>
          <span className="dashboard-kicker">WAYPOINT OPERATIONS</span>
          <h2>Dashboard unavailable</h2>
          <p>{error}</p>
          <button onClick={loadDashboard}>↻ Retry connection</button>
        </div>
      </div>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-background" aria-hidden="true">
        <div className="dashboard-background__glow dashboard-background__glow--one" />
        <div className="dashboard-background__glow dashboard-background__glow--two" />
        <div className="dashboard-background__grid" />
        <div className="dashboard-background__radar" />
      </div>

      <div className="dashboard-shell">
        <header className="dashboard-hero">
          <div className="dashboard-hero__copy">
            <div className="dashboard-live">
              <span />
              LIVE OPERATIONS INTELLIGENCE
            </div>
            <div className="dashboard-kicker">WAYPOINT · MARITIME BROKERAGE</div>
            <h1>Operations<br /><em>Command Center</em></h1>
            <p>
              See route activity, quotation movement, network reach and customer
              experience from one operational view.
            </p>

            <div className="dashboard-hero__chips">
              <span>ROUTE INTELLIGENCE</span>
              <span>QUOTATION MONITOR</span>
              <span>CUSTOMER SIGNALS</span>
            </div>
          </div>

          <div className="dashboard-hero__visual" aria-hidden="true">
            <div className="radar">
              <div className="radar__rings radar__rings--one" />
              <div className="radar__rings radar__rings--two" />
              <div className="radar__sweep" />
              <i className="radar__dot radar__dot--one" />
              <i className="radar__dot radar__dot--two" />
              <i className="radar__dot radar__dot--three" />
              <div className="radar__crosshair" />
            </div>
            <div className="hero-route-line" />
            <div className="hero-port hero-port--one">CHN</div>
            <div className="hero-port hero-port--two">RTM</div>
          </div>

          <button className="dashboard-refresh" onClick={() => { loadDashboard(); loadReviews(); }}>
            <span>↻</span> Refresh
          </button>
        </header>

        <section className="dashboard-kpis">
          <Kpi icon="⌁" label="Route Searches" value={summary.total_searches || 0} />
          <Kpi icon="◈" label="Available Routes" value={summary.available_routes || 0} />
          <Kpi icon="⚓" label="Connected Ports" value={summary.connected_ports || 0} />
          <Kpi icon="▣" label="Quotations" value={totalQuotations} />
          <Kpi icon="↗" label="Approved" value={approved} />
          <Kpi icon="◷" label="Avg Transit" value={summary.average_transit_days || 0} suffix="days" />
        </section>

        <section className="dashboard-grid dashboard-grid--top">
          <Panel title="Route demand" eyebrow="TRAFFIC SIGNAL" badge={`${searchedRoutes.length} tracked`}>
            {routeBars.length ? (
              <div className="route-bars">
                <div className="route-bars__scale">
                  <span>{maxSearches}</span>
                  <span>{Math.ceil(maxSearches / 2)}</span>
                  <span>0</span>
                </div>
                <div className="route-bars__plot">
                  <div className="chart-gridline chart-gridline--top" />
                  <div className="chart-gridline chart-gridline--mid" />
                  <div className="chart-gridline chart-gridline--bottom" />
                  <div className="route-bars__items">
                    {routeBars.map((item, index) => {
                      const value = Number(item.searches || 0);
                      const height = Math.max(7, (value / maxSearches) * 100);
                      return (
                        <div className="route-bar" key={`${item.route}-${index}`}>
                          <strong>{value}</strong>
                          <div className="route-bar__track">
                            <div
                              className={`route-bar__fill ${index === 0 ? "is-hot" : ""}`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span>{item.route || "Unknown"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Empty text="Search a route to populate the demand graph." />
            )}
          </Panel>

          <Panel title="Quotation status" eyebrow="COMMERCIAL FLOW" badge={`${totalQuotations} requests`}>
            <div className="status-visual">
              <div
                className="status-donut"
                style={{
                  background:
                    totalQuotations > 0
                      ? `conic-gradient(#e6b54d 0deg ${(pending / totalQuotations) * 360}deg, #38d09a ${(pending / totalQuotations) * 360}deg ${((pending + approved) / totalQuotations) * 360}deg, #ee6973 ${((pending + approved) / totalQuotations) * 360}deg 360deg)`
                      : "#183846",
                }}
              >
                <div>
                  <strong>{totalQuotations}</strong>
                  <span>requests</span>
                </div>
              </div>

              <div className="status-legend">
                <StatusRow label="Pending" value={pending} className="pending" />
                <StatusRow label="Approved" value={approved} className="approved" />
                <StatusRow label="Rejected" value={rejected} className="rejected" />
                <div className="status-rate">
                  <span>Approval rate</span>
                  <strong>{approvalRate}%</strong>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="dashboard-grid dashboard-grid--middle">
          <Panel title="Route performance" eyebrow="ROUTE INTELLIGENCE" badge="LIVE">
            {routeBars.length ? (
              <div className="route-ranking">
                {routeBars.map((item, index) => {
                  const value = Number(item.searches || 0);
                  return (
                    <div className="route-ranking__item" key={`${item.route}-rank-${index}`}>
                      <div className="route-ranking__rank">{String(index + 1).padStart(2, "0")}</div>
                      <div className="route-ranking__body">
                        <div className="route-ranking__title">
                          <strong>{item.route || "Unknown Route"}</strong>
                          <span>{value} searches</span>
                        </div>
                        <div className="route-ranking__track">
                          <span style={{ width: `${Math.max(5, (value / maxSearches) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty text="No route activity yet." />
            )}
          </Panel>

          <Panel title="Network snapshot" eyebrow="PORT CONNECTIVITY" badge="SYSTEM">
            <div className="network-card">
              <div className="network-card__globe">
                <span className="network-card__orbit network-card__orbit--one" />
                <span className="network-card__orbit network-card__orbit--two" />
                <i className="network-card__node network-card__node--one" />
                <i className="network-card__node network-card__node--two" />
                <i className="network-card__node network-card__node--three" />
              </div>
              <div>
                <span>Connected maritime nodes</span>
                <strong>{Number(summary.connected_ports || 0).toLocaleString()}</strong>
                <p>
                  Route network currently contains{" "}
                  {Number(summary.available_routes || 0).toLocaleString()} available route records.
                </p>
              </div>
            </div>

            <div className="network-metrics">
              <div><span>Searches</span><strong>{Number(summary.total_searches || 0).toLocaleString()}</strong></div>
              <div><span>Avg transit</span><strong>{Number(summary.average_transit_days || 0).toFixed(1)}d</strong></div>
              <div><span>Quotations</span><strong>{totalQuotations}</strong></div>
            </div>
          </Panel>
        </section>

        <section className="dashboard-grid dashboard-grid--activity">
          <Panel title="Recent route activity" eyebrow="USER ACTIVITY">
            {recentSearches.length ? (
              <div className="activity-list">
                {recentSearches.slice(0, 6).map((item, index) => (
                  <div className="activity-row" key={item.id || index}>
                    <div className="activity-row__icon">↗</div>
                    <div className="activity-row__main">
                      <strong>{item.origin || "Unknown"} <span>→</span> {item.destination || "Unknown"}</strong>
                      <small>{item.recommended_route ? `Recommended ${item.recommended_route}` : "Route analysis completed"}</small>
                    </div>
                    <time>{formatDate(item.created_at || item.timestamp || item.searched_at)}</time>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="Your route searches will appear here." />
            )}
          </Panel>

          <Panel title="Recent quotations" eyebrow="REQUEST PIPELINE">
            {recentQuotations.length ? (
              <div className="activity-list">
                {recentQuotations.slice(0, 6).map((item, index) => (
                  <div className="activity-row" key={item.id || index}>
                    <div className="activity-row__icon activity-row__icon--gold">$</div>
                    <div className="activity-row__main">
                      <strong>{item.origin || "Unknown"} <span>→</span> {item.destination || "Unknown"}</strong>
                      <small>Route {item.route_id || "—"}</small>
                    </div>
                    <div className={`activity-status activity-status--${String(item.status || "Pending").toLowerCase()}`}>
                      {item.status || "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="Your quotation requests will appear here." />
            )}
          </Panel>
        </section>

        <section className="feedback-section">
          <div className="feedback-summary">
            <div>
              <div className="dashboard-kicker">CUSTOMER EXPERIENCE</div>
              <h2>How is Waypoint serving you?</h2>
              <p>
                Your feedback helps us improve route intelligence, quotation
                handling, AI assistance and the overall brokerage experience.
              </p>
            </div>

            <div className="feedback-score">
              <strong>{averageRating ? averageRating.toFixed(1) : "—"}</strong>
              <div className="feedback-stars">
                {reviewStars.map((star) => (
                  <span key={star} className={star <= Math.round(averageRating) ? "is-on" : ""}>★</span>
                ))}
              </div>
              <small>{reviews?.total_reviews || 0} customer reviews</small>
            </div>
          </div>

          <div className="feedback-grid">
            <form className="review-form" onSubmit={submitReview}>
              <div className="review-form__head">
                <div>
                  <span>SHARE YOUR EXPERIENCE</span>
                  <h3>{reviews?.my_review ? "Update your review" : "Write a review"}</h3>
                </div>
                <div className="review-form__verified">✓ AUTHENTICATED USER</div>
              </div>

              <div className="review-rating">
                <label>Your rating</label>
                <div>
                  {reviewStars.map((star) => (
                    <button
                      type="button"
                      key={star}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      className={star <= (hoverRating || reviewForm.rating) ? "is-selected" : ""}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="review-form__row">
                <label>
                  Service area
                  <select
                    value={reviewForm.service_area}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, service_area: e.target.value }))}
                  >
                    {SERVICES.map((service) => <option key={service}>{service}</option>)}
                  </select>
                </label>

                <label>
                  Review title
                  <input
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="What stood out?"
                    maxLength={120}
                  />
                </label>
              </div>

              <label className="review-form__textarea">
                Your experience
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, review: e.target.value }))}
                  placeholder="Tell us what worked well and what we can improve..."
                  maxLength={1200}
                  rows={5}
                />
              </label>

              {reviewError && <div className="review-message review-message--error">{reviewError}</div>}
              {reviewMessage && <div className="review-message review-message--success">{reviewMessage}</div>}

              <button className="review-submit" type="submit" disabled={submittingReview}>
                {submittingReview ? "Submitting feedback..." : reviews?.my_review ? "Update my review →" : "Publish my review →"}
              </button>
            </form>

            {reviews?.my_review?.admin_reply && (
              <div className="admin-reply-card">
                <div className="admin-reply-card__icon">↩</div>
                <div>
                  <span className="admin-reply-card__eyebrow">WAYPOINT AI ADMIN RESPONSE</span>
                  <h3>Thank you for sharing your experience.</h3>
                  <p>{reviews.my_review.admin_reply}</p>
                  <small>Responded {formatDate(reviews.my_review.admin_reply_at)}</small>
                </div>
              </div>
            )}

            <div className="review-wall">
              <div className="review-wall__head">
                <div>
                  <span>RECENT FEEDBACK</span>
                  <h3>What users are saying</h3>
                </div>
                <button onClick={loadReviews}>↻</button>
              </div>

              {reviewLoading ? (
                <div className="review-empty">Loading customer feedback...</div>
              ) : reviews?.recent_reviews?.length ? (
                <div className="review-list">
                  {reviews.recent_reviews.map((review) => (
                    <article className="review-card" key={review.id}>
                      <div className="review-card__top">
                        <div className="review-card__stars">
                          {reviewStars.map((star) => (
                            <span key={star} className={star <= review.rating ? "is-on" : ""}>★</span>
                          ))}
                        </div>
                        <span>{review.service_area}</span>
                      </div>
                      <h4>{review.title || "Waypoint experience"}</h4>
                      <p>{review.review}</p>
                      <small>
                        {review.is_mine ? "Your review" : "Verified Waypoint user"} · {formatDate(review.created_at)}
                      </small>
                      {review.admin_reply && (
                        <div className="review-card__admin-reply">
                          <div>↩ <strong>Waypoint AI Admin</strong></div>
                          <p>{review.admin_reply}</p>
                          <small>Responded {formatDate(review.admin_reply_at)}</small>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="review-empty">
                  <span>✦</span>
                  <strong>Be the first to share feedback</strong>
                  <p>Your review will appear here after you submit it.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="dashboard-footer">
          <div>
            <span className="dashboard-live"><span /> SYSTEM ONLINE</span>
            <strong>Waypoint Maritime Operations</strong>
          </div>
          <div>
            <span>Route Engine</span>
            <span>Analytics API</span>
            <span>Quotation Service</span>
            <span>Customer Feedback</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Kpi({ icon, label, value, suffix }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{Number(value || 0).toLocaleString()}</strong>
        {suffix && <small>{suffix}</small>}
      </div>
    </div>
  );
}

function Panel({ title, eyebrow, badge, children }) {
  return (
    <section className="dashboard-panel">
      <div className="panel-head">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {badge && <b>{badge}</b>}
      </div>
      {children}
    </section>
  );
}

function StatusRow({ label, value, className }) {
  return (
    <div className="status-row">
      <span><i className={className} />{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="dashboard-empty">
      <span>◌</span>
      <p>{text}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default OperationsDashboard;
