import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE = "/api";

const MOOD_CONFIG = {
  happy: {
    label: "Happy",
    icon: "😊",
    className: "mood-happy",
  },
  calm: {
    label: "Calm",
    icon: "😌",
    className: "mood-calm",
  },
  neutral: {
    label: "Neutral",
    icon: "😐",
    className: "mood-neutral",
  },
  sad: {
    label: "Sad",
    icon: "😔",
    className: "mood-sad",
  },
  anxious: {
    label: "Anxious",
    icon: "😟",
    className: "mood-anxious",
  },
  angry: {
    label: "Angry",
    icon: "😠",
    className: "mood-angry",
  },
  stressed: {
    label: "Stressed",
    icon: "😣",
    className: "mood-stressed",
  },
  excited: {
    label: "Excited",
    icon: "✨",
    className: "mood-excited",
  },
};

const QUICK_ACTIONS = [
  {
    title: "Mood Check-in",
    description: "Take a moment to record how you are feeling today.",
    icon: "🌿",
    path: "/mood-history",
    className: "quick-action-mood",
  },
  {
    title: "Write in Journal",
    description: "Put your thoughts into words in your private journal.",
    icon: "✍️",
    path: "/journal",
    className: "quick-action-journal",
  },
  {
    title: "Explore Wellness",
    description: "Discover resources created to support your wellbeing.",
    icon: "📚",
    path: "/wellness-hub",
    className: "quick-action-wellness",
  },
  {
    title: "Wellness Studio",
    description: "Try practical activities for your everyday wellbeing.",
    icon: "🧘",
    path: "/wellness-studio",
    className: "quick-action-studio",
  },
];

const WELLNESS_SUGGESTIONS = [
  {
    title: "Take a mindful pause",
    text: "Give yourself a few quiet minutes away from screens and distractions.",
    icon: "🌱",
  },
  {
    title: "Write it down",
    text: "Journaling can help you organise thoughts and notice patterns over time.",
    icon: "📝",
  },
  {
    title: "Try a short activity",
    text: "Visit the Wellness Studio for a simple activity you can practise at your own pace.",
    icon: "☁️",
  },
];

function getGreeting(hour) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  if (hour < 21) {
    return "Good evening";
  }

  return "Good night";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference =
    (startOfToday.getTime() - startOfDate.getTime()) /
    (1000 * 60 * 60 * 24);

  if (difference === 0) {
    return "Today";
  }

  if (difference === 1) {
    return "Yesterday";
  }

  if (difference > 1 && difference < 7) {
    return `${Math.floor(difference)} days ago`;
  }

  return formatDate(dateValue);
}

function getMoodConfig(mood) {
  const normalizedMood = String(mood || "")
    .trim()
    .toLowerCase();

  if (MOOD_CONFIG[normalizedMood]) {
    return MOOD_CONFIG[normalizedMood];
  }

  return {
    label: mood || "Mood",
    icon: "💭",
    className: "mood-neutral",
  };
}

function getFirstName(name) {
  if (!name) {
    return "there";
  }

  return name.trim().split(/\s+/)[0];
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [moods, setMoods] = useState([]);
  const [journals, setJournals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const [showAllMoods, setShowAllMoods] = useState(false);

  const currentHour = new Date().getHours();

  const greeting = useMemo(
    () => getGreeting(currentHour),
    [currentHour]
  );

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setDataError("");

        const [userResponse, moodResponse, journalResponse] =
          await Promise.all([
            fetch(`${API_BASE}/me`, {
              method: "GET",
              credentials: "include",
            }),

            fetch(`${API_BASE}/moods`, {
              method: "GET",
              credentials: "include",
            }),

            fetch(`${API_BASE}/journals`, {
              method: "GET",
              credentials: "include",
            }),
          ]);

        if (userResponse.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        if (!userResponse.ok) {
          throw new Error("Unable to load your account.");
        }

        const userData = await userResponse.json();

        if (!userData.success || !userData.user) {
          navigate("/login", { replace: true });
          return;
        }

        let moodData = { success: true, moods: [] };
        let journalData = { success: true, journals: [] };

        if (moodResponse.ok) {
          moodData = await moodResponse.json();
        }

        if (journalResponse.ok) {
          journalData = await journalResponse.json();
        }

        if (!isMounted) {
          return;
        }

        setUser(userData.user);

        setMoods(
          Array.isArray(moodData.moods)
            ? moodData.moods
            : []
        );

        setJournals(
          Array.isArray(journalData.journals)
            ? journalData.journals
            : []
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDataError(
          error.message ||
            "Something went wrong while loading your dashboard."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const latestMood = moods.length > 0 ? moods[0] : null;

  const recentMoods = showAllMoods
    ? moods.slice(0, 7)
    : moods.slice(0, 4);

  const latestJournal =
    journals.length > 0 ? journals[0] : null;

  const moodFrequency = useMemo(() => {
    const frequency = {};

    moods.forEach((entry) => {
      const key = String(entry.mood || "")
        .trim()
        .toLowerCase();

      if (!key) {
        return;
      }

      frequency[key] = (frequency[key] || 0) + 1;
    });

    const sorted = Object.entries(frequency).sort(
      (a, b) => b[1] - a[1]
    );

    if (!sorted.length) {
      return null;
    }

    return sorted[0][0];
  }, [moods]);

  const frequentMoodConfig = getMoodConfig(moodFrequency);

  if (loading) {
    return (
      <main className="dashboard-page dashboard-loading-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading-orb">
            <span>🌿</span>
          </div>

          <h1>Preparing your space...</h1>

          <p>
            Your PsyTech dashboard is getting everything ready.
          </p>

          <div className="dashboard-loading-line">
            <span />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">

        {/* ==================================================
            HERO / WELCOME
        ================================================== */}

        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <span className="dashboard-eyebrow">
              YOUR WELLNESS SPACE
            </span>

            <h1>
              {greeting},{" "}
              <span>{getFirstName(user?.name)}.</span>
            </h1>

            <p className="dashboard-date">
              {today}
            </p>

            <p className="dashboard-intro">
              Take a moment for yourself. PsyTech is here to
              help you understand your wellbeing, reflect on
              your experiences, and build healthy everyday
              habits at your own pace.
            </p>

            <div className="dashboard-hero-actions">
              <Link
                to="/mood-history"
                className="dashboard-primary-button"
              >
                Check in with yourself
                <span>→</span>
              </Link>

              <Link
                to="/journal"
                className="dashboard-secondary-button"
              >
                Open Journal
              </Link>
            </div>
          </div>

          <div className="dashboard-hero-visual">
            <div className="dashboard-hero-circle dashboard-circle-one" />
            <div className="dashboard-hero-circle dashboard-circle-two" />

            <div className="dashboard-hero-card">
              <span className="hero-card-icon">🌱</span>

              <div>
                <strong>Your space, your pace.</strong>
                <p>
                  Small moments of awareness matter.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            ERROR NOTICE
        ================================================== */}

        {dataError && (
          <section className="dashboard-data-error">
            <div>
              <strong>Some dashboard information could not be loaded.</strong>
              <p>{dataError}</p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </section>
        )}


        {/* ==================================================
            TODAY'S CHECK-IN
        ================================================== */}

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="section-kicker">
                TODAY
              </span>

              <h2>How are you feeling?</h2>

              <p>
                Your check-ins help you notice your emotional
                patterns over time.
              </p>
            </div>

            <Link
              to="/mood-history"
              className="section-link"
            >
              View mood history →
            </Link>
          </div>

          <div className="today-checkin-card">
            {latestMood ? (
              <>
                <div className="today-mood-display">
                  <div
                    className={`today-mood-icon ${
                      getMoodConfig(latestMood.mood).className
                    }`}
                  >
                    {getMoodConfig(latestMood.mood).icon}
                  </div>

                  <div>
                    <span className="card-label">
                      Most recent check-in
                    </span>

                    <h3>
                      Feeling{" "}
                      {getMoodConfig(latestMood.mood).label.toLowerCase()}
                    </h3>

                    <p>
                      {formatRelativeDate(
                        latestMood.created_at
                      )}
                    </p>
                  </div>
                </div>

                {latestMood.note && (
                  <div className="today-mood-note">
                    <span>“</span>
                    <p>{latestMood.note}</p>
                  </div>
                )}

                <Link
                  to="/mood-history"
                  className="checkin-action"
                >
                  Record another check-in
                  <span>→</span>
                </Link>
              </>
            ) : (
              <div className="empty-checkin">
                <div className="empty-checkin-icon">
                  🌿
                </div>

                <div>
                  <span className="card-label">
                    Nothing recorded yet
                  </span>

                  <h3>
                    Start with a simple check-in.
                  </h3>

                  <p>
                    There is no right or wrong answer. Choose
                    what feels closest to how you feel.
                  </p>
                </div>

                <Link
                  to="/mood-history"
                  className="dashboard-primary-button"
                >
                  Start check-in
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </section>


        {/* ==================================================
            OVERVIEW CARDS
        ================================================== */}

        <section className="dashboard-overview-grid">

          <article className="overview-card overview-card-pink">
            <div className="overview-card-top">
              <span className="overview-icon">
                😊
              </span>

              <span className="overview-caption">
                MOOD
              </span>
            </div>

            <strong>
              {moods.length}
            </strong>

            <h3>Check-ins</h3>

            <p>
              {moods.length === 0
                ? "Your first check-in is waiting."
                : "Moments you've recorded so far."}
            </p>

            <Link to="/mood-history">
              Explore history →
            </Link>
          </article>


          <article className="overview-card overview-card-blue">
            <div className="overview-card-top">
              <span className="overview-icon">
                ✍️
              </span>

              <span className="overview-caption">
                REFLECTION
              </span>
            </div>

            <strong>
              {journals.length}
            </strong>

            <h3>Journal entries</h3>

            <p>
              {journals.length === 0
                ? "Create your first private reflection."
                : "Thoughts you've chosen to keep."}
            </p>

            <Link to="/journal">
              Open journal →
            </Link>
          </article>


          <article className="overview-card overview-card-green">
            <div className="overview-card-top">
              <span className="overview-icon">
                🌱
              </span>

              <span className="overview-caption">
                PATTERN
              </span>
            </div>

            <strong>
              {moodFrequency
                ? frequentMoodConfig.icon
                : "—"}
            </strong>

            <h3>
              {moodFrequency
                ? frequentMoodConfig.label
                : "Not enough data"}
            </h3>

            <p>
              {moodFrequency
                ? "Your most frequently recorded mood."
                : "Keep checking in to discover patterns."}
            </p>

            <Link to="/mood-history">
              See patterns →
            </Link>
          </article>

        </section>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="section-kicker">
                EXPLORE
              </span>

              <h2>What would you like to do?</h2>

              <p>
                Choose a space that feels useful right now.
              </p>
            </div>
          </div>

          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.title}
                to={action.path}
                className={`quick-action-card ${action.className}`}
              >
                <div className="quick-action-icon">
                  {action.icon}
                </div>

                <div className="quick-action-content">
                  <h3>{action.title}</h3>

                  <p>{action.description}</p>

                  <span>
                    Open
                    <strong>→</strong>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* ==================================================
            MOOD PATTERN
        ================================================== */}

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="section-kicker">
                YOUR PATTERN
              </span>

              <h2>Recent mood check-ins</h2>

              <p>
                Looking back can help you notice changes
                without judging them.
              </p>
            </div>

            <Link
              to="/mood-history"
              className="section-link"
            >
              Full history →
            </Link>
          </div>

          <div className="mood-pattern-card">
            {recentMoods.length > 0 ? (
              <>
                <div className="mood-timeline">
                  {recentMoods.map((entry) => {
                    const moodConfig = getMoodConfig(
                      entry.mood
                    );

                    return (
                      <div
                        className="mood-timeline-item"
                        key={entry.id}
                      >
                        <div
                          className={`mood-timeline-icon ${moodConfig.className}`}
                        >
                          {moodConfig.icon}
                        </div>

                        <div className="mood-timeline-info">
                          <strong>
                            {moodConfig.label}
                          </strong>

                          <span>
                            {formatRelativeDate(
                              entry.created_at
                            )}
                          </span>
                        </div>

                        {entry.note && (
                          <p>
                            {entry.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {moods.length > 4 && (
                  <button
                    type="button"
                    className="show-more-button"
                    onClick={() =>
                      setShowAllMoods((current) => !current)
                    }
                  >
                    {showAllMoods
                      ? "Show less"
                      : "Show more recent check-ins"}
                  </button>
                )}
              </>
            ) : (
              <div className="pattern-empty">
                <span>🌤️</span>

                <div>
                  <h3>Your pattern will appear here.</h3>

                  <p>
                    Complete a few mood check-ins and PsyTech
                    will give you a simple view of your recent
                    entries.
                  </p>
                </div>

                <Link
                  to="/mood-history"
                  className="dashboard-secondary-button"
                >
                  Begin
                </Link>
              </div>
            )}
          </div>
        </section>


        {/* ==================================================
            JOURNAL ACTIVITY
        ================================================== */}

        <section className="dashboard-two-column">

          <article className="dashboard-panel journal-preview-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">
                  REFLECTION
                </span>

                <h2>Journal activity</h2>
              </div>

              <Link to="/journal">
                View journal →
              </Link>
            </div>

            {latestJournal ? (
              <div className="journal-preview">
                <div className="journal-preview-decoration">
                  🧸
                </div>

                <div className="journal-preview-content">
                  <span>
                    {formatRelativeDate(
                      latestJournal.created_at
                    )}
                  </span>

                  <h3>
                    {latestJournal.title}
                  </h3>

                  <p>
                    {latestJournal.content}
                  </p>

                  <Link to="/journal">
                    Continue writing →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="panel-empty">
                <div className="panel-empty-icon">
                  📖
                </div>

                <h3>Your journal is waiting for you.</h3>

                <p>
                  Write freely about your thoughts, feelings,
                  experiences, or anything you want to remember.
                </p>

                <Link
                  to="/journal"
                  className="dashboard-secondary-button"
                >
                  Write an entry
                </Link>
              </div>
            )}
          </article>


          {/* ==================================================
              WELLNESS SUGGESTION
          ================================================== */}

          <article className="dashboard-panel suggestion-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">
                  FOR TODAY
                </span>

                <h2>A gentle suggestion</h2>
              </div>

              <span className="suggestion-sparkle">
                ✦
              </span>
            </div>

            <div className="suggestion-list">
              {WELLNESS_SUGGESTIONS.map(
                (suggestion, index) => (
                  <div
                    className="suggestion-item"
                    key={suggestion.title}
                  >
                    <div className="suggestion-number">
                      0{index + 1}
                    </div>

                    <div className="suggestion-icon">
                      {suggestion.icon}
                    </div>

                    <div>
                      <h3>{suggestion.title}</h3>
                      <p>{suggestion.text}</p>
                    </div>
                  </div>
                )
              )}
            </div>

            <Link
              to="/wellness-studio"
              className="suggestion-footer-link"
            >
              Explore Wellness Studio →
            </Link>
          </article>

        </section>


        {/* ==================================================
            SUPPORT AREA
        ================================================== */}

        <section className="dashboard-support">

          <div className="dashboard-support-content">
            <span className="section-kicker">
              YOU DON'T HAVE TO DO EVERYTHING ALONE
            </span>

            <h2>
              Need a little more support?
            </h2>

            <p>
              Explore PsyTech's support resources and learn
              about different ways to care for your wellbeing.
            </p>
          </div>

          <div className="dashboard-support-actions">
            <Link
              to="/ai-companion"
              className="support-action support-action-ai"
            >
              <span>✦</span>
              <div>
                <strong>AI Companion</strong>
                <small>
                  A supportive space for guided conversations.
                </small>
              </div>
              <b>→</b>
            </Link>

            <Link
              to="/professional-help"
              className="support-action support-action-help"
            >
              <span>🤝</span>
              <div>
                <strong>Professional Help</strong>
                <small>
                  Learn about professional support options.
                </small>
              </div>
              <b>→</b>
            </Link>
          </div>

        </section>


        {/* ==================================================
            FOOTER NOTE
        ================================================== */}

        <footer className="dashboard-footer-note">
          <span>🌿</span>

          <p>
            PsyTech is a self-help and wellbeing platform.
            It is not a replacement for professional mental
            health care.
          </p>
        </footer>

      </div>
    </main>
  );
}

export default Dashboard;
