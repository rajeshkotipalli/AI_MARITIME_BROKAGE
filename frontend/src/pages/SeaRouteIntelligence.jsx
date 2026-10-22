import { useEffect, useMemo, useState } from "react";

import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import "./SeaRouteIntelligence.css";

const API = "http://127.0.0.1:8000";

const PORTS = {

  Chennai: [13.0827, 80.2707], Mumbai: [18.9388, 72.8354], Kochi: [9.9312, 76.2673], Kolkata: [22.5726, 88.3639], Singapore: [1.2644, 103.8222],

  Rotterdam: [51.9244, 4.4777], Hamburg: [53.5511, 9.9937], Antwerp: [51.2194, 4.4025],

  Colombo: [6.9271, 79.8612], Suez: [29.9668, 32.5498], "Port Said": [31.2653, 32.3019],

  Jeddah: [21.4858, 39.1925], Dubai: [25.2048, 55.2708], "Port Klang": [3, 101.4],

  Algeciras: [36.14, -5.45], Barcelona: [41.35, 2.17], Genoa: [44.4056, 8.9463],

  London: [51.5074, -0.1278], Felixstowe: [51.954, 1.351], Sydney: [-33.85, 151.2],

  Shanghai: [31.23, 121.47], Ningbo: [29.87, 121.55], Busan: [35.1, 129.04], HongKong: [22.32, 114.17],

  "Cape Town": [-33.9249, 18.4241], Durban: [-29.8587, 31.0218], "Dar es Salaam": [-6.7924, 39.2083],

  "New York": [40.68, -74], "Los Angeles": [33.74, -118.27], "Long Beach": [33.75, -118.2], Vancouver: [49.29, -123.11],

  Melbourne: [-37.84, 144.94],

};

const key = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function point(name) { return PORTS[name] || PORTS[Object.keys(PORTS).find((p) => key(p) === key(name))]; }

function FitRoute({ positions }) {

  const map = useMap();

  useEffect(() => { if (positions.length > 1) map.fitBounds(positions, { padding: [35, 35], maxZoom: 5 }); }, [map, positions]);

  return null;

}

function Panel({ title, children, status }) { return <section className="sri-panel"><div className="sri-panel-head"><h3>{title}</h3>{status && <span>{status}</span>}</div>{children}</section>; }

export default function SeaRouteIntelligence({ route, origin, destination }) {

  // A selected multi-leg route may contain IDs such as "R0177 → R0068".

  // Keep individual IDs for API requests and the combined value for display.

  const routeIds = useMemo(() => {

    const rawId = route?.route_id ?? route?.routeId ?? "";

    const values = Array.isArray(rawId) ? rawId : String(rawId).split(/\s*(?:→|->|,)\s*/);

    return [...new Set(values.map((id) => String(id).trim()).filter(Boolean))];

  }, [route?.route_id, route?.routeId]);

  const routeId = routeIds.join(" → ");

  const routeOrigin = route?.origin || origin;

  const routeDestination = route?.destination || destination;

  const stops = useMemo(

    () => Array.isArray(route?.route_path) && route.route_path.length >= 2

      ? route.route_path

      : [routeOrigin, routeDestination],

    [route?.route_path, routeOrigin, routeDestination]

  );

  const [positions, setPositions] = useState([]);

  const [routeLoading, setRouteLoading] = useState(false);

  const [routeError, setRouteError] = useState("");
  const [aisVessels, setAisVessels] = useState([]);
  const [aisStatus, setAisStatus] = useState(null);
  const [aisError, setAisError] = useState("");
  const [aisLoading, setAisLoading] = useState(false);
  const [aisUpdatedAt, setAisUpdatedAt] = useState(null);
  const [aisSearch, setAisSearch] = useState("");


  useEffect(() => {

    let cancelled = false;

    async function loadMaritimeRoute() {

      setPositions([]);

      setRouteError("");

      const ports = stops.map((name) => ({ name, coordinates: point(name) }));

      if (ports.length < 2 || ports.some((port) => !port.coordinates)) {

        setRouteError("Coordinates are unavailable for one or more route ports.");

        setRouteLoading(false);

        return;

      }

      setRouteLoading(true);

      try {

        const combined = [];

        for (let i = 0; i < ports.length - 1; i += 1) {

          const [originLat, originLon] = ports[i].coordinates;

          const [destinationLat, destinationLon] = ports[i + 1].coordinates;

          const params = new URLSearchParams({

            origin_lon: String(originLon), origin_lat: String(originLat),

            destination_lon: String(destinationLon), destination_lat: String(destinationLat),

          });

          const response = await fetch(`${API}/api/maritime-route?${params}`);

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {

            const detail = data?.detail?.message || data?.detail || "Maritime routing service failed.";

            throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));

          }

          if (!Array.isArray(data.coordinates) || data.coordinates.length < 2) {

            throw new Error("The routing service returned no usable sea-route geometry.");

          }

          const leg = data.coordinates.map(([lonValue, latValue]) => {

            const lon = Number(lonValue);

            const lat = Number(latValue);

            if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {

              throw new Error("The routing service returned invalid coordinates.");

            }

            return [lat, lon];

          });

          combined.push(...(combined.length ? leg.slice(1) : leg));

        }

        if (!cancelled) {

          setPositions(combined);

          if (combined.length < 2) setRouteError("No usable maritime route was returned.");

        }

      } catch (error) {

        if (!cancelled) {

          setPositions([]);

          setRouteError(error.message || "Unable to calculate maritime route.");

        }

      } finally {

        if (!cancelled) setRouteLoading(false);

      }

    }

    loadMaritimeRoute();

    return () => { cancelled = true; };

  }, [stops]);

  useEffect(() => {
    let active = true;
    let timer;

    const loadAIS = async () => {
      setAisLoading(true);
      try {
        const [statusResponse, vesselsResponse] = await Promise.all([
          fetch(`${API}/api/vessels/status`),
          fetch(`${API}/api/vessels/live`),
        ]);
        const statusData = await statusResponse.json().catch(() => ({}));
        const vesselsData = await vesselsResponse.json().catch(() => ({}));
        if (!statusResponse.ok) throw new Error(statusData?.detail || "AIS status unavailable.");
        if (!vesselsResponse.ok) throw new Error(vesselsData?.detail || "Live vessel feed unavailable.");
        if (!active) return;
        const records = Array.isArray(vesselsData) ? vesselsData : (vesselsData.vessels || vesselsData.data || []);
        setAisVessels(records.filter((v) =>
          Number.isFinite(Number(v.latitude)) && Number.isFinite(Number(v.longitude))
          && Number(v.latitude) >= -90 && Number(v.latitude) <= 90
          && Number(v.longitude) >= -180 && Number(v.longitude) <= 180
        ));
        setAisStatus(statusData);
        setAisError("");
        setAisUpdatedAt(new Date());
      } catch (error) {
        if (active) setAisError(error.message || "Unable to load live AIS data.");
      } finally {
        if (active) setAisLoading(false);
      }
    };

    loadAIS();
    timer = window.setInterval(loadAIS, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const filteredAisVessels = useMemo(() => {
    const term = aisSearch.trim().toLowerCase();
    if (!term) return aisVessels;
    return aisVessels.filter((v) =>
      String(v.name || "").toLowerCase().includes(term)
      || String(v.mmsi || "").includes(term)
    );
  }, [aisVessels, aisSearch]);

  const [weather, setWeather] = useState(null);

  const [customs, setCustoms] = useState(null);

  const [cargoType, setCargoType] = useState("General Cargo");

  const [containers, setContainers] = useState(1);

  const [weatherError, setWeatherError] = useState("");

  const [customsError, setCustomsError] = useState("");

  const [weatherLoading, setWeatherLoading] = useState(false);

  const [customsLoading, setCustomsLoading] = useState(false);

  useEffect(() => {

    let active = true;

    if (!routeIds.length) {

      setWeather(null);

      setWeatherError("Select a route to view its weather profile.");

      setWeatherLoading(false);

      return () => { active = false; };

    }

    setWeatherLoading(true);

    setWeatherError("");

    async function loadRouteWeather() {

      try {

        // The weather API accepts one route ID per request, not a combined ID.

        const results = await Promise.all(

          routeIds.map(async (id) => {

            const response = await fetch(

              `${API}/api/weather/route/${encodeURIComponent(id)}`

            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {

              const detail = data?.detail?.message || data?.detail || data?.message;

              throw new Error(

                `${id}: ${typeof detail === "string" ? detail : "Weather profile unavailable."}`

              );

            }

            return { route_id: id, ...data };

          })

        );

        if (!active) return;

        const first = results[0];

        const weatherProfiles = results.map((item) => item.weather || {});

        const combinedWeather = { ...(first.weather || {}) };

        if (results.length > 1) {

          for (const key of ["wind_speed_knots", "wave_height_m", "visibility_km", "storm_probability"]) {

            const values = weatherProfiles

              .map((profile) => Number(profile[key]))

              .filter((value) => Number.isFinite(value));

            if (values.length) {

              combinedWeather[key] = Math.round(

                values.reduce((sum, value) => sum + value, 0) / values.length * 10

              ) / 10;

            }

          }

          const regions = [...new Set(weatherProfiles.map((profile) => profile.region).filter(Boolean))];

          combinedWeather.region = regions.length

            ? `Combined profile (${results.length} route legs): ${regions.join(", ")}`

            : `Combined profile (${results.length} route legs)`;

          const conditions = [...new Set(weatherProfiles.map((profile) => profile.weather_condition).filter(Boolean))];

          if (conditions.length) combinedWeather.weather_condition = conditions.join(" / ");

        }

        const riskRank = { low: 1, moderate: 2, medium: 2, high: 3, severe: 4, extreme: 5 };

        const risks = results.map((item) => item.risk || {});

        const highestRisk = risks.reduce((highest, current) => {

          const rank = (value) => riskRank[String(value.risk_level || "").toLowerCase()] || 0;

          return rank(current) > rank(highest) ? current : highest;

        }, risks[0] || {});

        setWeather({

          ...first,

          weather: combinedWeather,

          risk: highestRisk,

          route_legs: results.map((item) => ({

            route_id: item.route_id,

            weather: item.weather || {},

            risk: item.risk || {},

          })),

        });

      } catch (error) {

        if (active) {

          setWeather(null);

          setWeatherError(error.message || "Weather profile unavailable.");

        }

      } finally {

        if (active) setWeatherLoading(false);

      }

    }

    loadRouteWeather();

    return () => { active = false; };

  }, [routeIds]);useEffect(() => {

    let active = true;

    if (!routeOrigin || !routeDestination) return () => { active = false; };

    setCustomsLoading(true); setCustomsError("");

    const params = new URLSearchParams({ origin: routeOrigin, destination: routeDestination, cargo_type: cargoType, containers: String(containers) });

    fetch(`${API}/api/customs/analyze?${params}`)

      .then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data?.detail?.message || data?.message || "Customs profile unavailable."); return data; })

      .then((data) => { if (active) setCustoms(data); })

      .catch((e) => { if (active) { setCustoms(null); setCustomsError(e.message); } })

      .finally(() => { if (active) setCustomsLoading(false); });

    return () => { active = false; };

  }, [routeOrigin, routeDestination, cargoType, containers]);

  const w = weather?.weather || {};

  const wr = weather?.risk || {};

  const c = customs?.customs || {};

  const cr = customs?.risk || {};

  return <div className="sri-wrap">

    <div className="sri-heading"><div><span className="sri-eyebrow">SELECTED SHIPPING LANE</span><h2>Route, weather &amp; customs intelligence</h2><p>{routeOrigin || "Origin"} → {routeDestination || "Destination"}{routeId ? ` · Route ID: ${routeId}` : ""}</p></div><span className="sri-best"><i /> Selected route</span></div>

    <div className="sri-map-shell">

      {routeLoading ? (

        <div className="sri-map-empty">Calculating maritime route…</div>

      ) : routeError ? (

        <div className="sri-map-empty" role="alert">

          <strong>Sea route unavailable</strong>

          <p>{routeError}</p>

          <p>No straight-line fallback is displayed because it could cross land.</p>

        </div>

      ) : positions.length > 1 ? (

        <MapContainer key={`${routeOrigin}-${routeDestination}-${routeId || ""}`} center={positions[0]} zoom={3} scrollWheelZoom className="sri-map">

          <FitRoute positions={positions}/>

          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          {aisVessels.map((vessel) => (
            <CircleMarker
              key={String(vessel.mmsi || `${vessel.latitude}-${vessel.longitude}`)}
              center={[Number(vessel.latitude), Number(vessel.longitude)]}
              radius={5}
              pathOptions={{ color: "#ffffff", weight: 1.5, fillColor: "#f59e0b", fillOpacity: 0.95 }}
            >
              <Tooltip direction="top">
                <strong>{vessel.name || "Unknown vessel"}</strong><br />
                MMSI: {vessel.mmsi || "—"}<br />
                Speed: {vessel.speed_knots ?? "—"} kn<br />
                Course: {vessel.course ?? "—"}°<br />
                Updated: {vessel.age_seconds != null ? `${Math.round(Number(vessel.age_seconds))}s ago` : (vessel.last_update || "—")}
              </Tooltip>
            </CircleMarker>
          ))}

          <Polyline positions={positions} pathOptions={{ color: "#1675ee", weight: 5, opacity: .95 }}/>

          {[positions[0], positions[positions.length - 1]].map((p, i) => <CircleMarker key={i} center={p} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: i ? "#0ea5e9" : "#16a34a", fillOpacity: 1 }}><Tooltip>{i ? routeDestination : routeOrigin}</Tooltip></CircleMarker>)}

        </MapContainer>

      ) : (

        <div className="sri-map-empty">Select a valid route to display its maritime geometry.</div>

      )}

      <div className="sri-map-caption"><strong>{routeId || "Maritime route"}</strong><span>Approximate maritime planning geometry — verify navigational data before sailing</span></div>

    </div>

    <section className="sri-ais-panel">
      <div className="sri-ais-head">
        <div>
          <span className="sri-eyebrow">LIVE MARITIME TRAFFIC</span>
          <h3>AIS vessel tracking</h3>
          <p>
            {aisStatus?.connected ? "Connected to AISstream" : "AIS connection status unavailable"}
            {" · "}{aisVessels.length} vessels with valid coordinates
            {aisUpdatedAt ? ` · Refreshed ${aisUpdatedAt.toLocaleTimeString()}` : ""}
          </p>
        </div>
        <span className={`sri-ais-badge ${aisStatus?.connected ? "is-live" : "is-offline"}`}>
          {aisLoading ? "Refreshing…" : aisStatus?.connected ? "LIVE FEED" : "CHECK CONNECTION"}
        </span>
      </div>
      {aisError && <p className="sri-ais-error" role="status">{aisError}</p>}
      <div className="sri-ais-controls">
        <input
          type="search"
          value={aisSearch}
          onChange={(event) => setAisSearch(event.target.value)}
          placeholder="Search vessel name or MMSI…"
          aria-label="Search live vessels"
        />
        <span>{filteredAisVessels.length} shown</span>
      </div>
      {filteredAisVessels.length ? (
        <div className="sri-ais-table-wrap">
          <table className="sri-ais-table">
            <thead><tr><th>Vessel</th><th>MMSI</th><th>Speed</th><th>Course</th><th>Position</th><th>Last update</th></tr></thead>
            <tbody>
              {filteredAisVessels.slice(0, 30).map((vessel) => (
                <tr key={String(vessel.mmsi || `${vessel.latitude}-${vessel.longitude}`)}>
                  <td>{vessel.name || "Unknown vessel"}</td>
                  <td>{vessel.mmsi || "—"}</td>
                  <td>{vessel.speed_knots != null ? `${vessel.speed_knots} kn` : "—"}</td>
                  <td>{vessel.course != null ? `${vessel.course}°` : "—"}</td>
                  <td>{Number(vessel.latitude).toFixed(4)}, {Number(vessel.longitude).toFixed(4)}</td>
                  <td>{vessel.age_seconds != null ? `${Math.max(0, Math.round(Number(vessel.age_seconds)))}s ago` : (vessel.last_update || "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAisVessels.length > 30 && <p className="sri-muted">Showing first 30 matches. Search to narrow the list.</p>}
        </div>
      ) : (
        <p className="sri-muted">{aisError || (aisLoading ? "Loading live vessel positions…" : "No live vessels currently match this search. The AIS subscription may only cover its configured region.")}</p>
      )}
      <p className="sri-disclaimer">AIS coverage depends on the backend subscription area and signal availability. Vessel positions are live reports, not a guarantee of navigational accuracy.</p>
    </section>

    <div className="sri-intel-grid">

      <Panel title="Weather intelligence" status={weatherLoading ? "Loading…" : wr.risk_level ? `${wr.risk_level} risk` : "Route profile"}>

        {weatherError ? <p className="sri-muted">{weatherError}</p> : <><p className="sri-region">{w.region || "Route weather profile"}</p><div className="sri-metrics"><div><b>{w.wind_speed_knots ?? "—"}</b><small>Wind (knots)</small></div><div><b>{w.wave_height_m ?? "—"} m</b><small>Wave height</small></div><div><b>{w.visibility_km ?? "—"} km</b><small>Visibility</small></div><div><b>{w.storm_probability ?? "—"}%</b><small>Storm probability</small></div></div><p className="sri-condition">{w.weather_condition || "Weather condition unavailable"}</p></>}

      </Panel>

      <Panel title="Customs intelligence" status={customsLoading ? "Loading…" : cr.risk_level ? `${cr.risk_level} risk` : "Destination profile"}>

        <div className="sri-customs-controls"><label>Cargo type<select value={cargoType} onChange={(e) => setCargoType(e.target.value)}><option>General Cargo</option><option>Electronics</option><option>Food Products</option><option>Machinery</option><option>Chemicals</option><option>Textiles</option><option>Pharmaceuticals</option><option>Perishable Goods</option></select></label><label>Containers<input type="number" min="1" value={containers} onChange={(e) => setContainers(Math.max(1, Number(e.target.value) || 1))}/></label></div>

        {customsError ? <p className="sri-muted">{customsError}</p> : <><div className="sri-customs-summary"><div><small>Destination</small><b>{c.destination_country || routeDestination || "—"}</b></div><div><small>Clearance estimate</small><b>{c.estimated_clearance_days ? `${c.estimated_clearance_days} days` : "—"}</b></div><div><small>Inspection probability</small><b>{c.inspection_probability_percent != null ? `${c.inspection_probability_percent}%` : "—"}</b></div></div><p className="sri-doc-title">Required documents</p>{Array.isArray(c.required_documents) && c.required_documents.length ? <ul className="sri-doc-list">{c.required_documents.map((doc) => <li key={doc}>{doc}</li>)}</ul> : <p className="sri-muted">{c.special_requirements || "Customs documents are not available for this selection."}</p>}<p className="sri-disclaimer">{customs?.disclaimer || "Prototype dataset only. Verify current requirements with the destination customs authority."}</p></>}

      </Panel>

    </div>

  </div>;

}
