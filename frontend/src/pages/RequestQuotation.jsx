import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RequestQuotation.css";

const API_URL = "http://127.0.0.1:8000";

function RequestQuotation() {
  const location = useLocation();
  const navigate = useNavigate();

  /* =====================================================
     ROUTE DATA
     ===================================================== */

  const route = location.state?.route || null;
  const result = location.state?.result || null;

  /*
    Support route data coming in different structures.
    This prevents the quotation page from breaking if
    RouteResults sends slightly different field names.
  */

  const origin =
    route?.origin ||
    result?.origin ||
    location.state?.origin ||
    "";

  const destination =
    route?.destination ||
    result?.destination ||
    location.state?.destination ||
    "";

  const routeId =
    route?.route_id ||
    route?.routeId ||
    result?.route_id ||
    result?.recommended_route ||
    location.state?.route_id ||
    "";

  const transitDays =
    route?.transit_days ??
    route?.transit_time_days ??
    result?.transit_days ??
    result?.transit_time_days ??
    "";

  const distance =
    route?.distance_nm ??
    result?.distance_nm ??
    "";

  const freight =
    route?.base_freight_usd ??
    route?.freight_usd ??
    result?.base_freight_usd ??
    result?.estimated_cost_usd ??
    "";

  const transshipments =
    route?.transshipments ??
    result?.transshipments ??
    "";

  const routeType =
    route?.route_type ||
    result?.route_type ||
    "Maritime Route";


  /* =====================================================
     FORM
     ===================================================== */

  const initialContainers =
    result?.containers ??
    route?.containers ??
    "";

  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    cargoWeight: "",
    containers: initialContainers,
    requirements: "",
  });


  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [quotations, setQuotations] =
    useState([]);

  const [loadingQuotations, setLoadingQuotations] =
    useState(false);

  // Holds the completed quotation returned/displayed after submission.
  // Pricing details come from the route-analysis result already passed
  // into this page, while the submitted request data comes from the form.
  const [finalQuotation, setFinalQuotation] = useState(null);


  /* =====================================================
     INPUT HANDLING
     ===================================================== */

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "containers") {

      if (value === "") {

        setForm((previous) => ({
          ...previous,
          containers: "",
        }));

        return;
      }

      const numberValue = Number(value);

      if (
        !Number.isNaN(numberValue) &&
        Number.isInteger(numberValue) &&
        numberValue >= 0
      ) {

        setForm((previous) => ({
          ...previous,
          containers: numberValue,
        }));

      }

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  /* =====================================================
     LOAD EXISTING QUOTATIONS
     ===================================================== */

  async function loadQuotations() {

    try {

      const token =
        localStorage.getItem(
          "waypoint_token"
        );

      if (!token) {
        return;
      }

      setLoadingQuotations(true);

      const response =
        await fetch(
          `${API_URL}/api/quotations`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
              Accept:
                "application/json",
            },
          }
        );

      if (response.status === 401) {

        localStorage.removeItem(
          "waypoint_token"
        );

        localStorage.removeItem(
          "waypoint_user"
        );

        navigate("/");

        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        return;
      }

      setQuotations(
        Array.isArray(data)
          ? data
          : data?.quotations || []
      );

    } catch (err) {

      console.error(
        "Quotation history error:",
        err
      );

    } finally {

      setLoadingQuotations(false);

    }
  }


  useEffect(() => {

    loadQuotations();

  }, []);


  /* =====================================================
     SUBMIT QUOTATION
     ===================================================== */

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setMessage("");


    /* -----------------------------------------------
       ROUTE VALIDATION
       ----------------------------------------------- */

    if (!origin || !destination) {

      setError(
        "Route information is missing. Please go back and select a route again."
      );

      return;
    }


    if (!routeId) {

      setError(
        "Route ID is missing. Please select a valid route again."
      );

      return;
    }


    /* -----------------------------------------------
       COMPANY VALIDATION
       ----------------------------------------------- */

    if (!form.companyName.trim()) {

      setError(
        "Please enter your company name."
      );

      return;
    }


    if (!form.email.trim()) {

      setError(
        "Please enter your email address."
      );

      return;
    }


    if (!form.phone.trim()) {

      setError(
        "Please enter your phone number."
      );

      return;
    }


    /* -----------------------------------------------
       CARGO WEIGHT
       ----------------------------------------------- */

    const cargoWeight =
      Number(form.cargoWeight);

    if (
      !form.cargoWeight ||
      Number.isNaN(cargoWeight) ||
      cargoWeight <= 0
    ) {

      setError(
        "Cargo weight must be greater than 0."
      );

      return;
    }


    /* -----------------------------------------------
       CONTAINERS
       ----------------------------------------------- */

    const containers =
      Number(form.containers);

    if (
      !form.containers ||
      Number.isNaN(containers) ||
      !Number.isInteger(containers) ||
      containers <= 0
    ) {

      setError(
        "Please enter a valid number of containers."
      );

      return;
    }


    /* -----------------------------------------------
       AUTHENTICATION
       ----------------------------------------------- */

    const token =
      localStorage.getItem(
        "waypoint_token"
      );

    if (!token) {

      setError(
        "Your session has expired. Please login again."
      );

      navigate("/");

      return;
    }


    setSubmitting(true);


    try {

      const response =
        await fetch(
          `${API_URL}/api/quotations`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({

              company_name:
                form.companyName.trim(),

              email:
                form.email.trim(),

              phone:
                form.phone.trim(),

              origin:
                origin,

              destination:
                destination,

              route_id:
                routeId,

              cargo_type:
                routeType,

              cargo_weight:
                cargoWeight,

              containers:
                containers,

              special_requirements:
                form.requirements.trim(),

            }),
          }
        );


      let data = {};

      try {

        data =
          await response.json();

      } catch {

        data = {};

      }


      /* -----------------------------------------------
         AUTH ERROR
         ----------------------------------------------- */

      if (
        response.status === 401
      ) {

        localStorage.removeItem(
          "waypoint_token"
        );

        localStorage.removeItem(
          "waypoint_user"
        );

        navigate("/");

        return;
      }


      /* -----------------------------------------------
         API ERROR
         ----------------------------------------------- */

      if (!response.ok) {

        let errorMessage =
          "Quotation request failed.";

        if (
          typeof data?.detail ===
          "string"
        ) {

          errorMessage =
            data.detail;

        } else if (
          data?.detail?.message
        ) {

          errorMessage =
            data.detail.message;

        } else if (
          data?.message
        ) {

          errorMessage =
            data.message;

        } else if (
          data?.error
        ) {

          errorMessage =
            data.error;

        }

        throw new Error(
          `${errorMessage} (HTTP ${response.status})`
        );
      }


      /* -----------------------------------------------
         SUCCESS
         ----------------------------------------------- */

      /*
        The backend returns a customer-safe pricing object.
        Internal operating cost, margin, profit and surcharge
        fields are intentionally not rendered or copied here.
      */

      const pricing = data?.pricing || {};
      const savedQuotation = data?.quotation || {};

      setFinalQuotation({
        id: savedQuotation.id,
        companyName: savedQuotation.company_name || form.companyName.trim(),
        origin: savedQuotation.origin || origin,
        destination: savedQuotation.destination || destination,
        route_id: savedQuotation.route_id || routeId,
        cargo_type:
          savedQuotation.cargo_type ||
          result?.cargo_type ||
          route?.cargo_type ||
          routeType,
        cargo_weight:
          savedQuotation.cargo_weight ?? cargoWeight,
        containers:
          savedQuotation.containers ?? containers,
        special_requirements:
          savedQuotation.special_requirements ??
          form.requirements.trim(),
        status:
          savedQuotation.status ||
          "Pending",
        created_at:
          savedQuotation.created_at || null,

        route_score:
          pricing.route_score ??
          result?.route_score ??
          route?.route_score,
        route_type:
          pricing.route_type ||
          result?.route_type ||
          routeType,
        transshipments:
          pricing.transshipments ??
          transshipments,
        transit_time_days:
          pricing.transit_time_days ??
          pricing.transit_days ??
          transitDays,
        distance_nm:
          pricing.distance_nm ??
          distance,

        final_selling_price_usd:
          pricing.final_selling_price_usd,
        total_customer_price_usd:
          pricing.total_customer_price_usd ??
          pricing.estimated_total_customer_price_usd,
      });

      setMessage("");

      /* Refresh quotation history */
      await loadQuotations();

    } catch (err) {

      console.error(
        "Quotation submission error:",
        err
      );

      setError(
        err?.message ||
        "Unable to submit quotation request."
      );

    } finally {

      setSubmitting(false);

    }
  }


  /* =====================================================
     NO ROUTE SELECTED
     ===================================================== */

  if (!origin || !destination) {

    return (

      <main className="wp-page wp-quotation-page wp-quotation-cinematic">

        <div className="wp-quotation-scene" aria-hidden="true">
          <div className="wp-quotation-stars" />
          <div className="wp-quotation-glow wp-quotation-glow--one" />
        </div>

        <section className="wp-quotation">

          <button
            type="button"
            className="wp-page__back"
            onClick={() =>
              navigate("/routes")
            }
          >
            ← Back to routes
          </button>


          <div className="wp-page-header">

            <span className="wp-eyebrow">
              FREIGHT BROKERAGE
            </span>

            <h1>
              No Route Selected
            </h1>

            <p>
              Please return to the route
              planner and select a route
              before requesting a quotation.
            </p>

          </div>


          <button
            type="button"
            className="wp-form-submit"
            onClick={() =>
              navigate("/routes")
            }
          >
            Select a Route →
          </button>

        </section>

      </main>

    );
  }


  /* =====================================================
     FINAL QUOTATION
     ===================================================== */

  if (finalQuotation) {
    const q = finalQuotation;

    const money = (value) => {
      if (value === undefined || value === null || value === "") {
        return "—";
      }

      return `$${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const totalCustomerPrice =
      q.total_customer_price_usd ??
      (
        Number(q.final_selling_price_usd || 0) *
        Number(q.containers || 0)
      );

    async function downloadQuotationPdf() {
      const token =
        localStorage.getItem("waypoint_token");

      if (!token || !q.id) {
        setError(
          "Quotation download is unavailable because the quotation ID is missing."
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/quotations/${q.id}/pdf`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/pdf",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to download the quotation PDF."
          );
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download =
          `waypoint_quotation_${q.id}.pdf`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);

      } catch (downloadError) {
        console.error(
          "Quotation PDF download error:",
          downloadError
        );

        setError(
          downloadError?.message ||
          "Unable to download the quotation PDF."
        );
      }
    }

    return (
      <main className="wp-page wp-quotation-page">
        <section
          className="wp-quotation"
          style={{
            maxWidth: "980px",
            margin: "0 auto",
          }}
        >
          <button
            type="button"
            className="wp-page__back"
            onClick={() => setFinalQuotation(null)}
          >
            ← Back to quotation request
          </button>

          <div className="wp-page-header wp-quotation-header">
            <div className="wp-quotation-live">
              <span />
              QUOTATION GENERATED
            </div>

            <span className="wp-eyebrow">
              FREIGHT BROKERAGE
            </span>

            <h1>Quotation Submitted</h1>

            <p>
              Your quotation request has been generated
              and submitted for brokerage review.
            </p>
          </div>

          {/* REQUEST STATUS */}
          <section className="wp-quotation-review-banner">
            <div>
              <span className="wp-eyebrow">
                REQUEST ID
              </span>

              <strong>
                #{q.id || "—"}
              </strong>
            </div>

            <div>
              <span className="wp-eyebrow">
                STATUS
              </span>

              <span
                className={`wp-quotation-status wp-quotation-status--${String(
                  q.status || "Pending"
                ).toLowerCase()}`}
              >
                {q.status || "Pending"}
              </span>
            </div>
          </section>

          {/* ROUTE SUMMARY */}
          <div
            className="wp-quotation-route wp-quotation-route--cinematic"
            style={{ marginBottom: "24px" }}
          >
            <span className="wp-eyebrow">
              RECOMMENDED ROUTE
            </span>

            <h2>
              {q.origin} {" → "} {q.destination}
            </h2>

            <div className="wp-quotation-route__meta">
              <span>
                Route: {q.route_id || "—"}
              </span>

              <span>
                Route Score:{" "}
                {q.route_score !== undefined &&
                q.route_score !== null
                  ? Number(q.route_score).toFixed(2)
                  : "—"}
              </span>

              <span>
                Transit:{" "}
                {q.transit_time_days !== undefined &&
                q.transit_time_days !== null
                  ? `${q.transit_time_days} days`
                  : "—"}
              </span>

              <span>
                Distance:{" "}
                {q.distance_nm !== undefined &&
                q.distance_nm !== null
                  ? `${Number(q.distance_nm).toLocaleString()} NM`
                  : "—"}
              </span>

              <span>
                Transshipments:{" "}
                {q.transshipments ?? "—"}
              </span>
            </div>
          </div>

          {/* SHIPMENT SUMMARY */}
          <section className="wp-form-section">
            <h3>SHIPMENT SUMMARY</h3>

            <div className="wp-form-two">
              <div>
                <strong>Company</strong>
                <p>{q.companyName || "—"}</p>
              </div>

              <div>
                <strong>Cargo Type</strong>
                <p>{q.cargo_type || "—"}</p>
              </div>

              <div>
                <strong>Cargo Weight</strong>
                <p>
                  {q.cargo_weight !== undefined &&
                  q.cargo_weight !== null
                    ? `${Number(
                        q.cargo_weight
                      ).toLocaleString()} kg`
                    : "—"}
                </p>
              </div>

              <div>
                <strong>Containers</strong>
                <p>{q.containers || "—"}</p>
              </div>
            </div>
          </section>

          {/* CUSTOMER-SAFE PRICE */}
          <section className="wp-customer-price-card">
            <span className="wp-eyebrow">
              FINAL CUSTOMER QUOTATION
            </span>

            <div className="wp-customer-price">
              {money(totalCustomerPrice)}
            </div>

            <p>
              Total quotation for{" "}
              {q.containers || "—"} container
              {Number(q.containers) === 1
                ? ""
                : "s"}
            </p>

            <div className="wp-price-note">
              Customer-facing quotation price only.
              Internal brokerage cost and margin data
              are restricted to the Admin Portal.
            </div>
          </section>

          {/* ACTIONS */}
          <section className="wp-quotation-actions">
            <button
              type="button"
              className="wp-quotation-action wp-quotation-action--primary"
              onClick={() =>
                navigate(
                  `/quotation-review/${q.id}`
                )
              }
              disabled={!q.id}
            >
              Review quotation →
            </button>

            <button
              type="button"
              className="wp-quotation-action"
              onClick={downloadQuotationPdf}
              disabled={!q.id}
            >
              ↓ Download PDF
            </button>

            <button
              type="button"
              className="wp-quotation-action"
              onClick={() =>
                navigate("/quotation-reviews")
              }
            >
              View quotation reviews
            </button>
          </section>

          <button
            type="button"
            className="wp-form-submit"
            style={{ marginTop: "24px" }}
            onClick={() => {
              setFinalQuotation(null);

              setForm((previous) => ({
                ...previous,
                cargoWeight: "",
                containers: "",
                requirements: "",
              }));
            }}
          >
            Create another quotation →
          </button>
        </section>
      </main>
    );
  }


  /* =====================================================
     RENDER
     ===================================================== */

  return (

    <main className="wp-page">

      <section className="wp-quotation">


        {/* BACK */}

        <button
          type="button"
          className="wp-page__back"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back to routes
        </button>


        {/* HEADER */}

        <div className="wp-page-header wp-quotation-header">

          <div className="wp-quotation-live">
            <span />
            QUOTATION REQUEST CENTER
          </div>

          <span className="wp-eyebrow">
            FREIGHT BROKERAGE
          </span>

          <h1>
            Request a quotation
          </h1>

          <p>
            Submit your shipment details
            for the selected maritime route.
          </p>

        </div>


        {/* =================================================
           SELECTED ROUTE
           ================================================= */}

        <div className="wp-quotation-route wp-quotation-route--cinematic">

          <div className="wp-route-live">
            <span />
            ROUTE LOCKED FOR QUOTATION
          </div>

          <span className="wp-eyebrow">
            SELECTED ROUTE
          </span>

          <h2>
            {origin}
            {" → "}
            {destination}
          </h2>


          <div className="wp-quotation-route__meta">

            <span>
              Route: {routeId}
            </span>

            <span>
              Transit:{" "}
              {transitDays !== ""
                ? `${transitDays} days`
                : "—"}
            </span>

            {distance !== "" && (
              <span>
                Distance:{" "}
                {distance} NM
              </span>
            )}

            {transshipments !== "" && (
              <span>
                Transshipments:{" "}
                {transshipments}
              </span>
            )}

            {freight !== "" && (
              <span>
                Freight: $
                {Number(
                  freight
                ).toLocaleString()}
              </span>
            )}

          </div>

        </div>


        {/* =================================================
           FORM
           ================================================= */}

        <form
          className="wp-quotation-form"
          onSubmit={handleSubmit}
        >


          {/* COMPANY */}

          <section className="wp-form-section">

            <h3>
              COMPANY INFORMATION
            </h3>


            <div className="wp-form-two">


              <div className="wp-form-group">

                <label>
                  Company name
                </label>

                <input
                  type="text"
                  name="companyName"
                  value={
                    form.companyName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter company name"
                />

              </div>


              <div className="wp-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="company@example.com"
                />

              </div>

            </div>


            <div
              className="wp-form-group"
              style={{
                marginTop: "20px",
              }}
            >

              <label>
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="+91 XXXXX XXXXX"
              />

            </div>

          </section>


          {/* =================================================
             SHIPMENT DETAILS
             ================================================= */}

          <section className="wp-form-section">

            <h3>
              SHIPMENT DETAILS
            </h3>


            <div className="wp-form-two">


              <div className="wp-form-group">

                <label>
                  Cargo weight (kg)
                </label>

                <input
                  type="number"
                  name="cargoWeight"
                  value={
                    form.cargoWeight
                  }
                  onChange={
                    handleChange
                  }
                  min="1"
                  step="0.01"
                  placeholder="Enter cargo weight"
                />

              </div>


              <div className="wp-form-group">

                <label>
                  Number of containers
                </label>

                <input
                  type="number"
                  name="containers"
                  value={
                    form.containers
                  }
                  onChange={
                    handleChange
                  }
                  min="1"
                  max="10000"
                  step="1"
                  placeholder="Enter number of containers"
                />

              </div>

            </div>

          </section>


          {/* =================================================
             SPECIAL REQUIREMENTS
             ================================================= */}

          <section className="wp-form-section">

            <h3>
              SPECIAL REQUIREMENTS
            </h3>


            <div className="wp-form-group">

              <label>
                Additional requirements
              </label>

              <textarea
                name="requirements"
                value={
                  form.requirements
                }
                onChange={
                  handleChange
                }
                placeholder="Temperature requirements, special handling, documentation, etc."
              />

            </div>

          </section>


          {/* ERROR */}

          {error && (

            <div className="wp-error">

              ⚠ {error}

            </div>

          )}


          {/* SUCCESS */}

          {message && (

            <div className="wp-success">

              ✓ {message}

            </div>

          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="wp-form-submit"
            disabled={submitting}
          >

            {submitting
              ? "Submitting..."
              : "Submit quotation request →"}

          </button>

        </form>


        {/* =================================================
           MY QUOTATIONS
           ================================================= */}

        <section
          className="wp-my-quotations wp-my-quotations--cinematic"
          style={{
            marginTop: "40px",
          }}
        >

          <div className="wp-page-header">

            <span className="wp-eyebrow">
              REQUEST HISTORY
            </span>

            <h2>
              My Quotations
            </h2>

          </div>


          {loadingQuotations ? (

            <p>
              Loading quotation history...
            </p>

          ) : quotations.length === 0 ? (

            <p>
              No quotation requests yet.
            </p>

          ) : (

            <div>

              {quotations.map(
                (quotation) => (

                  <div
                    key={quotation.id}
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      border:
                        "1px solid #e1eaf2",
                      borderRadius:
                        "12px",
                      background:
                        "#ffffff",
                    }}
                  >

                    <strong>
                      {quotation.origin}
                      {" → "}
                      {quotation.destination}
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "7px",
                        fontSize:
                          "13px",
                        color:
                          "#6f8296",
                      }}
                    >

                      Route ID:{" "}
                      {quotation.route_id ||
                        "—"}

                      {" • "}

                      Status:{" "}
                      {quotation.status ||
                        "Pending"}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </section>

    </main>

  );
}


export default RequestQuotation;