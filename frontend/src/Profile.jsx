
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

const API_BASE = "http://localhost:5000";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load profile.");
        }

        const profile = data.user || data;

        if (active) {
          setUser(profile);
          setName(profile.name || "");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load your profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Could not update profile.");
      }

      setUser((previous) => ({
        ...(previous || {}),
        ...(data.user || {}),
        name: data.user?.name || trimmedName,
      }));

      setName(data.user?.name || trimmedName);
      setSuccess(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <section className="profile-intro">
          <h1>My Profile</h1>
          <p>Manage your account and wellness journey.</p>
        </section>

        {error && (
          <div className="profile-message profile-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-message profile-success" role="status">
            {success}
          </div>
        )}

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>Account Information</h2>
            <p>Keep your account details up to date.</p>
          </div>

          <form onSubmit={handleSave}>
            <div className="profile-form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ""}
                readOnly
                autoComplete="email"
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>Privacy &amp; Security</h2>
            <p>
              Your wellness journey is personal. Use your account
              responsibly and keep your login details private.
            </p>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>Quick Access</h2>
            <p>Explore your personal wellness tools.</p>
          </div>

          <div className="profile-shortcuts">
            <Link to="/mood-history" className="profile-shortcut">
              <span>😊</span>
              <span>
                <strong>Mood History</strong>
                <small>Review your mood entries</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/journal" className="profile-shortcut">
              <span>📔</span>
              <span>
                <strong>Journal</strong>
                <small>Reflect on your thoughts</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/wellness-studio" className="profile-shortcut">
              <span>🌿</span>
              <span>
                <strong>Wellness Studio</strong>
                <small>Explore wellness activities</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/preferences" className="profile-shortcut">
              <span>💚</span>
              <span>
                <strong>Wellness Preferences</strong>
                <small>Manage your wellness interests</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;