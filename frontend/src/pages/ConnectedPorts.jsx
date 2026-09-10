import {
  useEffect,
  useState,
} from "react";
import "./ConnectedPorts.css";
import {
  ORIGIN_PORTS,
} from "../data/ports";

import PortCard from "../components/PortCard";


function ConnectedPorts() {

  const [origin, setOrigin] =
    useState(
      ORIGIN_PORTS[0] ||
      "Chennai"
    );

  const [connections, setConnections] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // -------------------------------------------------
  // LOAD CONNECTED PORTS FROM BACKEND
  // -------------------------------------------------

  useEffect(() => {

    const fetchConnections = async () => {

      setLoading(true);
      setError("");

      try {

        const token =
          localStorage.getItem(
            "waypoint_token"
          ) ||
          localStorage.getItem(
            "token"
          );

        const backendUrl =
          "http://127.0.0.1:8000";

        const response =
          await fetch(
            `${backendUrl}/api/ports/connections?origin=${encodeURIComponent(origin)}`,
            {
              method: "GET",

              headers: token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {},
            }
          );


        if (!response.ok) {

          throw new Error(
            `Server returned ${response.status}`
          );

        }


        const data =
          await response.json();


        console.log(
          "Connected ports API response:",
          data
        );


        if (
          data.status === "success"
        ) {

          setConnections(
            data.connections || []
          );

        } else {

          setConnections([]);

          setError(
            data.message ||
            "Could not load connected ports."
          );

        }

      } catch (err) {

        console.error(
          "Connected ports error:",
          err
        );

        setConnections([]);

        setError(
          "Unable to connect to the backend. Make sure FastAPI is running."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchConnections();

  }, [origin]);


  // -------------------------------------------------
  // TOTAL ROUTES
  // -------------------------------------------------

  const totalRoutes =
    connections.reduce(
      (
        total,
        connection
      ) =>
        total +
        Number(
          connection.route_count ||
          connection.total_routes ||
          (
            connection.routes
              ?.length || 0
          )
        ),
      0
    );


  return (

    <main className="wp-page wp-connected-ports wp-connected-ports-cinematic">

      {/* Cinematic network atmosphere */}
      <div className="wp-ports-scene" aria-hidden="true">
        <div className="wp-ports-stars" />
        <div className="wp-ports-orbit wp-ports-orbit--one" />
        <div className="wp-ports-orbit wp-ports-orbit--two" />

        <div className="wp-ports-globe">
          <div className="wp-ports-globe-grid" />
          <span className="wp-port-node wp-port-node--one" />
          <span className="wp-port-node wp-port-node--two" />
          <span className="wp-port-node wp-port-node--three" />
          <span className="wp-port-node wp-port-node--four" />
          <span className="wp-port-node wp-port-node--five" />

          <i className="wp-port-route wp-port-route--one" />
          <i className="wp-port-route wp-port-route--two" />
          <i className="wp-port-route wp-port-route--three" />
        </div>

        <div className="wp-ports-wave wp-ports-wave--one" />
        <div className="wp-ports-wave wp-ports-wave--two" />

        <div className="wp-ports-ship">
          <span className="wp-ports-ship__body" />
          <span className="wp-ports-ship__deck" />
          <span className="wp-ports-ship__stack" />
          <span className="wp-ports-ship__light" />
        </div>
      </div>


      {/* --------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* --------------------------------------------- */}

      <section className="wp-page-header">

        <div className="wp-ports-live">
          <span className="wp-ports-live__dot" />
          LIVE PORT NETWORK
        </div>

        <p className="wp-eyebrow">
          Global maritime network
        </p>

        <h1>
          Connected ports
        </h1>

        <p>
          Explore destinations available
          from each origin in the
          Waypoint network.
        </p>

        <div className="wp-ports-header-meta">
          <span>PORT CONNECTIVITY</span>
          <span>ROUTE DISCOVERY</span>
          <span>NETWORK INTELLIGENCE</span>
        </div>

      </section>


      {/* --------------------------------------------- */}
      {/* ORIGIN SELECTOR */}
      {/* --------------------------------------------- */}

      <section className="wp-port-selector">

        <div className="wp-selector-copy">
          <span className="wp-selector-kicker">
            ORIGIN NODE
          </span>

          <label>
            Select origin port
          </label>
        </div>

        <select
          value={origin}
          onChange={(e) =>
            setOrigin(
              e.target.value
            )
          }
        >

          {ORIGIN_PORTS.map(
            (port) => (

              <option
                key={port}
                value={port}
              >
                {port}
              </option>

            )
          )}

        </select>

        <span className="wp-selector-status">
          NETWORK LINK ACTIVE
        </span>

      </section>


      {/* --------------------------------------------- */}
      {/* RESULTS */}
      {/* --------------------------------------------- */}

      <section className="wp-connected-results">

        <div className="wp-routes-heading">

          <div>

            <p className="wp-eyebrow">
              Network connections
            </p>

            <h2>
              Routes from{" "}
              {origin}
            </h2>

          </div>


          <span className="wp-route-total">

            {loading
              ? "Loading..."
              : `${connections.length} destinations`
            }

          </span>

        </div>


        {/* ------------------------------------------- */}
        {/* ERROR */}
        {/* ------------------------------------------- */}

        {error && (

          <div
            className="wp-error-message"
            style={{
              padding: "16px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 80, 80, 0.4)",
            }}
          >

            {error}

          </div>

        )}


        {/* ------------------------------------------- */}
        {/* LOADING */}
        {/* ------------------------------------------- */}

        {/* ------------------------------------------- */}
        {/* PORT CARDS */}
        {/* ------------------------------------------- */}

        {connections.length > 0 && (

            <div className={`wp-port-grid ${loading ? "wp-port-grid--loading" : ""}`}>

              {connections.map(
                (connection) => {

                  const routeCount =
                    Number(
                      connection.route_count ||
                      connection.total_routes ||
                      (
                        connection.routes
                          ?.length || 0
                      )
                    );


                  return (

                    <PortCard
                      key={
                        `${origin}-${connection.destination}`
                      }

                      origin={
                        origin
                      }

                      destination={
                        connection.destination
                      }

                      routeCount={
                        routeCount
                      }

                    />

                  );

                }
              )}

            </div>

          )}

        {loading && (
          <div className="wp-ports-loading" aria-live="polite">
            <span className="wp-loading-ring" />
            <span>Updating port network...</span>
          </div>
        )}


        {/* ------------------------------------------- */}
        {/* NO CONNECTIONS */}
        {/* ------------------------------------------- */}

        {!loading &&
          !error &&
          connections.length === 0 && (

            <div
              className="wp-ports-empty"
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >

              <div className="wp-empty-anchor">
                ⚓
              </div>

              <h3>
                No connected ports found
              </h3>

              <p>
                There are currently no
                routes available from{" "}
                {origin}.
              </p>

            </div>

          )}

      </section>


      {/* --------------------------------------------- */}
      {/* ROUTE SUMMARY */}
      {/* --------------------------------------------- */}

      {!loading &&
        connections.length > 0 && (

          <section
            className="wp-ports-network-summary"
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "16px",
            }}
          >

            <div className="wp-summary-signal">
              <span />
              NETWORK STATUS · CONNECTED
            </div>

            <strong>
              Network summary
            </strong>

            <p>
              {connections.length} connected
              destinations with{" "}
              {totalRoutes} available routes
              from {origin}.
            </p>

            <div className="wp-summary-metrics">
              <div>
                <span>DESTINATIONS</span>
                <strong>{connections.length}</strong>
              </div>

              <div>
                <span>AVAILABLE ROUTES</span>
                <strong>{totalRoutes}</strong>
              </div>

              <div>
                <span>ORIGIN NODE</span>
                <strong>{origin}</strong>
              </div>
            </div>

          </section>

        )}

    </main>

  );

}


export default ConnectedPorts;
