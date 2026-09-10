import { useLocation, useNavigate } from "react-router-dom";
import "./RouteResults.css";

function RouteResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result;
  const error = location.state?.error;

  /* =========================================================
     NO RESULT
     ========================================================= */

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
          <div className="wp-rship-bridge">
            <b /><b /><b />
          </div>
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

          <div className="wp-route-empty__icon">
            ⚓
          </div>

          <p className="wp-eyebrow">
            Route Intelligence
          </p>

          <h1>
            No route analysis found
          </h1>

          <p>
            Start by selecting an origin and destination
            from the route planner.
          </p>

          <button
            type="button"
            className="wp-btn wp-btn--primary"
            onClick={() => navigate("/")}
          >
            ← Back to route planner
          </button>

        </div>

      </main>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error) {
    return (
      <main className="wp-page wp-route-results">

        <div className="wp-route-empty wp-route-empty--error">

          <div className="wp-route-empty__icon">
            ⚠
          </div>

          <div className="wp-route-status">
            <span />
            LIVE ROUTE ANALYSIS
          </div>

          <p className="wp-eyebrow">
            Route Analysis
          </p>

          <h1>
            No routes found
          </h1>

          <p>
            {typeof error === "string"
              ? error
              : "Unable to find a route for the selected ports."}
          </p>

          <button
            type="button"
            className="wp-btn wp-btn--primary"
            onClick={() => navigate("/")}
          >
            Try another route
          </button>

        </div>

      </main>
    );
  }

  /* =========================================================
     ROUTES
     ========================================================= */

  const routes = Array.isArray(result.available_routes)
    ? result.available_routes
    : [];

  /*
   * Backend:
   *
   * recommended_route: "R0010"
   *
   * So we normalize it into an ID.
   */

  const recommendedRouteId =
    typeof result.recommended_route === "string"
      ? result.recommended_route
      : result.recommended_route?.route_id || null;

  /*
   * Find the complete best-route object.
   */

  const recommendedRoute =
    routes.find(
      (route) =>
        route.route_id === recommendedRouteId
    ) ||
    (
      typeof result.recommended_route === "object"
        ? result.recommended_route
        : null
    );

  /* =========================================================
     SELECT ROUTE
     ========================================================= */

  const handleSelectRoute = (route) => {

    if (!route) {
      return;
    }

    navigate("/quotation", {
      state: {
        route,
        result,
      },
    });
  };

  /* =========================================================
     FORMAT MONEY
     ========================================================= */

  const formatMoney = (value) => {

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "—";
    }

    return `$${number.toLocaleString()}`;
  };

  /* =========================================================
     FORMAT NUMBER
     ========================================================= */

  const formatNumber = (value) => {

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "—";
    }

    return number.toLocaleString();
  };

  /* =========================================================
     ROUTE PATH
     ========================================================= */

  const getRoutePath = (route) => {

    if (
      Array.isArray(route.route_path) &&
      route.route_path.length > 0
    ) {
      return route.route_path.join(" → ");
    }

    if (route.route_display) {
      return route.route_display;
    }

    if (
      route.origin &&
      route.destination
    ) {
      return `${route.origin} → ${route.destination}`;
    }

    return route.route_id || "Route";
  };

  /* =========================================================
     ROUTE CARD
     ========================================================= */

  const renderRouteCard = (route, index) => {

    const isBest =
      route.is_best === true ||
      route.route_id === recommendedRouteId;

    const score = Number(route.score);

    const scoreValue =
      Number.isFinite(score)
        ? Math.max(0, Math.min(100, score))
        : 0;

    return (
      <article
        key={`${route.route_id}-${index}`}
        className={`wp-route-card ${
          isBest
            ? "wp-route-card--best"
            : ""
        }`}
      >

        {/* =================================================
            CARD HEADER
            ================================================= */}

        <div className="wp-route-card__top">

          <div>

            <span className="wp-route-card__number">
              Option #{index + 1}
            </span>

            <h3 className="wp-route-card__title">
              {getRoutePath(route)}
            </h3>

          </div>

          {isBest && (
            <span className="wp-route-card__best">
              ★ BEST ROUTE
            </span>
          )}

        </div>


        {/* =================================================
            ROUTE TYPE
            ================================================= */}

        <div className="wp-route-card__type">
          {route.route_type || "Maritime Route"}
        </div>


        {/* =================================================
            SCORE
            ================================================= */}

        <div className="wp-route-card__score">

          <div className="wp-route-card__score-row">

            <span className="wp-route-card__score-label">
              Route Score
            </span>

            <strong className="wp-route-card__score-number">
              {Number.isFinite(score)
                ? score.toFixed(1)
                : "—"}
            </strong>

          </div>

          <div className="wp-score-bar">

            <span
              style={{
                width: `${scoreValue}%`,
              }}
            />

          </div>

        </div>


        {/* =================================================
            ROUTE PATH
            ================================================= */}

        <div className="wp-route-card__path">

          <span>
            {getRoutePath(route)}
          </span>

        </div>


        {/* =================================================
            STATS
            ================================================= */}

        <div className="wp-route-card__stats">

          {/* TRANSIT DAYS */}

          <div className="wp-route-card__stat">

            <span className="wp-route-card__stat-label">
              Transit Days
            </span>

            <strong className="wp-route-card__stat-value">
              {route.transit_days != null
                ? `${route.transit_days} days`
                : "—"}
            </strong>

          </div>


          {/* DISTANCE */}

          <div className="wp-route-card__stat">

            <span className="wp-route-card__stat-label">
              Nautical Miles
            </span>

            <strong className="wp-route-card__stat-value">
              {formatNumber(
                route.distance_nm
              )}
              {" NM"}
            </strong>

          </div>


          {/* TRANSSHIPMENTS */}

          <div className="wp-route-card__stat">

            <span className="wp-route-card__stat-label">
              Transshipments
            </span>

            <strong className="wp-route-card__stat-value">
              {route.transshipments != null
                ? route.transshipments
                : "—"}
            </strong>

          </div>


          {/* FREIGHT */}

          <div className="wp-route-card__stat">

            <span className="wp-route-card__stat-label">
              Freight / Container
            </span>

            <strong className="wp-route-card__stat-value">
              {formatMoney(
                route.base_freight_usd
              )}
            </strong>

          </div>

        </div>


        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="wp-route-card__footer">

          <div className="wp-route-card__price">

            <small>
              Estimated shipment cost
            </small>

            {formatMoney(
              route.estimated_total_usd
            )}

          </div>


          <button
            type="button"
            className="wp-route-card__button"
            onClick={() =>
              handleSelectRoute(route)
            }
          >
            Select Route →
          </button>

        </div>

      </article>
    );
  };


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <main className="wp-page wp-route-results">

      {/* =====================================================
          BACK
          ===================================================== */}

      <div className="wp-page__back wp-route-back">

        <button
          type="button"
          onClick={() => navigate("/")}
        >
          ← Back to Waypoint
        </button>

      </div>


      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="wp-results-header wp-route-hero-header">

        <div>

          <p className="wp-eyebrow">
            Route Analysis
          </p>

          <h1>
            {result.origin}
            <span> → </span>
            {result.destination}
          </h1>

          <p className="wp-route-header-meta">
            <span>{result.cargo_type || "Containerized Cargo"}</span>
            <i />
            <span>{result.containers || 0} TEU</span>
            <i />
            <span>{routes.length} available options</span>
          </p>

        </div>

      </section>


      {/* =====================================================
          RECOMMENDED ROUTE
          ===================================================== */}

      {recommendedRoute && (

        <section className="wp-best-route wp-best-route--cinematic">

          <div>

            <span className="wp-eyebrow">
              Recommended Route
            </span>

            <div className="wp-best-route__badge">
              <span>★</span> TOP RECOMMENDATION
            </div>

            <h2 className="wp-best-route__route">
              {getRoutePath(recommendedRoute)}
            </h2>

            <p>
              {result.reason ||
                "Recommended based on the highest combined route score considering transit time, distance and transshipments."}
            </p>


            {/* BEST ROUTE METRICS */}

            <div className="wp-best-route__score-orb">
              <span>ROUTE SCORE</span>
              <strong>
                {Number.isFinite(Number(recommendedRoute.score))
                  ? Number(recommendedRoute.score).toFixed(1)
                  : "—"}
              </strong>
            </div>

            <div className="wp-best-route__meta">

              <span>
                🚢{" "}
                {recommendedRoute.route_type ||
                  "Maritime Route"}
              </span>

              <span>
                ⏱{" "}
                {recommendedRoute.transit_days ??
                  "—"}
                {" days"}
              </span>

              <span>
                📏{" "}
                {formatNumber(
                  recommendedRoute.distance_nm
                )}
                {" NM"}
              </span>

              <span>
                💰{" "}
                {formatMoney(
                  recommendedRoute.base_freight_usd
                )}
              </span>

            </div>

          </div>


          <button
            type="button"
            className="wp-btn wp-btn--primary"
            onClick={
              () =>
                handleSelectRoute(
                  recommendedRoute
                )
            }
          >
            Request quotation →
          </button>

        </section>

      )}


      {/* =====================================================
          ALL ROUTES
          ===================================================== */}

      <section className="wp-comparison wp-route-comparison">

        <div className="wp-comparison__heading">

          <div>

            <p className="wp-eyebrow">
              Available Routes
            </p>

            <h2>
              Compare every option
            </h2>

          </div>


          <span className="wp-comparison__count">

            {routes.length}

            {" "}

            {routes.length === 1
              ? "route"
              : "routes"}

            {" found"}

          </span>

        </div>


        <p className="wp-comparison__description">
          The recommended route is selected after
          comparing the available maritime options.
        </p>


        {/* =================================================
            ROUTE CARDS
            ================================================= */}

        {routes.length > 0 ? (

          <>
            <div className="wp-route-network-line" aria-hidden="true">
              <span />
              <span />
              <span />
              <small>COMPARING AVAILABLE MARITIME OPTIONS</small>
            </div>

            <div className="wp-route-grid">

              {routes.map(
                (route, index) =>
                  renderRouteCard(
                    route,
                    index
                  )
              )}
            </div>
          </>
        ) : (

          <div className="wp-empty">

            <span>⚓</span>

            <h3>
              No available routes
            </h3>

            <p>
              No maritime route options were
              returned for this route.
            </p>

          </div>

        )}

      </section>

    </main>
  );
}

export default RouteResults;