import { useCallback, useEffect, useMemo, useState } from "react";

import "./Shipments.css";



const API_URL = "http://127.0.0.1:8000";



const STATUS_STEPS = [

  "Booked",

  "Preparing",

  "In Transit",

  "Arrived",

  "Delivered",

];



export default function MyShipments() {

  const [shipments, setShipments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewMessages, setReviewMessages] = useState({});
  const [reviewSaving, setReviewSaving] = useState({});



  const load = useCallback(async () => {

    setLoading(true);

    setError("");



    try {

      const token = localStorage.getItem("waypoint_token");



      if (!token) {

        throw new Error("Please log in to view your shipments.");

      }



      const response = await fetch(`${API_URL}/api/my-shipments`, {

        headers: {

          Authorization: `Bearer ${token}`,

          Accept: "application/json",

        },

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(

          data?.detail?.message ||

            data?.detail ||

            "Unable to load shipments."

        );

      }



      setShipments(data.shipments || []);

    } catch (e) {

      setError(String(e.message || "Unable to load shipments."));

    } finally {

      setLoading(false);

    }

  }, []);



  async function submitShipmentReview(shipment) {
    const draft = reviewDrafts[shipment.id] || {};
    const rating = Number(draft.rating || 5);
    const review = String(draft.review || "").trim();
    if (review.length < 10) {
      setReviewMessages((current) => ({ ...current, [shipment.id]: "Please write at least 10 characters." }));
      return;
    }
    const token = localStorage.getItem("waypoint_token");
    setReviewSaving((current) => ({ ...current, [shipment.id]: true }));
    setReviewMessages((current) => ({ ...current, [shipment.id]: "" }));
    try {
      const response = await fetch(`${API_URL}/api/my-shipments/${shipment.id}/review`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ rating, title: draft.title || "", review }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        const detail = data?.detail?.message || data?.detail || data?.message || "Unable to save shipment review.";
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      setShipments((current) => current.map((item) => item.id === shipment.id ? { ...item, review: data.review } : item));
      setReviewMessages((current) => ({ ...current, [shipment.id]: data.message || "Review saved." }));
    } catch (err) {
      setReviewMessages((current) => ({ ...current, [shipment.id]: err?.message || "Unable to save shipment review." }));
    } finally {
      setReviewSaving((current) => ({ ...current, [shipment.id]: false }));
    }
  }

  useEffect(() => {

    load();

  }, [load]);



  const counts = useMemo(() => ({

    total: shipments.length,

    active: shipments.filter(

      (s) => !["Delivered", "Arrived"].includes(s.status)

    ).length,

    delivered: shipments.filter(

      (s) => s.status === "Delivered"

    ).length,

  }), [shipments]);



  const visibleShipments = useMemo(() => {

    if (filter === "All") return shipments;

    return shipments.filter((s) => s.status === filter);

  }, [shipments, filter]);



  const formatDate = (value) => {

    if (!value) return "Not scheduled";



    const date = new Date(value);



    return Number.isNaN(date.getTime())

      ? value

      : date.toLocaleDateString(undefined, {

          day: "numeric",

          month: "short",

          year: "numeric",

        });

  };



  const formatDateTime = (value) => {

    if (!value) return "—";



    const date = new Date(value);



    return Number.isNaN(date.getTime())

      ? value

      : date.toLocaleString();

  };



  const getStep = (status) => STATUS_STEPS.indexOf(status);



  return (

    <main className="shipments-page">

      <div className="shipments-content">

        <header className="shipments-hero">

          <div className="shipments-heading">

            <span className="shipments-eyebrow">

              CUSTOMER PORTAL / LOGISTICS

            </span>



            <h1>My Shipments</h1>



            <p>

              Your cargo. Your route. Your visibility.

              Track every shipment from booking to delivery.

            </p>

          </div>



          <button

            className="shipments-refresh"

            onClick={load}

            disabled={loading}

          >

            <span aria-hidden="true">↻</span>{" "}

            {loading ? "Refreshing..." : "Refresh"}

          </button>

        </header>



        <section className="shipment-stats" aria-label="Shipment summary">

          <article className="shipment-stat">

            <span>Total shipments</span>

            <strong>{counts.total.toString().padStart(2, "0")}</strong>

            <small>All your bookings</small>

          </article>



          <article className="shipment-stat">

            <span>Active shipments</span>

            <strong>{counts.active.toString().padStart(2, "0")}</strong>

            <small>Not yet completed</small>

          </article>



          <article className="shipment-stat">

            <span>Delivered</span>

            <strong>{counts.delivered.toString().padStart(2, "0")}</strong>

            <small>Completed shipments</small>

          </article>

        </section>



        <section className="shipments-toolbar">

          <div>

            <h2>Shipment tracking</h2>

            <p>Monitor routes, cargo details and estimated arrivals.</p>

          </div>



          <label className="shipment-filter">

            <span>Show</span>

            <select

              value={filter}

              onChange={(e) => setFilter(e.target.value)}

            >

              <option>All</option>

              {STATUS_STEPS.map((status) => (

                <option key={status} value={status}>

                  {status}

                </option>

              ))}

              <option>Delayed</option>

            </select>

          </label>

        </section>



        {error && (

          <div className="shipments-error" role="alert">

            {error}

            <button onClick={load}>Try again</button>

          </div>

        )}



        {loading ? (

          <div className="shipments-empty">

            <span className="shipment-empty-icon">↻</span>

            <h2>Loading your shipments</h2>

            <p>Retrieving your latest tracking information...</p>

          </div>

        ) : visibleShipments.length === 0 ? (

          <div className="shipments-empty">

            <span className="shipment-empty-icon">⚓</span>

            <h2>

              {shipments.length === 0

                ? "Your journey starts here"

                : "No matching shipments"}

            </h2>

            <p>

              {shipments.length === 0

                ? "Once your quotation is approved and a shipment is created by the operations team, its tracking details will appear here."

                : "Try another status filter to find your shipment."}

            </p>



            {filter !== "All" && (

              <button

                className="shipment-reset-filter"

                onClick={() => setFilter("All")}

              >

                View all shipments

              </button>

            )}

          </div>

        ) : (

          <div className="shipments-grid">

            {visibleShipments.map((s) => {

              const step = getStep(s.status);



              return (

                <article className="shipment-card" key={s.id}>

                  <div className="shipment-card-top">

                    <div className="shipment-route-heading">

                      <span className="shipment-ref">

                        {s.tracking_reference}

                      </span>



                      <h3>

                        {s.origin}

                        <span className="route-arrow"> → </span>

                        {s.destination}

                      </h3>

                    </div>



                    <span

                      className={`shipment-status status-${String(

                        s.status || "unknown"

                      )

                        .toLowerCase()

                        .replace(/\s+/g, "-")}`}

                    >

                      {s.status || "Unknown"}

                    </span>

                  </div>



                  <div className="shipment-facts">

                    <div>

                      <small>Route ID</small>

                      <strong>{s.route_id || "—"}</strong>

                    </div>



                    <div>

                      <small>Cargo</small>

                      <strong>

                        {s.cargo_type || "Not specified"}

                        {s.containers != null

                          ? ` · ${s.containers} container(s)`

                          : ""}

                      </strong>

                    </div>



                    <div>

                      <small>Current location</small>

                      <strong>{s.current_location || "Not updated"}</strong>

                    </div>



                    <div>

                      <small>Vessel</small>

                      <strong>{s.vessel_name || "Not assigned"}</strong>

                    </div>



                    <div>

                      <small>Estimated departure</small>

                      <strong>

                        {formatDate(s.estimated_departure)}

                      </strong>

                    </div>



                    <div>

                      <small>Estimated arrival</small>

                      <strong>{formatDate(s.estimated_arrival)}</strong>

                    </div>

                  </div>



                  <section className="shipment-tracking">

                    <div className="tracking-heading">

                      <span>SHIPMENT PROGRESS</span>

                      <span>

                        {step >= 0

                          ? `${Math.round(

                              ((step + 1) / STATUS_STEPS.length) * 100

                            )}%`

                          : s.status === "Delayed"

                          ? "Delayed"

                          : "Status pending"}

                      </span>

                    </div>



                    <div className="shipment-progress">

                      {STATUS_STEPS.map((status, index) => {

                        const complete = step >= index && step >= 0;



                        return (

                          <div

                            key={status}

                            className={`shipment-progress-step ${

                              complete ? "complete" : ""

                            } ${

                              s.status === "Delayed" &&

                              status === "In Transit"

                                ? "delayed"

                                : ""

                            }`}

                          >

                            <span>{complete ? "✓" : index + 1}</span>

                            <small>{status}</small>

                          </div>

                        );

                      })}

                    </div>

                  </section>



                  {s.status === "Delayed" && (

                    <div className="shipment-delay">

                      This shipment is marked delayed. Contact the

                      operations team for the latest update.

                    </div>

                  )}



                  {s.notes && (

                    <div className="shipment-notes">

                      <strong>Operations note</strong>

                      <p>{s.notes}</p>

                    </div>

                  )}



                  <section className="shipment-review" aria-label={`Review shipment ${s.tracking_reference}`}>
                    <div className="shipment-review-heading">
                      <div><span className="shipment-review-eyebrow">SHIPMENT EXPERIENCE</span><h4>Review this shipment</h4></div>
                      {s.review && <span className="shipment-review-saved">Review submitted</span>}
                    </div>
                    {s.review ? (
                      <div className="shipment-review-existing">
                        <div className="shipment-review-stars" aria-label={`${s.review.rating} out of 5 stars`}>{"★".repeat(Number(s.review.rating || 0))}{"☆".repeat(5 - Number(s.review.rating || 0))}</div>
                        {s.review.title && <strong>{s.review.title}</strong>}
                        <p>{s.review.review}</p>
                        {s.review.admin_reply ? <div className="shipment-review-reply"><strong>Waypoint AI response</strong><p>{s.review.admin_reply}</p>{s.review.admin_reply_at && <small>Replied {formatDateTime(s.review.admin_reply_at)}</small>}</div> : <small>Your review is visible to the operations team. An administrator can reply here.</small>}
                        <button type="button" className="shipment-review-edit" onClick={() => setReviewDrafts((current) => ({ ...current, [s.id]: { rating: s.review.rating, title: s.review.title || "", review: s.review.review } }))}>Edit review</button>
                      </div>
                    ) : s.status === "Delivered" ? (
                      <div className="shipment-review-form">
                        <label>Rating <select value={reviewDrafts[s.id]?.rating || 5} onChange={(e) => setReviewDrafts((current) => ({ ...current, [s.id]: { ...current[s.id], rating: Number(e.target.value) } }))}><option value={5}>5 — Excellent</option><option value={4}>4 — Good</option><option value={3}>3 — Average</option><option value={2}>2 — Poor</option><option value={1}>1 — Very poor</option></select></label>
                        <label>Title (optional) <input value={reviewDrafts[s.id]?.title || ""} maxLength={120} onChange={(e) => setReviewDrafts((current) => ({ ...current, [s.id]: { ...current[s.id], title: e.target.value } }))} placeholder="Summarize your experience" /></label>
                        <label>Your review <textarea value={reviewDrafts[s.id]?.review || ""} maxLength={1200} rows={3} onChange={(e) => setReviewDrafts((current) => ({ ...current, [s.id]: { ...current[s.id], review: e.target.value } }))} placeholder="Tell us about the shipment experience (at least 10 characters)." /></label>
                        <button type="button" onClick={() => submitShipmentReview(s)} disabled={Boolean(reviewSaving[s.id])}>{reviewSaving[s.id] ? "Saving…" : "Submit shipment review"}</button>
                        {reviewMessages[s.id] && <p className="shipment-review-message" role="status">{reviewMessages[s.id]}</p>}
                      </div>
                    ) : <p className="shipment-review-locked">Review becomes available when this shipment is marked Delivered.</p>}
                    {s.review && reviewDrafts[s.id] && <div className="shipment-review-form">
                      <label>Rating <select value={reviewDrafts[s.id].rating || 5} onChange={(e) => setReviewDrafts((current) => ({ ...current, [s.id]: { ...current[s.id], rating: Number(e.target.value) } }))}><option value={5}>5 — Excellent</option><option value={4}>4 — Good</option><option value={3}>3 — Average</option><option value={2}>2 — Poor</option><option value={1}>1 — Very poor</option></select></label>
                      <label>Title (optional) <input value={reviewDrafts[s.id].title || ""} maxLength={120} onChange={(e) => setReviewDrafts((current) => ({ ...current, [s.id]: { ...current[s.id], title: e.target.value } }))} /></label>
                      <label>Your review <textarea value={reviewDrafts[s.id].review || ""} maxLength={1200} rows={3} onChange={(e) => setReviewDrafts((current) => ({ ...current, [s.id]: { ...current[s.id], review: e.target.value } }))} /></label>
                      <button type="button" onClick={() => submitShipmentReview(s)} disabled={Boolean(reviewSaving[s.id])}>{reviewSaving[s.id] ? "Saving…" : "Save review changes"}</button>
                      {reviewMessages[s.id] && <p className="shipment-review-message" role="status">{reviewMessages[s.id]}</p>}
                    </div>}
                  </section>

                  <footer className="shipment-footer">

                    <span>LAST UPDATED</span>

                    <time>

                      {formatDateTime(s.updated_at)}

                    </time>

                  </footer>

                </article>

              );

            })}

          </div>

        )}

      </div>

    </main>

  );

}