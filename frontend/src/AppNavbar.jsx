import React from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./AppNavbar.css";

const API_BASE = "http://localhost:5000";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Mood History", path: "/mood-history" },
  { label: "Journal", path: "/journal" },
  { label: "Wellness Hub", path: "/private-wellness-hub" },
  { label: "Wellness Studio", path: "/wellness-studio" },
  { label: "AI Companion", path: "/ai-companion" },
  { label: "Professional Help", path: "/professional-help" },
  { label: "Profile", path: "/profile" },
];

export default function AppNavbar({ isPublic = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/wellness-hub") {
    return null;
  }

  const currentPage =
    navigationItems.find(
      (item) => item.path === location.pathname
    )?.label || "Dashboard";

  const visibleItems = isPublic
    ? [{ label: "Wellness Hub", path: "/wellness-hub" }]
    : navigationItems;

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Continue to login if the server is unavailable.
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="psytech-navbar">
      <div className="psytech-navbar-inner">
        <div className="psytech-navbar-heading">
          <Link
            to={isPublic ? "/" : "/dashboard"}
            className="psytech-navbar-logo"
            aria-label="PsyTech Home"
          >
            PsyTech
          </Link>

          <span className="psytech-navbar-divider" />

          <span className="psytech-navbar-page">
            {isPublic ? "Wellness Hub" : currentPage}
          </span>
        </div>

        <nav
          className="psytech-navbar-links"
          aria-label="Main navigation"
        >
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "psytech-navbar-link active"
                  : "psytech-navbar-link"
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isPublic ? (
            <>
              <Link
                to="/login"
                className="psytech-navbar-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="psytech-navbar-register"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="psytech-navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}