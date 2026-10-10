import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "./LandingPage";
import Authentication from "./Authentication";
import Dashboard from "./Dashboard";
import MoodHistory from "./MoodHistory";
import Journal from "./Journal";
import WellnessHub from "./WellnessHub";
import WellnessStudio from "./WellnessStudio";
import AICompanion from "./AICompanion";
import ProfessionalHelp from "./ProfessionalHelp";
import Profile from "./Profile";
import Preferences from "./Preferences";
import AppNavbar from "./AppNavbar";
import "./App.css";

const API_BASE = "http://localhost:5000";

async function checkAuthentication() {
  try {
    const response = await fetch(`${API_BASE}/api/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return Boolean(data.success && data.user);
  } catch (error) {
    return false;
  }
}

function RouteLoading() {
  return (
    <div className="route-loading">
      <div className="route-loading-spinner" />
      <p>Loading PsyTech...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const authenticated = await checkAuthentication();

      if (!active) return;

      setStatus(
        authenticated ? "authenticated" : "unauthenticated"
      );
    }

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <RouteLoading />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <AppNavbar />
      <div className="app-page-content">{children}</div>
    </div>
  );
}

function PublicRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const authenticated = await checkAuthentication();

      if (!active) return;

      setStatus(
        authenticated ? "authenticated" : "unauthenticated"
      );
    }

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <RouteLoading />;
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicWellnessHub() {
  return (
          <div className="wellness-hub-public">
            <div className="wellness-hub-back-wrapper">
              <button
                type="button"
                className="wellness-hub-back-button"
                onClick={() => window.location.href = "/"}
            >
              ← Back to Home
              </button>
          </div>

        <WellnessHub />
</div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Authentication initialMode="login" />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Authentication initialMode="register" />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <Authentication initialMode="forgot" />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <Authentication initialMode="reset" />
          }
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mood-history"
          element={
            <ProtectedRoute>
              <MoodHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />

        {/* Public Wellness Hub */}
        <Route
          path="/wellness-hub"
          element={<PublicWellnessHub />}
        />

        {/* Private Wellness Hub */}
        <Route
          path="/private-wellness-hub"
          element={
            <ProtectedRoute>
              <WellnessHub />
            </ProtectedRoute>
          }
        />

        {/* Protected modules */}
        <Route
          path="/wellness-studio"
          element={
            <ProtectedRoute>
              <WellnessStudio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-companion"
          element={
            <ProtectedRoute>
              <AICompanion />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professional-help"
          element={
            <ProtectedRoute>
              <ProfessionalHelp />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <Preferences />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}