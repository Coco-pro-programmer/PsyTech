
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MoodHistory.css";

const API_BASE = "http://localhost:5000";

const MOODS = [
  {
    name: "Happy",
    emoji: "😊",
    description: "Feeling positive and cheerful",
  },
  {
    name: "Calm",
    emoji: "😌",
    description: "Feeling peaceful and settled",
  },
  {
    name: "Okay",
    emoji: "🙂",
    description: "Feeling neutral or balanced",
  },
  {
    name: "Excited",
    emoji: "🤩",
    description: "Feeling energetic or enthusiastic",
  },
  {
    name: "Sad",
    emoji: "😔",
    description: "Feeling low or down",
  },
  {
    name: "Anxious",
    emoji: "😟",
    description: "Feeling worried or uneasy",
  },
  {
    name: "Stressed",
    emoji: "😣",
    description: "Feeling under pressure",
  },
  {
    name: "Angry",
    emoji: "😠",
    description: "Feeling frustrated or irritated",
  },
];

function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isToday(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getMoodDetails(moodName) {
  return (
    MOODS.find(
      (item) => item.name.toLowerCase() === String(moodName).toLowerCase()
    ) || {
      name: moodName || "Mood",
      emoji: "🌿",
      description: "",
    }
  );
}

function MoodHistory() {
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");

  const [moods, setMoods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setLoading(true);
      setError("");

      try {
        const moodResponse = await fetch(`${API_BASE}/api/moods`, {
          method: "GET",
          credentials: "include",
        });

        if (moodResponse.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const moodData = await moodResponse.json();

        if (!moodResponse.ok) {
          throw new Error(
            moodData.message || "Unable to load your mood history."
          );
        }

        if (!isMounted) return;

        setMoods(Array.isArray(moodData.moods) ? moodData.moods : []);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.message ||
            "Something went wrong while loading your mood history."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const sortedMoods = useMemo(() => {
    return [...moods].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return dateB - dateA;
    });
  }, [moods]);

  const moodCounts = useMemo(() => {
    const counts = {};

    moods.forEach((entry) => {
      const mood = entry.mood || "Unknown";
      counts[mood] = (counts[mood] || 0) + 1;
    });

    return counts;
  }, [moods]);

  const mostFrequentMood = useMemo(() => {
    const entries = Object.entries(moodCounts);

    if (!entries.length) {
      return null;
    }

    entries.sort((a, b) => b[1] - a[1]);

    return {
      name: entries[0][0],
      count: entries[0][1],
      details: getMoodDetails(entries[0][0]),
    };
  }, [moodCounts]);

  const recentMoods = sortedMoods.slice(0, 7);

  const checkedInToday = moods.some((entry) => isToday(entry.created_at));

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedMood) {
      setError("Please choose how you are feeling before saving.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/api/moods`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: selectedMood,
          note: note.trim(),
        }),
      });

      if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your check-in.");
      }

      if (data.mood) {
        setMoods((previousMoods) => [data.mood, ...previousMoods]);
      }

      setSelectedMood("");
      setNote("");
      setSuccess("Your mood check-in has been saved.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleMoodSelection(moodName) {
    setSelectedMood(moodName);
    setError("");
    setSuccess("");
  }

  if (loading) {
    return (
      <div className="mood-page">
        <div className="mood-loading">
          <div className="mood-loading-spinner"></div>
          <p>Loading your mood space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-page">
      <main className="mood-main">
        <section className="mood-hero">
          <div className="mood-hero-copy">
            <span className="mood-eyebrow">MOOD CHECK-IN</span>

            <h1>How are you feeling today?</h1>

            <p>
              Take a moment to notice how you feel. Your check-ins help you
              keep a personal record of your moods over time.
            </p>
          </div>

          <div className="mood-hero-decoration" aria-hidden="true">
            <span>🌿</span>
          </div>
        </section>

        {error && (
          <div className="mood-alert mood-alert-error" role="alert">
            <span>!</span>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mood-alert mood-alert-success" role="status">
            <span>✓</span>
            <p>{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        <div className="mood-layout">
          <section className="mood-checkin-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">TODAY'S CHECK-IN</span>
                <h2>Choose your mood</h2>
              </div>

              {checkedInToday && (
                <span className="checked-today">
                  <span>✓</span> Checked in today
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mood-grid">
                {MOODS.map((mood) => {
                  const isSelected = selectedMood === mood.name;

                  return (
                    <button
                      key={mood.name}
                      type="button"
                      className={`mood-option ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleMoodSelection(mood.name)}
                      aria-pressed={isSelected}
                    >
                      <span className="mood-option-emoji">
                        {mood.emoji}
                      </span>

                      <span className="mood-option-content">
                        <strong>{mood.name}</strong>
                        <small>{mood.description}</small>
                      </span>

                      <span className="mood-option-check">
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mood-note-area">
                <label htmlFor="mood-note">
                  What's on your mind?
                  <span>Optional</span>
                </label>

                <textarea
                  id="mood-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a short note about how your day is going..."
                  rows="5"
                  maxLength="1000"
                />

                <div className="mood-note-footer">
                  <span>Your note is part of your private mood history.</span>
                  <span>{note.length}/1000</span>
                </div>
              </div>

              <button
                type="submit"
                className="save-mood-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Mood Check-in"}
              </button>
            </form>
          </section>

          <aside className="mood-side-card">
            <div className="side-card-icon">🌱</div>

            <h3>A moment for yourself</h3>

            <p>
              There is no right or wrong mood to choose. This space is simply
              for noticing and recording how you feel.
            </p>

            <div className="side-card-divider"></div>

            <div className="side-stat">
              <span className="side-stat-number">{moods.length}</span>
              <span className="side-stat-label">
                total check-ins
              </span>
            </div>

            {mostFrequentMood && (
              <div className="side-stat">
                <span className="side-stat-number">
                  {mostFrequentMood.details.emoji}
                </span>

                <span className="side-stat-label">
                  {mostFrequentMood.name} appears most often
                </span>
              </div>
            )}
          </aside>
        </div>

        <section className="mood-history-section">
          <div className="history-heading">
            <div>
              <span className="section-kicker">YOUR RECORD</span>
              <h2>Mood history</h2>
              <p>
                Look back at the moods you have chosen during your check-ins.
              </p>
            </div>

            <div className="history-count">
              {moods.length} {moods.length === 1 ? "entry" : "entries"}
            </div>
          </div>

          {sortedMoods.length === 0 ? (
            <div className="mood-empty-state">
              <div className="empty-icon">🌿</div>

              <h3>Your mood history starts here</h3>

              <p>
                Once you save your first check-in, your personal mood record
                will appear here.
              </p>
            </div>
          ) : (
            <div className="history-content">
              <div className="history-summary-grid">
                <div className="history-summary-card">
                  <span className="summary-icon">📊</span>
                  <div>
                    <strong>{moods.length}</strong>
                    <span>Total check-ins</span>
                  </div>
                </div>

                <div className="history-summary-card">
                  <span className="summary-icon">📅</span>
                  <div>
                    <strong>
                      {moods.filter((entry) => isToday(entry.created_at))
                        .length}
                    </strong>
                    <span>Today's check-ins</span>
                  </div>
                </div>

                <div className="history-summary-card">
                  <span className="summary-icon">
                    {mostFrequentMood?.details.emoji || "🌱"}
                  </span>
                  <div>
                    <strong>
                      {mostFrequentMood?.name || "—"}
                    </strong>
                    <span>Most recorded mood</span>
                  </div>
                </div>
              </div>

              <div className="history-panel">
                <div className="history-panel-header">
                  <div>
                    <h3>Recent check-ins</h3>
                    <p>Your seven most recent mood entries</p>
                  </div>
                </div>

                <div className="history-list">
                  {recentMoods.map((entry, index) => {
                    const details = getMoodDetails(entry.mood);

                    return (
                      <article
                        className="history-entry"
                        key={entry.id || `${entry.created_at}-${index}`}
                      >
                        <div className="history-timeline">
                          <span className="history-dot">
                            {details.emoji}
                          </span>

                          {index !== recentMoods.length - 1 && (
                            <span className="history-line"></span>
                          )}
                        </div>

                        <div className="history-entry-main">
                          <div className="history-entry-top">
                            <div>
                              <h4>{details.name}</h4>

                              <span className="history-date">
                                {formatDate(entry.created_at)}
                                {formatTime(entry.created_at)
                                  ? ` • ${formatTime(entry.created_at)}`
                                  : ""}
                              </span>
                            </div>

                            {isToday(entry.created_at) && (
                              <span className="today-label">Today</span>
                            )}
                          </div>

                          {entry.note && (
                            <p className="history-note">{entry.note}</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {moods.length > 0 && (
                <div className="mood-frequency-panel">
                  <div className="history-panel-header">
                    <div>
                      <h3>Mood overview</h3>
                      <p>
                        A simple view of how often each mood has been
                        recorded.
                      </p>
                    </div>
                  </div>

                  <div className="frequency-list">
                    {Object.entries(moodCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([moodName, count]) => {
                        const details = getMoodDetails(moodName);
                        const percentage = Math.round(
                          (count / moods.length) * 100
                        );

                        return (
                          <div
                            className="frequency-row"
                            key={moodName}
                          >
                            <div className="frequency-label">
                              <span>{details.emoji}</span>
                              <strong>{moodName}</strong>
                            </div>

                            <div className="frequency-track">
                              <div
                                className="frequency-fill"
                                style={{
                                  width: `${Math.max(
                                    percentage,
                                    5
                                  )}%`,
                                }}
                              ></div>
                            </div>

                            <span className="frequency-value">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mood-bottom-actions">
          <Link to="/dashboard" className="secondary-action">
            ← Back to Dashboard
          </Link>

          <div className="bottom-action-links">
            <Link to="/journal">Write in Journal →</Link>
            <Link to="/wellness-studio">Explore Wellness Studio →</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MoodHistory;