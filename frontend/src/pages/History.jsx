import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./History.css";

const API_ROOT = "http://127.0.0.1:8000";

function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    const token = localStorage.getItem("waypoint_token");

    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_ROOT}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("waypoint_token");
        localStorage.removeItem("waypoint_user");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail?.message ||
          data?.message ||
          "Unable to load history."
        );
      }

      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load search history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function deleteHistory(id) {
    if (!window.confirm("Delete this search?")) {
      return;
    }

    const token = localStorage.getItem("waypoint_token");

    try {
      const response = await fetch(`${API_ROOT}/api/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to delete search.");
      }

      setHistory((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const totalSearches = history.length;

  return (
    <main className="wp-page wp-history-page wp-history-cinematic">

      <div className="wp-history-scene" aria-hidden="true">
        <div className="wp-history-stars" />
        <div className="wp-history-grid" />
        <div className="wp-history-glow wp-history-glow--one" />
        <div className="wp-history-glow wp-history-glow--two" />

        <div className="wp-history-globe">
          <div className="wp-history-globe-grid" />
          <span className="wp-history-node wp-history-node--one" />
          <span className="wp-history-node wp-history-node--two" />
          <span className="wp-history-node wp-history-node--three" />
          <span className="wp-history-node wp-history-node--four" />
          <i className="wp-history-arc wp-history-arc--one" />
          <i className="wp-history-arc wp-history-arc--two" />
        </div>

        <div className="wp-history-ship">
          <span className="wp-history-ship__body" />
          <span className="wp-history-ship__deck" />
          <span className="wp-history-ship__stack" />
          <span className="wp-history-ship__light" />
        </div>

        <div className="wp-history-wave wp-history-wave--one" />
        <div className="wp-history-wave wp-history-wave--two" />
      </div>

      <section className="wp-page-header wp-history-header">
        <div className="wp-history-live">
          <span />
          ROUTE INTELLIGENCE ARCHIVE
        </div>

        <p className="wp-eyebrow">Search history</p>

        <h1>Previous route analyses</h1>

        <p>
          Review routes you analyzed previously and return to an
          earlier routing decision whenever you need it.
        </p>

        <div className="wp-history-header-meta">
          <span>ROUTE ANALYSIS</span>
          <span>DECISION HISTORY</span>
          <span>MARITIME INTELLIGENCE</span>
        </div>
      </section>

      {loading && (
        <div className="wp-history-state wp-history-loading">
          <span className="wp-spinner" />
          <div>
            <strong>Loading route history</strong>
            <p>Retrieving your saved analyses...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="wp-history-error">
          <div className="wp-history-error__icon">!</div>
          <div>
            <strong>Unable to load history</strong>
            <p>{error}</p>
          </div>
          <button onClick={loadHistory}>Retry</button>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="wp-history-empty">
          <div className="wp-history-empty__icon">⌁</div>
          <span className="wp-history-empty__label">ARCHIVE EMPTY</span>
          <h2>No previous searches</h2>
          <p>
            Your route analyses will appear here automatically after
            you plot a route.
          </p>
          <button
            className="wp-btn wp-btn--primary"
            onClick={() => navigate("/")}
          >
            Plot your first route
          </button>
        </div>
      )}

      {!loading && history.length > 0 && (
        <>
          <section className="wp-history-overview">
            <div>
              <span className="wp-history-overview__label">ARCHIVED SEARCHES</span>
              <strong>{totalSearches}</strong>
              <p>route analyses available</p>
            </div>

            <div className="wp-history-overview__signal">
              <span />
              PERSONAL ROUTING ARCHIVE
            </div>
          </section>

          <div className="wp-history-page-grid">
            {history.map((item, index) => (
              <article
                key={item.id}
                className="wp-history-card"
                style={{ "--history-index": index }}
              >
                <div className="wp-history-card__line" />

                <div className="wp-history-card__top">
                  <div>
                    <span className="wp-history-card__label">
                      SEARCH {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3>
                      {item.origin}
                      <span>→</span>
                      {item.destination}
                    </h3>
                  </div>

                  <span className="wp-history-card__date">
                    {item.searched_at
                      ? new Date(item.searched_at).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>

                <div className="wp-history-card__cargo">
                  <span>{item.cargo_type || "Cargo not specified"}</span>
                  <i />
                  <span>{item.containers ?? "—"} TEU</span>
                </div>

                <div className="wp-history-card__route">
                  <div>
                    <span>Recommended</span>
                    <strong>
                      <b>★</b> {item.recommended_route || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Transit</span>
                    <strong>
                      {item.transit_time_days
                        ? `${item.transit_time_days} days`
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Distance</span>
                    <strong>
                      {item.distance_nm
                        ? `${Number(item.distance_nm).toLocaleString()} NM`
                        : "—"}
                    </strong>
                  </div>
                </div>

                <div className="wp-history-card__actions">
                  <button
                    className="wp-history-view"
                    onClick={() => navigate(`/history/${item.id}`)}
                  >
                    <span>View analysis</span>
                    <b>→</b>
                  </button>

                  <button
                    className="wp-history-delete"
                    onClick={() => deleteHistory(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default History;
