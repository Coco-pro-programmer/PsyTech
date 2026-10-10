
import React from "react";
import { Link } from "react-router-dom";
import "./ProfessionalHelp.css";

export default function ProfessionalHelp() {
  return (
    <div className="professional-help-page">
      <main className="professional-help-main">
        <section className="professional-help-hero">
          <div className="professional-help-hero-content">
            <span className="professional-help-eyebrow">
              PROFESSIONAL SUPPORT
            </span>

            <h1>
              Sometimes, talking to a
              <br />
              professional can help.
            </h1>

            <p>
              PsyTech can support everyday self-reflection and wellbeing,
              but some concerns are better explored with a qualified
              mental-health professional who can understand your
              individual situation.
            </p>

            <div className="professional-help-actions">
              <a
                href="#support-options"
                className="professional-help-primary"
              >
                Explore support options
              </a>

              <Link
                to="/ai-companion"
                className="professional-help-secondary"
              >
                Return to AI Companion
              </Link>
            </div>
          </div>

          <div className="professional-help-hero-visual">
            <div className="professional-help-orbit orbit-one" />
            <div className="professional-help-orbit orbit-two" />

            <div className="professional-help-visual-card">
              <div className="professional-help-visual-icon">
                +
              </div>

              <span>Professional support</span>

              <strong>
                You don't have to figure
                everything out alone.
              </strong>
            </div>
          </div>
        </section>

        <section className="professional-help-section-block">
          <div className="professional-help-section-heading">
            <span>WHEN SUPPORT MAY HELP</span>

            <h2>
              Consider reaching out when
              <br />
              something is becoming difficult to manage.
            </h2>

            <p>
              Seeking professional support is not limited to one type
              of experience. A qualified professional can help you
              understand concerns that are persistent, disruptive, or
              difficult to navigate on your own.
            </p>
          </div>

          <div className="professional-help-signs">
            <article className="professional-help-sign-card">
              <div className="professional-help-card-number">
                01
              </div>

              <h3>Daily life feels affected</h3>

              <p>
                Your emotions, thoughts, or worries are making school,
                work, relationships, routines, or everyday activities
                noticeably harder.
              </p>
            </article>

            <article className="professional-help-sign-card">
              <div className="professional-help-card-number">
                02
              </div>

              <h3>Something keeps returning</h3>

              <p>
                A concern continues to come back or remains difficult
                even after trying ordinary coping and wellbeing
                strategies.
              </p>
            </article>

            <article className="professional-help-sign-card">
              <div className="professional-help-card-number">
                03
              </div>

              <h3>You want individual guidance</h3>

              <p>
                You would like to speak with someone who can listen
                to your circumstances and provide support based on
                your individual needs.
              </p>
            </article>
          </div>
        </section>

        <section
          id="support-options"
          className="professional-help-section-block"
        >
          <div className="professional-help-section-heading">
            <span>SUPPORT OPTIONS</span>

            <h2>
              Different professionals can
              <br />
              provide different kinds of support.
            </h2>
          </div>

          <div className="professional-help-options">
            <article className="professional-help-option-card">
              <div className="professional-help-option-icon">
                P
              </div>

              <div>
                <h3>Psychologist</h3>

                <p>
                  A psychologist can provide psychological assessment,
                  structured conversations, and evidence-based
                  psychological interventions depending on their
                  qualifications and area of practice.
                </p>
              </div>
            </article>

            <article className="professional-help-option-card">
              <div className="professional-help-option-icon">
                C
              </div>

              <div>
                <h3>Counsellor</h3>

                <p>
                  A counsellor can provide a supportive space to
                  discuss personal, emotional, academic, relationship,
                  or everyday concerns.
                </p>
              </div>
            </article>

            <article className="professional-help-option-card">
              <div className="professional-help-option-icon">
                P
              </div>

              <div>
                <h3>Psychiatrist</h3>

                <p>
                  A psychiatrist is a medical doctor specializing in
                  mental health and can assess mental-health conditions
                  and provide medical treatment when appropriate.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="professional-help-start">
          <div className="professional-help-start-content">
            <span className="professional-help-eyebrow">
              TAKING THE FIRST STEP
            </span>

            <h2>
              Starting a conversation
              <br />
              can be simple.
            </h2>

            <p>
              You do not need to have everything figured out before
              contacting a professional. You can begin by explaining
              what you have been experiencing and what kind of support
              you are looking for.
            </p>
          </div>

          <div className="professional-help-steps">
            <div className="professional-help-step">
              <span>1</span>

              <div>
                <h3>Identify what you need</h3>
                <p>
                  Think about what has been difficult and how it has
                  been affecting your everyday life.
                </p>
              </div>
            </div>

            <div className="professional-help-step">
              <span>2</span>

              <div>
                <h3>Find a suitable professional</h3>
                <p>
                  Look for a qualified professional whose area of
                  practice matches the kind of support you need.
                </p>
              </div>
            </div>

            <div className="professional-help-step">
              <span>3</span>

              <div>
                <h3>Have an initial conversation</h3>
                <p>
                  Ask questions about their approach, qualifications,
                  availability, and what you can expect from support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Helplines */}
        <section className="professional-help-emergency">
          <div className="professional-help-emergency-heading">
            <span>IMMEDIATE SUPPORT</span>
            <h2>Emergency Helplines</h2>
            <p>
              If you or someone else needs urgent support in India,
              these services can help.
            </p>
          </div>

          <div className="professional-help-emergency-list">
            <article className="professional-help-emergency-card">
              <div className="professional-help-emergency-info">
                <span className="professional-help-emergency-icon">
                  !
                </span>

                <div>
                  <h3>National Emergency Number</h3>
                  <p>
                    For police, ambulance, fire, and other
                    emergencies. Available 24/7.
                  </p>
                  <strong className="professional-help-emergency-number">
                    112
                  </strong>
                </div>
              </div>

              <a
                href="tel:112"
                className="professional-help-emergency-button"
                aria-label="Call National Emergency Number 112"
              >
                Call Now
              </a>
            </article>

            <article className="professional-help-emergency-card">
              <div className="professional-help-emergency-info">
                <span className="professional-help-emergency-icon">
                  +
                </span>

                <div>
                  <h3>Tele-MANAS</h3>
                  <p>
                    Free, 24/7 mental health counselling and
                    support across India.
                  </p>
                  <strong className="professional-help-emergency-number">
                    14416
                  </strong>
                </div>
              </div>

              <a
                href="tel:14416"
                className="professional-help-emergency-button"
                aria-label="Call Tele-MANAS 14416"
              >
                Call Now
              </a>
            </article>
          </div>

          <p className="professional-help-emergency-note">
            In an immediate emergency, call 112. If you're a young
            person, consider reaching out to a trusted adult who
            can help you contact support.
          </p>
        </section>

        <section className="professional-help-boundary">
          <div className="professional-help-boundary-mark">
            i
          </div>

          <div>
            <h3>
              PsyTech is a wellbeing companion, not a replacement
              for professional care.
            </h3>

            <p>
              Its mood tracking, journaling, wellness activities,
              resources, and AI Companion are intended to support
              self-reflection and everyday wellbeing. They do not
              provide a professional diagnosis or replace individual
              assessment and care.
            </p>
          </div>
        </section>

        <section className="professional-help-navigation">
          <Link to="/wellness-hub">
            <span>Wellness Hub</span>
            <strong>Explore resources →</strong>
          </Link>

          <Link to="/wellness-studio">
            <span>Wellness Studio</span>
            <strong>Try a guided activity →</strong>
          </Link>

          <Link to="/dashboard">
            <span>PsyTech Dashboard</span>
            <strong>Return to dashboard →</strong>
          </Link>
        </section>

        <p className="professional-help-footer-note">
          PsyTech provides general wellbeing information and self-help
          tools. For personal assessment, diagnosis, or treatment,
          consult an appropriately qualified professional.
        </p>
      </main>
    </div>
  );
}