import { useMemo } from "react";

function RouteCard({
  route,
  index,
  isBest,
  onSelect,
}) {

  const score = Number(
    route?.score ?? route?.route_score ?? 0
  );

  const freight = Number(
    route?.base_freight_usd ?? 0
  );

  const totalFreight = Number(
    route?.estimated_total_freight_usd ??
    freight * Number(route?.containers || 1)
  );

  const scoreWidth = useMemo(() => {
    return Math.min(
      Math.max(score, 0),
      100
    );
  }, [score]);


  return (
    <article
      className={`wp-route-card ${
        isBest
          ? "wp-route-card--best"
          : ""
      }`}
    >

      {/* HEADER */}

      <div className="wp-route-card__top">

        <div>

          <span className="wp-route-number">
            OPTION #{index + 1}
          </span>

          <h3>
            {route?.route_id ||
              `Route ${index + 1}`}
          </h3>

        </div>


        {isBest && (
          <span className="wp-best-label">
            ★ BEST ROUTE
          </span>
        )}

      </div>


      {/* SCORE */}

      <div className="wp-route-card__score">

        <div className="wp-route-card__score-info">

          <span>
            Route score
          </span>

          <strong>
            {score > 0
              ? score.toFixed(1)
              : "—"}
          </strong>

        </div>

        <div className="wp-route-card__scorebar">

          <div
            className="wp-route-card__scorefill"
            style={{
              width: `${scoreWidth}%`,
            }}
          />

        </div>

      </div>


      {/* TYPE */}

      <div className="wp-route-card__type">

        {route?.route_type ||
          "Standard maritime route"}

      </div>


      {/* STATS */}

      <div className="wp-route-card__stats">

        <div className="wp-stat">

          <span className="wp-stat__value">
            {route?.transit_time_days ?? "—"}
          </span>

          <span className="wp-stat__label">
            Transit days
          </span>

        </div>


        <div className="wp-stat">

          <span className="wp-stat__value">

            {route?.distance_nm
              ? Number(
                  route.distance_nm
                ).toLocaleString()
              : "—"}

          </span>

          <span className="wp-stat__label">
            Nautical miles
          </span>

        </div>


        <div className="wp-stat">

          <span className="wp-stat__value">
            {route?.transshipments ?? "—"}
          </span>

          <span className="wp-stat__label">
            Transshipments
          </span>

        </div>


        <div className="wp-stat">

          <span className="wp-stat__value">

            {freight
              ? `$${freight.toLocaleString()}`
              : "—"}

          </span>

          <span className="wp-stat__label">
            / container
          </span>

        </div>

      </div>


      {/* FOOTER */}

      <div className="wp-route-card__footer">

        <div>

          <span>
            Estimated shipment cost
          </span>

          <strong>

            {totalFreight
              ? `$${totalFreight.toLocaleString()}`
              : "—"}

          </strong>

        </div>


        {onSelect && (
          <button
            type="button"
            onClick={() =>
              onSelect(route)
            }
            className={
              isBest
                ? "wp-route-select wp-route-select--best"
                : "wp-route-select"
            }
          >
            Select route
          </button>
        )}

      </div>

    </article>
  );
}

export default RouteCard;