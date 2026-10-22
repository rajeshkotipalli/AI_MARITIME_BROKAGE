import { useState } from "react";

import "./Customs.css";



const CARGO_TYPES = [

  "Electronics",

  "Textiles",

  "Machinery",

  "Food Products",

  "Automotive Parts",

  "Chemicals",

  "Pharmaceuticals",

  "General Cargo",

];



function Customs() {

  const [origin, setOrigin] = useState("");

  const [destination, setDestination] = useState("");

  const [cargoType, setCargoType] = useState("Electronics");

  const [containers, setContainers] = useState(1);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");



  const analyzeCustoms = async () => {

    setError("");

    setResult(null);



    if (!origin.trim() || !destination.trim()) {

      setError("Enter both origin and destination ports.");

      return;

    }



    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {

      setError("Origin and destination cannot be the same.");

      return;

    }



    setLoading(true);



    try {

      const params = new URLSearchParams({

        origin: origin.trim(),

        destination: destination.trim(),

        cargo_type: cargoType,

        containers: String(Math.max(1, Number(containers) || 1)),

      });



      const response = await fetch(

        `http://127.0.0.1:8000/api/customs/analyze?${params.toString()}`

      );



      const data = await response.json();



      if (!response.ok) {

        throw new Error(

          data?.detail?.message ||

            data?.detail ||

            "Customs analysis failed."

        );

      }



      setResult(data);

    } catch (err) {

      setError(err.message || "Unable to connect to Customs Agent.");

    } finally {

      setLoading(false);

    }

  };



  const customsData = result?.customs || {};
  const riskData = result?.risk || {};

  const riskValue = String(
    riskData?.risk_level ??
      customsData?.compliance_risk ??
      "—"
  );

  const riskScore = riskData?.risk_score ?? null;

  const inspection =
    customsData?.inspection_probability_percent ??
    customsData?.inspection_probability ??
    "—";

  const clearance =
    customsData?.estimated_clearance_days ??
    customsData?.clearance_estimate_days ??
    "—";

  const documents = Array.isArray(customsData?.required_documents)
    ? customsData.required_documents
    : [];

  const complianceNote =
    customsData?.special_requirements ||
    "Review destination-country customs requirements before shipment release.";

  const destinationCountry =
    customsData?.destination_country || "—";

  const documentationLevel =
    customsData?.documentation_level || "—";



  const normalizedRisk = riskValue.toLowerCase();

  const riskClass = normalizedRisk.includes("high")

    ? "high"

    : normalizedRisk.includes("medium")

      ? "medium"

      : normalizedRisk.includes("low")

        ? "low"

        : "neutral";



  return (

    <main className="customs-page">

      <div className="customs-noise" />



      <section className="customs-hero">

        <div className="hero-copy">

          <div className="eyebrow">

            <span className="eyebrow-dot" /> WAYPOINT AI / INTELLIGENCE LAYER

          </div>

          <h1>

            Customs <span>Intelligence</span>

          </h1>

          <p>

            Predict compliance exposure, inspection risk and clearance

            conditions before your cargo moves.

          </p>

        </div>



        <div className="hero-badge">

          <span className="badge-orbit orbit-one" />

          <span className="badge-orbit orbit-two" />

          <span className="badge-core">✦</span>

          <div>

            <strong>CUSTOMS AGENT</strong>

            <small>READY FOR ANALYSIS</small>

          </div>

        </div>

      </section>



      <section className="customs-workspace">

        <div className="shipment-card glass-card">

          <div className="card-heading">

            <div>

              <span className="section-kicker">SHIPMENT PROFILE</span>

              <h2>Analyze a Shipment</h2>

            </div>

            <span className="live-chip">

              <i /> LIVE

            </span>

          </div>



          <div className="route-line">

            <div className="route-node">

              <span className="node-dot" />

              <div>

                <small>ORIGIN</small>

                <strong>{origin || "Departure Port"}</strong>

              </div>

            </div>

            <div className="route-track">

              <span />

              <span />

              <span />

            </div>

            <div className="route-node destination">

              <span className="node-dot" />

              <div>

                <small>DESTINATION</small>

                <strong>{destination || "Arrival Port"}</strong>

              </div>

            </div>

          </div>



          <div className="form-grid">

            <label>

              <span>Origin Port</span>

              <input

                value={origin}

                onChange={(e) => setOrigin(e.target.value)}

                placeholder="e.g. Chennai"

              />

            </label>



            <label>

              <span>Destination Port</span>

              <input

                value={destination}

                onChange={(e) => setDestination(e.target.value)}

                placeholder="e.g. Rotterdam"

              />

            </label>



            <label>

              <span>Cargo Type</span>

              <select

                value={cargoType}

                onChange={(e) => setCargoType(e.target.value)}

              >

                {CARGO_TYPES.map((type) => (

                  <option key={type} value={type}>

                    {type}

                  </option>

                ))}

              </select>

            </label>



            <label>

              <span>Containers</span>

              <input

                type="number"

                min="1"

                value={containers}

                onChange={(e) => setContainers(e.target.value)}

              />

            </label>

          </div>



          {error && <div className="error-box">{error}</div>}



          <button

            className="analyze-button"

            onClick={analyzeCustoms}

            disabled={loading}

          >

            <span className="button-icon">✦</span>

            {loading ? "ANALYZING SHIPMENT..." : "RUN CUSTOMS ANALYSIS"}

            <span className="button-arrow">→</span>

          </button>

        </div>



        <div className="visual-card glass-card">

          <div className="visual-label">

            <span>3D CARGO RISK MODEL</span>

            <span>WAYPOINT / CX-01</span>

          </div>



          <div className="scene">

            <div className="scene-glow glow-a" />

            <div className="scene-glow glow-b" />



            <div className="radar-ring ring-a" />

            <div className="radar-ring ring-b" />

            <div className="radar-ring ring-c" />



            <div className="ship-3d">

              <div className="ship-top" />

              <div className="ship-body">

                <div className="ship-window w1" />

                <div className="ship-window w2" />

                <div className="ship-window w3" />

                <div className="ship-container c1" />

                <div className="ship-container c2" />

                <div className="ship-container c3" />

              </div>

              <div className="ship-keel" />

            </div>



            <div className="orbit orbit-main">

              <span className="orbit-dot" />

            </div>

            <div className="orbit orbit-small">

              <span className="orbit-dot" />

            </div>



            <div className="scene-data data-top">

              <span>COMPLIANCE ENGINE</span>

              <strong>ACTIVE</strong>

            </div>

            <div className="scene-data data-bottom">

              <span>ANALYSIS MODE</span>

              <strong>PRE-CLEARANCE</strong>

            </div>

          </div>



          <div className="visual-footer">

            <div>

              <span className="footer-icon">◇</span>

              <div>

                <strong>Intelligent Screening</strong>

                <small>Rules + cargo + route context</small>

              </div>

            </div>

            <div className="footer-status">

              <i /> Agent online

            </div>

          </div>

        </div>

      </section>



      {result && (

        <section className="results-section">

          <div className="results-heading">

            <div>

              <span className="section-kicker">AGENT OUTPUT</span>

              <h2>Customs Risk Assessment</h2>

            </div>

            <span className={`risk-pill ${riskClass}`}>

              {riskValue || "ASSESSED"}

            </span>

          </div>



          <div className="metrics-grid">

            <article className="metric-card metric-risk">

              <span>01 / CUSTOMS RISK</span>

              <strong>{riskValue || "—"}</strong>

              <small>
                Overall compliance exposure
                {riskScore !== null ? ` • Score ${riskScore}/100` : ""}
              </small>

            </article>

            <article className="metric-card">

              <span>02 / INSPECTION</span>

              <strong>

                {typeof inspection === "number" ? `${inspection}%` : inspection}

              </strong>

              <small>Estimated inspection probability</small>

            </article>

            <article className="metric-card">

              <span>03 / CLEARANCE</span>

              <strong>

                {Array.isArray(clearance)

                  ? `${clearance[0]}–${clearance[1]} days`

                  : typeof clearance === "number"

                    ? `${clearance} days`

                    : clearance}

              </strong>

              <small>Estimated clearance window</small>

            </article>

            <article className="metric-card">

              <span>04 / CARGO</span>

              <strong>{cargoType}</strong>

              <small>{containers} container(s)</small>

            </article>

          </div>



          <div className="intelligence-grid">

            <article className="info-card documents-card">

              <div className="info-title">

                <span>DOCUMENT CONTROL</span>

                <b>{documents.length}</b>

              </div>

              {documents.length ? (

                <ul>

                  {documents.map((doc, index) => (

                    <li key={`${doc}-${index}`}>

                      <span>✓</span> {String(doc)}

                    </li>

                  ))}

                </ul>

              ) : (

                <p>No document list was returned by the agent.</p>

              )}

            </article>



            <article className="info-card compliance-card">

              <div className="info-title">

                <span>COMPLIANCE INTELLIGENCE</span>

                <b>AI</b>

              </div>

              <p>{complianceNote}</p>

              <div className="route-summary">
                <span>{destinationCountry}</span>
                <b>•</b>
                <span>{documentationLevel}</span>
              </div>

              <div className="route-summary">

                <span>{origin}</span>

                <b>→</b>

                <span>{destination}</span>

              </div>

            </article>

          </div>

        </section>

      )}

    </main>

  );

}



export default Customs;
