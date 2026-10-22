import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./History.css";

const API_ROOT = "http://127.0.0.1:8000";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [cargoFilter, setCargoFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [listView, setListView] = useState(false);

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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("waypoint_token");
        localStorage.removeItem("waypoint_user");
        navigate("/");
        return;
      }
      if (!response.ok) {
        throw new Error(data?.detail?.message || data?.message || "Unable to load history.");
      }
      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch (err) {
      console.error("History loading error:", err);
      setError(err.message || "Unable to load search history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // loadHistory is intentionally called once when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteHistory(id) {
    if (!window.confirm("Delete this search?")) return;
    const token = localStorage.getItem("waypoint_token");
    try {
      const response = await fetch(`${API_ROOT}/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail?.message || data?.message || "Unable to delete search.");
      }
      setHistory((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Unable to delete search.");
    }
  }

  function downloadHistory(item) {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `waypoint-route-${item.id ?? "analysis"}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const cargoTypes = useMemo(
    () => [...new Set(history.map((item) => item.cargo_type).filter(Boolean))].sort(),
    [history]
  );

  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const cutoff = timeFilter === "7" ? now - 7 * 86400000
      : timeFilter === "30" ? now - 30 * 86400000 : 0;
    const normalizedQuery = query.trim().toLowerCase();

    return history
      .filter((item) => {
        const searchable = [
          item.origin, item.destination, item.cargo_type,
          item.recommended_route, item.containers,
        ].join(" ").toLowerCase();
        const timestamp = item.searched_at ? new Date(item.searched_at).getTime() : 0;
        return (!normalizedQuery || searchable.includes(normalizedQuery))
          && (timeFilter === "all" || (Number.isFinite(timestamp) && timestamp >= cutoff))
          && (cargoFilter === "all" || item.cargo_type === cargoFilter);
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return new Date(a.searched_at || 0) - new Date(b.searched_at || 0);
        if (sortBy === "origin") return String(a.origin || "").localeCompare(String(b.origin || ""));
        return new Date(b.searched_at || 0) - new Date(a.searched_at || 0);
      });
  }, [history, query, timeFilter, cargoFilter, sortBy]);

  const totalContainers = history.reduce((sum, item) => sum + (Number(item.containers) || 0), 0);
  const transitValues = history.map((item) => Number(item.transit_time_days)).filter((value) => Number.isFinite(value) && value > 0);
  const averageTransit = transitValues.length
    ? (transitValues.reduce((sum, value) => sum + value, 0) / transitValues.length).toFixed(1)
    : "—";
  const uniqueRoutes = new Set(history.map((item) => `${item.origin || ""}→${item.destination || ""}`)).size;

  return (
    <main className={`wp-page wp-history-page wp-history-cinematic${listView ? " wp-history-list-view" : ""}`}>
      <div className="wp-history-scene" aria-hidden="true">
        <img className="wp-history-scene__image" src={new URL("./history-maritime-bg.png", import.meta.url).href} alt="" />
        <div className="wp-history-scene__veil" />
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
        <div className="wp-history-live"><span />ROUTE INTELLIGENCE ARCHIVE</div>
        <p className="wp-eyebrow">Search history</p>
        <h1>Previous route <span className="wp-history-title-accent">analyses</span></h1>
        <p>Review your past route analyses, compare detailed information and return to any route whenever you need to plan, quote or make a decision.</p>
        <div className="wp-history-header-meta">
          <span>ROUTE ANALYSIS</span><span>DECISION HISTORY</span><span>MARITIME INTELLIGENCE</span>
        </div>
      </section>

      {!loading && !error && history.length > 0 && (
        <section className="wp-history-stats" aria-label="History statistics">
          <Stat icon="▤" value={history.length} label="Saved Analyses" />
          <Stat icon="⚓" value={uniqueRoutes} label="Unique Routes" />
          <Stat icon="▥" value={totalContainers.toLocaleString()} label="Total Containers" gold />
          <Stat icon="◷" value={averageTransit === "—" ? averageTransit : `${averageTransit}d`} label="Avg Transit Time" />
          <div className="wp-history-coverage">
            <span className="wp-history-coverage__icon">◎</span>
            <div><small>GLOBAL COVERAGE</small><strong>Maritime Network</strong><span>Route archive connected</span></div>
          </div>
        </section>
      )}

      {loading && (
        <div className="wp-history-state wp-history-loading">
          <span className="wp-spinner" />
          <div><strong>Loading route history</strong><p>Retrieving your saved analyses...</p></div>
        </div>
      )}

      {error && (
        <div className="wp-history-error">
          <div className="wp-history-error__icon">!</div>
          <div><strong>Unable to load history</strong><p>{error}</p></div>
          <button onClick={loadHistory}>Retry</button>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="wp-history-empty">
          <div className="wp-history-empty__icon">⌁</div>
          <span className="wp-history-empty__label">ARCHIVE EMPTY</span>
          <h2>No previous searches</h2>
          <p>Your route analyses will appear here automatically after you plot a route.</p>
          <button className="wp-btn wp-btn--primary" onClick={() => navigate("/")}>Plot your first route</button>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <>
          <div className="wp-history-toolbar">
            <label className="wp-history-search">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search routes, ports, or cargo type..."
                aria-label="Search route history"
              />
            </label>
            <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)} aria-label="Filter by date">
              <option value="all">All Time</option><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option>
            </select>
            <select value={cargoFilter} onChange={(event) => setCargoFilter(event.target.value)} aria-label="Filter by cargo">
              <option value="all">All Cargo Types</option>
              {cargoTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort history">
              <option value="newest">Date (Newest)</option><option value="oldest">Date (Oldest)</option><option value="origin">Origin (A–Z)</option>
            </select>
            <span className="wp-history-toolbar__count">{filteredHistory.length} of {history.length}</span>
            <button className={`wp-history-toolbar__toggle${!listView ? " is-active" : ""}`} onClick={() => setListView(false)} aria-label="Grid view" aria-pressed={!listView}>▦</button>
            <button className={`wp-history-toolbar__toggle${listView ? " is-active" : ""}`} onClick={() => setListView(true)} aria-label="List view" aria-pressed={listView}>☷</button>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="wp-history-page-grid">
              {filteredHistory.map((item, index) => (
                <article key={item.id ?? `${item.origin}-${item.destination}-${index}`} className="wp-history-card" style={{ "--history-index": index }}>
                  <div className="wp-history-card__line" />
                  <div className="wp-history-card__top">
                    <div>
                      <span className="wp-history-card__label">SEARCH {String(index + 1).padStart(2, "0")}</span>
                      <h3>{item.origin || "Unknown"} <span>→</span> {item.destination || "Unknown"}</h3>
                    </div>
                    <span className="wp-history-card__date">
                      {item.searched_at && !Number.isNaN(new Date(item.searched_at).getTime())
                        ? new Date(item.searched_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "Date unavailable"}
                    </span>
                  </div>

                  <div className="wp-history-card__map" aria-label={`Route map preview from ${item.origin || "origin"} to ${item.destination || "destination"}`}>
                    <span className="wp-history-map-node wp-history-map-node--start" />
                    <span className="wp-history-map-node wp-history-map-node--end" />
                    <span className="wp-history-map-label wp-history-map-label--start">{item.origin || "Origin"}</span>
                    <span className="wp-history-map-label wp-history-map-label--end">{item.destination || "Destination"}</span>
                  </div>

                  <div className="wp-history-card__cargo">
                    <span>{item.cargo_type || "Containerized Cargo"}</span><i />
                    <span>{item.containers ?? "—"} TEU</span>
                  </div>

                  <div className="wp-history-card__route">
                    <div><span>Recommended</span><strong><b>★</b> {item.recommended_route || "Route analysis"}</strong></div>
                    <div><span>Transit Time</span><strong>{item.transit_time_days ? `${item.transit_time_days} days` : "—"}</strong></div>
                    <div><span>Distance</span><strong>{item.distance_nm ? `${Number(item.distance_nm).toLocaleString()} NM` : "—"}</strong></div>
                  </div>

                  <div className="wp-history-card__actions">
                    <button className="wp-history-view" onClick={() => navigate(`/history/${item.id}`)}><span>View analysis</span><b>→</b></button>
                    <div className="wp-history-card__action-group">
                      <button className="wp-history-download" onClick={() => downloadHistory(item)} aria-label="Download route details" title="Download route details">⇩</button>
                      <button className="wp-history-delete" onClick={() => deleteHistory(item.id)} aria-label="Delete this search" title="Delete search">♲</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="wp-history-empty wp-history-empty--filtered">
              <div className="wp-history-empty__icon">⌕</div><h2>No matching routes</h2>
              <p>Try changing your search text or filters.</p>
              <button className="wp-history-toolbar__toggle" onClick={() => { setQuery(""); setTimeFilter("all"); setCargoFilter("all"); }}>Clear filters</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function Stat({ icon, value, label, gold = false }) {
  return (
    <div className={`wp-history-stat${gold ? " wp-history-stat--gold" : ""}`}>
      <span className="wp-history-stat__icon">{icon}</span>
      <div><strong>{value}</strong><span>{label}</span></div>
    </div>
  );
}

export default History;
