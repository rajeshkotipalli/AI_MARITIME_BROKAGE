<<<<<<< HEAD
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
=======
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapTracing.css";

/*
  Intelligent Map — User Portal
  --------------------------------
  Route options come from the same Route Agent API used by
  the main user route-analysis workflow.

  The current routes.csv contains these dataset-backed lanes:
  Chennai -> Rotterdam (R001-R003)
  Chennai -> Hamburg   (R004)
  Mumbai  -> Hamburg   (R005-R006)
  Mumbai  -> Rotterdam (R007-R008)
  Singapore -> Rotterdam (R009)
  Singapore -> Hamburg  (R010)

  This page does NOT invent route metrics. Transit time,
  distance, transshipments and route score are read from
  the Route Agent response.
*/

const API_ROOT = "http://127.0.0.1:8000";

const PORTS = {
  Chennai: { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707 },
  Mumbai: { name: "Mumbai", country: "India", lat: 18.9388, lon: 72.8354 },
  Kochi: { name: "Kochi", country: "India", lat: 9.9312, lon: 76.2673 },
  Kolkata: { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639 },
  Singapore: { name: "Singapore", country: "Singapore", lat: 1.2644, lon: 103.8222 },
  Colombo: { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612 },
  Rotterdam: { name: "Rotterdam", country: "Netherlands", lat: 51.9244, lon: 4.4777 },
  Hamburg: { name: "Hamburg", country: "Germany", lat: 53.5511, lon: 9.9937 },
  Antwerp: { name: "Antwerp", country: "Belgium", lat: 51.2194, lon: 4.4025 },
  London: { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  Felixstowe: { name: "Felixstowe", country: "United Kingdom", lat: 51.954, lon: 1.351 },
  Algeciras: { name: "Algeciras", country: "Spain", lat: 36.14, lon: -5.45 },
  Barcelona: { name: "Barcelona", country: "Spain", lat: 41.35, lon: 2.17 },
  Genoa: { name: "Genoa", country: "Italy", lat: 44.4056, lon: 8.9463 },
  Piraeus: { name: "Piraeus", country: "Greece", lat: 37.9475, lon: 23.6373 },
  Suez: { name: "Suez", country: "Egypt", lat: 29.9668, lon: 32.5498 },
  PortSaid: { name: "Port Said", country: "Egypt", lat: 31.2653, lon: 32.3019 },
  Jeddah: { name: "Jeddah", country: "Saudi Arabia", lat: 21.4858, lon: 39.1925 },
  Dubai: { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  JebelAli: { name: "Jebel Ali", country: "United Arab Emirates", lat: 25.0115, lon: 55.0617 },
  Muscat: { name: "Muscat", country: "Oman", lat: 23.588, lon: 58.3829 },
  PortKlang: { name: "Port Klang", country: "Malaysia", lat: 3.0, lon: 101.4 },
  PortLouis: { name: "Port Louis", country: "Mauritius", lat: -20.1609, lon: 57.5012 },
  DarEsSalaam: { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lon: 39.2083 },
  Durban: { name: "Durban", country: "South Africa", lat: -29.8587, lon: 31.0218 },
  CapeTown: { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  NewYork: { name: "New York", country: "United States", lat: 40.68, lon: -74.0 },
  LosAngeles: { name: "Los Angeles", country: "United States", lat: 33.74, lon: -118.27 },
  LongBeach: { name: "Long Beach", country: "United States", lat: 33.75, lon: -118.2 },
  Vancouver: { name: "Vancouver", country: "Canada", lat: 49.29, lon: -123.11 },
  Sydney: { name: "Sydney", country: "Australia", lat: -33.85, lon: 151.2 },
  Melbourne: { name: "Melbourne", country: "Australia", lat: -37.84, lon: 144.94 },
  Shanghai: { name: "Shanghai", country: "China", lat: 31.23, lon: 121.47 },
  Ningbo: { name: "Ningbo", country: "China", lat: 29.87, lon: 121.55 },
  Busan: { name: "Busan", country: "South Korea", lat: 35.1, lon: 129.04 },
  HongKong: { name: "Hong Kong", country: "Hong Kong", lat: 22.32, lon: 114.17 },
};

const FALLBACK_ORIGINS = ["Chennai", "Mumbai", "Singapore"];
const FALLBACK_DESTINATIONS = ["Rotterdam", "Hamburg"];

function normalizePortKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getPort(value) {
  if (!value) return null;
  if (PORTS[value]) return PORTS[value];
  const key = normalizePortKey(value);
  return Object.values(PORTS).find((port) => normalizePortKey(port.name) === key) || null;
}

function MapController({ routePorts }) {
  const map = useMap();

  useEffect(() => {
    const resize = () => map.invalidateSize();
    resize();
    const timer = setTimeout(resize, 250);

    if (routePorts.length >= 2) {
      map.fitBounds(
        routePorts.map((port) => [port.lat, port.lon]),
        { padding: [70, 70], maxZoom: 5 }
      );
    }

    const focusAis = (event) => {
      const vessels = Array.isArray(event.detail) ? event.detail : [];
      const points = vessels
        .map((v) => [Number(v.latitude), Number(v.longitude)])
        .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
      if (points.length) {
        map.fitBounds(points, { padding: [60, 60], maxZoom: 7 });
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("waypoint-focus-ais", focusAis);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("waypoint-focus-ais", focusAis);
    };
  }, [map, routePorts]);

  return null;
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : value;
}

function routeScoreValue(route) {
  const value = route?.route_score ?? route?.score;
  return value === undefined || value === null ? null : Number(value);
}

function normalizeRoutes(data) {
  if (!data || data.status !== "success") return [];

  const routes = Array.isArray(data.available_routes)
    ? data.available_routes
    : [];

  return routes.map((route, index) => ({
    ...route,
    rank: route.rank ?? index + 1,
    route_score: route.route_score ?? route.score,
    transit_days: route.transit_days ?? route.transit_time_days,
    is_best:
      route.is_best === true ||
      route.route_id === data.recommended_route,
  }));
}

function navigationStatusLabel(status) {
  const labels = {
    0: "Under way using engine",
    1: "At anchor",
    2: "Not under command",
    3: "Restricted manoeuvrability",
    4: "Constrained by draught",
    5: "Moored",
    6: "Aground",
    7: "Engaged in fishing",
    8: "Under way sailing",
    9: "Reserved",
    10: "Reserved",
    11: "Towing",
    12: "Pushing / towing",
    13: "Reserved",
    14: "AIS-SART active",
    15: "Not defined",
  };

  return labels[Number(status)] || "Unknown";
}

function vesselAgeLabel(ageSeconds) {
  const age = Number(ageSeconds);
  if (!Number.isFinite(age)) return "—";
  if (age < 60) return `${Math.round(age)}s ago`;
  if (age < 3600) return `${Math.round(age / 60)}m ago`;
  return `${Math.round(age / 3600)}h ago`;
}

function MapTracing() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("Chennai");
  const [destination, setDestination] = useState("Rotterdam");
  const [origins, setOrigins] = useState(FALLBACK_ORIGINS);
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);
  const [datasetRouteCount, setDatasetRouteCount] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  const [routeData, setRouteData] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [routeAnimation, setRouteAnimation] = useState(true);

  // Live AISstream vessel intelligence. The AIS API key remains backend-only.
  const [liveVessels, setLiveVessels] = useState([]);
  const [aisConnected, setAisConnected] = useState(false);
  const [aisLoading, setAisLoading] = useState(true);
  const [aisLastMessageTime, setAisLastMessageTime] = useState(null);
  const [aisError, setAisError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadLiveVessels = async () => {
      try {
        const [vesselResponse, statusResponse] = await Promise.all([
          fetch(`${API_ROOT}/api/vessels/live`),
          fetch(`${API_ROOT}/api/vessels/status`),
        ]);

        if (!vesselResponse.ok) {
          throw new Error("Live AIS vessel endpoint is unavailable.");
        }

        const vesselData = await vesselResponse.json();
        const statusData = statusResponse.ok
          ? await statusResponse.json()
          : null;

        if (cancelled) return;

        setLiveVessels(
          Array.isArray(vesselData?.vessels) ? vesselData.vessels : []
        );
        setAisConnected(statusData?.connected === true);
        setAisLastMessageTime(statusData?.last_message_time ?? null);
        setAisError("");
      } catch (aisFetchError) {
        if (cancelled) return;
        console.warn("AIS live vessel data unavailable:", aisFetchError);
        setAisConnected(false);
        setAisError(aisFetchError.message || "AIS data unavailable");
      } finally {
        if (!cancelled) setAisLoading(false);
      }
    };

    loadLiveVessels();
    const interval = setInterval(loadLiveVessels, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const loadRouteCatalog = async () => {
      try {
        const token = localStorage.getItem("waypoint_token");

        const response = await fetch(
          `${API_ROOT}/api/routes/catalog`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data?.status === "success") {
          const nextOrigins = Array.isArray(data.origins)
            ? data.origins
            : [];
          const nextDestinations = Array.isArray(data.destinations)
            ? data.destinations
            : [];

          if (nextOrigins.length) {
            setOrigins(nextOrigins);

            if (!nextOrigins.includes(origin)) {
              setOrigin(nextOrigins[0]);
            }
          }

          if (nextDestinations.length) {
            setDestinations(nextDestinations);

            if (!nextDestinations.includes(destination)) {
              setDestination(nextDestinations[0]);
            }
          }

          if (data.total_routes !== undefined) {
            setDatasetRouteCount(data.total_routes);
          }
        }
      } catch (catalogError) {
        console.warn(
          "Route catalog unavailable; using local port list.",
          catalogError
        );
      }
    };

    loadRouteCatalog();
  }, []);

  const selectedRoute = useMemo(() => {
    if (!routeOptions.length) return null;

    if (selectedRouteId) {
      return (
        routeOptions.find(
          (route) => String(route.route_id) === String(selectedRouteId)
        ) || routeOptions[0]
      );
    }

    return routeOptions.find((route) => route.is_best) || routeOptions[0];
  }, [routeOptions, selectedRouteId]);

  const routePorts = useMemo(() => {
    const names = selectedRoute?.route_path || [origin, destination];
    return names.map(getPort).filter(Boolean);
  }, [selectedRoute, origin, destination]);

  const polyline = routePorts.map((port) => [port.lat, port.lon]);

  const displayDistance =
    selectedRoute?.distance_nm ?? routeData?.distance_nm ?? null;

  const displayTransit =
    selectedRoute?.transit_days ??
    routeData?.transit_time_days ??
    routeData?.transit_days ??
    null;

  const displayScore = routeScoreValue(
    selectedRoute || routeData || {}
  );

  const selectedRouteType =
    selectedRoute?.route_type ||
    routeData?.route_type ||
    "—";

  const plotRoute = async () => {
    setLoading(true);
    setError("");
    setRouteData(null);
    setRouteOptions([]);
    setSelectedRouteId(null);

    try {
      const token = localStorage.getItem("waypoint_token");

      const response = await fetch(`${API_ROOT}/api/routes/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          origin,
          destination,
          cargo_type: "General Cargo",
          containers: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail?.message ||
            data?.detail ||
            data?.message ||
            "Unable to analyze the selected route."
        );
      }

      if (data.status === "not_found") {
        setError(data.message || "No route exists for this lane.");
        return;
      }

      const routes = normalizeRoutes(data);

      setRouteData(data);
      setRouteOptions(routes);

      if (routes.length) {
        const best =
          routes.find((route) => route.is_best) || routes[0];
        setSelectedRouteId(best.route_id);
        setActiveTab("overview");
      } else {
        setError("The Route Agent returned no route options.");
      }
    } catch (err) {
      console.error("Intelligent Map route error:", err);
      setError(
        err.message ||
          "Route analysis is unavailable. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectRoute = (route) => {
    setSelectedRouteId(route.route_id);
    setActiveTab("overview");
  };

  const openWeather = (portName) => {
    navigate(`/weather?location=${encodeURIComponent(portName)}`);
  };

  const focusLiveVessels = () => {
    if (!liveVessels.length) return;
    window.dispatchEvent(
      new CustomEvent("waypoint-focus-ais", { detail: liveVessels })
    );
  };

  const reset = () => {
    setOrigin(origins.includes("Chennai") ? "Chennai" : origins[0] || "Chennai");
    setDestination(
      destinations.includes("Rotterdam")
        ? "Rotterdam"
        : destinations[0] || "Rotterdam"
    );
    setSelectedRouteId(null);
    setRouteData(null);
    setRouteOptions([]);
    setError("");
    setActiveTab("overview");
  };

  return (
    <div className="intelligent-map-page">
      <div className="map-atmosphere map-atmosphere-one" />
      <div className="map-atmosphere map-atmosphere-two" />

      <header className="intelligent-map-hero">
        <div className="hero-copy">
          <span className="intelligent-map-eyebrow">
            WAYPOINT AI · INTELLIGENT MAP
          </span>
          <h1>
            Maritime Route <span>Intelligence</span>
          </h1>
          <p>
            Explore every dataset-backed route, compare transit and score,
            and inspect the selected corridor.
          </p>
        </div>

        <div className="hero-ship-art" aria-hidden="true">
          <div className="hero-ship-glow" />
          <div className="hero-ship">▰▰▰</div>
          <div className="hero-slogan">
            Smarter Routes
            <br />
            <b>Greener Oceans</b>
            <br />
            Brighter Trade
          </div>
        </div>

        <div className="map-system-status">
          <span className="map-status-dot" />
          ROUTE INTELLIGENCE ONLINE
        </div>

        <div className={`map-system-status ais-system-status ${aisConnected ? "ais-online" : "ais-offline"}`}>
          <span className="map-status-dot" />
          {aisLoading
            ? "AIS CONNECTING..."
            : aisConnected
            ? `AIS LIVE · ${liveVessels.length} VESSELS`
            : "AIS OFFLINE"}
        </div>
      </header>

      <section className="route-control-card glass-card">
        <div className="route-control-title">
          <span>◈</span> ROUTE CONFIGURATION
          <small>Dataset-backed selection</small>
        </div>

        <div className="route-input-grid">
          <div className="port-select-group">
            <label>ORIGIN PORT</label>
            <select
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            >
              {origins.map((port) => {
                const info = getPort(port);
                return (
                  <option key={port} value={port}>
                    {info?.name || port}, {info?.country || "Maritime Port"}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="route-arrow">→</div>

          <div className="port-select-group">
            <label>DESTINATION PORT</label>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            >
              {destinations.map((port) => {
                const info = getPort(port);
                return (
                  <option key={port} value={port}>
                    {info?.name || port}, {info?.country || "Maritime Port"}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="button"
            className="plot-route-button"
            onClick={plotRoute}
            disabled={loading}
          >
            <span>➤</span>
            {loading ? "ANALYZING..." : "ANALYZE ROUTES"}
          </button>
        </div>

        <div className="control-note">
          Waypoint AI evaluates every matching route from the Route Agent dataset.
          {datasetRouteCount !== null
            ? ` ${datasetRouteCount} total route records are currently loaded.`
            : ""}
          No route metrics are hard-coded in this page.
          <br />
          <span>
            Live AIS data is supplied by the backend and refreshed every 10 seconds.
            Vessel positions are currently streamed from the configured AISstream coverage area.
          </span>
        </div>
      </section>

      {error && <div className="map-error glass-card">⚠ {error}</div>}

      <main className="intelligent-map-content">
        <section className="intelligent-map-panel glass-card">
          <div className="map-panel-header">
            <div>
              <span>AUTOMATIC ROUTE VISUALIZATION</span>
              <small>
                {routeOptions.length
                  ? `${routeOptions.length} route option${
                      routeOptions.length === 1 ? "" : "s"
                    } evaluated`
                  : "Select a lane to load route intelligence"}
              </small>
            </div>

            <div className="map-panel-tools">
              <div className="distance-badge">
                {displayDistance !== null
                  ? `${formatNumber(displayDistance)} NM`
                  : "— NM"}
              </div>
            </div>
          </div>

          <div className="intelligent-map-wrapper">
            <div className="map-scanline" />
            <div className="map-grid-overlay" />
            <div className="map-ocean-glow" />

            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={3}
              scrollWheelZoom
              className="intelligent-leaflet-map"
            >
              <MapController routePorts={routePorts} />

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Live AISstream vessel positions */}
              {liveVessels.map((vessel) => {
                const lat = Number(vessel.latitude);
                const lon = Number(vessel.longitude);
                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

                const speed = Number(vessel.speed_knots);
                const course = Number(vessel.course);
                const rotation = Number.isFinite(course) ? course : 0;

                const icon = divIcon({
                  className: "ais-ship-icon-wrapper",
                  html: `<div class="ais-ship-icon" style="transform:rotate(${rotation}deg)">➤</div>`,
                  iconSize: [22, 22],
                  iconAnchor: [11, 11],
                });

                return (
                  <Marker key={`ais-${vessel.mmsi}`} position={[lat, lon]} icon={icon}>
                    <Tooltip direction="top" offset={[0, -10]} className="ais-vessel-tooltip">
                      <div className="ais-tooltip-content">
                        <strong>🚢 {vessel.name || "Unknown Vessel"}</strong>
                        <span>MMSI: {vessel.mmsi || "—"}</span>
                        <span>Speed: {Number.isFinite(speed) ? `${formatNumber(speed, 1)} kn` : "—"}</span>
                        <span>Course: {Number.isFinite(course) ? `${formatNumber(course, 1)}°` : "—"}</span>
                        <span>Status: {navigationStatusLabel(vessel.navigation_status)}</span>
                        <span>Update: {vesselAgeLabel(vessel.age_seconds)}</span>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })}

              {polyline.length >= 2 && (
                <>
                  <Polyline
                    positions={polyline}
                    pathOptions={{
                      weight: 13,
                      opacity: 0.16,
                      className: "route-glow",
                    }}
                  />
                  <Polyline
                    positions={polyline}
                    pathOptions={{
                      weight: 4,
                      opacity: 0.98,
                      className: routeAnimation
                        ? "route-line route-line-animated"
                        : "route-line",
                    }}
                  />
                </>
              )}

              {routePorts.map((port, index) => {
                const isOrigin = index === 0;
                const isDestination = index === routePorts.length - 1;

                return (
                  <CircleMarker
                    key={`${port.name}-${index}`}
                    center={[port.lat, port.lon]}
                    radius={isOrigin || isDestination ? 9 : 7}
                    pathOptions={{
                      weight: 3,
                      fillOpacity: 1,
                      className: isOrigin
                        ? "port-origin"
                        : isDestination
                        ? "port-destination"
                        : "port-via",
                    }}
                  >
                    <Tooltip
                      permanent
                      direction="top"
                      offset={[0, -10]}
                      className="port-tooltip"
                    >
                      <strong>{port.name}</strong>
                      <br />
                      <span>
                        {isOrigin
                          ? "Departure"
                          : isDestination
                          ? "Arrival"
                          : "Connected Port"}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            <div className="map-compass">
              <span>N</span>
              <b>✦</b>
              <span>S</span>
              <i>W</i>
              <em>E</em>
            </div>

            <div className="map-controls-float">
              <button type="button">+</button>
              <button type="button">−</button>
              <button type="button" onClick={focusLiveVessels} disabled={!liveVessels.length} title="Show live AIS vessels">
                🚢
              </button>
              <button
                type="button"
                onClick={() => setRouteAnimation((value) => !value)}
              >
                {routeAnimation ? "Ⅱ" : "▶"}
              </button>
            </div>

            <div className="map-route-status">
              <span className="status-pulse" />
              <div>
                <strong>
                  {selectedRoute
                    ? `RANK #${selectedRoute.rank} · ${selectedRoute.route_id}`
                    : "ROUTE ENGINE READY"}
                </strong>
                <small>
                  {selectedRoute
                    ? selectedRoute.route_display
                    : "Choose a route to inspect its metrics"}
                </small>
              </div>
            </div>

            <div className="map-overlay-badge">
              {routeOptions.length
                ? `${routeOptions.length} OPTIONS`
                : "DATA INTELLIGENCE"}
            </div>

            <div className="ais-map-badge">
              <span className="ais-live-dot" />
              AIS LIVE · {liveVessels.length} VESSELS
              <button type="button" onClick={focusLiveVessels}>VIEW AIS</button>
            </div>

            <div className="ais-live-badge">
              <span className={aisConnected ? "ais-live-dot" : "ais-live-dot offline"} />
              <div>
                <strong>
                  {aisConnected ? "LIVE AIS" : "AIS UNAVAILABLE"}
                </strong>
                <small>
                  {liveVessels.length} vessel{liveVessels.length === 1 ? "" : "s"} tracked
                  {aisLastMessageTime
                    ? ` · stream ${vesselAgeLabel(Date.now() / 1000 - Number(aisLastMessageTime))}`
                    : ""}
                </small>
              </div>
            </div>
          </div>

          <div className="map-feature-strip">
            <div>
              <span>⚓</span>
              <strong>Route Dataset</strong>
              <small>All matching records evaluated</small>
            </div>
            <div>
              <span>◷</span>
              <strong>Transit Intelligence</strong>
              <small>Dataset-backed travel time</small>
            </div>
            <div>
              <span>◎</span>
              <strong>Route Scoring</strong>
              <small>Weighted Route Agent score</small>
            </div>
            <div>
              <span>☁</span>
              <strong>Weather</strong>
              <small>Open weather for route ports</small>
            </div>
            <div>
              <span>🚢</span>
              <strong>Live AIS</strong>
              <small>
                {aisConnected
                  ? `${liveVessels.length} vessels · 10s refresh`
                  : aisError || "Waiting for AISstream"}
              </small>
            </div>
          </div>
        </section>

        <aside className="route-information">
          <div className="information-card glass-card">
            <div className="side-card-heading">
              <span>ROUTE INTELLIGENCE</span>
              <b>{routeOptions.length || 0} OPTIONS</b>
            </div>

            <div className="intelligence-tabs">
              {[
                ["overview", "Overview"],
                ["routes", "All Routes"],
                ["sequence", "Sequence"],
                ["weather", "Weather"],
              ].map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className={activeTab === id ? "active" : ""}
                  onClick={() => setActiveTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="tab-panel">
                <div className="recommended-card">
                  <div>
                    <span>RECOMMENDED ROUTE</span>
                    <strong>
                      {selectedRoute?.route_id || "—"}
                    </strong>
                    <small>
                      {selectedRoute?.route_display || "Run route analysis"}
                    </small>
                  </div>
                  <div className="recommended-rank">
                    #{selectedRoute?.rank || "—"}
                  </div>
                </div>

                <div className="metric-grid">
                  <div>
                    <span>TRANSIT</span>
                    <strong>
                      {displayTransit !== null
                        ? formatNumber(displayTransit)
                        : "—"}
                    </strong>
                    <small>DAYS</small>
                  </div>

                  <div>
                    <span>ROUTE SCORE</span>
                    <strong>
                      {displayScore !== null
                        ? formatNumber(displayScore, 2)
                        : "—"}
                    </strong>
                    <small>WEIGHTED</small>
                  </div>

                  <div>
                    <span>DISTANCE</span>
                    <strong>
                      {displayDistance !== null
                        ? formatNumber(displayDistance)
                        : "—"}
                    </strong>
                    <small>NAUTICAL MILES</small>
                  </div>

                  <div>
                    <span>TRANSSHIPMENTS</span>
                    <strong>
                      {selectedRoute?.transshipments ?? "—"}
                    </strong>
                    <small>COUNT</small>
                  </div>
                </div>

                <div className="score-breakdown">
                  <div className="score-heading">
                    <span>SCORE SIGNAL</span>
                    <b>40 / 25 / 35</b>
                  </div>
                  <div className="score-bar">
                    <span style={{ width: "40%" }} />
                  </div>
                  <div className="score-labels">
                    <span>Transit 40%</span>
                    <span>Distance 25%</span>
                    <span>Transshipment 35%</span>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-icon">✦</div>
                  <div>
                    <span>WAYPOINT INSIGHT</span>
                    <p>
                      The Route Agent compares the available records for the
                      selected lane and ranks them using transit time,
                      distance and transshipments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "routes" && (
              <div className="tab-panel all-routes-panel">
                <div className="routes-tab-intro">
                  <span>ALL AVAILABLE ROUTES</span>
                  <p>
                    Every candidate returned by the Route Agent is shown
                    below. Click any card to inspect it on the map.
                  </p>
                </div>

                {routeOptions.length === 0 ? (
                  <div className="empty-route-state">
                    <span>01</span>
                    Select a lane and click Analyze Routes.
                  </div>
                ) : (
                  <div className="route-option-list">
                    {routeOptions.map((route) => {
                      const score = routeScoreValue(route);
                      const isSelected =
                        String(route.route_id) ===
                        String(selectedRoute?.route_id);

                      return (
                        <button
                          type="button"
                          key={route.route_id}
                          className={`route-option ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => selectRoute(route)}
                        >
                          <div className="route-option-rank">
                            <span>#{route.rank}</span>
                            {route.is_best && <b>BEST</b>}
                          </div>

                          <div className="route-option-main">
                            <strong>{route.route_id}</strong>
                            <span>{route.route_display}</span>
                          </div>

                          <div className="route-option-metrics">
                            <div>
                              <small>TRANSIT</small>
                              <strong>{route.transit_days}d</strong>
                            </div>
                            <div>
                              <small>DISTANCE</small>
                              <strong>
                                {formatNumber(route.distance_nm)}
                              </strong>
                            </div>
                            <div>
                              <small>SCORE</small>
                              <strong>
                                {score !== null
                                  ? formatNumber(score, 2)
                                  : "—"}
                              </strong>
                            </div>
                          </div>

                          <div className="route-option-footer">
                            <span>
                              {route.route_type || "Route"}
                            </span>
                            <span>
                              {route.transshipments} transshipment
                              {route.transshipments === 1 ? "" : "s"}
                            </span>
                            <b>→</b>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "sequence" && (
              <div className="tab-panel">
                <div className="routes-tab-intro">
                  <span>SELECTED ROUTE SEQUENCE</span>
                  <p>
                    Port sequence for the route currently displayed on the
                    map.
                  </p>
                </div>

                <div className="route-sequence">
                  {routePorts.map((port, index) => (
                    <React.Fragment key={`${port.name}-${index}`}>
                      <div className="route-port">
                        <div className="route-port-marker">
                          {index + 1}
                        </div>
                        <div>
                          <strong>{port.name}</strong>
                          <span>{port.country}</span>
                        </div>
                        <small>
                          {index === 0
                            ? "Departure"
                            : index === routePorts.length - 1
                            ? "Arrival"
                            : "Via"}
                        </small>
                      </div>

                      {index < routePorts.length - 1 && (
                        <div className="route-sequence-line" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "weather" && (
              <div className="tab-panel">
                <div className="routes-tab-intro">
                  <span>WEATHER INTELLIGENCE</span>
                  <p>
                    Open the existing Weather dashboard for any port in the
                    selected route.
                  </p>
                </div>

                <div className="weather-port-list">
                  {routePorts.map((port) => (
                    <button
                      type="button"
                      className="weather-port-button"
                      key={port.name}
                      onClick={() => openWeather(port.name)}
                    >
                      <span>
                        <strong>{port.name}</strong>
                        <small>{port.country} · Open Weather →</small>
                      </span>
                      <span className="weather-port-icon">☁</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="button" className="reset-button" onClick={reset}>
            <span>↺</span> Reset route intelligence
          </button>
        </aside>
      </main>

      <div className="map-bottom-quote">
        <span>“</span>
        <p>
          Connecting Horizons,
          <br />
          <b>Empowering Global Trade.</b>
        </p>
        <span>”</span>
      </div>
    </div>
  );
}

export default MapTracing;
>>>>>>> origin/master
