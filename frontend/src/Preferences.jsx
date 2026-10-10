
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Preferences.css";

const API_BASE = "http://localhost:5000";

const OPTIONS = [
  {
    title: "Calm & relaxation",
    detail: "Relaxation, breathing and taking a pause.",
    icon: "🌿",
  },
  {
    title: "Stress & emotions",
    detail: "Understanding feelings and everyday stress.",
    icon: "💛",
  },
  {
    title: "Focus & study",
    detail: "Focus, routines and managing study tasks.",
    icon: "📚",
  },
  {
    title: "Grounding",
    detail: "Reconnect with the present moment.",
    icon: "🌱",
  },
  {
    title: "Self-reflection",
    detail: "Journaling, self-awareness and reflection.",
    icon: "📝",
  },
  {
    title: "Sleep & rest",
    detail: "Restful routines and winding down.",
    icon: "🌙",
  },
  {
    title: "Confidence & relationships",
    detail: "Confidence, communication and connection.",
    icon: "✨",
  },
];

export default function Preferences() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewUser = location.state?.newUser === true;

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      try {
        const response = await fetch(
          `${API_BASE}/api/preferences`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (response.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Could not load preferences."
          );
        }

        if (active) {
          setSelected(data.preferences || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load preferences.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPreferences();

    return () => {
      active = false;
    };
  }, [navigate]);

  function toggle(title) {
    setSelected((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );

    setMessage("");
    setError("");
  }

  async function savePreferences(event) {
    event.preventDefault();

    if (!selected.length) {
      setError("Choose at least one topic to continue.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE}/api/preferences`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interests: selected,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not save preferences."
        );
      }

      setSelected(data.preferences || selected);

      if (isNewUser) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setMessage("Your wellness preferences have been saved.");
    } catch (err) {
      setError(err.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="preferences-page">
      

      <main className="preferences-main">
        <Link to="/profile" className="preferences-back">
          ← Back to Profile
        </Link>

        <section className="preferences-intro">
          <span className="preferences-eyebrow">
            YOUR WELLBEING, YOUR WAY
          </span>

          <h1>What would you like to focus on?</h1>

          <p>
            Select the topics you’re interested in. You can
            change these anytime, and your choices help PsyTech
            tailor your experience.
          </p>

          <div className="preferences-count">
            {selected.length} of {OPTIONS.length} selected
          </div>
        </section>

        {loading ? (
          <div className="preferences-loading">
            Loading your preferences…
          </div>
        ) : (
          <form onSubmit={savePreferences}>
            <div className="preferences-grid">
              {OPTIONS.map((option) => {
                const active = selected.includes(option.title);

                return (
                  <button
                    type="button"
                    key={option.title}
                    className={`preference-option${
                      active ? " selected" : ""
                    }`}
                    aria-pressed={active}
                    onClick={() => toggle(option.title)}
                  >
                    <span className="preference-icon">
                      {option.icon}
                    </span>

                    <span className="preference-copy">
                      <strong>{option.title}</strong>
                      <small>{option.detail}</small>
                    </span>

                    <span
                      className="preference-check"
                      aria-hidden="true"
                    >
                      {active ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div
                className="preferences-message error"
                role="alert"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                className="preferences-message success"
                role="status"
              >
                {message}
              </div>
            )}

            <div className="preferences-actions">
              <button
                className="preferences-save"
                type="submit"
                disabled={saving || !selected.length}
              >
                {saving ? "Saving…" : "Save Preferences"}
              </button>

              <Link
                to="/profile"
                className="preferences-cancel"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}