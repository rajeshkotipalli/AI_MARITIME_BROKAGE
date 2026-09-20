import { useEffect, useState } from "react";
import "./AdminDashboard.css";


function AdminDashboard({ admin, onLogout }) {

  // ==========================================================
  // STATE
  // ==========================================================

  const [activeSection, setActiveSection] =
    useState("overview");

  const [overview, setOverview] =
    useState(null);

  const [overviewLoading, setOverviewLoading] =
    useState(true);

  const [overviewError, setOverviewError] =
    useState("");


  // ==========================================================
  // QUOTATION STATE
  // ==========================================================

  const [quotations, setQuotations] =
    useState([]);

  const [quotationsLoading, setQuotationsLoading] =
    useState(false);

  const [quotationsError, setQuotationsError] =
    useState("");

  const [quotationSearch, setQuotationSearch] =
    useState("");

  const [quotationStatus, setQuotationStatus] =
    useState("all");

  const [selectedQuotation, setSelectedQuotation] =
    useState(null);

  const [quotationActionLoading, setQuotationActionLoading] =
    useState(false);

  const [quotationActionError, setQuotationActionError] =
    useState("");

  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState("");
  const [routeSearch, setRouteSearch] = useState("");

  // CUSTOMER FEEDBACK
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, unreplied: 0, average: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewReply, setReviewReply] = useState("");
  const [reviewReplyLoading, setReviewReplyLoading] = useState(false);
  const [reviewReplyMessage, setReviewReplyMessage] = useState("");

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);

  const [commercial, setCommercial] = useState(null);
  const [commercialLoading, setCommercialLoading] = useState(false);
  const [commercialError, setCommercialError] = useState("");

  const [operations, setOperations] = useState([]);
  const [operationSummary, setOperationSummary] = useState({});
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [operationsError, setOperationsError] = useState("");
  const [operationSearch, setOperationSearch] = useState("");

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");


  // ==========================================================
  // ADMIN NAME
  // ==========================================================

  const adminName =
    admin?.username ||
    admin?.name ||
    "Administrator";


  // ==========================================================
  // LOAD OVERVIEW
  // ==========================================================

  async function loadOverview() {

    try {

      setOverviewLoading(true);

      setOverviewError("");

      const token =
        localStorage.getItem(
          "waypoint_admin_token"
        );


      if (!token) {

        throw new Error(
          "Administrator session token not found."
        );
      }


      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/overview",
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


      const data =
        await response.json();


      console.log(
        "ADMIN OVERVIEW RESPONSE:",
        data
      );


      if (!response.ok) {

        const message =
          data?.detail?.message ||
          data?.detail ||
          "Unable to load administrator overview.";

        throw new Error(message);
      }


      if (!data?.success) {

        throw new Error(
          data?.message ||
          "Unable to load administrator overview."
        );
      }


      setOverview(data);

    } catch (err) {

      console.error(
        "Admin overview error:",
        err
      );

      setOverviewError(
        err?.message ||
        "Unable to connect to the admin service."
      );

    } finally {

      setOverviewLoading(false);
    }
  }


  // ==========================================================
  // LOAD ADMIN QUOTATIONS
  // ==========================================================

  async function loadQuotations() {

    try {

      setQuotationsLoading(true);

      setQuotationsError("");

      const token =
        localStorage.getItem(
          "waypoint_admin_token"
        );


      if (!token) {

        throw new Error(
          "Administrator session token not found."
        );
      }


      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/quotations",
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


      const data =
        await response.json();


      console.log(
        "ADMIN QUOTATIONS RESPONSE:",
        data
      );


      if (!response.ok) {

        const message =
          data?.detail?.message ||
          data?.detail ||
          "Unable to load quotations.";

        throw new Error(message);
      }


      if (!data?.success) {

        throw new Error(
          data?.message ||
          "Unable to load quotations."
        );
      }


      setQuotations(
        Array.isArray(data.quotations)
          ? data.quotations
          : []
      );


    } catch (err) {

      console.error(
        "Admin quotations error:",
        err
      );

      setQuotationsError(
        err?.message ||
        "Unable to load quotation records."
      );

    } finally {

      setQuotationsLoading(false);
    }
  }


  // ==========================================================
  // ROUTE INTELLIGENCE
  // ==========================================================
  async function loadRoutes() {
    try {
      setRoutesLoading(true);
      setRoutesError("");
      const token = localStorage.getItem("waypoint_admin_token");
      if (!token) throw new Error("Administrator session token not found.");
      const response = await fetch("http://127.0.0.1:8000/api/admin/routes", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.detail?.message || data?.detail || data?.message || "Unable to load route intelligence.");
      }
      setRoutes(Array.isArray(data.routes) ? data.routes : []);
    } catch (err) {
      console.error("Admin routes error:", err);
      setRoutesError(err?.message || "Unable to load route intelligence data.");
    } finally {
      setRoutesLoading(false);
    }
  }

  // ==========================================================
  // ADMIN MODULE LOADERS
  // ==========================================================
  async function adminFetch(path, options = {}) {
    const token = localStorage.getItem("waypoint_admin_token");
    if (!token) throw new Error("Administrator session token not found.");
    const response = await fetch(`http://127.0.0.1:8000${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.detail?.message || data?.detail || data?.message || "Administrator request failed.");
    }
    return data;
  }

  async function loadReviews() {
    try {
      setReviewsLoading(true);
      setReviewsError("");
      const data = await adminFetch("/api/admin/reviews");
      const items = Array.isArray(data.reviews) ? data.reviews : [];
      setReviews(items);
      setReviewStats({
        total: Number(data.count || items.length),
        unreplied: Number(data.unreplied_count || items.filter((r) => !r.admin_replied).length),
        average: items.length
          ? (items.reduce((sum, r) => sum + Number(r.rating || 0), 0) / items.length).toFixed(1)
          : "0.0",
      });
    } catch (err) {
      console.error("Admin reviews error:", err);
      setReviewsError(err?.message || "Unable to load customer feedback.");
    } finally {
      setReviewsLoading(false);
    }
  }

  async function replyToReview(reviewId) {
    const reply = reviewReply.trim();
    if (!reply) {
      setReviewReplyMessage("Please write a response before sending.");
      return;
    }
    try {
      setReviewReplyLoading(true);
      setReviewReplyMessage("");
      const data = await adminFetch(`/api/admin/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      setReviewReplyMessage(data.message || "Response sent to the customer successfully.");
      setReviewReply("");
      await loadReviews();
      setSelectedReview((current) => current ? { ...current, admin_reply: reply, admin_reply_at: new Date().toISOString(), admin_replied: true } : current);
    } catch (err) {
      console.error("Admin review reply error:", err);
      setReviewReplyMessage(err?.message || "Unable to send the response.");
    } finally {
      setReviewReplyLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      setCustomersLoading(true); setCustomersError("");
      const data = await adminFetch("/api/admin/customers");
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    } catch (err) { setCustomersError(err?.message || "Unable to load customers."); }
    finally { setCustomersLoading(false); }
  }

  async function loadCustomerHistory(customer) {
    try {
      const data = await adminFetch(`/api/admin/customers/${customer.id}/history`);
      setSelectedCustomer(customer); setCustomerHistory(data);
    } catch (err) { setCustomersError(err?.message || "Unable to load customer history."); }
  }

  async function loadCommercial() {
    try {
      setCommercialLoading(true); setCommercialError("");
      const data = await adminFetch("/api/admin/commercial");
      setCommercial(data);
    } catch (err) { setCommercialError(err?.message || "Unable to load commercial analytics."); }
    finally { setCommercialLoading(false); }
  }

  async function loadOperations() {
    try {
      setOperationsLoading(true); setOperationsError("");
      const data = await adminFetch("/api/admin/operations");
      setOperations(Array.isArray(data.operations) ? data.operations : []);
      setOperationSummary(data.summary || {});
    } catch (err) { setOperationsError(err?.message || "Unable to load operations."); }
    finally { setOperationsLoading(false); }
  }

  async function updateOperationStatus(id, status) {
    try {
      await adminFetch(`/api/admin/operations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadOperations();
      loadOverview();
    } catch (err) { setOperationsError(err?.message || "Unable to update operation status."); }
  }

  async function loadAdmins() {
    try {
      setAdminsLoading(true); setAdminsError("");
      const data = await adminFetch("/api/admin/admins");
      setAdmins(Array.isArray(data.admins) ? data.admins : []);
    } catch (err) { setAdminsError(err?.message || "Unable to load administrators."); }
    finally { setAdminsLoading(false); }
  }

  async function addAdministrator() {
    const email = newAdminEmail.trim();
    if (!email) return;
    try {
      await adminFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setNewAdminEmail("");
      loadAdmins();
    } catch (err) { setAdminsError(err?.message || "Unable to add administrator."); }
  }

  async function removeAdministrator(id) {
    if (!window.confirm("Remove administrator access from this account?")) return;
    try { await adminFetch(`/api/admin/admins/${id}`, { method: "DELETE" }); loadAdmins(); }
    catch (err) { setAdminsError(err?.message || "Unable to remove administrator."); }
  }

  // ==========================================================
  // DOWNLOAD QUOTATION DATA / PDF
  // ==========================================================

  async function downloadAdminQuotation(quotationId, format = "pdf") {
    try {
      setQuotationActionLoading(true);
      setQuotationActionError("");

      const token = localStorage.getItem("waypoint_admin_token");

      if (!token) {
        throw new Error("Administrator session token not found.");
      }

      const endpoint =
        format === "csv"
          ? `/api/admin/quotations/${quotationId}/csv`
          : `/api/admin/quotations/${quotationId}/pdf`;

      const response = await fetch(
        `http://127.0.0.1:8000${endpoint}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept:
              format === "csv"
                ? "text/csv"
                : "application/pdf",
          },
        }
      );

      if (!response.ok) {
        let message = "Unable to download quotation.";
        try {
          const data = await response.json();
          message =
            data?.detail?.message ||
            data?.detail ||
            data?.message ||
            message;
        } catch {
          // Non-JSON error response.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const contentDisposition =
        response.headers.get("Content-Disposition") || "";

      const filenameMatch =
        contentDisposition.match(/filename="?([^"]+)"?/i);

      const filename =
        filenameMatch?.[1] ||
        `quotation_${quotationId}.${format}`;

      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Quotation download error:", err);
      setQuotationActionError(
        err?.message || "Unable to download quotation."
      );
    } finally {
      setQuotationActionLoading(false);
    }
  }


  // ==========================================================
  // APPROVE / REJECT QUOTATION
  // ==========================================================

  async function updateQuotationStatus(quotationId, newStatus) {
    const action = newStatus === "Approved"
      ? "approve"
      : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} quotation #${quotationId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setQuotationActionLoading(true);
      setQuotationActionError("");

      const token =
        localStorage.getItem("waypoint_admin_token");

      if (!token) {
        throw new Error(
          "Administrator session token not found."
        );
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/quotations/${quotationId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.detail?.message ||
          data?.detail ||
          `Unable to ${action} quotation.`;

        throw new Error(message);
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
          `Unable to ${action} quotation.`
        );
      }

      setQuotations((previous) =>
        previous.map((quotation) =>
          quotation.id === quotationId
            ? {
                ...quotation,
                status: newStatus,
              }
            : quotation
        )
      );

      setSelectedQuotation((previous) =>
        previous && previous.id === quotationId
          ? {
              ...previous,
              status: newStatus,
            }
          : previous
      );

      if (data?.customer_notification_sent === false) {
        setQuotationActionError(
          `Quotation updated, but the customer email could not be sent: ${
            data?.customer_notification_message || "Unknown email error."
          }`
        );
      }

      // Refresh overview figures/status counts after a decision.
      loadOverview();
    } catch (err) {
      console.error(
        "Quotation status update error:",
        err
      );

      setQuotationActionError(
        err?.message ||
        `Unable to ${action} quotation.`
      );
    } finally {
      setQuotationActionLoading(false);
    }
  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadOverview();
    loadRoutes();

  }, []);


  // ==========================================================
  // LOAD QUOTATIONS WHEN SECTION IS OPENED
  // ==========================================================

  useEffect(() => {

    if (activeSection === "quotations") {
      loadQuotations();
    }

    if (activeSection === "routes") {
      loadRoutes();
    }
    if (activeSection === "customers") {
      loadCustomers();
    }
    if (activeSection === "commercial") {
      loadCommercial();
    }
    if (activeSection === "operations") {
      loadOperations();
    }
    if (activeSection === "settings") {
      loadAdmins();
    }
    if (activeSection === "reviews") {
      loadReviews();
    }

  }, [activeSection]);


  // ==========================================================
  // LOGOUT
  // ==========================================================

  function handleLogout() {

    localStorage.removeItem(
      "waypoint_admin_token"
    );

    localStorage.removeItem(
      "waypoint_admin_user"
    );


    if (onLogout) {
      onLogout();
    }


    window.location.href = "/";
  }


  // ==========================================================
  // MENU
  // ==========================================================

  const menuItems = [

    {
      id: "overview",
      icon: "📊",
      label: "Overview",
    },

    {
      id: "quotations",
      icon: "📄",
      label: "Quotations",
    },

    {
      id: "reviews",
      icon: "💬",
      label: "Customer Feedback",
    },

    {
      id: "routes",
      icon: "🗺️",
      label: "Route Intelligence",
    },

    {
      id: "customers",
      icon: "👥",
      label: "Customers",
    },

    {
      id: "commercial",
      icon: "💰",
      label: "Commercial",
    },

    {
      id: "operations",
      icon: "⚓",
      label: "Operations",
    },

    {
      id: "settings",
      icon: "⚙️",
      label: "System",
    },

  ];


  // ==========================================================
  // FORMAT CURRENCY
  // ==========================================================

  function formatCurrency(value) {

    return `$${Number(
      value || 0
    ).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(value) {

    if (!value) {
      return "—";
    }


    try {

      return new Date(
        value
      ).toLocaleString();

    } catch {

      return value;
    }
  }


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  function getStatusClass(status) {

    const normalized =
      String(
        status || "Pending"
      ).toLowerCase();


    if (
      normalized === "completed"
    ) {

      return "completed";
    }


    if (
      normalized === "reviewed"
    ) {

      return "reviewed";
    }


    return "pending";
  }


  // ==========================================================
  // FILTER QUOTATIONS
  // ==========================================================

  const filteredQuotations =
    quotations.filter(
      (quotation) => {

        const search =
          quotationSearch
            .trim()
            .toLowerCase();


        const matchesSearch =
          !search ||
          String(
            quotation.id
          )
            .toLowerCase()
            .includes(search) ||

          String(
            quotation.company_name || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            quotation.email || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            quotation.origin || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            quotation.destination || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            quotation.route_id || ""
          )
            .toLowerCase()
            .includes(search);


        const matchesStatus =
          quotationStatus === "all" ||
          String(
            quotation.status || "Pending"
          ).toLowerCase() ===
          quotationStatus.toLowerCase();


        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );


  // ==========================================================
  // OVERVIEW
  // ==========================================================

  function renderOverview() {

    return (
      <>

        <div className="admin-page-heading">

          <div>

            <span className="admin-eyebrow">
              ADMIN CONTROL CENTER
            </span>

            <h1>
              Dashboard Overview
            </h1>

            <p>
              Monitor Waypoint AI's maritime
              brokerage operations and
              commercial intelligence.
            </p>

          </div>


          <div className="admin-secure-badge">
            🔐 Admin Access
          </div>

        </div>


        <div className="admin-stat-grid">


          {/* TOTAL QUOTATIONS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              📄
            </div>

            <div>

              <span>
                Total Quotations
              </span>

              <strong>

                {overviewLoading
                  ? "—"
                  : overview?.overview
                      ?.total_quotations ?? 0}

              </strong>

              <small>
                {overviewLoading
                  ? "Loading from backend"
                  : "All quotations"}
              </small>

            </div>

          </div>


          {/* BROKERAGE PROFIT */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              💰
            </div>

            <div>

              <span>
                Total Brokerage Profit
              </span>

              <strong>

                {overviewLoading
                  ? "—"
                  : formatCurrency(
                      overview?.overview
                        ?.total_brokerage_profit_usd
                    )}

              </strong>

              <small>
                Admin-only metric
              </small>

            </div>

          </div>


          {/* AVAILABLE ROUTES */}

          <div
            className="admin-stat-card admin-stat-card-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setActiveSection("routes")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveSection("routes");
              }
            }}
            title="Open Route Intelligence"
          >

            <div className="admin-stat-icon">
              🚢
            </div>

            <div>

              <span>
                Available Routes
              </span>

              <strong>
                {routesLoading
                  ? "—"
                  : routes.length}
              </strong>

              <small>
                Routes available in Route Intelligence
              </small>

            </div>

            <span className="admin-stat-arrow" aria-hidden="true">
              →
            </span>

          </div>


          {/* CUSTOMERS */}

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              👥
            </div>

            <div>

              <span>
                Registered Customers
              </span>

              <strong>

                {overviewLoading
                  ? "—"
                  : overview?.overview
                      ?.total_customers ?? 0}

              </strong>

              <small>
                Registered users
              </small>

            </div>

          </div>

        </div>


        <div className="admin-command-hero">

          <div className="admin-command-copy">
            <span className="admin-command-kicker">GLOBAL OPERATIONS OVERVIEW</span>
            <h2>Maritime Command Center</h2>
            <p>
              A secure operational view of quotations, customers, routes and commercial performance across the Waypoint AI network.
            </p>
            <div className="admin-command-actions">
              <button type="button" onClick={() => setActiveSection("routes")}>
                Explore Route Intelligence <span>→</span>
              </button>
              <span className="admin-command-status"><i /> Systems operational</span>
            </div>
          </div>

          <div className="admin-command-visual" aria-hidden="true">
            <div className="admin-orbit orbit-one" />
            <div className="admin-orbit orbit-two" />
            <div className="admin-orbit orbit-three" />
            <div className="admin-globe">
              <div className="globe-grid globe-grid-a" />
              <div className="globe-grid globe-grid-b" />
              <div className="globe-core" />
              <span className="globe-node node-a" />
              <span className="globe-node node-b" />
              <span className="globe-node node-c" />
              <span className="globe-node node-d" />
              <span className="globe-route route-a" />
              <span className="globe-route route-b" />
              <span className="globe-route route-c" />
            </div>
            <div className="admin-visual-chip chip-top">LIVE NETWORK</div>
            <div className="admin-visual-chip chip-bottom">AI ROUTE ENGINE <strong>ACTIVE</strong></div>
          </div>

        </div>


        <div className="admin-content-grid">


          {/* COMMERCIAL */}

          <div className="admin-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-label">
                  COMMERCIAL INTELLIGENCE
                </span>

                <h2>
                  Brokerage Performance
                </h2>

              </div>

              <span className="admin-live-dot">
                ● Secure
              </span>

            </div>


            <div className="commercial-preview-grid">


              <div>

                <span>
                  Operating Cost
                </span>

                <strong>
                  Not in overview
                </strong>

              </div>


              <div>

                <span>
                  Average Margin
                </span>

                <strong>

                  {overviewLoading
                    ? "—"
                    : `${Number(
                        overview?.overview
                          ?.average_margin_percent || 0
                      ).toFixed(2)}%`}

                </strong>

              </div>


              <div>

                <span>
                  Demand Factor
                </span>

                <strong>
                  Available per quotation
                </strong>

              </div>


              <div>

                <span>
                  Net Brokerage Profit
                </span>

                <strong>

                  {overviewLoading
                    ? "—"
                    : formatCurrency(
                        overview?.overview
                          ?.total_brokerage_profit_usd
                      )}

                </strong>

              </div>

            </div>


            <div className="admin-info-message">

              <span>
                ℹ️
              </span>

              <p>
                These commercial values are
                intentionally available only
                inside the authenticated
                admin portal.
              </p>

            </div>

          </div>


          {/* ADMIN ACCOUNT */}

          <div className="admin-panel">

            <div className="admin-panel-header">

              <div>

                <span className="admin-panel-label">
                  ADMIN ACCOUNT
                </span>

                <h2>
                  Administrator
                </h2>

              </div>


              <div className="admin-avatar">
                {adminName
                  .charAt(0)
                  .toUpperCase()}
              </div>

            </div>


            <div className="admin-account-details">

              <div>

                <span>
                  Name
                </span>

                <strong>
                  {adminName}
                </strong>

              </div>


              <div>

                <span>
                  Email
                </span>

                <strong>
                  {admin?.email || "—"}
                </strong>

              </div>


              <div>

                <span>
                  Role
                </span>

                <strong className="admin-role">
                  ADMIN
                </strong>

              </div>

            </div>

          </div>

        </div>


        {overviewError && (

          <div className="admin-panel admin-error-panel">

            <div>

              <strong>
                Unable to load live overview
              </strong>

              <p>
                {overviewError}
              </p>

            </div>

            <button
              type="button"
              onClick={loadOverview}
            >
              Retry
            </button>

          </div>

        )}


        {/* QUICK ACCESS */}

        <div className="admin-panel admin-quick-panel">

          <div className="admin-panel-header">

            <div>

              <span className="admin-panel-label">
                QUICK ACCESS
              </span>

              <h2>
                Administrative Tools
              </h2>

            </div>

          </div>


          <div className="admin-quick-grid">


            <button
              onClick={() =>
                setActiveSection(
                  "quotations"
                )
              }
            >

              <span>
                📄
              </span>

              <div>

                <strong>
                  Quotation Management
                </strong>

                <small>
                  Review customer quotations
                </small>

              </div>

            </button>


            <button
              onClick={() =>
                setActiveSection(
                  "routes"
                )
              }
            >

              <span>
                🗺️
              </span>

              <div>

                <strong>
                  Route Intelligence
                </strong>

                <small>
                  Analyse available maritime routes
                </small>

              </div>

            </button>


            <button
              onClick={() =>
                setActiveSection(
                  "commercial"
                )
              }
            >

              <span>
                💰
              </span>

              <div>

                <strong>
                  Commercial Analytics
                </strong>

                <small>
                  Internal pricing and profit data
                </small>

              </div>

            </button>


            <button
              onClick={() =>
                setActiveSection(
                  "customers"
                )
              }
            >

              <span>
                👥
              </span>

              <div>

                <strong>
                  Customer Management
                </strong>

                <small>
                  View registered customers
                </small>

              </div>

            </button>

          </div>

        </div>

      </>
    );
  }


  // ==========================================================
  // QUOTATION MANAGEMENT
  // ==========================================================

  function renderQuotations() {

    return (
      <>

        <div className="admin-page-heading">

          <div>

            <span className="admin-eyebrow">
              ADMIN MODULE
            </span>

            <h1>
              📄 Quotation Management
            </h1>

            <p>
              Review and analyse customer
              quotation records.
            </p>

          </div>


          <div className="admin-secure-badge">
            🔐 Admin Only
          </div>

        </div>


        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="admin-stat-grid">


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              📄
            </div>

            <div>

              <span>
                Total Quotations
              </span>

              <strong>
                {quotations.length}
              </strong>

              <small>
                Database records
              </small>

            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              ⏳
            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {
                  quotations.filter(
                    (q) =>
                      String(
                        q.status || "Pending"
                      ).toLowerCase() ===
                      "pending"
                  ).length
                }
              </strong>

              <small>
                Awaiting review
              </small>

            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              ✅
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {
                  quotations.filter(
                    (q) =>
                      String(
                        q.status || ""
                      ).toLowerCase() ===
                      "completed"
                  ).length
                }
              </strong>

              <small>
                Completed quotations
              </small>

            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              💰
            </div>

            <div>

              <span>
                Total Profit
              </span>

              <strong>

                {formatCurrency(
                  quotations.reduce(
                    (
                      total,
                      q
                    ) =>
                      total +
                      Number(
                        q.brokerage_profit_usd ||
                        0
                      ),
                    0
                  )
                )}

              </strong>

              <small>
                Internal brokerage value
              </small>

            </div>

          </div>

        </div>


        {/* ==================================================
            CONTROLS
        ================================================== */}

        <div
          className="admin-panel"
          style={{
            marginBottom: "20px",
          }}
        >

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >

            <input
              type="text"
              placeholder="Search company, email, route, port or ID..."
              value={quotationSearch}
              onChange={(e) =>
                setQuotationSearch(
                  e.target.value
                )
              }
              style={{
                flex: "1 1 320px",
                padding: "12px 14px",
                border: "1px solid #d8dee8",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            />


            <select
              value={quotationStatus}
              onChange={(e) =>
                setQuotationStatus(
                  e.target.value
                )
              }
              style={{
                padding: "12px 14px",
                border: "1px solid #d8dee8",
                borderRadius: "8px",
                fontSize: "14px",
                background: "#fff",
              }}
            >

              <option value="all">
                All Statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="reviewed">
                Reviewed
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="completed">
                Completed
              </option>

            </select>


            <button
              type="button"
              onClick={loadQuotations}
              disabled={quotationsLoading}
              style={{
                padding: "12px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >

              {quotationsLoading
                ? "Refreshing..."
                : "↻ Refresh"}

            </button>

          </div>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {quotationsError && (

          <div
            className="admin-panel"
            style={{
              marginBottom: "20px",
            }}
          >

            <strong>
              Unable to load quotations
            </strong>

            <p>
              {quotationsError}
            </p>

            <button
              type="button"
              onClick={loadQuotations}
            >
              Retry
            </button>

          </div>

        )}


        {/* ==================================================
            TABLE
        ================================================== */}

        <div
          className="admin-panel"
          style={{
            overflow: "hidden",
          }}
        >

          <div className="admin-panel-header">

            <div>

              <span className="admin-panel-label">
                QUOTATION RECORDS
              </span>

              <h2>
                Customer Quotations
              </h2>

            </div>

            <span className="admin-live-dot">
              ● Live Database
            </span>

          </div>


          {quotationsLoading ? (

            <div
              style={{
                padding: "50px",
                textAlign: "center",
              }}
            >
              Loading quotation records...
            </div>

          ) : filteredQuotations.length === 0 ? (

            <div
              style={{
                padding: "50px",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "10px",
                }}
              >
                📄
              </div>

              <strong>
                No quotations found
              </strong>

              <p>
                Try changing your search
                or status filter.
              </p>

            </div>

          ) : (

            <div
              style={{
                overflowX: "auto",
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1100px",
                }}
              >

                <thead>

                  <tr>

                    {[
                      "ID",
                      "Company",
                      "Route",
                      "Cargo",
                      "Containers",
                      "Customer Value",
                      "Profit",
                      "Status",
                      "Created",
                      "Action",
                    ].map(
                      (heading) => (

                        <th
                          key={heading}
                          style={{
                            textAlign: "left",
                            padding: "14px 12px",
                            borderBottom:
                              "1px solid #e5e9f0",
                            fontSize: "12px",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.05em",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {heading}
                        </th>

                      )
                    )}

                  </tr>

                </thead>


                <tbody>

                  {filteredQuotations.map(
                    (quotation) => (

                      <tr
                        key={
                          quotation.id
                        }
                      >

                        {/* ID */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                            fontWeight: "700",
                          }}
                        >
                          #{quotation.id}
                        </td>


                        {/* COMPANY */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                          }}
                        >

                          <strong>
                            {
                              quotation.company_name ||
                              "—"
                            }
                          </strong>

                          <div
                            style={{
                              fontSize: "12px",
                              marginTop: "4px",
                              opacity: 0.7,
                            }}
                          >
                            {
                              quotation.email ||
                              "—"
                            }
                          </div>

                        </td>


                        {/* ROUTE */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                            whiteSpace:
                              "nowrap",
                          }}
                        >

                          <strong>
                            {
                              quotation.origin ||
                              "—"
                            }
                          </strong>

                          <span>
                            {" → "}
                          </span>

                          <strong>
                            {
                              quotation.destination ||
                              "—"
                            }
                          </strong>

                          <div
                            style={{
                              fontSize: "11px",
                              opacity: 0.65,
                              marginTop: "4px",
                            }}
                          >
                            Route:{" "}
                            {
                              quotation.route_id ||
                              "—"
                            }
                          </div>

                        </td>


                        {/* CARGO */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                          }}
                        >

                          {
                            quotation.cargo_type ||
                            "—"
                          }

                          <div
                            style={{
                              fontSize: "11px",
                              opacity: 0.65,
                              marginTop: "4px",
                            }}
                          >
                            {
                              quotation.cargo_weight ??
                              "—"
                            }
                          </div>

                        </td>


                        {/* CONTAINERS */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                          }}
                        >
                          {
                            quotation.containers ??
                            "—"
                          }
                        </td>


                        {/* CUSTOMER VALUE */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                            fontWeight: "600",
                          }}
                        >
                          {
                            formatCurrency(
                              quotation.customer_value_usd
                            )
                          }
                        </td>


                        {/* PROFIT */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                            fontWeight: "700",
                          }}
                        >
                          {
                            formatCurrency(
                              quotation.brokerage_profit_usd
                            )
                          }
                        </td>


                        {/* STATUS */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                          }}
                        >

                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                              background:
                                "#eef3f8",
                            }}
                          >
                            {
                              quotation.status ||
                              "Pending"
                            }
                          </span>

                        </td>


                        {/* CREATED */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                            whiteSpace:
                              "nowrap",
                            fontSize:
                              "12px",
                          }}
                        >
                          {
                            formatDate(
                              quotation.created_at
                            )
                          }
                        </td>


                        {/* ACTION */}

                        <td
                          style={{
                            padding: "15px 12px",
                            borderBottom:
                              "1px solid #edf0f4",
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedQuotation(
                                  quotation
                                )
                              }
                              style={{
                                padding:
                                  "7px 12px",
                                border:
                                  "1px solid #d5dce6",
                                borderRadius:
                                  "6px",
                                cursor:
                                  "pointer",
                                background:
                                  "#fff",
                                fontWeight:
                                  "600",
                              }}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              disabled={quotationActionLoading}
                              onClick={() =>
                                downloadAdminQuotation(
                                  quotation.id,
                                  "pdf"
                                )
                              }
                              style={{
                                padding: "7px 12px",
                                border: "1px solid #c5e8e1",
                                borderRadius: "6px",
                                cursor: quotationActionLoading
                                  ? "not-allowed"
                                  : "pointer",
                                background: "#eefaf7",
                                color: "#126c66",
                                fontWeight: "700",
                              }}
                            >
                              ↓ PDF
                            </button>

                            <button
                              type="button"
                              disabled={quotationActionLoading}
                              onClick={() =>
                                downloadAdminQuotation(
                                  quotation.id,
                                  "csv"
                                )
                              }
                              style={{
                                padding: "7px 12px",
                                border: "1px solid #e3d2a7",
                                borderRadius: "6px",
                                cursor: quotationActionLoading
                                  ? "not-allowed"
                                  : "pointer",
                                background: "#fff9eb",
                                color: "#80611d",
                                fontWeight: "700",
                              }}
                            >
                              ↓ Data
                            </button>

                            {(String(
                              quotation.status ||
                                "Pending"
                            ).toLowerCase() ===
                              "pending" ||
                              String(
                                quotation.status ||
                                  "Pending"
                              ).toLowerCase() ===
                                "reviewed") && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    quotationActionLoading
                                  }
                                  onClick={() =>
                                    updateQuotationStatus(
                                      quotation.id,
                                      "Approved"
                                    )
                                  }
                                  style={{
                                    padding:
                                      "7px 12px",
                                    border:
                                      "1px solid #b7dfc2",
                                    borderRadius:
                                      "6px",
                                    cursor:
                                      quotationActionLoading
                                        ? "not-allowed"
                                        : "pointer",
                                    background:
                                      "#eaf7ee",
                                    fontWeight:
                                      "700",
                                  }}
                                >
                                  ✓ Approve
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    quotationActionLoading
                                  }
                                  onClick={() =>
                                    updateQuotationStatus(
                                      quotation.id,
                                      "Rejected"
                                    )
                                  }
                                  style={{
                                    padding:
                                      "7px 12px",
                                    border:
                                      "1px solid #efb7b7",
                                    borderRadius:
                                      "6px",
                                    cursor:
                                      quotationActionLoading
                                        ? "not-allowed"
                                        : "pointer",
                                    background:
                                      "#fff0f0",
                                    fontWeight:
                                      "700",
                                  }}
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}
                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ==================================================
            QUOTATION DETAILS
        ================================================== */}

        {selectedQuotation && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.45)",
              display: "flex",
              justifyContent:
                "flex-end",
              zIndex: 1000,
            }}
            onClick={() =>
              setSelectedQuotation(null)
            }
          >

            <div
              style={{
                width: "min(520px, 92vw)",
                height: "100%",
                background: "#fff",
                padding: "28px",
                overflowY: "auto",
                boxShadow:
                  "-10px 0 30px rgba(0,0,0,0.15)",
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >

                <div>

                  <span className="admin-panel-label">
                    QUOTATION DETAILS
                  </span>

                  <h2>
                    Quotation #
                    {
                      selectedQuotation.id
                    }
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedQuotation(
                      null
                    )
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>

              </div>


              <div
                style={{
                  display: "grid",
                  gap: "0",
                }}
              >

                {[
                  [
                    "Company",
                    selectedQuotation.company_name,
                  ],

                  [
                    "Email",
                    selectedQuotation.email,
                  ],

                  [
                    "Phone",
                    selectedQuotation.phone,
                  ],

                  [
                    "Origin",
                    selectedQuotation.origin,
                  ],

                  [
                    "Destination",
                    selectedQuotation.destination,
                  ],

                  [
                    "Route ID",
                    selectedQuotation.route_id,
                  ],

                  [
                    "Cargo Type",
                    selectedQuotation.cargo_type,
                  ],

                  [
                    "Cargo Weight",
                    selectedQuotation.cargo_weight,
                  ],

                  [
                    "Containers",
                    selectedQuotation.containers,
                  ],

                  [
                    "Special Requirements",
                    selectedQuotation.special_requirements,
                  ],

                  [
                    "Status",
                    selectedQuotation.status,
                  ],

                  [
                    "Created",
                    formatDate(
                      selectedQuotation.created_at
                    ),
                  ],

                ].map(
                  ([label, value]) => (

                    <div
                      key={label}
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "20px",
                        padding:
                          "14px 0",
                        borderBottom:
                          "1px solid #edf0f4",
                      }}
                    >

                      <span
                        style={{
                          color:
                            "#68758a",
                          fontSize:
                            "13px",
                        }}
                      >
                        {label}
                      </span>

                      <strong
                        style={{
                          textAlign:
                            "right",
                          maxWidth:
                            "60%",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {value || "—"}
                      </strong>

                    </div>

                  )
                )}

              </div>


              {/* COMMERCIAL */}

              <div
                style={{
                  marginTop: "25px",
                  padding: "20px",
                  borderRadius: "10px",
                  background:
                    "#f5f8fb",
                }}
              >

                <span className="admin-panel-label">
                  INTERNAL COMMERCIAL DATA
                </span>


                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "16px",
                    marginTop:
                      "15px",
                  }}
                >

                  <div>

                    <span
                      style={{
                        fontSize:
                          "12px",
                        opacity:
                          0.7,
                      }}
                    >
                      Customer Value
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "20px",
                        marginTop:
                          "5px",
                      }}
                    >
                      {
                        formatCurrency(
                          selectedQuotation
                            .customer_value_usd
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span
                      style={{
                        fontSize:
                          "12px",
                        opacity:
                          0.7,
                      }}
                    >
                      Brokerage Profit
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "20px",
                        marginTop:
                          "5px",
                      }}
                    >
                      {
                        formatCurrency(
                          selectedQuotation
                            .brokerage_profit_usd
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span
                      style={{
                        fontSize:
                          "12px",
                        opacity:
                          0.7,
                      }}
                    >
                      Target Margin
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "20px",
                        marginTop:
                          "5px",
                      }}
                    >
                      {
                        Number(
                          selectedQuotation
                            .margin_percent ||
                          0
                        ).toFixed(2)
                      }%
                    </strong>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  DOWNLOAD ACTIONS
              ================================================== */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid #d9e4e2",
                  background: "#f8fbfa",
                }}
              >
                <span className="admin-panel-label">
                  EXPORT QUOTATION
                </span>

                <p
                  style={{
                    marginTop: "8px",
                    marginBottom: "14px",
                    fontSize: "13px",
                    color: "#68758a",
                  }}
                >
                  Download the proposal before or after an approval decision.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    disabled={quotationActionLoading}
                    onClick={() =>
                      downloadAdminQuotation(
                        selectedQuotation.id,
                        "pdf"
                      )
                    }
                    style={{
                      flex: "1 1 150px",
                      padding: "11px 14px",
                      border: "1px solid #b9ddd7",
                      borderRadius: "8px",
                      cursor: quotationActionLoading
                        ? "not-allowed"
                        : "pointer",
                      background: "#eefaf7",
                      color: "#126c66",
                      fontWeight: "700",
                    }}
                  >
                    ↓ Download PDF
                  </button>

                  <button
                    type="button"
                    disabled={quotationActionLoading}
                    onClick={() =>
                      downloadAdminQuotation(
                        selectedQuotation.id,
                        "csv"
                      )
                    }
                    style={{
                      flex: "1 1 150px",
                      padding: "11px 14px",
                      border: "1px solid #e3d2a7",
                      borderRadius: "8px",
                      cursor: quotationActionLoading
                        ? "not-allowed"
                        : "pointer",
                      background: "#fff9eb",
                      color: "#80611d",
                      fontWeight: "700",
                    }}
                  >
                    ↓ Download Data
                  </button>
                </div>
              </div>

              {/* ==================================================
                  APPROVAL ACTIONS
              ================================================== */}

              {(String(
                selectedQuotation.status ||
                  "Pending"
              ).toLowerCase() === "pending" ||
                String(
                  selectedQuotation.status ||
                    "Pending"
                ).toLowerCase() === "reviewed") && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    borderRadius: "10px",
                    border: "1px solid #e1e6ed",
                    background: "#fff",
                  }}
                >
                  <span className="admin-panel-label">
                    QUOTATION DECISION
                  </span>

                  <p
                    style={{
                      marginTop: "8px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      color: "#68758a",
                    }}
                  >
                    Review the quotation details and
                    approve or reject this customer request.
                  </p>

                  {quotationActionError && (
                    <div
                      style={{
                        marginBottom: "12px",
                        padding: "10px 12px",
                        borderRadius: "7px",
                        background: "#fff0f0",
                        border: "1px solid #efb7b7",
                        color: "#a33a3a",
                        fontSize: "13px",
                      }}
                    >
                      {quotationActionError}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      disabled={quotationActionLoading}
                      onClick={() =>
                        updateQuotationStatus(
                          selectedQuotation.id,
                          "Approved"
                        )
                      }
                      style={{
                        flex: "1 1 160px",
                        padding: "12px 16px",
                        border: "1px solid #b7dfc2",
                        borderRadius: "8px",
                        cursor: quotationActionLoading
                          ? "not-allowed"
                          : "pointer",
                        background: "#eaf7ee",
                        fontWeight: "700",
                      }}
                    >
                      {quotationActionLoading
                        ? "Processing..."
                        : "✓ Approve Quotation"}
                    </button>

                    <button
                      type="button"
                      disabled={quotationActionLoading}
                      onClick={() =>
                        updateQuotationStatus(
                          selectedQuotation.id,
                          "Rejected"
                        )
                      }
                      style={{
                        flex: "1 1 160px",
                        padding: "12px 16px",
                        border: "1px solid #efb7b7",
                        borderRadius: "8px",
                        cursor: quotationActionLoading
                          ? "not-allowed"
                          : "pointer",
                        background: "#fff0f0",
                        fontWeight: "700",
                      }}
                    >
                      {quotationActionLoading
                        ? "Processing..."
                        : "✕ Reject Quotation"}
                    </button>
                  </div>
                </div>
              )}

              {String(
                selectedQuotation.status || ""
              ).toLowerCase() === "approved" && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    background: "#eaf7ee",
                    border: "1px solid #b7dfc2",
                    fontWeight: "700",
                  }}
                >
                  ✓ This quotation has been approved.
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#47705a",
                    }}
                  >
                    Customer notification email has been triggered.
                  </div>
                </div>
              )}

              {String(
                selectedQuotation.status || ""
              ).toLowerCase() === "rejected" && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    background: "#fff0f0",
                    border: "1px solid #efb7b7",
                    fontWeight: "700",
                  }}
                >
                  ✕ This quotation has been rejected.
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#8a5050",
                    }}
                  >
                    Customer notification email has been triggered.
                  </div>
                </div>
              )}

            </div>

          </div>

        )}

      </>
    );
  }


  // ==========================================================
  // ROUTE INTELLIGENCE
  // ==========================================================
  function renderRouteIntelligence() {
    const query = routeSearch.trim().toLowerCase();
    const filteredRoutes = routes.filter((route) =>
      !query || [route.route_id, route.origin, route.destination, route.route_type]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
    const origins = new Set(routes.map((r) => r.origin)).size;
    const destinations = new Set(routes.map((r) => r.destination)).size;
    const avgTransit = routes.length ? routes.reduce((sum, r) => sum + Number(r.transit_days || 0), 0) / routes.length : 0;
    const avgFreight = routes.length ? routes.reduce((sum, r) => sum + Number(r.base_freight_usd || 0), 0) / routes.length : 0;

    return (
      <>
        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">ROUTE INTELLIGENCE</span>
            <h1>🗺️ Route Intelligence</h1>
            <p>Live route dataset used by the Waypoint AI Route Agent.</p>
          </div>
          <div className="admin-secure-badge">🔐 Admin Only</div>
        </div>

        {routesError && <div className="admin-error-message" style={{ marginBottom: 18 }}>{routesError} <button type="button" onClick={loadRoutes}>Retry</button></div>}

        <div className="admin-stat-grid">
          {[["🗺️", "Total Routes", routes.length, "Dataset routes"], ["⚓", "Origin Ports", origins, "Connected origins"], ["🌍", "Destinations", destinations, "Reachable destinations"], ["⏱️", "Avg Transit", `${avgTransit.toFixed(1)} days`, "Across routes"]].map(([icon, label, value, sub]) => (
            <div className="admin-stat-card" key={label}>
              <div className="admin-stat-icon">{icon}</div><div><span>{label}</span><strong>{routesLoading ? "—" : value}</strong><small>{sub}</small></div>
            </div>
          ))}
        </div>

        <div className="admin-panel" style={{ marginTop: 20 }}>
          <div className="admin-panel-header"><div><span className="admin-panel-label">ROUTE DATASET</span><h2>Available Maritime Routes</h2></div><span className="admin-live-dot">● Live Dataset</span></div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
            <input value={routeSearch} onChange={(e) => setRouteSearch(e.target.value)} placeholder="Search route, port or type..." style={{ flex: 1, minWidth: 260, padding: "12px 14px", border: "1px solid #dfe5ec", borderRadius: 8 }} />
            <button type="button" onClick={loadRoutes} style={{ padding: "12px 18px", borderRadius: 8, border: "1px solid #dfe5ec", background: "#fff", cursor: "pointer" }}>↻ Refresh</button>
          </div>
          {routesLoading ? <div className="admin-empty-state">Loading route intelligence...</div> : filteredRoutes.length === 0 ? <div className="admin-empty-state">No routes found.</div> : (
            <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #edf0f4" }}>{["Route ID","Origin","Destination","Type","Distance","Transit","Transshipments","Base Freight"].map((h) => <th key={h} style={{ padding: "13px 10px", fontSize: 12, color: "#68758a" }}>{h}</th>)}</tr></thead>
              <tbody>{filteredRoutes.map((r) => <tr key={r.route_id} style={{ borderBottom: "1px solid #edf0f4" }}>
                <td style={{ padding: "14px 10px", fontWeight: 800 }}>{r.route_id}</td><td style={{ padding: "14px 10px" }}>{r.origin}</td><td style={{ padding: "14px 10px" }}>{r.destination}</td><td style={{ padding: "14px 10px" }}>{r.route_type}</td><td style={{ padding: "14px 10px" }}>{Number(r.distance_nm || 0).toLocaleString()} NM</td><td style={{ padding: "14px 10px" }}>{r.transit_days} days</td><td style={{ padding: "14px 10px" }}>{r.transshipments}</td><td style={{ padding: "14px 10px", fontWeight: 700 }}>{formatCurrency(r.base_freight_usd)}</td>
              </tr>)}</tbody>
            </table></div>
          )}
        </div>

        <div className="admin-content-grid" style={{ marginTop: 20 }}>
          <div className="admin-panel"><div className="admin-panel-header"><div><span className="admin-panel-label">FREIGHT INTELLIGENCE</span><h2>Average Base Freight</h2></div></div><div style={{ fontSize: 30, fontWeight: 800 }}>{formatCurrency(avgFreight)}</div><p>Average base freight per container across the live route dataset.</p></div>
          <div className="admin-panel"><div className="admin-panel-header"><div><span className="admin-panel-label">ROUTE ENGINE</span><h2>Scoring Factors</h2></div></div><div style={{ display: "grid", gap: 10 }}><div>⚡ <strong>Transit time</strong> — 40%</div><div>📏 <strong>Distance</strong> — 25%</div><div>🔄 <strong>Transshipments</strong> — 35%</div></div></div>
        </div>
      </>
    );
  }

  // PLACEHOLDER
  // ==========================================================

  function renderCustomers() {
    const query = customerSearch.trim().toLowerCase();
    const filtered = customers.filter(c => !query || [c.name, c.username, c.email, c.phone, c.country].some(v => String(v || "").toLowerCase().includes(query)));
    return <>
      <div className="admin-page-heading"><div><span className="admin-eyebrow">ADMIN MODULE</span><h1>👥 Customer Management</h1><p>View registered customers, quotation activity and search history.</p></div><div className="admin-secure-badge">🔐 Admin Only</div></div>
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><div className="admin-stat-icon">👥</div><div><span>Customers</span><strong>{customers.length}</strong><small>Registered accounts</small></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">📄</div><div><span>Customers With Quotes</span><strong>{customers.filter(c => c.quotation_count > 0).length}</strong><small>Active commercial users</small></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">✅</div><div><span>Verified</span><strong>{customers.filter(c => c.is_verified).length}</strong><small>Verified accounts</small></div></div>
      </div>
      <div className="admin-panel" style={{marginBottom:20}}><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><input value={customerSearch} onChange={e=>setCustomerSearch(e.target.value)} placeholder="Search name, email, phone or country..." style={{flex:"1 1 320px",padding:"12px 14px",border:"1px solid #d8dee8",borderRadius:8}}/><button type="button" onClick={loadCustomers}>{customersLoading ? "Refreshing..." : "↻ Refresh"}</button></div></div>
      {customersError && <div className="admin-panel" style={{marginBottom:20}}><strong>Customer service error</strong><p>{customersError}</p></div>}
      <div className="admin-panel" style={{overflow:"hidden"}}><div className="admin-panel-header"><div><span className="admin-panel-label">CUSTOMER RECORDS</span><h2>Registered Customers</h2></div><span className="admin-live-dot">● Live Database</span></div>
        {customersLoading ? <div style={{padding:50,textAlign:"center"}}>Loading customers...</div> : <div style={{overflowX:"auto"}}><table className="admin-data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Country</th><th>Quotes</th><th>Value</th><th>Role</th><th>Action</th></tr></thead><tbody>{filtered.map(c=><tr key={c.id}><td><strong>{c.name || c.username}</strong></td><td>{c.email}</td><td>{c.phone || "—"}</td><td>{c.country || "—"}</td><td>{c.quotation_count}</td><td>{formatCurrency(c.total_customer_value_usd)}</td><td>{String(c.role).toUpperCase()}</td><td><button type="button" onClick={()=>loadCustomerHistory(c)}>View History</button></td></tr>)}</tbody></table></div>}
      </div>
      {selectedCustomer && customerHistory && <div className="admin-panel" style={{marginTop:20}}><div className="admin-panel-header"><div><span className="admin-panel-label">CUSTOMER HISTORY</span><h2>{selectedCustomer.name || selectedCustomer.email}</h2></div><button type="button" onClick={()=>{setSelectedCustomer(null);setCustomerHistory(null)}}>Close</button></div><h3>Quotations</h3><div style={{overflowX:"auto"}}><table className="admin-data-table"><thead><tr><th>ID</th><th>Route</th><th>Cargo</th><th>Status</th><th>Value</th><th>Date</th></tr></thead><tbody>{(customerHistory.quotations||[]).map(q=><tr key={q.id}><td>#{q.id}</td><td>{q.origin} → {q.destination}</td><td>{q.cargo_type || "—"}</td><td>{q.status}</td><td>{formatCurrency(q.customer_value_usd)}</td><td>{formatDate(q.created_at)}</td></tr>)}</tbody></table></div><h3 style={{marginTop:20}}>Search History</h3><div style={{overflowX:"auto"}}><table className="admin-data-table"><thead><tr><th>Origin</th><th>Destination</th><th>Route</th><th>Searched</th></tr></thead><tbody>{(customerHistory.search_history||[]).map((s,i)=><tr key={s.id||i}><td>{s.origin||"—"}</td><td>{s.destination||"—"}</td><td>{s.route_id||"—"}</td><td>{formatDate(s.searched_at)}</td></tr>)}</tbody></table></div></div>}
    </>;
  }

  function renderCommercial() {
    const summary = commercial?.summary || {};
    const monthly = commercial?.monthly || [];
    const maxValue = Math.max(...monthly.map(m=>Number(m.customer_value_usd||0)), 1);
    return <>
      <div className="admin-page-heading"><div><span className="admin-eyebrow">COMMERCIAL INTELLIGENCE</span><h1>💰 Commercial Analytics</h1><p>Internal pricing, business value, brokerage profit and margin performance.</p></div><div className="admin-secure-badge">🔐 Admin Only</div></div>
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><div className="admin-stat-icon">📄</div><div><span>Total Quotations</span><strong>{summary.total_quotations||0}</strong><small>Database records</small></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">💵</div><div><span>Total Business</span><strong>{formatCurrency(summary.total_customer_value_usd)}</strong><small>Customer quotation value</small></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">📈</div><div><span>Brokerage Profit</span><strong>{formatCurrency(summary.total_brokerage_profit_usd)}</strong><small>Internal profit</small></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">%</div><div><span>Average Margin</span><strong>{Number(summary.average_margin_percent||0).toFixed(2)}%</strong><small>Target margin average</small></div></div>
      </div>
      {commercialError && <div className="admin-panel"><strong>Commercial analytics error</strong><p>{commercialError}</p></div>}
      <div className="admin-content-grid">
        <div className="admin-panel"><div className="admin-panel-header"><div><span className="admin-panel-label">MONTHLY BUSINESS</span><h2>Business & Profit Trend</h2></div><button onClick={loadCommercial}>{commercialLoading?"Refreshing...":"↻ Refresh"}</button></div>{monthly.length===0?<p>No quotation business data recorded yet.</p>:<div style={{display:"flex",gap:14,alignItems:"flex-end",height:260,padding:"20px 5px",overflowX:"auto"}}>{monthly.map(m=><div key={m.month} style={{minWidth:65,textAlign:"center",height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div title={formatCurrency(m.customer_value_usd)} style={{height:`${Math.max(8,(Number(m.customer_value_usd)/maxValue)*190)}px`,background:"#1f6feb",borderRadius:"6px 6px 0 0"}}></div><small>{m.month}</small><small>{formatCurrency(m.brokerage_profit_usd)}</small></div>)}</div>}</div>
        <div className="admin-panel"><div className="admin-panel-header"><div><span className="admin-panel-label">STATUS ANALYTICS</span><h2>Quotation Outcomes</h2></div></div>{Object.entries(commercial?.status_counts||{}).map(([s,n])=><div key={s} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #edf0f4"}}><span>{s}</span><strong>{n}</strong></div>)}<div className="admin-info-message" style={{marginTop:15}}><span>ℹ️</span><p>{commercial?.satisfaction?.message || "No satisfaction data."}</p></div></div>
      </div>
      <div className="admin-panel" style={{marginTop:20}}><div className="admin-panel-header"><div><span className="admin-panel-label">ROUTE PROFITABILITY</span><h2>Top Routes by Brokerage Profit</h2></div></div><div style={{overflowX:"auto"}}><table className="admin-data-table"><thead><tr><th>Route</th><th>Quotes</th><th>Business Value</th><th>Brokerage Profit</th></tr></thead><tbody>{(commercial?.route_profitability||[]).map(r=><tr key={r.route_id}><td>{r.route_id}</td><td>{r.quotations}</td><td>{formatCurrency(r.customer_value_usd)}</td><td><strong>{formatCurrency(r.brokerage_profit_usd)}</strong></td></tr>)}</tbody></table></div></div>
    </>;
  }

  function renderOperations() {
    const q = operationSearch.trim().toLowerCase();
    const filtered = operations.filter(o=>!q || [o.company_name,o.email,o.origin,o.destination,o.route_id,o.operation_status].some(v=>String(v||"").toLowerCase().includes(q)));
    return <>
      <div className="admin-page-heading"><div><span className="admin-eyebrow">OPERATIONS CONTROL</span><h1>⚓ Operations</h1><p>Track approved work, shipping phases and completed operations.</p></div><div className="admin-secure-badge">🔐 Admin Only</div></div>
      <div className="admin-stat-grid">{["Needs Review","Approved","In Shipping","Completed","Rejected"].map(s=><div className="admin-stat-card" key={s}><div className="admin-stat-icon">{s==="Completed"?"✅":s==="Rejected"?"❌":"⚓"}</div><div><span>{s}</span><strong>{operationSummary[s]||0}</strong><small>Operations</small></div></div>)}</div>
      {operationsError && <div className="admin-panel"><strong>Operations error</strong><p>{operationsError}</p></div>}
      <div className="admin-panel" style={{marginBottom:20}}><div style={{display:"flex",gap:12}}><input value={operationSearch} onChange={e=>setOperationSearch(e.target.value)} placeholder="Search customer, email, route or status..." style={{flex:"1 1 320px",padding:"12px 14px",border:"1px solid #d8dee8",borderRadius:8}}/><button onClick={loadOperations}>{operationsLoading?"Refreshing...":"↻ Refresh"}</button></div></div>
      <div className="admin-panel" style={{overflow:"hidden"}}><div className="admin-panel-header"><div><span className="admin-panel-label">LIVE OPERATIONS</span><h2>Operational Work Queue</h2></div></div><div style={{overflowX:"auto"}}><table className="admin-data-table"><thead><tr><th>Quotation</th><th>Customer</th><th>Route</th><th>Cargo</th><th>Status</th><th>Update</th></tr></thead><tbody>{filtered.map(o=><tr key={o.quotation_id}><td>#{o.quotation_id}</td><td>{o.company_name}<br/><small>{o.email}</small></td><td>{o.origin} → {o.destination}</td><td>{o.cargo_type||"—"} / {o.containers||0}</td><td>{o.operation_status}</td><td>{o.operation_status!=="Rejected"&&o.operation_status!=="Completed"?<select value={o.operation_status} onChange={e=>updateOperationStatus(o.quotation_id,e.target.value)}><option>Approved</option><option>In Shipping</option><option>Completed</option><option>Rejected</option></select>:<span>Final</span>}</td></tr>)}</tbody></table></div></div>
    </>;
  }

  function renderReviews() {
    const query = reviewSearch.trim().toLowerCase();
    const filtered = reviews.filter((review) =>
      !query ||
      [review.customer_name, review.customer_email, review.title, review.review, review.service_area]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );

    return <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">CUSTOMER EXPERIENCE</span>
          <h1>💬 Customer Feedback</h1>
          <p>Read customer opinions, respond personally, and show that every voice reaches the Waypoint AI team.</p>
        </div>
        <div className="admin-secure-badge">🔐 Admin Only</div>
      </div>

      <div className="admin-stat-grid feedback-stat-grid">
        <div className="admin-stat-card"><div className="admin-stat-icon">💬</div><div><span>Total Reviews</span><strong>{reviewStats.total}</strong><small>Customer opinions received</small></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">🔔</div><div><span>Needs Response</span><strong className={reviewStats.unreplied ? "admin-number-warning" : "admin-number-positive"}>{reviewStats.unreplied}</strong><small>Awaiting administrator reply</small></div></div>
        <div className="admin-stat-card"><div className="admin-stat-icon">★</div><div><span>Average Rating</span><strong>{reviewStats.average}</strong><small>Out of 5.0</small></div></div>
      </div>

      <div className="admin-panel feedback-toolbar">
        <input value={reviewSearch} onChange={(e) => setReviewSearch(e.target.value)} placeholder="Search customer, service or review..." />
        <button type="button" onClick={loadReviews}>{reviewsLoading ? "Refreshing..." : "↻ Refresh feedback"}</button>
      </div>

      {reviewsError && <div className="admin-panel feedback-error"><strong>Feedback error</strong><p>{reviewsError}</p></div>}

      {reviewsLoading && !reviews.length ? (
        <div className="admin-panel admin-loading-state">Loading customer feedback...</div>
      ) : (
        <div className="feedback-layout">
          <div className="feedback-list">
            {filtered.length ? filtered.map((review) => (
              <button type="button" className={`feedback-item ${selectedReview?.id === review.id ? "is-selected" : ""}`} key={review.id} onClick={() => { setSelectedReview(review); setReviewReply(review.admin_reply || ""); setReviewReplyMessage(""); }}>
                <div className="feedback-item__top"><span className="feedback-rating">{"★".repeat(Number(review.rating || 0))}{"☆".repeat(5 - Number(review.rating || 0))}</span><span className={review.admin_replied ? "feedback-replied" : "feedback-unreplied"}>{review.admin_replied ? "Replied" : "Needs reply"}</span></div>
                <strong>{review.title || "Waypoint experience"}</strong>
                <span>{review.customer_name} · {review.service_area}</span>
                <p>{review.review}</p>
                <small>{formatDate(review.created_at)}</small>
              </button>
            )) : <div className="admin-panel feedback-empty">No customer feedback matches your search.</div>}
          </div>

          <div className="feedback-detail">
            {selectedReview ? (
              <>
                <div className="feedback-detail__head">
                  <div><span className="admin-eyebrow">REVIEW #{selectedReview.id}</span><h2>{selectedReview.title || "Waypoint experience"}</h2><p>{selectedReview.customer_name} · {selectedReview.customer_email}</p></div>
                  <div className="feedback-detail__rating">{"★".repeat(Number(selectedReview.rating || 0))}{"☆".repeat(5 - Number(selectedReview.rating || 0))}</div>
                </div>
                <div className="feedback-detail__meta"><span>{selectedReview.service_area}</span><span>Submitted {formatDate(selectedReview.created_at)}</span></div>
                <blockquote>{selectedReview.review}</blockquote>

                {selectedReview.admin_reply && <div className="feedback-existing-reply"><span>YOUR CURRENT RESPONSE</span><p>{selectedReview.admin_reply}</p><small>{selectedReview.admin_reply_at ? `Sent ${formatDate(selectedReview.admin_reply_at)}` : "Response recorded"}</small></div>}

                <div className="feedback-reply-box">
                  <div><span className="admin-eyebrow">ADMIN RESPONSE</span><h3>{selectedReview.admin_reply ? "Update your response" : "Reply to this customer"}</h3></div>
                  <textarea value={reviewReply} onChange={(e) => setReviewReply(e.target.value)} maxLength={2000} placeholder="Write a thoughtful response to the customer's feedback..." />
                  <div className="feedback-reply-actions"><small>{reviewReply.length}/2000 characters</small><button type="button" onClick={() => replyToReview(selectedReview.id)} disabled={reviewReplyLoading}>{reviewReplyLoading ? "Sending..." : selectedReview.admin_reply ? "Update response →" : "Send response →"}</button></div>
                  {reviewReplyMessage && <div className="feedback-reply-message">{reviewReplyMessage}</div>}
                </div>
              </>
            ) : (
              <div className="feedback-detail__empty"><span>💬</span><h2>Select a customer review</h2><p>Read the customer's experience and send a personal response from this panel.</p></div>
            )}
          </div>
        </div>
      )}
    </>;
  }


  function renderSettings() {
    return <>
      <div className="admin-page-heading"><div><span className="admin-eyebrow">SYSTEM ADMINISTRATION</span><h1>⚙️ System Settings</h1><p>Manage administrator access and core administrative controls.</p></div><div className="admin-secure-badge">🔐 Admin Only</div></div>
      {adminsError && <div className="admin-panel"><strong>Administrator management error</strong><p>{adminsError}</p></div>}
      <div className="admin-panel" style={{marginBottom:20}}><div className="admin-panel-header"><div><span className="admin-panel-label">ADD ADMINISTRATOR</span><h2>Grant Admin Access</h2></div></div><p>Enter the Gmail address of an existing registered user. No new admin account is created here.</p><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><input value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)} placeholder="registered-user@gmail.com" style={{flex:"1 1 320px",padding:"12px 14px",border:"1px solid #d8dee8",borderRadius:8}}/><button type="button" onClick={addAdministrator}>Add Administrator</button></div></div>
      <div className="admin-panel"><div className="admin-panel-header"><div><span className="admin-panel-label">ADMINISTRATOR ACCOUNTS</span><h2>Admin Management</h2></div><button onClick={loadAdmins}>{adminsLoading?"Refreshing...":"↻ Refresh"}</button></div><div style={{overflowX:"auto"}}><table className="admin-data-table"><thead><tr><th>Name</th><th>Email</th><th>Verified</th><th>Role</th><th>Action</th></tr></thead><tbody>{admins.map(a=><tr key={a.id}><td>{a.name||a.username}</td><td>{a.email}</td><td>{a.is_verified?"Yes":"No"}</td><td>ADMIN</td><td>{a.id===admin?.id?<span>Current Admin</span>:<button type="button" onClick={()=>removeAdministrator(a.id)}>Remove Admin</button>}</td></tr>)}</tbody></table></div></div>
      <div className="admin-info-message" style={{marginTop:20}}><span>🔐</span><p>Admin access is enforced by the backend role and protected administrator JWT. Removing an admin changes their database role back to a normal user.</p></div>
    </>;
  }

  function renderPlaceholder(
    title,
    description,
    icon
  ) {

    return (

      <div className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            ADMIN MODULE
          </span>

          <h1>
            {icon} {title}
          </h1>

          <p>
            {description}
          </p>

        </div>


        <div className="admin-secure-badge">
          🔐 Admin Only
        </div>

      </div>

    );
  }


  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (

    <div className="admin-dashboard">


      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside className="admin-sidebar">


        <div className="admin-brand">

          <div className="admin-brand-mark">
            W
          </div>

          <div>

            <strong>
              Waypoint AI
            </strong>

            <span>
              ADMIN PORTAL
            </span>

          </div>

        </div>


        <div className="admin-nav-label">
          CONTROL CENTER
        </div>


        <nav className="admin-nav">

          {menuItems.map(
            (item) => (

              <button
                key={item.id}
                className={
                  activeSection ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveSection(
                    item.id
                  )
                }
              >

                <span className="admin-nav-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </button>

            )
          )}

        </nav>


        <div className="admin-sidebar-bottom">


          <div className="admin-security-status">

            <span className="status-indicator" />

            <div>

              <strong>
                System Secure
              </strong>

              <small>
                Admin session active
              </small>

            </div>

          </div>


          <button
            className="admin-logout"
            onClick={
              handleLogout
            }
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </div>

      </aside>


      {/* ====================================================
          MAIN
      ==================================================== */}

      <main className="admin-main">


        <header className="admin-topbar">

          <div className="admin-topbar-title">

            Waypoint AI

            <span>
              /
            </span>

            Administration

          </div>


          <div className="admin-topbar-user">

            <div className="admin-topbar-avatar">

              {adminName
                .charAt(0)
                .toUpperCase()}

            </div>


            <div>

              <strong>
                {adminName}
              </strong>

              <span>
                Administrator
              </span>

            </div>

            <button type="button" className="admin-topbar-logout" onClick={handleLogout} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #dfe5ec", background: "#fff", cursor: "pointer", fontWeight: 700, marginLeft: 14 }}>
              Logout ↪
            </button>

          </div>

        </header>


        <section className="admin-content">


          {/* OVERVIEW */}

          {activeSection ===
            "overview" &&
            renderOverview()}


          {/* QUOTATIONS */}

          {activeSection ===
            "quotations" &&
            renderQuotations()}


          {/* OTHER MODULES */}

          {activeSection ===
            "routes" &&
            renderRouteIntelligence()}


          {activeSection === "customers" && renderCustomers()}

          {activeSection === "reviews" && renderReviews()}

          {activeSection === "commercial" && renderCommercial()}

          {activeSection === "operations" && renderOperations()}

          {activeSection === "settings" && renderSettings()}

        </section>

      </main>

    </div>
  );
}


export default AdminDashboard;