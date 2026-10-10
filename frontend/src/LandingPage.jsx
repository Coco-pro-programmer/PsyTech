import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* =========================
          NAVIGATION
      ========================= */}
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          PsyTech
        </Link>

        <nav className="landing-nav" aria-label="Main Navigation">
          <Link to="/" className="active">
            Home
          </Link>

          <a href="#about">About</a>

          <a href="#wellness">Wellness Hub</a>

          <Link to="/login" className="nav-login">
            Login
          </Link>

          <Link to="/register" className="nav-register">
            Register
          </Link>
        </nav>
      </header>

      {/* =========================
          HERO
      ========================= */}
      <main>
        <section className="landing-hero">
          <div className="landing-hero-content">
            <span className="landing-eyebrow">
              YOUR PERSONAL WELLNESS SPACE
            </span>

            <h1>
              Understand yourself.
              <br />
              <span>Take care of your wellbeing.</span>
            </h1>

            <p>
              PsyTech brings together mood tracking, private journaling, guided
              wellness activities, helpful resources, and an AI Companion in one
              calm and supportive space.
            </p>

            <div className="landing-hero-buttons">
              <Link to="/register" className="landing-primary-button">
                Get Started
              </Link>

              <Link to="/login" className="landing-secondary-button">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-orbit landing-orbit-one" />
            <div className="landing-orbit landing-orbit-two" />

            <div className="landing-main-card">
              <div className="landing-card-top">
                <span>Today</span>
                <span className="landing-card-dot" />
              </div>

              <h3>Your wellbeing, one check-in at a time</h3>

              <div className="landing-moods">
                <span>Calm</span>
                <span>Okay</span>
                <span>Low</span>
              </div>

              <div className="landing-card-line" />

              <div className="landing-card-bottom">
                <span>Your wellbeing journey</span>
                <strong>♡</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            ABOUT
        ========================= */}
        <section id="about" className="landing-about">
          <div className="landing-section-label">ABOUT PSYTECH</div>

          <div className="landing-about-grid">
            <div>
              <h2>
                A space designed
                <br />
                around your wellbeing.
              </h2>
            </div>

            <div>
              <p>
                PsyTech is a self-help and wellbeing platform designed to help
                users reflect on their emotions, build healthy everyday habits, and
                discover useful wellbeing resources.
              </p>

              <p>
                It combines personal reflection tools with guided activities and an
                AI Companion while keeping clear boundaries around what technology
                can and cannot provide.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            FEATURES
        ========================= */}
        <section className="landing-features">
          <div className="landing-section-heading">
            <span>WHAT PSYTECH OFFERS</span>

            <h2>
              Tools for everyday
              <br />
              self-reflection.
            </h2>
          </div>

          <div className="landing-feature-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-number">01</div>
              <h3>Mood Tracking</h3>
              <p>
                Record how you feel and look back at your personal mood patterns
                over time.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-number">02</div>
              <h3>Private Journal</h3>
              <p>
                Put your thoughts into words through a private personal journaling
                space.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-number">03</div>
              <h3>Wellness Studio</h3>
              <p>
                Explore simple guided activities for reflection, relaxation,
                grounding, and focus.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-number">04</div>
              <h3>AI Companion</h3>
              <p>
                Have supportive wellbeing-focused conversations designed for
                self-reflection.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            WELLNESS HUB
        ========================= */}
        <section id="wellness" className="landing-wellness">
          <div className="landing-wellness-content">
            <span className="landing-section-label">WELLNESS HUB</span>

            <h2>
              Discover resources
              <br />
              worth exploring.
            </h2>

            <p>
              Find articles, videos, audio resources, and guided wellbeing
              content collected inside PsyTech.
            </p>

            <Link to="/wellness-hub" className="landing-wellness-button">
              Explore PsyTech
              <span>→</span>
            </Link>
          </div>

          <div className="landing-wellness-visual">
            <div className="landing-resource-card landing-resource-one">
              <span>READ</span>
              <strong>Understanding your emotions</strong>
            </div>

            <div className="landing-resource-card landing-resource-two">
              <span>LISTEN</span>
              <strong>A moment to slow down</strong>
            </div>

            <div className="landing-resource-card landing-resource-three">
              <span>WATCH</span>
              <strong>Everyday wellbeing</strong>
            </div>
          </div>
        </section>

        {/* =========================
            CTA
        ========================= */}
        <section className="landing-cta">
          <span>START YOUR JOURNEY</span>

          <h2>
            Your wellbeing deserves
            <br />a little more attention.
          </h2>

          <p>
            Create your PsyTech account and explore your personal wellbeing
            space.
          </p>

          <Link to="/register" className="landing-cta-button">
            Create your account
          </Link>

          <p className="landing-cta-login">
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </section>
      </main>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <Link to="/">PsyTech</Link>
          <p>
            A digital space for everyday wellbeing, self-reflection, and
            personal growth.
          </p>
        </div>

        <div className="landing-footer-links">
          <Link to="/">Home</Link>
          <a href="#about">About</a>
          <a href="#wellness">Wellness Hub</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        <div className="landing-footer-bottom">
          © {new Date().getFullYear()} PsyTech. All rights reserved.
        </div>
      </footer>
    </div>
  );
}