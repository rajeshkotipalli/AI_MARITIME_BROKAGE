import { useEffect, useMemo, useState } from "react";

import { ORIGIN_PORTS, DEST_PORTS } from "../data/ports";
import weatherHero from "./weather-hero.png";
import "./Weather.css";



const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");



const asNumber = (...values) => {

  for (const value of values) {

    if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) return Number(value);

  }

  return null;

};

const display = (value, suffix = "") => value === null || value === undefined || value === "" ? "—" : `${value}${suffix}`;

const dateLabel = (value, index) => {

  if (!value) return index === 0 ? "Today" : `Day ${index + 1}`;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN", { weekday: "short" });

};

const iconFor = (condition = "") => {

  const text = String(condition).toLowerCase();

  if (text.includes("thunder")) return "⛈️";

  if (text.includes("rain")) return "🌧️";

  if (text.includes("drizzle")) return "🌦️";

  if (text.includes("snow")) return "❄️";

  if (text.includes("fog") || text.includes("mist")) return "🌫️";

  if (text.includes("cloud")) return "☁️";

  return "☀️";

};

const conditionOf = (weather) => weather?.condition || weather?.description || weather?.weather_condition || weather?.weather?.[0]?.description || "Conditions unavailable";

const tempOf = (weather) => asNumber(weather?.temperature, weather?.temp, weather?.main?.temp, weather?.current?.temp);

const windOf = (weather) => asNumber(weather?.wind_speed, weather?.wind, weather?.wind_speed_kmh, weather?.wind?.speed);

const humidityOf = (weather) => asNumber(weather?.humidity, weather?.main?.humidity);

const pressureOf = (weather) => asNumber(weather?.pressure, weather?.main?.pressure);

const visibilityOf = (weather) => asNumber(weather?.visibility_km, weather?.visibility);

const rainOf = (weather) => asNumber(weather?.rain_probability, weather?.pop);



function WorldMapArt() {

  return <div className="wpw-map-art" aria-label="Illustrative global weather map">

    <div className="wpw-map-grid" />

    <svg className="wpw-world-svg" viewBox="0 0 800 390" role="img" aria-label="Global shipping network map">

      <defs><radialGradient id="wpwGlow"><stop offset="0" stopColor="#27f5ff" stopOpacity=".8"/><stop offset="1" stopColor="#27f5ff" stopOpacity="0"/></radialGradient></defs>

      <g fill="#0b78a8" fillOpacity=".35" stroke="#1b9bc7" strokeOpacity=".65" strokeWidth="1.1">

        <path d="M62 83 94 57 135 49 165 65 193 59 220 82 211 105 185 111 171 135 147 145 137 174 115 192 97 167 80 151 72 123 51 109Z"/>

        <path d="M177 198 202 207 218 238 210 267 224 295 208 338 190 318 184 284 166 251 163 225Z"/>

        <path d="M319 77 345 62 373 67 389 82 378 101 350 103 333 93Z"/>

        <path d="M371 103 406 85 449 88 479 75 516 84 538 103 571 108 592 132 575 150 544 143 525 161 494 155 475 179 451 168 430 146 405 143 389 125Z"/>

        <path d="M389 158 419 165 438 190 431 228 410 259 397 295 378 275 371 244 355 218 360 184Z"/>

        <path d="M547 204 573 191 602 201 620 224 611 248 582 257 560 239Z"/>

        <path d="M642 265 671 253 701 268 712 287 691 300 663 292Z"/>

      </g>

      <g fill="none" stroke="#26e7ff" strokeWidth="1.7" strokeDasharray="5 6" opacity=".9">

        <path d="M135 112 Q260 25 385 118 T584 139"/><path d="M385 118 Q420 220 565 226"/><path d="M135 112 Q185 190 203 260"/><path d="M385 118 Q520 70 672 278"/>

      </g>

      {[[135,112],[385,118],[584,139],[565,226],[203,260],[672,278]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="22" fill="url(#wpwGlow)"/><circle cx={x} cy={y} r="4" fill="#42f4ff"/><circle cx={x} cy={y} r="8" fill="none" stroke="#42f4ff" strokeOpacity=".8"/></g>)}

      <g transform="translate(385 118)"><circle r="39" fill="#ff4d46" fillOpacity=".12"/><circle r="27" fill="#ff5b42" fillOpacity=".18"/><circle r="15" fill="#ffb35c" fillOpacity=".3"/><circle r="5" fill="#fff2ac"/><path d="M0 -53V-38M0 38V53M-53 0H-38M38 0H53" stroke="#ffb35c" strokeWidth="2"/></g>

    </svg>

    <div className="wpw-map-legend"><span><i className="wpw-legend-light"/>Light</span><div className="wpw-legend-bar"/><span>Heavy</span></div>

    <div className="wpw-map-wind"><span>〰</span><div><small>Global wind</small><strong>Network view</strong></div></div>

    <div className="wpw-map-live"><i/> Illustrative map</div>

  </div>;

}



function Weather() {

  const originOptions = useMemo(() => [...new Set([...(ORIGIN_PORTS || []), ...(DEST_PORTS || [])])].sort(), []);

  const destinationOptions = useMemo(() => [...new Set([...(DEST_PORTS || []), ...(ORIGIN_PORTS || [])])].sort(), []);

  const [origin, setOrigin] = useState(ORIGIN_PORTS?.includes("Chennai") ? "Chennai" : (ORIGIN_PORTS?.[0] || "Chennai"));

  const [destination, setDestination] = useState(DEST_PORTS?.includes("Rotterdam") ? "Rotterdam" : (DEST_PORTS?.[0] || "Rotterdam"));

  const [originWeather, setOriginWeather] = useState(null);

  const [destinationWeather, setDestinationWeather] = useState(null);

  const [originForecast, setOriginForecast] = useState([]);

  const [destinationForecast, setDestinationForecast] = useState([]);

  const [routeWeather, setRouteWeather] = useState(null);

  const [mode, setMode] = useState("route");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [updatedAt, setUpdatedAt] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);



  useEffect(() => {

    let cancelled = false;

    async function loadWeather() {

      if (!origin || !destination) return;

      setLoading(true); setError("");

      try {

        const [originRes, destinationRes] = await Promise.all([

          fetch(`${API_BASE_URL}/api/weather?location=${encodeURIComponent(origin)}`),

          fetch(`${API_BASE_URL}/api/weather?location=${encodeURIComponent(destination)}`),

        ]);

        if (!originRes.ok || !destinationRes.ok) throw new Error("The weather API could not return data for one or both ports.");

        const [originData, destinationData] = await Promise.all([originRes.json(), destinationRes.json()]);

        let routeData = null;

        try {

          const routeRes = await fetch(`${API_BASE_URL}/api/weather/route-by-locations?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);

          if (routeRes.ok) routeData = await routeRes.json();

        } catch (e) { console.warn("Route dataset weather unavailable", e); }

        if (cancelled) return;

        setOriginWeather(originData.current || originData);

        setDestinationWeather(destinationData.current || destinationData);

        setOriginForecast(originData.forecast || originData.list || []);

        setDestinationForecast(destinationData.forecast || destinationData.list || []);

        setRouteWeather(routeData);

        setUpdatedAt(new Date());

      } catch (e) {

        if (cancelled) return;

        setError(e?.message || "Unable to load weather. Check that the FastAPI server and OpenWeather key are configured.");

        setOriginWeather(null); setDestinationWeather(null); setOriginForecast([]); setDestinationForecast([]); setRouteWeather(null);

      } finally { if (!cancelled) setLoading(false); }

    }

    loadWeather();

    return () => { cancelled = true; };

  }, [origin, destination, refreshKey]);



  useEffect(() => {

    if (!originWeather && !destinationWeather) return;

    const context = { origin, destination, originWeather, destinationWeather, originForecast, destinationForecast, routeWeather, updatedAt: updatedAt?.toISOString() || new Date().toISOString() };

    try {

      localStorage.setItem("waypoint_ai_weather_context", JSON.stringify(context));

      window.dispatchEvent(new CustomEvent("waypoint-ai-weather-updated"));

    } catch (e) { console.warn("Could not share weather context with Waypoint AI", e); }

  }, [origin, destination, originWeather, destinationWeather, originForecast, destinationForecast, routeWeather, updatedAt]);



  const weatherRisk = (weather) => {

    const wind = windOf(weather) ?? 0; const rain = rainOf(weather) ?? 0;

    if (wind >= 45 || rain >= 70) return { level: "High", className: "high" };

    if (wind >= 25 || rain >= 40) return { level: "Moderate", className: "moderate" };

    return { level: "Low", className: "low" };

  };

  const originRisk = weatherRisk(originWeather);

  const routeRisk = routeWeather?.risk?.risk_level || routeWeather?.risk_level || "Unavailable";

  const routeRiskClass = String(routeRisk).toLowerCase();

  const routeMarine = routeWeather?.weather || {};

  const forecastItems = (list) => {

    if (!Array.isArray(list)) return [];

    // OpenWeather's standard forecast is 3-hourly. Keep one representative record per date.

    const byDay = new Map();

    list.forEach((item) => {

      const rawDate = item.date || item.dt_txt || item.datetime || item.time;

      const key = rawDate ? new Date(rawDate).toDateString() : (item.day || "unknown");

      if (!byDay.has(key)) byDay.set(key, item);

    });

    return [...byDay.values()].slice(0, 5);

  };

  const forecast = forecastItems(originForecast);

  const advisory = routeRisk === "High" ? "High-risk marine conditions are reported for this route. Review alternatives before dispatch." : routeRisk === "Medium" || routeRisk === "Moderate" ? "Moderate marine conditions are reported for this route. Monitor wind and wave conditions before dispatch." : routeRisk === "Low" ? "Dataset risk is low for this route. Continue routine weather monitoring before dispatch." : "Route-specific marine conditions are unavailable. Use live port weather and verify conditions before dispatch.";



  return <main className="wpw-page">

    <section
      className="wpw-hero"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(2, 17, 34, 0.78), rgba(2, 17, 34, 0.18)), url(${weatherHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      <div className="wpw-hero-overlay" />

      <div className="wpw-hero-content">

        <div className="wpw-eyebrow"><span className="wpw-pulse"/> MARITIME WEATHER INTELLIGENCE</div>

        <h1>Weather <span>&amp; Conditions</span></h1>

        <p>Monitor live weather conditions and forecast information for safer,<br className="wpw-desktop-break"/> smarter and more efficient voyages.</p>

        <div className="wpw-hero-pills"><span>☁ <b>Real-Time Data</b></span><span>◎ <b>Global Coverage</b></span><span>▥ <b>Accurate Forecasts</b></span><span>⬟ <b>Route Safety</b></span></div>

      </div>

      <div className="wpw-coverage-card"><div className="wpw-globe">◎</div><div><small>GLOBAL COVERAGE</small><strong>Port weather intelligence</strong><span><i/> Weather service connected</span></div></div>

    </section>



    <section className="wpw-controls">

      <div className="wpw-mode-switch"><button className={mode === "route" ? "active" : ""} onClick={() => setMode("route")}>⌘ <span>Route Forecast</span></button><button className={mode === "port" ? "active" : ""} onClick={() => setMode("port")}>⚓ <span>Port Weather</span></button></div>

      <label className="wpw-select"><small>ORIGIN PORT</small><span>⌖</span><select value={origin} onChange={(e) => setOrigin(e.target.value)}>{originOptions.map((port) => <option key={port} value={port}>{port}</option>)}</select></label>

      <div className="wpw-route-arrow">→</div>

      <label className="wpw-select"><small>DESTINATION PORT</small><span>⌖</span><select value={destination} onChange={(e) => setDestination(e.target.value)}>{destinationOptions.map((port) => <option key={port} value={port}>{port}</option>)}</select></label>

      <div className="wpw-range-label">▦ <span>Forecast window</span><strong>Next 5 days</strong></div>

      <button className="wpw-refresh" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>{loading ? "Loading…" : "↻ Refresh"}</button>

    </section>



    {error && <div className="wpw-error"><strong>Weather data unavailable</strong><span>{error}</span><small>Confirm FastAPI is running and OPENWEATHER_API_KEY is set in the backend .env file.</small></div>}

    {loading && <div className="wpw-loading"><span className="wpw-spinner"/> Fetching live port conditions and route dataset…</div>}



    <section className="wpw-main-grid">

      <article className="wpw-panel wpw-map-panel"><header className="wpw-panel-heading"><div><span className="wpw-heading-icon">◉</span><h2>Global Weather Map</h2></div><span className="wpw-live"><i/> NETWORK</span></header><WorldMapArt/><p className="wpw-map-note">Network illustration · Not a live radar layer</p></article>



      <article className="wpw-panel wpw-current-panel"><header className="wpw-panel-heading"><div><span className="wpw-heading-icon">{iconFor(conditionOf(originWeather))}</span><h2>Current Conditions</h2></div><span className="wpw-updated">{updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}` : "Waiting for data"}</span></header>

        <div className="wpw-current-hero"><div className="wpw-current-copy"><span className="wpw-location-dot">⌖</span><div><strong>{origin}</strong><small>Origin port</small></div><div className="wpw-temperature">{display(tempOf(originWeather), "°C")}</div><p>{conditionOf(originWeather)}</p></div><div className="wpw-weather-art">{iconFor(conditionOf(originWeather))}</div></div>

        <div className="wpw-metric-grid">

          <div className="wpw-metric"><span>≋</span><div><small>Wind speed</small><strong>{display(windOf(originWeather), windOf(originWeather) === null ? "" : " km/h")}</strong></div></div>

          <div className="wpw-metric"><span>◉</span><div><small>Humidity</small><strong>{display(humidityOf(originWeather), humidityOf(originWeather) === null ? "" : "%")}</strong></div></div>

          <div className="wpw-metric"><span>◉</span><div><small>Pressure</small><strong>{display(pressureOf(originWeather), pressureOf(originWeather) === null ? "" : " hPa")}</strong></div></div>

          <div className="wpw-metric"><span>◎</span><div><small>Visibility</small><strong>{display(visibilityOf(originWeather), visibilityOf(originWeather) === null ? "" : " km")}</strong></div></div>

        </div>

        <div className="wpw-port-comparison"><div><small>DESTINATION</small><strong>{destination}</strong><span>{iconFor(conditionOf(destinationWeather))} {conditionOf(destinationWeather)}</span></div><div className="wpw-dest-temp">{display(tempOf(destinationWeather), "°C")}</div><span className={`wpw-risk-chip ${weatherRisk(destinationWeather).className}`}>{weatherRisk(destinationWeather).level} risk</span></div>

      </article>



      <article className="wpw-panel wpw-forecast-panel"><header className="wpw-panel-heading"><div><span className="wpw-heading-icon">▦</span><h2>5-Day Forecast</h2></div><span className="wpw-forecast-port">{origin}</span></header>

        <div className="wpw-forecast-grid">{forecast.length ? forecast.map((day, index) => {

          const main = day.main || day; const temp = asNumber(day.temperature, day.temp, main.temp, day.temp_max);

          const date = day.date || day.dt_txt || day.datetime || day.time;

          const condition = conditionOf(day);

          return <div className="wpw-day-card" key={`${date || day.day || index}`}><small>{dateLabel(date || day.day, index)}</small><span className="wpw-day-date">{date && !Number.isNaN(new Date(date).getTime()) ? new Date(date).toLocaleDateString("en-IN", {day:"2-digit", month:"short"}) : "Forecast"}</span><strong className="wpw-day-icon">{iconFor(condition)}</strong><b>{display(temp, "°C")}</b><span className="wpw-day-condition">{condition}</span></div>;

        }) : <div className="wpw-forecast-empty">Forecast records will appear here when returned by OpenWeather.</div>}</div>

        <div className="wpw-advisory"><span className="wpw-advisory-icon">〰</span><div><small>MARITIME ADVISORY</small><p>{advisory}</p></div><span className={`wpw-risk-chip ${routeRiskClass}`}>{routeRisk}</span></div>

      </article>

    </section>



    <section className="wpw-panel wpw-route-panel"><header className="wpw-panel-heading"><div><span className="wpw-heading-icon">〰</span><div><h2>Route Weather Intelligence</h2><p>{origin} <span>→</span> {destination} · marine dataset</p></div></div><span className="wpw-updated">{updatedAt ? `Last updated ${updatedAt.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}` : "Awaiting route data"}</span></header>

      {routeWeather?.success === false ? <div className="wpw-route-empty">{routeWeather.message || "No matching route weather record was found in weather.csv."}</div> : <div className="wpw-route-metrics">

        <div className="wpw-route-metric"><span>⌖</span><small>Region</small><strong>{routeMarine.region || "—"}</strong></div>

        <div className="wpw-route-metric"><span>≋</span><small>Wind speed</small><strong>{display(asNumber(routeMarine.wind_speed_knots), asNumber(routeMarine.wind_speed_knots) === null ? "" : " knots")}</strong><em>Dataset value</em></div>

        <div className="wpw-route-metric"><span>〰</span><small>Wave height</small><strong>{display(asNumber(routeMarine.wave_height_m), asNumber(routeMarine.wave_height_m) === null ? "" : " m")}</strong><em>Dataset value</em></div>

        <div className="wpw-route-metric"><span>◎</span><small>Visibility</small><strong>{display(asNumber(routeMarine.visibility_km), asNumber(routeMarine.visibility_km) === null ? "" : " km")}</strong><em>Dataset value</em></div>

        <div className="wpw-route-metric"><span>ϟ</span><small>Storm probability</small><strong>{display(asNumber(routeMarine.storm_probability), asNumber(routeMarine.storm_probability) === null ? "" : "%")}</strong><em>Dataset value</em></div>

        <div className="wpw-route-metric"><span>{iconFor(routeMarine.weather_condition)}</span><small>Condition / risk</small><strong>{routeMarine.weather_condition || routeRisk}</strong><em className={`wpw-risk-text ${routeRiskClass}`}>{routeRisk} risk</em></div>

      </div>}

      <p className="wpw-data-note">Live atmospheric readings come from OpenWeather. Wind, waves, visibility and storm probability in this section come from your route-linked weather.csv dataset and are not live marine sensor readings.</p>

    </section>

  </main>;

}



export default Weather;
