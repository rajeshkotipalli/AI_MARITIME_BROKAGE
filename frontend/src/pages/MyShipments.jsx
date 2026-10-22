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