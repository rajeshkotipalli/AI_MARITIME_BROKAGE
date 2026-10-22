import WaypointAI from "./components/WaypointAI";

import {

  BrowserRouter,

  Routes,

  Route,

  Navigate,

} from "react-router-dom";

import { useState } from "react";

import Login from "./Login";

import Register from "./Register";

import OTPVerification from "./OTPVerification";

import AdminLogin from "./AdminLogin";

import AdminOTP from "./AdminOTP";

import AdminDashboard from "./AdminDashboard";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";

import RouteResults from "./pages/RouteResults";

import History from "./pages/History";

import ConnectedPorts from "./pages/ConnectedPorts";

import RequestQuotation from "./pages/RequestQuotation";

import Weather from "./pages/Weather";
import PublicLanding from "./PublicLanding";


import OperationsDashboard from "./pages/OperationsDashboard";
import QuotationReviews from "./pages/QuotationReviews";
import MyShipments from "./pages/MyShipments";

import "./App.css";

// ============================================================

// SCREEN CONSTANTS

// ============================================================

const AUTH_PUBLIC = "public";
const AUTH_LOGIN = "login";

const AUTH_REGISTER = "register";

const AUTH_OTP = "otp";

const AUTH_APP = "app";

const ADMIN_LOGIN = "admin_login";

const ADMIN_OTP = "admin_otp";

const ADMIN_APP = "admin_app";

// ============================================================

// APPLICATION

// ============================================================

function Application() {

  // ==========================================================

  // NORMAL USER AUTHENTICATION

  // ==========================================================

  const [authScreen, setAuthScreen] = useState(() => {

    return localStorage.getItem("waypoint_token")

      ? AUTH_APP

      : AUTH_PUBLIC;

  });

  const [otpData, setOtpData] = useState(null);

  const [user, setUser] = useState(() => {

    const saved = localStorage.getItem("waypoint_user");

    if (!saved) {

      return null;

    }

    try {

      return JSON.parse(saved);

    } catch (error) {

      console.error("Failed to parse saved user:", error);

      return null;

    }

  });

  // ==========================================================

  // ADMIN AUTHENTICATION

  // ==========================================================

  const [adminScreen, setAdminScreen] = useState(() => {

    const adminToken =

      localStorage.getItem("waypoint_admin_token");

    const adminUser =

      localStorage.getItem("waypoint_admin_user");

    if (adminToken && adminUser) {

      return ADMIN_APP;

    }

    return null;

  });

  const [adminOtpData, setAdminOtpData] = useState(null);

  const [admin, setAdmin] = useState(() => {

    const saved =

      localStorage.getItem("waypoint_admin_user");

    if (!saved) {

      return null;

    }

    try {

      return JSON.parse(saved);

    } catch (error) {

      console.error(

        "Failed to parse saved administrator:",

        error

      );

      return null;

    }

  });

  // ==========================================================

  // GLOBAL DEBUG LOG

  // ==========================================================

  console.log("APP RENDER:", {

    authScreen,

    adminScreen,

    user,

    admin,

    hasAdminToken:

      !!localStorage.getItem("waypoint_admin_token"),

  });

  // ==========================================================

  // NORMAL USER LOGIN

  // ==========================================================

  function handleLoginSuccess(data) {

    console.log(

      "USER LOGIN SUCCESS:",

      data

    );

    setOtpData({

      email: data.email,

      developmentOtp:

        data.developmentOtp,

    });

    setAuthScreen(AUTH_OTP);

  }

  // ==========================================================

  // NORMAL USER REGISTER

  // ==========================================================

  function handleRegisterSuccess(data) {

    console.log(

      "USER REGISTER SUCCESS:",

      data

    );

    setOtpData({

      email: data.email,

      developmentOtp:

        data.developmentOtp,

    });

    setAuthScreen(AUTH_OTP);

  }

  // ==========================================================

  // NORMAL USER OTP VERIFIED

  // ==========================================================

  function handleOTPVerified(data) {

    console.log(

      "USER OTP VERIFIED:",

      data

    );

    const loggedInUser =

      data?.user || data;

    const accessToken =

      data?.access_token ||

      data?.token;

    if (accessToken) {

      localStorage.setItem(

        "waypoint_token",

        accessToken

      );

    }

    if (loggedInUser) {

      localStorage.setItem(

        "waypoint_user",

        JSON.stringify(loggedInUser)

      );

      setUser(loggedInUser);

    }

    setOtpData(null);

    setAuthScreen(AUTH_APP);

  }

  // ==========================================================

  // NORMAL USER LOGOUT

  // ==========================================================

  function handleLogout() {

    console.log(

      "USER LOGOUT"

    );

    localStorage.removeItem(

      "waypoint_token"

    );

    localStorage.removeItem(

      "waypoint_user"

    );

    setUser(null);

    setOtpData(null);

    setAuthScreen(AUTH_PUBLIC);

  }

  // ==========================================================

  // ADMIN LOGIN

  // ==========================================================

  function handleAdminLoginSuccess(data) {

    console.log(

      "ADMIN LOGIN SUCCESS:",

      data

    );

    if (!data?.email) {

      console.error(

        "Admin login did not return an email:",

        data

      );

      return;

    }

    setAdminOtpData({

      email: data.email,

    });

    setAdminScreen(

      ADMIN_OTP

    );

  }

  // ==========================================================

  // ADMIN OTP VERIFIED

  // ==========================================================

  function handleAdminOTPVerified(data) {

    console.log(

      "ADMIN OTP VERIFIED:",

      data

    );

    // --------------------------------------------------------

    // BACKEND RESPONSE

    // --------------------------------------------------------

    //

    // {

    //   success: true,

    //   access_token: "...",

    //   token_type: "bearer",

    //   admin: {

    //      id,

    //      name,

    //      username,

    //      email,

    //      role

    //   }

    // }

    //

    // --------------------------------------------------------

    const adminUser =

      data?.admin ||

      data?.user;

    const adminToken =

      data?.access_token ||

      data?.token;

    // --------------------------------------------------------

    // VALIDATE TOKEN

    // --------------------------------------------------------

    if (!adminToken) {

      console.error(

        "ADMIN TOKEN NOT FOUND:",

        data

      );

      return;

    }

    // --------------------------------------------------------

    // VALIDATE ADMIN USER

    // --------------------------------------------------------

    if (!adminUser) {

      console.error(

        "ADMIN USER NOT FOUND:",

        data

      );

      return;

    }

    // --------------------------------------------------------

    // CHECK ROLE

    // --------------------------------------------------------

    if (

      adminUser.role &&

      adminUser.role !== "admin"

    ) {

      console.error(

        "USER IS NOT ADMIN:",

        adminUser

      );

      return;

    }

    // --------------------------------------------------------

    // SAVE ADMIN TOKEN

    // --------------------------------------------------------

    localStorage.setItem(

      "waypoint_admin_token",

      adminToken

    );

    // --------------------------------------------------------

    // SAVE ADMIN USER

    // --------------------------------------------------------

    localStorage.setItem(

      "waypoint_admin_user",

      JSON.stringify(adminUser)

    );

    // --------------------------------------------------------

    // UPDATE STATE

    // --------------------------------------------------------

    setAdmin(adminUser);

    setAdminOtpData(null);

    setAdminScreen(

      ADMIN_APP

    );

    console.log(

      "ADMIN SESSION CREATED SUCCESSFULLY"

    );

    console.log(

      "ADMIN USER:",

      adminUser

    );

    console.log(

      "ADMIN TOKEN SAVED:",

      !!localStorage.getItem(

        "waypoint_admin_token"

      )

    );

  }

  // ==========================================================

  // ADMIN LOGOUT

  // ==========================================================

  function handleAdminLogout() {

    console.log(

      "ADMIN LOGOUT"

    );

    localStorage.removeItem(

      "waypoint_admin_token"

    );

    localStorage.removeItem(

      "waypoint_admin_user"

    );

    setAdmin(null);

    setAdminOtpData(null);

    setAdminScreen(null);

    setAuthScreen(

      AUTH_LOGIN

    );

  }

  // ==========================================================

  // ADMIN LOGIN SCREEN

  // ==========================================================

  if (adminScreen === ADMIN_LOGIN) {

    console.log(

      "ADMIN LOGIN SCREEN RENDERING"

    );

    return (

      <AdminLogin

        onLoginSuccess={

          handleAdminLoginSuccess

        }

        onBack={() => {

          console.log(

            "BACK FROM ADMIN LOGIN"

          );

          setAdminOtpData(null);

          setAdminScreen(null);

          setAuthScreen(

            AUTH_LOGIN

          );

        }}

      />

    );

  }

  // ==========================================================

  // ADMIN OTP SCREEN

  // ==========================================================

  if (adminScreen === ADMIN_OTP) {

    console.log(

      "ADMIN OTP SCREEN RENDERING:",

      adminOtpData

    );

    return (

      <AdminOTP

        email={

          adminOtpData?.email

        }

        onVerified={

          handleAdminOTPVerified

        }

        onBack={() => {

          console.log(

            "BACK FROM ADMIN OTP"

          );

          setAdminOtpData(null);

          setAdminScreen(

            ADMIN_LOGIN

          );

        }}

      />

    );

  }

  // ==========================================================

  // ADMIN DASHBOARD

  // ==========================================================

  if (adminScreen === ADMIN_APP) {

    console.log(

      "================================"

    );

    console.log(

      "ADMIN APP RENDERING"

    );

    console.log(

      "ADMIN:",

      admin

    );

    console.log(

      "ADMIN TOKEN:",

      !!localStorage.getItem(

        "waypoint_admin_token"

      )

    );

    console.log(

      "================================"

    );

    return (

      <AdminDashboard

        key="admin-dashboard"

        admin={admin}

        onLogout={

          handleAdminLogout

        }

      />

    );

  }

  // ==========================================================

  // PUBLIC MARKETING LANDING PAGE (BEFORE LOGIN)

  // ==========================================================

  if (authScreen === AUTH_PUBLIC) {

    return (

      <PublicLanding

        onLogin={() => setAuthScreen(AUTH_LOGIN)}

        onRegister={() => setAuthScreen(AUTH_REGISTER)}

      />

    );

  }

  // ==========================================================

  // NORMAL USER LOGIN

  // ==========================================================

  if (authScreen === AUTH_LOGIN) {

    console.log(

      "LOGIN SCREEN RENDERING"

    );

    return (

      <Login

        onBackHome={() => setAuthScreen(AUTH_PUBLIC)}

        onLoginSuccess={

          handleLoginSuccess

        }

        onRegister={() =>

          setAuthScreen(

            AUTH_REGISTER

          )

        }

        onAdminLogin={() => {

          console.log(

            "ADMIN LOGIN BUTTON CLICKED"

          );

          setAdminOtpData(null);

          setAdminScreen(

            ADMIN_LOGIN

          );

        }}

      />

    );

  }

  // ==========================================================

  // NORMAL USER REGISTER

  // ==========================================================

  if (authScreen === AUTH_REGISTER) {

    console.log(

      "REGISTER SCREEN RENDERING"

    );

    return (

      <Register

        onBackHome={() => setAuthScreen(AUTH_PUBLIC)}

        onRegisterSuccess={

          handleRegisterSuccess

        }

        onLogin={() =>

          setAuthScreen(

            AUTH_LOGIN

          )

        }

      />

    );

  }

  // ==========================================================

  // NORMAL USER OTP

  // ==========================================================

  if (authScreen === AUTH_OTP) {

    console.log(

      "USER OTP SCREEN RENDERING"

    );

    return (

      <OTPVerification

        email={

          otpData?.email

        }

        developmentOtp={

          otpData?.developmentOtp

        }

        onVerified={

          handleOTPVerified

        }

        onBack={() => {

          setOtpData(null);

          setAuthScreen(

            AUTH_LOGIN

          );

        }}

      />

    );

  }

  // ==========================================================

  // NORMAL USER APPLICATION

  // ==========================================================

  console.log(

    "NORMAL USER APPLICATION RENDERING"

  );

  return (

    <BrowserRouter>

      <Navbar

        user={user}

        onLogout={

          handleLogout

        }

      />

      <Routes>

        {/* ==================================================

            HOME

        ================================================== */}

        <Route

          path="/"

          element={

            <Home />

          }

        />

        {/* ==================================================

            ROUTE ANALYSIS

        ================================================== */}

        <Route

          path="/routes"

          element={

            <RouteResults />

          }

        />

        {/* ==================================================

            OPERATIONS DASHBOARD

        ================================================== */}

        <Route

          path="/dashboard"

          element={

            <OperationsDashboard />

          }

        />

        <Route path="/my-shipments" element={<MyShipments />} />

        {/* ==================================================

            HISTORY

        ================================================== */}

        <Route

          path="/history"

          element={

            <History />

          }

        />

        {/* ==================================================

            CONNECTED PORTS

        ================================================== */}

        <Route

          path="/connected-ports"

          element={

            <ConnectedPorts />

          }

        />

        {/* ==================================================

            WEATHER

        ================================================== */}

        <Route

          path="/weather"

          element={

            <Weather />

          }

        />

        {/* ==================================================

            REQUEST QUOTATION

        ================================================== */}

        <Route

          path="/quotation"

          element={

            <RequestQuotation />

          }

        />

        {/* ==================================================

            QUOTATION REVIEW INTELLIGENCE

            ================================================== */}

        <Route

          path="/quotation-reviews"

          element={

            <QuotationReviews />

          }

        />

        <Route

          path="/quotation-review/:quotationId"

          element={

            <QuotationReviews />

          }

        />
        {/* ==================================================

            UNKNOWN PAGE

        ================================================== */}

        <Route

          path="*"

          element={

            <Navigate

              to="/"

              replace

            />

          }

        />

      </Routes>

      {/* ====================================================

          WAYPOINT AI ASSISTANT

      ==================================================== */}

      <WaypointAI

        currentPage="Waypoint"

      />

    </BrowserRouter>

  );

}

// ============================================================

// APP EXPORT

// ============================================================

function App() {

  return (

    <Application />

  );

}

export default App;