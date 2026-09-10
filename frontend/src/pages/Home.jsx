import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartCanvas from "../ChartCanvas";
import {
  ORIGIN_PORTS,
  DEST_PORTS,
  CARGO_TYPES,
} from "../data/ports";
import "./Home.css";

const API_ROOT = "http://127.0.0.1:8000";

function Home() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("Chennai");
  const [destination, setDestination] = useState("Rotterdam");
  const [cargoType, setCargoType] = useState(CARGO_TYPES[1]);
  const [containers, setContainers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const samePort =
    origin.toLowerCase() === destination.toLowerCase();

  async function handlePlotRoute(e) {
    e.preventDefault();
    setError("");

    if (samePort) {
      setError("Origin and destination cannot be the same.");
      return;
    }

    if (!containers || Number(containers) <= 0) {
      setError("Enter a valid number of containers.");
      return;
    }

    const token = localStorage.getItem("waypoint_token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_ROOT}/api/routes/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            origin: origin.trim(),
            destination: destination.trim(),
            cargo_type: cargoType,
            containers: Number(containers),
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response received from server.");
      }

      if (response.status === 401) {
        localStorage.removeItem("waypoint_token");
        localStorage.removeItem("waypoint_user");
        window.location.href = "/";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail?.message ||
            data?.message ||
            "Route analysis failed."
        );
      }

      const routeData = data?.data || data;

      if (routeData.status === "not_found") {
        navigate("/routes", {
          state: {
            error: routeData.message,
            origin,
            destination,
            cargoType,
            containers,
          },
        });
        return;
      }

      if (!Array.isArray(routeData.available_routes)) {
        throw new Error(
          "No available routes were returned by the backend."
        );
      }

      navigate("/routes", {
        state: {
          result: routeData,
        },
      });
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to connect to the route server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wp-home">
      <section className="wp-home-hero">
        <div className="wp-home-ambient wp-home-ambient--one" />
        <div className="wp-home-ambient wp-home-ambient--two" />
        <div className="wp-home-stars" />

        <div className="wp-home-ocean">
          <div className="wp-home-globe">
            <span className="wp-globe-line wp-globe-line--one" />
            <span className="wp-globe-line wp-globe-line--two" />
            <span className="wp-globe-line wp-globe-line--three" />
            <span className="wp-globe-dot wp-globe-dot--chennai" />
            <span className="wp-globe-dot wp-globe-dot--rotterdam" />
            <span className="wp-globe-route" />
          </div>

          <div className="wp-home-route-label wp-home-route-label--chennai">
            <span>⚓</span> Chennai
          </div>

          <div className="wp-home-route-label wp-home-route-label--rotterdam">
            <span>⚓</span> Rotterdam
          </div>

          <div className="wp-home-ship" aria-hidden="true">
            <div className="wp-ship-smoke wp-ship-smoke--one" />
            <div className="wp-ship-smoke wp-ship-smoke--two" />
            <div className="wp-ship-top" />
            <div className="wp-ship-bridge">
              <span />
              <span />
              <span />
            </div>
            <div className="wp-ship-containers">
              <i /><i /><i /><i /><i /><i />
              <b /><b /><b /><b /><b />
            </div>
            <div className="wp-ship-deck" />
            <div className="wp-ship-hull">
              <strong>WAYPOINT</strong>
              <em>W</em>
            </div>
            <div className="wp-ship-water" />
          </div>

          <div className="wp-home-port-cranes" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>

        <div className="wp-home-hero-content">
          <div className="wp-home-kicker">
            <span className="wp-kicker-dot" />
            GLOBAL MARITIME INTELLIGENCE
          </div>

          <h1 className="wp-home-title">
            Navigate a
            <br />
            <span>Smarter Tomorrow.</span>
          </h1>

          <p className="wp-home-description">
            Waypoint combines real-world maritime data, route
            intelligence and weather conditions to help you find
            safer, faster and more efficient shipping routes.
          </p>

          <div className="wp-home-features">
            <div className="wp-home-feature">
              <span className="wp-feature-icon">⚓</span>
              <div>
                <strong>Smarter Routes</strong>
                <small>Data-driven analysis</small>
              </div>
            </div>

            <div className="wp-home-feature">
              <span className="wp-feature-icon">◈</span>
              <div>
                <strong>Safer Journeys</strong>
                <small>Real-time weather</small>
              </div>
            </div>

            <div className="wp-home-feature">
              <span className="wp-feature-icon">↗</span>
              <div>
                <strong>Better Decisions</strong>
                <small>Operational insights</small>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="wp-home-primary"
            onClick={() =>
              document
                .getElementById("route-planner")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Plot a route <span>→</span>
          </button>
        </div>

        <div className="wp-home-side-note">
          <span>OCEANS</span>
          <span>CONNECT</span>
          <span>OPPORTUNITIES</span>
          <i />
          <small>From ports to possibilities</small>
        </div>

        <div className="wp-home-chart-layer">
          <ChartCanvas
            origin={origin}
            destination={destination}
            status="idle"
          />
        </div>
      </section>

      <section id="route-planner" className="wp-home-planner">
        <div className="wp-planner-glow" />

        <div className="wp-planner-heading">
          <div>
            <p className="wp-home-section-kicker">ROUTE PLANNER</p>
            <h2>Find your maritime route</h2>
            <p>
              Enter your shipment details to compare every
              available route.
            </p>
          </div>

          <div className="wp-planner-orbit">
            <span>✦</span>
            <small>EXPLORE · COMPARE · SHIP SMARTER</small>
          </div>
        </div>

        <form
          className="wp-home-route-form"
          onSubmit={handlePlotRoute}
        >
          <div className="wp-home-field">
            <label>⚓ Load port</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              {ORIGIN_PORTS.map((port) => (
                <option key={port} value={port}>
                  {port}
                </option>
              ))}
            </select>
          </div>

          <div className="wp-home-field">
            <label>⚓ Discharge port</label>
            <select
              value={destination}
              onChange={(e) =>
                setDestination(e.target.value)
              }
            >
              {DEST_PORTS.map((port) => (
                <option key={port} value={port}>
                  {port}
                </option>
              ))}
            </select>
          </div>

          <div className="wp-home-field">
            <label>▣ Cargo type</label>
            <select
              value={cargoType}
              onChange={(e) =>
                setCargoType(e.target.value)
              }
            >
              {CARGO_TYPES.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
            </select>
          </div>

          <div className="wp-home-field">
            <label>▥ Containers (TEU)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={containers}
              onChange={(e) =>
                setContainers(e.target.value)
              }
            />
          </div>

          {error && (
            <div className="wp-home-form-error">
              <span>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="wp-home-submit"
            disabled={loading}
          >
            {loading ? "Analyzing routes..." : "Plot route"}
            <span>→</span>
          </button>
        </form>
      </section>

      <section className="wp-home-metrics">
        <div className="wp-home-metric">
          <span className="wp-metric-icon">⚓</span>
          <div>
            <strong>870+</strong>
            <small>Maritime Routes</small>
          </div>
          <b>LIVE DATA</b>
        </div>

        <div className="wp-home-metric">
          <span className="wp-metric-icon">◎</span>
          <div>
            <strong>180+</strong>
            <small>Connected Ports</small>
          </div>
          <b>NETWORK</b>
        </div>

        <div className="wp-home-metric">
          <span className="wp-metric-icon">☁</span>
          <div>
            <strong>24/7</strong>
            <small>Weather Intelligence</small>
          </div>
          <b>REAL TIME</b>
        </div>

        <div className="wp-home-metric">
          <span className="wp-metric-icon">◉</span>
          <div>
            <strong>Global</strong>
            <small>Maritime Coverage</small>
          </div>
          <b>CONNECTED</b>
        </div>
      </section>

      <div className="wp-home-bottom-line">
        <span>⚓ FROM PORTS TO POSSIBILITIES</span>
        <span>SAFER ROUTES&nbsp;&nbsp; | &nbsp;&nbsp;SMARTER DECISIONS&nbsp;&nbsp; | &nbsp;&nbsp;BRIGHTER HORIZONS</span>
      </div>
    </div>
  );
}

export default Home;
