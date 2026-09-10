function PortCard({
  origin,
  destination,
  routeCount,
  onViewRoutes,
}) {
  return (
    <article className="wp-port-card">

      <div className="wp-port-card__icon">
        ⚓
      </div>

      <div className="wp-port-card__content">

        <span className="wp-port-card__label">
          Connected destination
        </span>

        <h3>
          {destination}
        </h3>

        <p>
          From {origin}
        </p>

      </div>


      <div className="wp-port-card__footer">

        <span>

          {routeCount || 0}
          {" "}
          available route
          {routeCount === 1
            ? ""
            : "s"}

        </span>


        {onViewRoutes && (
          <button
            type="button"
            onClick={onViewRoutes}
          >
            View routes →
          </button>
        )}

      </div>

    </article>
  );
}

export default PortCard;