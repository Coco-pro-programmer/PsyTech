
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./WellnessStudio.css";

const ACTIVITIES = [
  {
    id: 1,
    category: "Calm",
    icon: "🌿",
    title: "Slow Breathing",
    description:
      "A simple paced-breathing activity to help you pause and settle into the present moment.",
    duration: "2 min",
    steps: [
      "Sit comfortably and let your shoulders relax.",
      "Breathe in slowly through your nose.",
      "Pause gently for a moment.",
      "Breathe out slowly and comfortably.",
      "Continue at your own comfortable pace.",
    ],
  },
  {
    id: 2,
    category: "Grounding",
    icon: "🌱",
    title: "Present Moment",
    description:
      "A short grounding activity that brings your attention back to what you can notice around you.",
    duration: "3 min",
    steps: [
      "Look around and notice something you can see.",
      "Notice a sound around you.",
      "Notice how your feet or body feel against the surface beneath you.",
      "Take one slow breath.",
      "Choose one thing around you to focus on for a few moments.",
    ],
  },
  {
    id: 3,
    category: "Relax",
    icon: "☁️",
    title: "Quiet Pause",
    description:
      "Step away from your surroundings for a few moments and give yourself some quiet time.",
    duration: "5 min",
    steps: [
      "Find a comfortable place to sit.",
      "Put aside your phone or other distractions.",
      "Let your breathing return to a natural rhythm.",
      "Notice your surroundings without needing to change anything.",
      "When you are ready, gently return your attention to your day.",
    ],
  },
  {
    id: 4,
    category: "Focus",
    icon: "🎯",
    title: "Focus Reset",
    description:
      "A brief reset for moments when your attention feels scattered.",
    duration: "3 min",
    steps: [
      "Choose one small task you want to focus on.",
      "Clear one unnecessary distraction from your space.",
      "Take one slow breath.",
      "Give your attention to the chosen task for a few minutes.",
      "When the timer ends, decide what your next small step is.",
    ],
  },
  {
    id: 5,
    category: "Reflect",
    icon: "📝",
    title: "Thought Check",
    description:
      "A gentle reflection exercise to help you notice what is occupying your mind.",
    duration: "4 min",
    steps: [
      "Pause and notice the main thought on your mind.",
      "Write it down in a few words.",
      "Ask yourself what part of it you can act on today.",
      "Separate that from what is outside your control.",
      "Choose one small action or allow yourself to leave it for later.",
    ],
  },
  {
    id: 6,
    category: "Calm",
    icon: "🌊",
    title: "Body Relaxation",
    description:
      "A gentle pause to notice areas of tension and allow yourself to relax comfortably.",
    duration: "5 min",
    steps: [
      "Get into a comfortable position.",
      "Notice your shoulders and let them rest naturally.",
      "Relax your hands and jaw.",
      "Take a slow, comfortable breath.",
      "Move your attention through your body and notice where you can soften.",
    ],
  },
];

const CATEGORIES = [
  "All",
  "Calm",
  "Grounding",
  "Relax",
  "Focus",
  "Reflect",
];

function WellnessStudio() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeActivity, setActiveActivity] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const filteredActivities = useMemo(() => {
    if (selectedCategory === "All") {
      return ACTIVITIES;
    }

    return ACTIVITIES.filter(
      (activity) => activity.category === selectedCategory
    );
  }, [selectedCategory]);

  function openActivity(activity) {
    setActiveActivity(activity);
    setCurrentStep(0);
  }

  function closeActivity() {
    setActiveActivity(null);
    setCurrentStep(0);
  }

  function nextStep() {
    if (!activeActivity) return;

    if (currentStep < activeActivity.steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  }

  return (
    <div className="wellness-studio-page">
      <main className="studio-main">
        <section className="studio-hero">
          <div className="studio-hero-content">
            <span className="studio-eyebrow">WELLNESS STUDIO</span>

            <h1>Small pauses can make space for a better day.</h1>

            <p>
              Explore simple guided activities for calming down,
              grounding yourself, reflecting, or taking a focused
              break.
            </p>

            <div className="studio-hero-actions">
              <a
                href="#studio-activities"
                className="studio-primary-button"
              >
                Explore activities
              </a>

              <Link
                to="/mood-history"
                className="studio-secondary-button"
              >
                Check your mood
              </Link>
            </div>
          </div>

          <div className="studio-hero-visual" aria-hidden="true">
            <div className="studio-orbit studio-orbit-one"></div>
            <div className="studio-orbit studio-orbit-two"></div>
            <div className="studio-hero-leaf">🌿</div>
          </div>
        </section>

        <section className="studio-intro">
          <div>
            <span className="studio-section-kicker">
              YOUR WELLNESS TOOLKIT
            </span>

            <h2>Choose what feels useful right now.</h2>
          </div>

          <p>
            These activities are designed as everyday self-help
            tools. You can stop an activity whenever you want and
            choose something else.
          </p>
        </section>

        <section
          className="studio-activities-section"
          id="studio-activities"
        >
          <div className="studio-filter-row">
            <div className="studio-filter-heading">
              <h2>Guided activities</h2>
              <span>
                {filteredActivities.length}{" "}
                {filteredActivities.length === 1
                  ? "activity"
                  : "activities"}
              </span>
            </div>

            <div className="studio-category-list">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    selectedCategory === category ? "active" : ""
                  }
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="studio-activity-grid">
            {filteredActivities.map((activity) => (
              <article
                className="studio-activity-card"
                key={activity.id}
              >
                <div className="activity-card-top">
                  <div className="activity-icon">
                    {activity.icon}
                  </div>

                  <span className="activity-duration">
                    {activity.duration}
                  </span>
                </div>

                <span className="activity-category">
                  {activity.category}
                </span>

                <h3>{activity.title}</h3>

                <p>{activity.description}</p>

                <button
                  type="button"
                  className="activity-start-button"
                  onClick={() => openActivity(activity)}
                >
                  Start activity
                  <span>→</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="studio-guidance">
          <div className="guidance-icon">💚</div>

          <div>
            <h3>Use the studio at your own pace.</h3>

            <p>
              Wellness activities are optional self-help tools.
              They are not a diagnosis or a replacement for
              professional care.
            </p>
          </div>

          <Link to="/professional-help">
            Professional Help →
          </Link>
        </section>

        <section className="studio-bottom-links">
          <Link to="/dashboard">← Back to Dashboard</Link>

          <div>
            <Link to="/mood-history">Mood History</Link>
            <Link to="/journal">Journal</Link>
          </div>
        </section>
      </main>

      {activeActivity && (
        <div
          className="studio-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeActivity();
            }
          }}
        >
          <section
            className="studio-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-title"
          >
            <button
              type="button"
              className="studio-modal-close"
              onClick={closeActivity}
              aria-label="Close activity"
            >
              ×
            </button>

            <div className="modal-activity-icon">
              {activeActivity.icon}
            </div>

            <span className="modal-category">
              {activeActivity.category} • {activeActivity.duration}
            </span>

            <h2 id="activity-title">
              {activeActivity.title}
            </h2>

            <p className="modal-description">
              {activeActivity.description}
            </p>

            <div className="modal-progress">
              <div className="modal-progress-label">
                <span>
                  Step {currentStep + 1} of{" "}
                  {activeActivity.steps.length}
                </span>

                <span>
                  {Math.round(
                    ((currentStep + 1) /
                      activeActivity.steps.length) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="modal-progress-track">
                <div
                  className="modal-progress-fill"
                  style={{
                    width: `${
                      ((currentStep + 1) /
                        activeActivity.steps.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="modal-step-card">
              <span>STEP {currentStep + 1}</span>

              <p>{activeActivity.steps[currentStep]}</p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-secondary-button"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                ← Previous
              </button>

              {currentStep <
              activeActivity.steps.length - 1 ? (
                <button
                  type="button"
                  className="modal-primary-button"
                  onClick={nextStep}
                >
                  Next step →
                </button>
              ) : (
                <button
                  type="button"
                  className="modal-primary-button"
                  onClick={closeActivity}
                >
                  Finish activity ✓
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default WellnessStudio;