import WaypointAI from "./components/WaypointAI";

import {
<<<<<<< HEAD

  BrowserRouter,

  Routes,

  Route,

  Navigate,

=======
  BrowserRouter,
  Routes,
  Route,
  Navigate,
>>>>>>> origin/master
} from "react-router-dom";

import { useState } from "react";

import Login from "./Login";
<<<<<<< HEAD

import Register from "./Register";

import OTPVerification from "./OTPVerification";

import AdminLogin from "./AdminLogin";

import AdminOTP from "./AdminOTP";

=======
import Register from "./Register";
import OTPVerification from "./OTPVerification";

import AdminLogin from "./AdminLogin";
import AdminOTP from "./AdminOTP";
>>>>>>> origin/master
import AdminDashboard from "./AdminDashboard";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
<<<<<<< HEAD

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

=======
import RouteResults from "./pages/RouteResults";
import History from "./pages/History";
import ConnectedPorts from "./pages/ConnectedPorts";
import RequestQuotation from "./pages/RequestQuotation";
import Weather from "./pages/Weather";
import OperationsDashboard from "./pages/OperationsDashboard";
import MapTracing from "./pages/MapTracing";
import QuotationReviews from "./pages/QuotationReviews";

import "./App.css";


// ============================================================
// SCREEN CONSTANTS
// ============================================================

const AUTH_LOGIN = "login";
const AUTH_REGISTER = "register";
const AUTH_OTP = "otp";
const AUTH_APP = "app";

const ADMIN_LOGIN = "admin_login";
const ADMIN_OTP = "admin_otp";
const ADMIN_APP = "admin_app";


// ============================================================
// APPLICATION
>>>>>>> origin/master
// ============================================================

function Application() {

  // ==========================================================
<<<<<<< HEAD

  // NORMAL USER AUTHENTICATION

  // ==========================================================

  const [authScreen, setAuthScreen] = useState(() => {

    return localStorage.getItem("waypoint_token")

      ? AUTH_APP

      : AUTH_PUBLIC;

=======
  // NORMAL USER AUTHENTICATION
  // ==========================================================

  const [authScreen, setAuthScreen] = useState(() => {
    return localStorage.getItem("waypoint_token")
      ? AUTH_APP
      : AUTH_LOGIN;
>>>>>>> origin/master
  });

  const [otpData, setOtpData] = useState(null);

  const [user, setUser] = useState(() => {

    const saved = localStorage.getItem("waypoint_user");

    if (!saved) {
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
  // ==========================================================

  const [adminScreen, setAdminScreen] = useState(() => {

    const adminToken =
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
  // ==========================================================

  function handleLoginSuccess(data) {

    console.log(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
  // ==========================================================

  function handleRegisterSuccess(data) {

    console.log(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
  // ==========================================================

  function handleOTPVerified(data) {

    console.log(
<<<<<<< HEAD

      "USER OTP VERIFIED:",

      data

    );

    const loggedInUser =

      data?.user || data;

    const accessToken =

      data?.access_token ||

=======
      "USER OTP VERIFIED:",
      data
    );

    const loggedInUser =
      data?.user || data;

    const accessToken =
      data?.access_token ||
>>>>>>> origin/master
      data?.token;

    if (accessToken) {

      localStorage.setItem(
<<<<<<< HEAD

        "waypoint_token",

        accessToken

      );

=======
        "waypoint_token",
        accessToken
      );
>>>>>>> origin/master
    }

    if (loggedInUser) {

      localStorage.setItem(
<<<<<<< HEAD

        "waypoint_user",

        JSON.stringify(loggedInUser)

      );

      setUser(loggedInUser);

=======
        "waypoint_user",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);
>>>>>>> origin/master
    }

    setOtpData(null);

    setAuthScreen(AUTH_APP);
<<<<<<< HEAD

  }

  // ==========================================================

  // NORMAL USER LOGOUT

=======
  }


  // ==========================================================
  // NORMAL USER LOGOUT
>>>>>>> origin/master
  // ==========================================================

  function handleLogout() {

    console.log(
<<<<<<< HEAD

      "USER LOGOUT"

    );

    localStorage.removeItem(

      "waypoint_token"

    );

    localStorage.removeItem(

      "waypoint_user"

=======
      "USER LOGOUT"
    );

    localStorage.removeItem(
      "waypoint_token"
    );

    localStorage.removeItem(
      "waypoint_user"
>>>>>>> origin/master
    );

    setUser(null);

    setOtpData(null);

<<<<<<< HEAD
    setAuthScreen(AUTH_PUBLIC);

  }

  // ==========================================================

  // ADMIN LOGIN

=======
    setAuthScreen(AUTH_LOGIN);
  }


  // ==========================================================
  // ADMIN LOGIN
>>>>>>> origin/master
  // ==========================================================

  function handleAdminLoginSuccess(data) {

    console.log(
<<<<<<< HEAD

      "ADMIN LOGIN SUCCESS:",

      data

=======
      "ADMIN LOGIN SUCCESS:",
      data
>>>>>>> origin/master
    );

    if (!data?.email) {

      console.error(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
  // ==========================================================

  function handleAdminOTPVerified(data) {

    console.log(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
    // --------------------------------------------------------

    if (!adminToken) {

      console.error(
<<<<<<< HEAD

        "ADMIN TOKEN NOT FOUND:",

        data

      );

      return;

    }

    // --------------------------------------------------------

    // VALIDATE ADMIN USER

=======
        "ADMIN TOKEN NOT FOUND:",
        data
      );

      return;
    }


    // --------------------------------------------------------
    // VALIDATE ADMIN USER
>>>>>>> origin/master
    // --------------------------------------------------------

    if (!adminUser) {

      console.error(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
    // --------------------------------------------------------

    setAdmin(adminUser);

    setAdminOtpData(null);

    setAdminScreen(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
  // ==========================================================

  function handleAdminLogout() {

    console.log(
<<<<<<< HEAD

      "ADMIN LOGOUT"

    );

    localStorage.removeItem(

      "waypoint_admin_token"

    );

    localStorage.removeItem(

      "waypoint_admin_user"

=======
      "ADMIN LOGOUT"
    );

    localStorage.removeItem(
      "waypoint_admin_token"
    );

    localStorage.removeItem(
      "waypoint_admin_user"
>>>>>>> origin/master
    );

    setAdmin(null);

    setAdminOtpData(null);

    setAdminScreen(null);

    setAuthScreen(
<<<<<<< HEAD

      AUTH_LOGIN

    );

  }

  // ==========================================================

  // ADMIN LOGIN SCREEN

=======
      AUTH_LOGIN
    );
  }


  // ==========================================================
  // ADMIN LOGIN SCREEN
>>>>>>> origin/master
  // ==========================================================

  if (adminScreen === ADMIN_LOGIN) {

    console.log(
<<<<<<< HEAD

      "ADMIN LOGIN SCREEN RENDERING"

    );

    return (

      <AdminLogin

        onLoginSuccess={

          handleAdminLoginSuccess

=======
      "ADMIN LOGIN SCREEN RENDERING"
    );

    return (
      <AdminLogin
        onLoginSuccess={
          handleAdminLoginSuccess
>>>>>>> origin/master
        }

        onBack={() => {

          console.log(
<<<<<<< HEAD

            "BACK FROM ADMIN LOGIN"

=======
            "BACK FROM ADMIN LOGIN"
>>>>>>> origin/master
          );

          setAdminOtpData(null);

          setAdminScreen(null);

          setAuthScreen(
<<<<<<< HEAD

            AUTH_LOGIN

          );

        }}

      />

    );

  }

  // ==========================================================

  // ADMIN OTP SCREEN

=======
            AUTH_LOGIN
          );
        }}
      />
    );
  }


  // ==========================================================
  // ADMIN OTP SCREEN
>>>>>>> origin/master
  // ==========================================================

  if (adminScreen === ADMIN_OTP) {

    console.log(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
        }

        onBack={() => {

          console.log(
<<<<<<< HEAD

            "BACK FROM ADMIN OTP"

=======
            "BACK FROM ADMIN OTP"
>>>>>>> origin/master
          );

          setAdminOtpData(null);

          setAdminScreen(
<<<<<<< HEAD

            ADMIN_LOGIN

          );

        }}

      />

    );

  }

  // ==========================================================

  // ADMIN DASHBOARD

=======
            ADMIN_LOGIN
          );
        }}
      />
    );
  }


  // ==========================================================
  // ADMIN DASHBOARD
>>>>>>> origin/master
  // ==========================================================

  if (adminScreen === ADMIN_APP) {

    console.log(
<<<<<<< HEAD

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

=======
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
  // NORMAL USER LOGIN
>>>>>>> origin/master
  // ==========================================================

  if (authScreen === AUTH_LOGIN) {

    console.log(
<<<<<<< HEAD

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

=======
      "LOGIN SCREEN RENDERING"
    );

    return (
      <Login

        onLoginSuccess={
          handleLoginSuccess
        }

        onRegister={() =>
          setAuthScreen(
            AUTH_REGISTER
          )
>>>>>>> origin/master
        }

        onAdminLogin={() => {

          console.log(
<<<<<<< HEAD

            "ADMIN LOGIN BUTTON CLICKED"

=======
            "ADMIN LOGIN BUTTON CLICKED"
>>>>>>> origin/master
          );

          setAdminOtpData(null);

          setAdminScreen(
<<<<<<< HEAD

            ADMIN_LOGIN

          );

        }}

      />

    );

  }

  // ==========================================================

  // NORMAL USER REGISTER

=======
            ADMIN_LOGIN
          );
        }}
      />
    );
  }


  // ==========================================================
  // NORMAL USER REGISTER
>>>>>>> origin/master
  // ==========================================================

  if (authScreen === AUTH_REGISTER) {

    console.log(
<<<<<<< HEAD

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

=======
      "REGISTER SCREEN RENDERING"
    );

    return (
      <Register

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
>>>>>>> origin/master
  // ==========================================================

  if (authScreen === AUTH_OTP) {

    console.log(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
        }

        onBack={() => {

          setOtpData(null);

          setAuthScreen(
<<<<<<< HEAD

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

=======
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
            INTELLIGENT MAP / MAP ROUTING
        ================================================== */}

        <Route
          path="/map-tracing"
          element={
            <MapTracing />
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
>>>>>>> origin/master
        />

      </Routes>

<<<<<<< HEAD
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

=======

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
>>>>>>> origin/master
// ============================================================

function App() {

  return (
<<<<<<< HEAD

    <Application />

  );

}

=======
    <Application />
  );
}


>>>>>>> origin/master
export default App;