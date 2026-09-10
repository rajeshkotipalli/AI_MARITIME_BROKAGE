import React, { useEffect, useState } from "react";
import "./OperationsDashboard.css";

const API_URL = "http://127.0.0.1:8000";

function OperationsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("waypoint_token");

      if (!token) {
        setError("Please login to view the operations dashboard.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/analytics`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Invalid response received from server. HTTP ${response.status}`
        );
      }

      console.log("Analytics API Response:", data);

      if (!response.ok) {
        let message = "Unable to load dashboard data.";

        if (typeof data?.detail === "string") message = data.detail;
        else if (data?.detail?.message) message = data.detail.message;
        else if (data?.detail?.error) message = data.detail.error;
        else if (data?.message) message = data.message;
        else if (data?.error) message = data.error;
        else if (data?.detail) message = JSON.stringify(data.detail);

        throw new Error(`${message} (HTTP ${response.status})`);
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Analytics service returned an unsuccessful response."
        );
      }

      setAnalytics(data);
    } catch (err) {
      console.error("Dashboard analytics error:", err);
      setError(
        err?.message || "Failed to connect to the analytics service."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <h2>Loading Operations Dashboard</h2>
          <p>Fetching your latest maritime operations data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadAnalytics}>
            ↻ Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h2>No Dashboard Data</h2>
          <p>The analytics service did not return any data.</p>
          <button className="retry-btn" onClick={loadAnalytics}>
            ↻ Try Again
          </button>
        </div>
      </div>
    );
  }

  const summary = analytics.summary || {};
  const routeAnalytics = analytics.route_analytics || {};
  const quotationAnalytics = analytics.quotation_analytics || {};

  const recentSearches = Array.isArray(analytics.recent_searches)
    ? analytics.recent_searches
    : [];

  const recentQuotations = Array.isArray(analytics.recent_quotations)
    ? analytics.recent_quotations
    : [];

  const mostSearchedRoutes = Array.isArray(
    routeAnalytics.most_searched_routes
  )
    ? routeAnalytics.most_searched_routes
    : [];

  const quotationStatus = quotationAnalytics.status || {};

  const pending = Number(
    quotationStatus.Pending || quotationStatus.pending || 0
  );
  const approved = Number(
    quotationStatus.Approved || quotationStatus.approved || 0
  );
  const rejected = Number(
    quotationStatus.Rejected || quotationStatus.rejected || 0
  );

  const totalQuotations = Number(
    summary.total_quotations || quotationAnalytics.total || 0
  );

  const approvalPercentage =
    totalQuotations > 0
      ? Math.round((approved / totalQuotations) * 100)
      : 0;

  const maxSearches = Math.max(
    ...mostSearchedRoutes.map((route) => Number(route.searches || 0)),
    1
  );

  const routeChartData = mostSearchedRoutes.slice(0, 6);

  const quotationTotalForChart =
    pending + approved + rejected;

  const quotationPieStyle =
    quotationTotalForChart > 0
      ? {
          background: `conic-gradient(
            #f4b740 0deg ${(pending / quotationTotalForChart) * 360}deg,
            #35c98a ${(pending / quotationTotalForChart) * 360}deg ${
              ((pending + approved) / quotationTotalForChart) * 360
            }deg,
            #ef6670 ${
              ((pending + approved) / quotationTotalForChart) * 360
            }deg 360deg
          )`,
        }
      : {
          background: "#203b4d",
        };

  return (
    <div className="dashboard-page dashboard-cinematic">
      {/* 3D MARITIME BACKGROUND */}
      <div className="dashboard-scene" aria-hidden="true">
        <div className="dashboard-stars" />
        <div className="dashboard-glow dashboard-glow--one" />
        <div className="dashboard-glow dashboard-glow--two" />
        <div className="dashboard-orbit dashboard-orbit--one" />
        <div className="dashboard-orbit dashboard-orbit--two" />

        <div className="dashboard-globe">
          <div className="dashboard-globe-grid" />
          <span className="dashboard-node dashboard-node--one" />
          <span className="dashboard-node dashboard-node--two" />
          <span className="dashboard-node dashboard-node--three" />
          <span className="dashboard-node dashboard-node--four" />
          <i className="dashboard-arc dashboard-arc--one" />
          <i className="dashboard-arc dashboard-arc--two" />
        </div>

        <div className="dashboard-ship">
          <span className="dashboard-ship__hull" />
          <span className="dashboard-ship__deck" />
          <span className="dashboard-ship__containers" />
          <span className="dashboard-ship__bridge" />
        </div>

        <div className="dashboard-wave dashboard-wave--one" />
        <div className="dashboard-wave dashboard-wave--two" />
      </div>

      {/* HERO */}
      <section className="dashboard-header dashboard-header--cinematic">
        <div className="dashboard-hero-copy">
          <div className="dashboard-live-badge">
            <span />
            LIVE OPERATIONS INTELLIGENCE
          </div>

          <span className="dashboard-eyebrow">
            WAYPOINT • MARITIME OPERATIONS
          </span>

          <h1>Operations Dashboard</h1>

          <p>
            A live command center for route activity, quotations,
            connected ports and operational performance.
          </p>

          <div className="dashboard-hero-tags">
            <span>ROUTE INTELLIGENCE</span>
            <span>QUOTATION MONITOR</span>
            <span>NETWORK ACTIVITY</span>
          </div>
        </div>

        <div className="dashboard-hero-visual" aria-hidden="true">
          <div className="hero-radar">
            <div className="hero-radar__ring hero-radar__ring--one" />
            <div className="hero-radar__ring hero-radar__ring--two" />
            <div className="hero-radar__sweep" />
            <span className="hero-radar__point hero-radar__point--one" />
            <span className="hero-radar__point hero-radar__point--two" />
            <span className="hero-radar__point hero-radar__point--three" />
          </div>
        </div>

        <button className="refresh-dashboard-btn" onClick={loadAnalytics}>
          <span>↻</span>
          Refresh Data
        </button>
      </section>

      {/* KPI ROW */}
      <section className="summary-grid">
        <MetricCard icon="⌕" label="Total Searches" value={summary.total_searches ?? 0} />
        <MetricCard icon="↗" label="Available Routes" value={summary.available_routes ?? 0} />
        <MetricCard icon="★" label="Best Routes" value={summary.best_routes ?? 0} />
        <MetricCard icon="⚓" label="Connected Ports" value={summary.connected_ports ?? 0} />
        <MetricCard icon="▣" label="Quotations" value={totalQuotations} />
        <MetricCard
          icon="◷"
          label="Average Transit"
          value={summary.average_transit_days ?? 0}
          suffix="days"
        />
      </section>

      {/* ANALYTICS VISUALS */}
      <section className="analytics-grid">
        {/* ROUTE DEMAND GRAPH */}
        <div className="dashboard-panel chart-panel route-chart-panel">
          <PanelHeading
            label="ROUTE DEMAND"
            title="Most Searched Routes"
            badge={`${mostSearchedRoutes.length} routes`}
          />

          {routeChartData.length === 0 ? (
            <EmptyState icon="⚓" text="No route searches yet." />
          ) : (
            <div className="bar-chart">
              <div className="bar-chart__y-axis">
                <span>{maxSearches}</span>
                <span>{Math.ceil(maxSearches / 2)}</span>
                <span>0</span>
              </div>

              <div className="bar-chart__plot">
                <div className="bar-chart__gridline bar-chart__gridline--top" />
                <div className="bar-chart__gridline bar-chart__gridline--mid" />
                <div className="bar-chart__gridline bar-chart__gridline--bottom" />

                <div className="bar-chart__bars">
                  {routeChartData.map((item, index) => {
                    const searches = Number(item.searches || 0);
                    const height = Math.max(
                      searches > 0 ? (searches / maxSearches) * 100 : 4,
                      4
                    );

                    return (
                      <div
                        className="bar-chart__item"
                        key={`${item.route}-${index}`}
                        title={`${item.route || "Unknown route"}: ${searches} searches`}
                      >
                        <strong>{searches}</strong>
                        <div className="bar-chart__bar-wrap">
                          <div
                            className={`bar-chart__bar ${
                              index === 0 ? "is-primary" : ""
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span>
                          {item.route || "Unknown route"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QUOTATION PIE */}
        <div className="dashboard-panel chart-panel quotation-chart-panel">
          <PanelHeading
            label="QUOTATION ANALYTICS"
            title="Quotation Status"
            badge={`${totalQuotations} total`}
          />

          <div className="pie-layout">
            <div className="pie-chart-wrap">
              <div className="pie-chart" style={quotationPieStyle}>
                <div className="pie-chart__center">
                  <strong>{totalQuotations}</strong>
                  <span>Requests</span>
                </div>
              </div>
            </div>

            <div className="pie-legend">
              <LegendItem label="Pending" value={pending} className="pending" />
              <LegendItem label="Approved" value={approved} className="approved" />
              <LegendItem label="Rejected" value={rejected} className="rejected" />

              <div className="approval-callout">
                <span>Approval rate</span>
                <strong>{approvalPercentage}%</strong>
              </div>
            </div>
          </div>

          <div className="mini-progress">
            <div className="mini-progress__header">
              <span>Approval progress</span>
              <strong>{approvalPercentage}%</strong>
            </div>
            <div className="mini-progress__track">
              <div
                className="mini-progress__fill"
                style={{ width: `${Math.min(100, approvalPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ROUTE + FREIGHT DETAILS */}
      <section className="dashboard-main-grid">
        <div className="dashboard-panel">
          <PanelHeading
            label="ROUTE RANKING"
            title="Search Performance"
            badge={`${mostSearchedRoutes.length} tracked`}
          />

          {mostSearchedRoutes.length === 0 ? (
            <EmptyState icon="⌕" text="No route searches yet." />
          ) : (
            <div className="route-ranking">
              {mostSearchedRoutes.map((item, index) => {
                const searches = Number(item.searches || 0);
                const percentage = (searches / maxSearches) * 100;

                return (
                  <div className="route-ranking-item" key={`${item.route}-${index}`}>
                    <div className="route-rank">#{index + 1}</div>

                    <div className="route-info">
                      <div className="route-title-row">
                        <strong>{item.route || "Unknown Route"}</strong>
                        <span>{searches} searches</span>
                      </div>

                      <div className="route-progress">
                        <div
                          className="route-progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-panel freight-panel">
          <PanelHeading
            label="FREIGHT INTELLIGENCE"
            title="Commercial Snapshot"
            badge="LIVE"
          />

          <div className="freight-highlight">
            <span>Average Freight Estimate</span>
            <strong>
              ${Number(summary.average_freight_usd || 0).toLocaleString()}
            </strong>
          </div>

          <div className="freight-metrics">
            <div>
              <span>Total quotations</span>
              <strong>{totalQuotations}</strong>
            </div>
            <div>
              <span>Approved</span>
              <strong>{approved}</strong>
            </div>
            <div>
              <span>Pending</span>
              <strong>{pending}</strong>
            </div>
            <div>
              <span>Rejected</span>
              <strong>{rejected}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVITY */}
      <section className="activity-grid">
        <div className="dashboard-panel">
          <PanelHeading label="SEARCH ACTIVITY" title="Recent Searches" />

          {recentSearches.length === 0 ? (
            <EmptyState icon="⌕" text="No recent searches." />
          ) : (
            <div className="activity-list">
              {recentSearches.map((search, index) => {
                const origin = search.origin || search.from || "Unknown";
                const destination =
                  search.destination || search.to || "Unknown";
                const date =
                  search.created_at || search.timestamp || "";

                return (
                  <div className="activity-item" key={search.id || index}>
                    <div className="activity-icon route-icon">↗</div>

                    <div className="activity-content">
                      <strong>
                        {origin}
                        <span className="arrow">→</span>
                        {destination}
                      </strong>

                      <span>
                        {search.recommended_route
                          ? `Best route: ${search.recommended_route}`
                          : "Route analysis completed"}
                      </span>
                    </div>

                    <time>{formatDate(date)}</time>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <PanelHeading label="QUOTATION ACTIVITY" title="Recent Quotations" />

          {recentQuotations.length === 0 ? (
            <EmptyState icon="▣" text="No quotations submitted yet." />
          ) : (
            <div className="activity-list">
              {recentQuotations.map((quotation, index) => (
                <div className="activity-item" key={quotation.id || index}>
                  <div className="activity-icon quotation-icon">$</div>

                  <div className="activity-content">
                    <strong>
                      {quotation.company_name || "Quotation Request"}
                    </strong>

                    <span>
                      {quotation.origin || "Unknown"}
                      <span className="arrow">→</span>
                      {quotation.destination || "Unknown"}
                    </span>
                  </div>

                  <div className="quotation-status">
                    <span
                      className={`status-badge ${getStatusClass(
                        quotation.status
                      )}`}
                    >
                      {quotation.status || "Pending"}
                    </span>

                    <time>{formatDate(quotation.created_at)}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SYSTEM STATUS */}
      <section className="system-status">
        <div className="system-status-left">
          <div className="live-indicator" />
          <div>
            <strong>Waypoint Operations System</strong>
            <span>Backend analytics and route services are active</span>
          </div>
        </div>

        <div className="system-status-right">
          <span>● Route Engine</span>
          <span>● Analytics API</span>
          <span>● Quotation Service</span>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, suffix }) {
  return (
    <div className="summary-card">
      <div className="summary-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>
          {Number(value || 0).toLocaleString()}
          {suffix && <small> {suffix}</small>}
        </strong>
      </div>
    </div>
  );
}

function PanelHeading({ label, title, badge }) {
  return (
    <div className="panel-heading">
      <div>
        <span className="panel-label">{label}</span>
        <h2>{title}</h2>
      </div>
      {badge && <span className="panel-badge">{badge}</span>}
    </div>
  );
}

function LegendItem({ label, value, className }) {
  return (
    <div className="pie-legend__item">
      <div className={`pie-dot ${className}`} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <p>{text}</p>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Recently";

  try {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Recently";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function getStatusClass(status) {
  const value = String(status || "Pending").toLowerCase();

  if (value === "approved") return "status-approved";
  if (value === "rejected") return "status-rejected";

  return "status-pending";
}

export default OperationsDashboard;
