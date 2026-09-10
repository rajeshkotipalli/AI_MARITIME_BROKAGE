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

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import RouteResults from "./pages/RouteResults";
import History from "./pages/History";
import ConnectedPorts from "./pages/ConnectedPorts";
import RequestQuotation from "./pages/RequestQuotation";
import Weather from "./pages/Weather";
import OperationsDashboard from "./pages/OperationsDashboard";

import "./App.css";


const AUTH_LOGIN = "login";
const AUTH_REGISTER = "register";
const AUTH_OTP = "otp";
const AUTH_APP = "app";


function Application() {

  const [authScreen, setAuthScreen] =
    useState(() => {

      return localStorage.getItem(
        "waypoint_token"
      )
        ? AUTH_APP
        : AUTH_LOGIN;

    });


  const [otpData, setOtpData] =
    useState(null);


  const [user, setUser] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "waypoint_user"
        );

      if (!saved) {
        return null;
      }

      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }

    });


  function handleLoginSuccess(data) {

    setOtpData({
      email:
        data.email,

      developmentOtp:
        data.developmentOtp,
    });

    setAuthScreen(
      AUTH_OTP
    );

  }


  function handleRegisterSuccess(data) {

    setOtpData({
      email:
        data.email,

      developmentOtp:
        data.developmentOtp,
    });

    setAuthScreen(
      AUTH_OTP
    );

  }


  function handleOTPVerified(data) {

    setUser(
      data.user
    );

    setAuthScreen(
      AUTH_APP
    );

  }


  function handleLogout() {

    localStorage.removeItem(
      "waypoint_token"
    );

    localStorage.removeItem(
      "waypoint_user"
    );

    setUser(null);

    setOtpData(null);

    setAuthScreen(
      AUTH_LOGIN
    );

  }


  // -------------------------------------------------
  // LOGIN
  // -------------------------------------------------

  if (
    authScreen ===
    AUTH_LOGIN
  ) {

    return (
      <Login
        onLoginSuccess={
          handleLoginSuccess
        }

        onRegister={() =>
          setAuthScreen(
            AUTH_REGISTER
          )
        }
      />
    );

  }


  // -------------------------------------------------
  // REGISTER
  // -------------------------------------------------

  if (
    authScreen ===
    AUTH_REGISTER
  ) {

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


  // -------------------------------------------------
  // OTP
  // -------------------------------------------------

  if (
    authScreen ===
    AUTH_OTP
  ) {

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


  // -------------------------------------------------
  // MAIN APPLICATION
  // -------------------------------------------------

  return (

    <BrowserRouter>

      <Navbar
        user={user}
        onLogout={
          handleLogout
        }
      />


      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <Home />
          }
        />


        {/* ROUTE ANALYSIS */}

        <Route
          path="/routes"
          element={
            <RouteResults />
          }
        />


        {/* OPERATIONS DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <OperationsDashboard />
          }
        />


        {/* HISTORY */}

        <Route
          path="/history"
          element={
            <History />
          }
        />


        {/* CONNECTED PORTS */}

        <Route
          path="/connected-ports"
          element={
            <ConnectedPorts />
          }
        />


        {/* WEATHER & CONDITIONS */}

        <Route
          path="/weather"
          element={
            <Weather />
          }
        />


        {/* REQUEST QUOTATION */}

        <Route
          path="/quotation"
          element={
            <RequestQuotation />
          }
        />


        {/* UNKNOWN PAGE */}

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

      {/* WAYPOINT AI ASSISTANT */}

      <WaypointAI currentPage="Waypoint" />

    </BrowserRouter>

  );

}


function App() {

  return (
    <Application />
  );

}


export default App;
