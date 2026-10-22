import { useLocation, useNavigate } from "react-router-dom";

import { useState } from "react";

import "./RouteResults.css";

function RouteResults() {

  const location = useLocation();

  const navigate = useNavigate();

  const result = location.state?.result;

  const error = location.state?.error;

  const [freightAnalysis, setFreightAnalysis] = useState(null);

  const [freightLoading, setFreightLoading] = useState(false);

  const [freightError, setFreightError] = useState("");

  const [freightExpanded, setFreightExpanded] = useState(true);

  if (!result && !error) {

    return (

      <main className="wp-page wp-route-results wp-route-cinematic">

        <div className="wp-route-scene" aria-hidden="true">

          <div className="wp-route-stars" />

          <div className="wp-route-glow wp-route-glow--one" />

          <div className="wp-route-glow wp-route-glow--two" />

          <div className="wp-route-globe">

            <span className="wp-route-globe-line wp-route-globe-line--a" />

            <span className="wp-route-globe-line wp-route-globe-line--b" />

            <span className="wp-route-globe-line wp-route-globe-line--c" />

            <span className="wp-route-globe-route" />

            <i className="wp-route-globe-dot wp-route-globe-dot--a" />

            <i className="wp-route-globe-dot wp-route-globe-dot--b" />

          </div>

          <div className="wp-route-ship">

            <div className="wp-rship-smoke wp-rship-smoke--a" />

            <div className="wp-rship-smoke wp-rship-smoke--b" />

            <div className="wp-rship-bridge"><b /><b /><b /></div>

            <div className="wp-rship-containers">

              <i /><i /><i /><i /><i /><i />

              <b /><b /><b /><b />

            </div>

            <div className="wp-rship-deck" />

            <div className="wp-rship-hull">

              <strong>WAYPOINT</strong>

              <em>W</em>

            </div>

            <div className="wp-rship-water" />

          </div>

        </div>

        <div className="wp-route-empty">

          <div className="wp-route-empty__icon">⚓</div>

          <p className="wp-eyebrow">Route Intelligence</p>

          <h1>No route analysis found</h1>

          <p>Start by selecting an origin and destination from the route planner.</p>

          <button type="button" className="wp-btn wp-btn--primary" onClick={() => navigate("/")}>

            ← Back to route planner

          </button>

        </div>

      </main>

    );

  }

  if (error) {

    return (

      <main className="wp-page wp-route-results">

        <div className="wp-route-empty wp-route-empty--error">

          <div className="wp-route-empty__icon">⚠</div>

          <div className="wp-route-status"><span /> LIVE ROUTE ANALYSIS</div>

          <p className="wp-eyebrow">Route Analysis</p>

          <h1>No routes found</h1>

          <p>{typeof error === "string" ? error : "Unable to find a route for the selected ports."}</p>

          <button type="button" className="wp-btn wp-btn--primary" onClick={() => navigate("/")}>

            Try another route

          </button>

        </div>

      </main>

    );

  }

  const routes = Array.isArray(result.available_routes) ? result.available_routes : [];

  const recommendedRouteId =

    typeof result.recommended_route === "string"

      ? result.recommended_route

      : result.recommended_route?.route_id || null;

  const recommendedRoute =

    routes.find((route) => route.route_id === recommendedRouteId) ||

    (typeof result.recommended_route === "object" ? result.recommended_route : null);

  const containers = Number(result.containers) || 1;

  const handleSelectRoute = (route) => {

    if (!route) return;

    navigate("/quotation", {

      state: {

        route,

        result,

      },

    });

  };

  const analyzeCompleteShipment = async () => {

    const token = localStorage.getItem("waypoint_token");

    if (!token) {

      setFreightError("Please log in again to analyze the complete shipment.");

      setFreightAnalysis(null);

      return;

    }

    const origin = result.origin || recommendedRoute?.origin;

    const destination = result.destination || recommendedRoute?.destination;

    if (!origin || !destination) {

      setFreightError("Origin and destination are required. Return to the route planner and select both ports.");

      setFreightAnalysis(null);

      return;

    }

    setFreightLoading(true);

    setFreightError("");

    setFreightAnalysis(null);

    try {

      const response = await fetch("http\://127.0.0.1:8000/api/freight-intelligence", {

        method: "POST",

        headers: {

          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",

          Accept: "application/json",

        },

        body: JSON.stringify({

          origin,

          destination,

          cargo_type: result.cargo_type || "General Cargo",

          containers: Math.max(1, Number(result.containers || result.container_count || containers || 1)),

        }),

      });

      let data;

      try { data = await response.json(); }

      catch { throw new Error("The freight intelligence endpoint returned an unreadable response."); }

      if (!response.ok || data?.success === false) {

        const detail = data?.detail;

        throw new Error(

          (typeof detail === "string" ? detail : detail?.message) ||

          data?.message ||

          `Shipment analysis failed (HTTP ${response.status}).`

        );

      }

      setFreightAnalysis(data);

      setFreightExpanded(true);

    } catch (err) {

      console.error("Complete shipment analysis failed:", err);

      setFreightError(err?.message || "Unable to analyze the complete shipment. Check that the backend is running.");

    } finally {

      setFreightLoading(false);

    }

  };

  const formatRisk = (value) => value == null || value === "" ? "Unavailable" : String(value);

  const riskClass = (value) => {

    const level = String(value || "").toLowerCase();

    return level.includes("high") ? "is-high" : level.includes("low") ? "is-low" : "is-medium";

  };

  const formatMoney = (value) => {

    const number = Number(value);

    if (!Number.isFinite(number)) return "—";

    return `$${number.toLocaleString("en-US", {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,

    })}`;

  };

  const formatMoneyCompact = (value) => {

    const number = Number(value);

    if (!Number.isFinite(number)) return "—";

    return `$${number.toLocaleString("en-US", {

      maximumFractionDigits: 0,

    })}`;

  };

  const formatNumber = (value) => {

    const number = Number(value);

    if (!Number.isFinite(number)) return "—";

    return number.toLocaleString("en-US");

  };

  const getRoutePath = (route) => {

    if (Array.isArray(route?.route_path) && route.route_path.length > 0) {

      return route.route_path.join(" → ");

    }

    if (route?.route_display) return route.route_display;

    if (route?.origin && route?.destination) {

      return `${route.origin} → ${route.destination}`;

    }

    return route?.route_id || "Maritime Route";

  };

  const getStops = (route) => {

    if (Array.isArray(route?.route_path) && route.route_path.length > 0) {

      return route.route_path;

    }

    const display = route?.route_display || "";

    if (display.includes("→")) {

      return display.split("→").map((item) => item.trim()).filter(Boolean);

    }

    if (route?.origin && route?.destination) {

      return [route.origin, route.destination];

    }

    return [route?.route_id || "Origin", "Destination"];

  };

  const getPricing = (route) => {

    const pricing = route?.pricing || {};

    const baseFreight = Number(

      pricing.base_freight_usd ?? route?.base_freight_usd

    );

    const demandFactor = Number(pricing.demand_factor);

    const targetMargin = Number(pricing.target_margin_percent);

    const customerPrice = Number(

      pricing.final_selling_price_usd ??

      pricing.estimated_total_customer_price_usd ??

      route?.estimated_total_usd

    );

    const totalCustomerPrice = Number(

      pricing.estimated_total_customer_price_usd ??

      (Number.isFinite(customerPrice) ? customerPrice * containers : NaN)

    );

    return {

      ...pricing,

      baseFreight: Number.isFinite(baseFreight) ? baseFreight : null,

      demandFactor: Number.isFinite(demandFactor) ? demandFactor : null,

      targetMargin: Number.isFinite(targetMargin) ? targetMargin : null,

      customerPrice: Number.isFinite(customerPrice) ? customerPrice : null,

      totalCustomerPrice: Number.isFinite(totalCustomerPrice) ? totalCustomerPrice : null,

    };

  };

  const getScore = (route) => {

    const score = Number(route?.score ?? route?.route_score);

    return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;

  };

  const recommendedPricing = recommendedRoute ? getPricing(recommendedRoute) : null;

  const recommendedStops = recommendedRoute ? getStops(recommendedRoute) : [];

  const demandPercent =

    recommendedPricing?.demandFactor != null

      ? Math.round((recommendedPricing.demandFactor - 1) * 100)

      : null;

  const recommendationReason =

    result.reason ||

    "Best balance of transit time, distance, transshipments and route cost.";

  const getRouteTone = (route) => {

    const type = String(route?.route_type || "").toLowerCase();

    if (type.includes("express")) return "Express";

    if (type.includes("economy")) return "Economy";

    if (type.includes("multi")) return "Multi-leg";

    return "Standard";

  };

  const renderRouteTimeline = (route) => {

    const stops = getStops(route);

    return (

      <div className="wp-route-timeline">

        {stops.slice(0, 5).map((stop, index) => (

          <div className="wp-route-stop" key={`${stop}-${index}`}>

            <div className={`wp-route-stop__node wp-route-stop__node--${index}`}>

              <span>{index + 1}</span>

            </div>

            <div className="wp-route-stop__body">

              <strong>{stop}</strong>

              <small>

                {index === 0

                  ? "Origin"

                  : index === stops.length - 1

                    ? "Destination"

                    : "Transshipment hub"}

              </small>

            </div>

            {index < Math.min(stops.length - 1, 4) && (

              <div className="wp-route-stop__connector">

                <span>⌁</span>

              </div>

            )}

          </div>

        ))}

      </div>

    );

  };

  const renderMiniRoute = (route) => {

    const stops = getStops(route);

    const score = getScore(route);

    const pricing = getPricing(route);

    return (

      <div className="wp-route-mini-map" aria-hidden="true">

        <div className="wp-mini-map-grid" />

        <div className="wp-mini-map-line" />

        {stops.slice(0, 4).map((stop, index) => {

          const position = stops.length <= 2

            ? [14, 82][index] ?? 82

            : [10, 48, 82, 94][index] ?? 94;

          return (

            <div

              className={`wp-mini-map-point wp-mini-map-point--${index}`}

              style={{ left: `${position}%` }}

              key={`${stop}-${index}`}

            >

              <i />

              <span>{stop}</span>

            </div>

          );

        })}

        <div className="wp-mini-map-score">

          <span>ROUTE SCORE</span>

          <strong>{score.toFixed(1)}</strong>

        </div>

        <div className="wp-mini-map-price">

          <small>Customer</small>

          <strong>{formatMoneyCompact(pricing.customerPrice)}</strong>

        </div>

      </div>

    );

  };

  const renderAlternativeCard = (route, index) => {

    const isBest =

      route.is_best === true ||

      route.route_id === recommendedRouteId;

    const pricing = getPricing(route);

    const score = getScore(route);

    const tone = getRouteTone(route);

    return (

      <article

        key={`${route.route_id}-${index}`}

        className={`wp-alt-card ${isBest ? "wp-alt-card--best" : ""}`}

      >

        <div className="wp-alt-card__visual">

          {renderMiniRoute(route)}

          <div className="wp-alt-card__rank">

            <span>#{index + 1}</span>

            {isBest ? "RECOMMENDED" : "ALTERNATIVE"}

          </div>

        </div>

        <div className="wp-alt-card__content">

          <div className="wp-alt-card__heading">

            <div>

              <span className="wp-alt-card__eyebrow">{tone} ROUTE</span>

              <h3>{getRoutePath(route)}</h3>

            </div>

            <div className="wp-alt-score">

              <span>Score</span>

              <strong>{score.toFixed(1)}</strong>

            </div>

          </div>

          <div className="wp-alt-card__stats">

            <div>

              <span>Transit</span>

              <strong>{route.transit_days ?? "—"} days</strong>

            </div>

            <div>

              <span>Distance</span>

              <strong>{formatNumber(route.distance_nm)} NM</strong>

            </div>

            <div>

              <span>Transshipments</span>

              <strong>{route.transshipments ?? "—"}</strong>

            </div>

            <div>

              <span>Base Freight</span>

              <strong>{formatMoney(pricing.baseFreight)}</strong>

            </div>

          </div>

          <div className="wp-alt-card__bottom">

            <div className="wp-alt-price">

              <span>Customer Price / Container</span>

              <strong>{formatMoney(pricing.customerPrice)}</strong>

              {containers > 1 && pricing.totalCustomerPrice != null && (

                <small>

                  {formatMoney(pricing.totalCustomerPrice)} total for {containers} containers

                </small>

              )}

            </div>

            <button

              type="button"

              className="wp-alt-card__button"

              onClick={() => handleSelectRoute(route)}

            >

              {isBest ? "Request Quotation" : "Select Route"} <span>→</span>

            </button>

          </div>

        </div>

      </article>

    );

  };

  return (

    <main className="wp-page wp-route-results wp-route-cinematic">

      <div className="wp-route-background" aria-hidden="true">

        <div className="wp-route-background__grid" />

        <div className="wp-route-background__glow wp-route-background__glow--one" />

        <div className="wp-route-background__glow wp-route-background__glow--two" />

      </div>

      <div className="wp-route-shell">

        <div className="wp-page__back wp-route-back">

          <button type="button" onClick={() => navigate("/")}>

            ← Back to Waypoint

          </button>

          <span>LIVE ROUTE INTELLIGENCE</span>

        </div>

        <section className="wp-route-hero">

          <div className="wp-route-hero__main">

            <div className="wp-route-pill">

              <span className="wp-route-pill__icon">⌁</span>

              {getRouteTone(recommendedRoute || routes[0])} ROUTE ANALYSIS

            </div>

            <h1>

              {result.origin}

              <span> → </span>

              {result.destination}

            </h1>

            <p>

              AI-ranked maritime options with dynamic pricing, route scoring and

              alternative-path analysis.

            </p>

            <div className="wp-route-hero__meta">

              <span>{result.cargo_type || "Containerized Cargo"}</span>

              <i />

              <span>{containers} {containers === 1 ? "TEU" : "TEUs"}</span>

              <i />

              <span>{routes.length} available options</span>

            </div>

          </div>

          {recommendedRoute && (

            <div className="wp-route-hero__map">

              <div className="wp-map-header">

                <span>GLOBAL ROUTE VIEW</span>

                <b>● LIVE</b>

              </div>

              <div className="wp-map-ocean">

                <div className="wp-map-land wp-map-land--asia" />

                <div className="wp-map-land wp-map-land--africa" />

                <div className="wp-map-route wp-map-route--one" />

                <div className="wp-map-route wp-map-route--two" />

                {recommendedStops.slice(0, 4).map((stop, index) => (

                  <div

                    key={`${stop}-${index}`}

                    className={`wp-map-marker wp-map-marker--${index}`}

                  >

                    <i />

                    <span>{stop}</span>

                  </div>

                ))}

              </div>

              <div className="wp-map-footer">

                <span>⛴ AI OPTIMIZED</span>

                <strong>{formatNumber(recommendedRoute.distance_nm)} NM</strong>

              </div>

            </div>

          )}

        </section>

        <section className="wp-freight-intel" aria-labelledby="wp-freight-intel-title">

          <div className="wp-freight-intel__heading">

            <div>

              <span className="wp-freight-intel__eyebrow">END-TO-END SHIPMENT REVIEW</span>

              <h2 id="wp-freight-intel-title">Freight Intelligence</h2>

              <p>Combine route, price, weather, customs and risk insights for this shipment.</p>

            </div>

            <button type="button" className="wp-freight-intel__action" onClick={analyzeCompleteShipment} disabled={freightLoading}>

              {freightLoading ? "Analyzing shipment…" : freightAnalysis ? "Refresh analysis" : "Analyze complete shipment"}

            </button>

          </div>

          {freightError && <div className="wp-freight-intel__error" role="alert">{freightError}</div>}

          {freightLoading && <div className="wp-freight-intel__loading"><span className="wp-freight-intel__spinner" /> Checking route, pricing, weather, customs and risk…</div>}

          {freightAnalysis && (() => {

            const shipment = freightAnalysis.shipment || freightAnalysis;

            const selectedRoute =
              freightAnalysis.available_routes?.find((route) => route.is_best) ||
              freightAnalysis.available_routes?.find(
                (route) => route.route_id === freightAnalysis.recommended_route
              ) ||
              freightAnalysis.available_routes?.[0] ||
              {};

            const routeIntelSource = freightAnalysis.route_intelligence || {};
            const routeIntel = {
              ...routeIntelSource,
              recommended_route:
                routeIntelSource.recommended_route ||
                freightAnalysis.recommended_route ||
                selectedRoute.route_id,
              route_score:
                routeIntelSource.route_score ??
                freightAnalysis.route_score ??
                selectedRoute.route_score ??
                selectedRoute.score,
              transit_time_days:
                routeIntelSource.transit_time_days ??
                routeIntelSource.transit_days ??
                freightAnalysis.transit_time_days ??
                selectedRoute.transit_days,
              distance_nm:
                routeIntelSource.distance_nm ??
                freightAnalysis.distance_nm ??
                selectedRoute.distance_nm,
            };

            const priceSource =
              freightAnalysis.pricing_intelligence ||
              selectedRoute.pricing ||
              {};

            const price = {
              ...priceSource,
              base_freight_usd:
                priceSource.base_freight_usd ?? selectedRoute.base_freight_usd,
              total_customer_price_usd:
                priceSource.total_customer_price_usd ??
                priceSource.estimated_total_customer_price_usd ??
                priceSource.final_selling_price_usd ??
                selectedRoute.estimated_total_usd,
              total_brokerage_profit_usd:
                priceSource.total_brokerage_profit_usd ??
                priceSource.brokerage_profit_usd,
            };

            const weather = freightAnalysis.weather_intelligence || {};
            const customsIntel = freightAnalysis.customs_intelligence || {};
            const customs = customsIntel.customs || {};
            const weatherRisk =
              weather.risk_level ||
              weather.risk?.risk_level ||
              freightAnalysis.risk_intelligence?.weather_risk;

            const overallRisk = freightAnalysis.risk_intelligence || {};
            const requiredDocs = Array.isArray(customs.required_documents)
              ? customs.required_documents
              : [];

            const recommendationValue = freightAnalysis.business_recommendation;
            const recommendations = Array.isArray(recommendationValue)
              ? recommendationValue
              : typeof recommendationValue === "string"
                ? [recommendationValue]
                : [];

            // Build a transparent explanation from the risk values returned by the backend.
            // Scores are prototype indicators, not validated operational predictions.
            const weatherScore = Number(overallRisk.weather_risk_score);
            const customsScore = Number(overallRisk.customs_risk_score);
            const hasWeatherScore = overallRisk.weather_risk_score != null && Number.isFinite(weatherScore);
            const hasCustomsScore = overallRisk.customs_risk_score != null && Number.isFinite(customsScore);
            const routeRiskReasons = [];

            if (hasWeatherScore) {
              routeRiskReasons.push(
                weatherScore >= 70
                  ? `Weather contributes elevated risk (score ${weatherScore.toFixed(2)}/100); review conditions and consider a safer departure window.`
                  : weatherScore >= 45
                    ? `Weather contributes moderate risk (score ${weatherScore.toFixed(2)}/100); check conditions again before dispatch.`
                    : `Weather risk is relatively low in the current dataset (score ${weatherScore.toFixed(2)}/100); verify current marine conditions before departure.`
              );
            }

            if (hasCustomsScore) {
              routeRiskReasons.push(
                customsScore >= 70
                  ? `Customs contributes elevated risk (score ${customsScore.toFixed(2)}/100); verify permits, declarations, duties, and required documents with the destination authority.`
                  : customsScore >= 45
                    ? `Customs contributes moderate risk (score ${customsScore.toFixed(2)}/100); confirm cargo classification and destination documentation before booking.`
                    : `Customs risk is relatively low in the current prototype profile (score ${customsScore.toFixed(2)}/100); still verify current import rules and document requirements.`
              );
            }

            if (!hasWeatherScore) routeRiskReasons.push("Weather risk could not be scored because the weather assessment is unavailable.");
            if (!hasCustomsScore) routeRiskReasons.push("Customs risk could not be scored because the customs assessment is unavailable.");

            if (routeIntel.transit_time_days != null || routeIntel.transit_days != null) {
              routeRiskReasons.push(`Plan around the estimated transit time of ${routeIntel.transit_time_days ?? routeIntel.transit_days} days; this is an estimate and may change.`);
            }
            if (routeIntel.transshipments != null && Number(routeIntel.transshipments) > 0) {
              routeRiskReasons.push(`This route includes ${routeIntel.transshipments} transshipment(s); confirm connection windows and handling arrangements.`);
            }

            const disclaimers = Array.isArray(freightAnalysis.disclaimers)
              ? freightAnalysis.disclaimers
              : [];

            // The API normally returns weather directly under weather_intelligence.weather.
            // Keep the legs fallback for compatibility with older multi-leg responses.
            const firstLeg = Array.isArray(weather.legs)
              ? weather.legs.find((leg) => leg?.success)
              : null;

            const marine = weather.weather || firstLeg?.weather || {};
            return (

              <div className="wp-freight-intel__content">

                <button type="button" className="wp-freight-intel__collapse" onClick={() => setFreightExpanded((open) => !open)}>

                  {shipment.origin || result.origin} → {shipment.destination || result.destination}

                  <span>{freightExpanded ? "Hide details −" : "Show details +"}</span>

                </button>

                {freightExpanded && <>

                  <div className="wp-freight-intel__metrics">

                    <article><small>Estimated customer price</small><strong>{price.currency === "USD" ? "$" : `${price.currency || ""} `}{(Number.isFinite(Number(price.total_customer_price_usd)) && price.total_customer_price_usd != null
                        ? Number(price.total_customer_price_usd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "—")}</strong><span>For {shipment.containers || containers} container(s)</span></article>

                    <article><small>Recommended transit</small><strong>{routeIntel.transit_time_days ?? routeIntel.transit_days ?? "—"} days</strong><span>{routeIntel.distance_nm != null ? `${Number(routeIntel.distance_nm).toLocaleString()} nautical miles` : "Transit estimate"}</span></article>

                    <article><small>Route score</small><strong>{routeIntel.route_score != null ? `${routeIntel.route_score}/100` : "—"}</strong><span>{routeIntel.recommended_route || "Recommended route"}</span></article>

                    <article><small>Overall risk</small><strong className={riskClass(overallRisk.overall_risk_level)}>{formatRisk(overallRisk.overall_risk_level)}</strong><span>{overallRisk.overall_risk_score != null ? `Score ${overallRisk.overall_risk_score}/100` : "Risk score unavailable"}</span></article>

                  </div>

                  <div className="wp-freight-intel__grid">

                    <article className="wp-freight-intel__card">

                      <h3>Pricing breakdown</h3>

                      <dl>

                        <div><dt>Base freight</dt><dd>{formatMoney(price.base_freight_usd)}</dd></div>

                        <div><dt>Fuel surcharge</dt><dd>{formatMoney(price.fuel_surcharge_usd)}</dd></div>

                        <div><dt>Port charges</dt><dd>{formatMoney(price.port_charge_usd)}</dd></div>

                        <div><dt>Risk surcharge</dt><dd>{formatMoney(price.risk_surcharge_usd)}</dd></div>

                        <div className="wp-freight-intel__total"><dt>Total customer price</dt><dd>{formatMoney(price.total_customer_price_usd)}</dd></div>

                      </dl>

                      <p className="wp-freight-intel__note">Estimated brokerage profit: {formatMoney(price.total_brokerage_profit_usd)}.</p>

                    </article>

                    <article className="wp-freight-intel__card">

                      <h3>Weather intelligence</h3>

                      <div className="wp-freight-intel__riskline"><span>Route weather risk</span><b className={riskClass(weatherRisk)}>{formatRisk(weatherRisk)}</b></div>

                      <dl>

                        <div><dt>Condition</dt><dd>{marine.weather_condition || "Unavailable"}</dd></div>

                        <div><dt>Wind speed</dt><dd>{marine.wind_speed_knots != null ? `${marine.wind_speed_knots} knots` : "—"}</dd></div>

                        <div><dt>Wave height</dt><dd>{marine.wave_height_m != null ? `${marine.wave_height_m} m` : "—"}</dd></div>

                        <div><dt>Storm probability</dt><dd>{marine.storm_probability != null ? `${marine.storm_probability}%` : "—"}</dd></div>

                      </dl>

                      <p className="wp-freight-intel__note">Source: {weather.status || "Not reported"}. Figures may be dataset estimates, not live conditions.</p>

                    </article>

                    <article className="wp-freight-intel__card">

                      <h3>Customs &amp; documentation</h3>

                      <div className="wp-freight-intel__riskline"><span>Compliance risk</span><b className={riskClass(customs.compliance_risk || customsIntel.risk?.risk_level)}>{formatRisk(customs.compliance_risk || customsIntel.risk?.risk_level)}</b></div>

                      <dl>

                        <div><dt>Destination country</dt><dd>{customs.destination_country || "—"}</dd></div>

                        <div><dt>Clearance estimate</dt><dd>{customs.estimated_clearance_days || "—"} days</dd></div>

                        <div><dt>Inspection probability</dt><dd>{customs.inspection_probability_percent != null ? `${customs.inspection_probability_percent}%` : "—"}</dd></div>

                      </dl>

                      {requiredDocs.length > 0 && <><h4>Required documents</h4><ul>{requiredDocs.map((doc) => <li key={doc}>{doc}</li>)}</ul></>}

                      <p className="wp-freight-intel__note">Prototype customs profile. Verify official destination requirements before shipping.</p>

                    </article>

                    <article className="wp-freight-intel__card">

                      <h3>Unified risk intelligence</h3>

                      <div className="wp-freight-intel__riskline"><span>Overall risk level</span><b className={riskClass(overallRisk.overall_risk_level)}>{formatRisk(overallRisk.overall_risk_level)}</b></div>

                      <div className="wp-freight-intel__riskline"><span>Overall risk score</span><b>{overallRisk.overall_risk_score != null ? `${Number(overallRisk.overall_risk_score).toFixed(2)}/100` : "Unavailable"}</b></div>

                      <div className="wp-freight-intel__riskline"><span>Weather score</span><b>{hasWeatherScore ? `${weatherScore.toFixed(2)}/100` : "—"}</b></div>

                      <div className="wp-freight-intel__riskline"><span>Customs score</span><b>{hasCustomsScore ? `${customsScore.toFixed(2)}/100` : "—"}</b></div>

                      <h4>Why this assessment?</h4>
                      {routeRiskReasons.length > 0 ? <ul>{routeRiskReasons.map((item, index) => <li key={`reason-${index}`}>{item}</li>)}</ul> : <p>Risk reasons are unavailable for this shipment.</p>}

                      <h4>Recommended actions</h4>
                      {recommendations.length > 0 ? <ul>{recommendations.map((item, index) => <li key={`recommendation-${index}`}>{item}</li>)}</ul> : <p>Verify weather conditions and destination customs requirements before confirming shipment.</p>}

                    </article>

                  </div>

                  {disclaimers.length > 0 && <p className="wp-freight-intel__disclaimer">{disclaimers.join(" ")}</p>}

                  <div className="wp-freight-intel__footer"><span>Analysis complete · Engine {freightAnalysis.engine_version || "1.0.0"}</span><button type="button" onClick={() => handleSelectRoute(recommendedRoute || selectedRoute)}>Continue to quotation →</button></div>

                </>}

              </div>

            );

          })()}

          {!freightAnalysis && !freightLoading && !freightError && <p className="wp-freight-intel__hint">Your existing route results stay available. Run this analysis to load the complete shipment intelligence panel.</p>}

        </section>

        {recommendedRoute && (

          <>

            <section className="wp-route-timeline-section">

              <div className="wp-section-label">

                <span>01</span>

                ROUTE PATH

              </div>

              {renderRouteTimeline(recommendedRoute)}

            </section>

            <section className="wp-route-metrics">

              <div className="wp-metric-card">

                <span className="wp-metric-icon">◷</span>

                <div>

                  <small>TRANSIT DAYS</small>

                  <strong>{recommendedRoute.transit_days ?? "—"} days</strong>

                </div>

              </div>

              <div className="wp-metric-card">

                <span className="wp-metric-icon">⌖</span>

                <div>

                  <small>TOTAL DISTANCE</small>

                  <strong>{formatNumber(recommendedRoute.distance_nm)} NM</strong>

                </div>

              </div>

              <div className="wp-metric-card">

                <span className="wp-metric-icon">⇄</span>

                <div>

                  <small>TRANSSHIPMENTS</small>

                  <strong>{recommendedRoute.transshipments ?? "—"}</strong>

                </div>

              </div>

              <div className="wp-metric-card">

                <span className="wp-metric-icon">▣</span>

                <div>

                  <small>FREIGHT / CONTAINER</small>

                  <strong>{formatMoneyCompact(recommendedPricing?.baseFreight)}</strong>

                </div>

              </div>

            </section>

            <section className="wp-recommended-panel">

              <div className="wp-recommended-panel__top">

                <div className="wp-recommended-title">

                  <div className="wp-recommended-star">★</div>

                  <div>

                    <span className="wp-section-label wp-section-label--green">02 · RECOMMENDED ROUTE</span>

                    <h2>{getRoutePath(recommendedRoute)}</h2>

                    <p>Best balance of cost, transit time and route reliability.</p>

                  </div>

                </div>

                <div className="wp-feasible-badge">

                  <span>✓</span> FEASIBLE ROUTE

                </div>

              </div>

              <div className="wp-recommended-grid">

                <div className="wp-route-story">

                  <div className="wp-story-art">

                    <div className="wp-story-ocean" />

                    <div className="wp-story-ship">

                      <span className="wp-story-ship__smoke" />

                      <span className="wp-story-ship__body" />

                      <span className="wp-story-ship__containers" />

                    </div>

                    <div className="wp-story-skyline" />

                    <span className="wp-story-label">WAYPOINT MARITIME</span>

                  </div>

                  <div className="wp-route-story__quote">

                    <span>“</span>

                    <p>{recommendationReason}</p>

                  </div>

                </div>

                <div className="wp-pricing-panel">

                  <div className="wp-pricing-panel__heading">

                    <span className="wp-pricing-icon">◉</span>

                    <div>

                      <h3>Pricing Breakdown</h3>

                      <p>Dynamic AI pricing · per container</p>

                    </div>

                  </div>

                  <div className="wp-pricing-rows">

                    <div className="wp-pricing-row">

                      <div>

                        <span className="wp-pricing-row__icon">▣</span>

                        <div>

                          <strong>Base Freight</strong>

                          <small>Market rate for this route</small>

                        </div>

                      </div>

                      <b>{formatMoney(recommendedPricing?.baseFreight)}</b>

                    </div>

                    <div className="wp-pricing-row">

                      <div>

                        <span className="wp-pricing-row__icon">⚙</span>

                        <div>

                          <strong>Demand Factor</strong>

                          <small>Current market demand adjustment</small>

                        </div>

                      </div>

                      <div className="wp-pricing-value-stack">

                        <b>

                          {recommendedPricing?.demandFactor != null

                            ? recommendedPricing.demandFactor.toFixed(2)

                            : "—"}

                        </b>

                        {demandPercent != null && (

                          <span className={demandPercent >= 0 ? "wp-factor-up" : "wp-factor-down"}>

                            {demandPercent >= 0 ? "↑" : "↓"} {Math.abs(demandPercent)}%

                          </span>

                        )}

                      </div>

                    </div>

                    <div className="wp-pricing-row">

                      <div>

                        <span className="wp-pricing-row__icon">◇</span>

                        <div>

                          <strong>Target Margin</strong>

                          <small>Optimized brokerage margin</small>

                        </div>

                      </div>

                      <b>

                        {recommendedPricing?.targetMargin != null

                          ? `${recommendedPricing.targetMargin.toFixed(1)}%`

                          : "—"}

                      </b>

                    </div>

                  </div>

                  <div className="wp-pricing-final">

                    <div>

                      <span>FINAL CUSTOMER PRICE</span>

                      <small>Per container</small>

                    </div>

                    <strong>{formatMoney(recommendedPricing?.customerPrice)}</strong>

                  </div>

                  {containers > 1 && recommendedPricing?.totalCustomerPrice != null && (

                    <div className="wp-pricing-total">

                      <span>Total shipment · {containers} containers</span>

                      <strong>{formatMoney(recommendedPricing.totalCustomerPrice)}</strong>

                    </div>

                  )}

                </div>

                <div className="wp-advantages-panel">

                  <div className="wp-advantages-panel__heading">

                    <span>✦</span>

                    <h3>Key Advantages</h3>

                  </div>

                  <ul>

                    <li><span>◷</span> Competitive transit time</li>

                    <li><span>⬡</span> Reliable maritime connectivity</li>

                    <li><span>↗</span> Cost-effective route selection</li>

                    <li><span>▥</span> Data-driven route score</li>

                  </ul>

                  <div className="wp-score-card">

                    <div>

                      <span>ROUTE SCORE</span>

                      <strong>{getScore(recommendedRoute).toFixed(1)}</strong>

                    </div>

                    <div className="wp-score-ring">

                      <span style={{ "--score": `${getScore(recommendedRoute) * 3.6}deg` }} />

                    </div>

                  </div>

                  <button

                    type="button"

                    className="wp-request-button"

                    onClick={() => handleSelectRoute(recommendedRoute)}

                  >

                    <span>

                      <strong>Request Quotation</strong>

                      <small>Get detailed rates & booking information</small>

                    </span>

                    <b>→</b>

                  </button>

                </div>

              </div>

            </section>

          </>

        )}

        <section className="wp-alternatives-section">

          <div className="wp-alternatives-heading">

            <div>

              <span className="wp-section-label">03 · ALTERNATIVE ROUTES</span>

              <h2>Compare every option</h2>

              <p>

                Every available route carries its own pricing, demand adjustment

                and customer price.

              </p>

            </div>

            <div className="wp-route-count">

              <strong>{routes.length}</strong>

              <span>routes analyzed</span>

            </div>

          </div>

          {routes.length > 0 ? (

            <div className="wp-alternatives-list">

              {routes.map((route, index) => renderAlternativeCard(route, index))}

            </div>

          ) : (

            <div className="wp-empty">

              <span>⚓</span>

              <h3>No available routes</h3>

              <p>No maritime route options were returned for this route.</p>

            </div>

          )}

        </section>

        <footer className="wp-route-footer">

          <span>WAYPOINT AI · MARITIME BROKERAGE INTELLIGENCE</span>

          <span>ROUTE + PRICING ENGINE ACTIVE</span>

        </footer>

      </div>

    </main>

  );

}

export default RouteResults;
