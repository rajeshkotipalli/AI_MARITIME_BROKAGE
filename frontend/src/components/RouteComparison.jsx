import RouteCard from "./RouteCard";

function RouteComparison({
  routes = [],
  recommendedRoute,
  onSelect,
}) {

  const recommendedId =
    typeof recommendedRoute === "string"
      ? recommendedRoute
      : recommendedRoute?.route_id;


  if (!routes.length) {
    return (
      <div className="wp-route-empty">

        <span>⚓</span>

        <h3>
          No routes available
        </h3>

        <p>
          The route agent did not return
          any available routes.
        </p>

      </div>
    );
  }


  return (
    <section className="wp-route-comparison">

      <div className="wp-routes-heading">

        <div>

          <p className="wp-eyebrow">
            Available routes
          </p>

          <h2>
            Compare every option
          </h2>

          <p>
            The recommended route is selected
            after comparing the available
            maritime options.
          </p>

        </div>


        <div className="wp-route-total">

          <strong>
            {routes.length}
          </strong>

          <span>
            routes found
          </span>

        </div>

      </div>


      <div className="wp-routes-list">

        {routes.map((route, index) => {

          const routeId =
            route?.route_id;

          const isBest =
            routeId ===
            recommendedId;


          return (
            <RouteCard
              key={
                routeId ||
                `route-${index}`
              }
              route={route}
              index={index}
              isBest={isBest}
              onSelect={onSelect}
            />
          );

        })}

      </div>

    </section>
  );
}

export default RouteComparison;