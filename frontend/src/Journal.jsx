
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Journal.css";

const API_BASE = "http://localhost:5000";

/* =========================================================
   DATE & TIME HELPERS
   ========================================================= */

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

/* =========================================================
   JOURNAL COMPONENT
   ========================================================= */

function Journal() {
  const navigate = useNavigate();

  /* =======================================================
     JOURNAL DATA
     ======================================================= */

  const [journals, setJournals] = useState([]);

  /* =======================================================
     EDITOR STATE
     ======================================================= */

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingEntryId, setEditingEntryId] = useState(null);

  /* =======================================================
     UI STATE
     ======================================================= */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [expandedEntry, setExpandedEntry] = useState(null);

  /* =======================================================
     LOAD USER + JOURNALS
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadJournalPage() {
      setLoading(true);
      setError("");

      try {
        const [userResponse, journalResponse] =
          await Promise.all([
            fetch(`${API_BASE}/api/me`, {
              method: "GET",
              credentials: "include",
            }),

            fetch(`${API_BASE}/api/journals`, {
              method: "GET",
              credentials: "include",
            }),
          ]);

        /* -----------------------------------------------
           SESSION EXPIRED / NOT LOGGED IN
        ------------------------------------------------ */

        if (
          userResponse.status === 401 ||
          journalResponse.status === 401
        ) {
          navigate("/login", { replace: true });
          return;
        }

        const userData = await userResponse.json();
        const journalData = await journalResponse.json();

        /* -----------------------------------------------
           USER RESPONSE ERROR
        ------------------------------------------------ */

        if (!userResponse.ok) {
          throw new Error(
            userData.message ||
              "Unable to load your account."
          );
        }

        /* -----------------------------------------------
           JOURNAL RESPONSE ERROR
        ------------------------------------------------ */

        if (!journalResponse.ok) {
          throw new Error(
            journalData.message ||
              "Unable to load your journal."
          );
        }

        if (!mounted) return;

        setJournals(
          Array.isArray(journalData.journals)
            ? journalData.journals
            : []
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err.message ||
            "Something went wrong while loading your journal."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadJournalPage();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* =======================================================
     SORT JOURNALS
     Newest updated/created entries appear first.
     ======================================================= */

  const sortedJournals = useMemo(() => {
    return [...journals].sort((a, b) => {
      const dateA = new Date(
        a.updated_at || a.created_at
      ).getTime();

      const dateB = new Date(
        b.updated_at || b.created_at
      ).getTime();

      return dateB - dateA;
    });
  }, [journals]);

  /* =======================================================
     CLEAR EDITOR
     ======================================================= */

  function resetEditor() {
    setTitle("");
    setContent("");
    setEditingEntryId(null);
    setError("");
  }

  /* =======================================================
     START EDITING
     ======================================================= */

  function handleEdit(entry) {
    setEditingEntryId(entry.id);
    setTitle(entry.title || "");
    setContent(entry.content || "");

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     CANCEL EDITING
     ======================================================= */

  function handleCancelEdit() {
    resetEditor();

    setSuccess("Editing cancelled.");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     CREATE / UPDATE JOURNAL
     ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    /* -----------------------------------------------
       VALIDATION
    ------------------------------------------------ */

    if (!cleanTitle) {
      setError(
        "Please add a title to your journal entry."
      );
      return;
    }

    if (!cleanContent) {
      setError(
        "Please write something before saving your entry."
      );
      return;
    }

    setSaving(true);

    try {
      /* =================================================
         UPDATE EXISTING ENTRY
         ================================================= */

      if (editingEntryId !== null) {
        const response = await fetch(
          `${API_BASE}/api/journals/${editingEntryId}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: cleanTitle,
              content: cleanContent,
            }),
          }
        );

        /* -----------------------------------------------
           AUTHENTICATION
        ------------------------------------------------ */

        if (response.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update your journal entry."
          );
        }

        /* -----------------------------------------------
           UPDATE LOCAL JOURNAL LIST
        ------------------------------------------------ */

        if (data.journal) {
          setJournals((previous) =>
            previous.map((entry) =>
              entry.id === editingEntryId
                ? data.journal
                : entry
            )
          );
        } else {
          setJournals((previous) =>
            previous.map((entry) =>
              entry.id === editingEntryId
                ? {
                    ...entry,
                    title: cleanTitle,
                    content: cleanContent,
                    updated_at: new Date().toISOString(),
                  }
                : entry
            )
          );
        }

        resetEditor();

        setSuccess(
          "Your journal entry has been updated."
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      /* =================================================
         CREATE NEW ENTRY
         ================================================= */

      const response = await fetch(
        `${API_BASE}/api/journals`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: cleanTitle,
            content: cleanContent,
          }),
        }
      );

      /* -----------------------------------------------
         AUTHENTICATION
      ------------------------------------------------ */

      if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save your journal entry."
        );
      }

      /* -----------------------------------------------
         ADD NEW ENTRY TO LIST
      ------------------------------------------------ */

      if (data.journal) {
        setJournals((previous) => [
          data.journal,
          ...previous,
        ]);
      }

      resetEditor();

      setSuccess(
        "Your journal entry has been saved."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while saving your entry."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE JOURNAL
     ======================================================= */

  async function handleDelete(entry) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${entry.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(entry.id);

    try {
      const response = await fetch(
        `${API_BASE}/api/journals/${entry.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      /* -----------------------------------------------
         AUTHENTICATION
      ------------------------------------------------ */

      if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete your journal entry."
        );
      }

      /* -----------------------------------------------
         REMOVE FROM LOCAL STATE
      ------------------------------------------------ */

      setJournals((previous) =>
        previous.filter(
          (item) => item.id !== entry.id
        )
      );

      if (expandedEntry === entry.id) {
        setExpandedEntry(null);
      }

      if (editingEntryId === entry.id) {
        resetEditor();
      }

      setSuccess(
        "Your journal entry has been deleted."
      );
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while deleting your entry."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     EXPAND / COLLAPSE ENTRY
     ======================================================= */

  function toggleEntry(id) {
    setExpandedEntry((current) =>
      current === id ? null : id
    );
  }

  /* =======================================================
     LOADING SCREEN
     ======================================================= */

  if (loading) {
    return (
      <div className="journal-page">
        <div className="journal-loading">
          <div className="journal-loading-spinner"></div>
          <p>Opening your journal...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN JOURNAL PAGE
     ======================================================= */

  return (
    <div className="journal-page">
      <main className="journal-main">
        {/* HERO */}

        <section className="journal-hero">
          <div className="journal-hero-copy">
            <span className="journal-eyebrow">
              PERSONAL JOURNAL
            </span>

            <h1>
              A quiet place for your thoughts.
            </h1>

            <p>
              Write freely, reflect on your day, and
              keep your thoughts together in one
              private space.
            </p>
          </div>

          <div
            className="journal-hero-decoration"
            aria-hidden="true"
          >
            <span>✎</span>
          </div>
        </section>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            className="journal-alert journal-alert-error"
            role="alert"
          >
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

        {/* SUCCESS MESSAGE */}

        {success && (
          <div
            className="journal-alert journal-alert-success"
            role="status"
          >
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

        {/* JOURNAL EDITOR */}

        <section className="journal-writing-section">
          <div className="journal-section-heading">
            <div>
              <span className="journal-section-kicker">
                {editingEntryId !== null
                  ? "EDIT ENTRY"
                  : "NEW ENTRY"}
              </span>

              <h2>
                {editingEntryId !== null
                  ? "Update your thoughts"
                  : "What would you like to write?"}
              </h2>
            </div>

            <span className="journal-private-badge">
              🔒 Private journal
            </span>
          </div>

          <form
            className="journal-editor-card"
            onSubmit={handleSubmit}
          >
            {/* TITLE */}

            <div className="journal-title-field">
              <label htmlFor="journal-title">
                Title
              </label>

              <input
                id="journal-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Give this entry a title..."
                maxLength={150}
              />

              <span>{title.length}/150</span>
            </div>

            {/* CONTENT */}

            <div className="journal-content-field">
              <label htmlFor="journal-content">
                Your thoughts
              </label>

              <textarea
                id="journal-content"
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder="Start writing here. There is no particular way you need to write..."
                rows={11}
                maxLength={10000}
              />

              <div className="journal-content-footer">
                <span>
                  Write as much or as little as feels
                  right.
                </span>

                <span>{content.length}/10000</span>
              </div>
            </div>

            {/* EDITOR BUTTONS */}

            <div className="journal-editor-actions">
              <button
                type="button"
                className="journal-clear-button"
                onClick={
                  editingEntryId !== null
                    ? handleCancelEdit
                    : resetEditor
                }
                disabled={
                  saving ||
                  deletingId !== null ||
                  (!title &&
                    !content &&
                    editingEntryId === null)
                }
              >
                {editingEntryId !== null
                  ? "Cancel"
                  : "Clear"}
              </button>

              <button
                type="submit"
                className="journal-save-button"
                disabled={
                  saving ||
                  deletingId !== null
                }
              >
                {saving
                  ? editingEntryId !== null
                    ? "Saving Changes..."
                    : "Saving..."
                  : editingEntryId !== null
                  ? "Save Changes"
                  : "Save Entry"}
              </button>
            </div>
          </form>
        </section>

        {/* JOURNAL HISTORY */}

        <section className="journal-history-section">
          <div className="journal-history-heading">
            <div>
              <span className="journal-section-kicker">
                YOUR JOURNAL
              </span>

              <h2>Previous entries</h2>

              <p>
                Revisit what you have written whenever
                you want.
              </p>
            </div>

            <div className="journal-entry-count">
              {journals.length}{" "}
              {journals.length === 1
                ? "entry"
                : "entries"}
            </div>
          </div>

          {/* EMPTY JOURNAL */}

          {sortedJournals.length === 0 ? (
            <div className="journal-empty-state">
              <div className="journal-empty-icon">
                📖
              </div>

              <h3>
                Your journal is waiting for its
                first entry.
              </h3>

              <p>
                Start with anything that is on your
                mind. Your first entry will appear
                here after you save it.
              </p>
            </div>
          ) : (
            /* JOURNAL ENTRY LIST */

            <div className="journal-entry-list">
              {sortedJournals.map(
                (entry, index) => {
                  const entryId =
                    entry.id ||
                    `${entry.created_at}-${index}`;

                  const isExpanded =
                    expandedEntry === entryId;

                  const isDeleting =
                    deletingId === entry.id;

                  return (
                    <article
                      className={`journal-entry-card ${
                        isExpanded ? "expanded" : ""
                      }`}
                      key={entryId}
                    >
                      {/* ENTRY HEADER */}

                      <button
                        type="button"
                        className="journal-entry-header"
                        onClick={() =>
                          toggleEntry(entryId)
                        }
                        aria-expanded={isExpanded}
                      >
                        <div className="journal-entry-icon">
                          {index === 0 ? "✦" : "✎"}
                        </div>

                        <div className="journal-entry-heading">
                          <h3>{entry.title}</h3>

                          <span>
                            {formatDate(
                              entry.updated_at ||
                                entry.created_at
                            )}
                            {" • "}
                            {formatTime(
                              entry.updated_at ||
                                entry.created_at
                            )}
                          </span>
                        </div>

                        <span className="journal-entry-arrow">
                          {isExpanded ? "⌃" : "⌄"}
                        </span>
                      </button>

                      {/* ENTRY BODY */}

                      {isExpanded && (
                        <div className="journal-entry-body">
                          <p>{entry.content}</p>

                          {/* ENTRY META */}

                          <div className="journal-entry-meta">
                            Created{" "}
                            {formatDate(entry.created_at)}

                            {entry.updated_at &&
                              entry.updated_at !==
                                entry.created_at &&
                              ` • Updated ${formatDate(
                                entry.updated_at
                              )}`}
                          </div>

                          {/* EDIT / DELETE */}

                          <div className="journal-entry-actions">
                            <button
                              type="button"
                              className="journal-edit-button"
                              onClick={() =>
                                handleEdit(entry)
                              }
                              disabled={
                                isDeleting || saving
                              }
                            >
                              ✎ Edit
                            </button>

                            <button
                              type="button"
                              className="journal-delete-button"
                              onClick={() =>
                                handleDelete(entry)
                              }
                              disabled={
                                isDeleting || saving
                              }
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "🗑 Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* BOTTOM INFORMATION */}

        <section className="journal-bottom-section">
          <div className="journal-reflection-card">
            <div className="reflection-icon">
              🌿
            </div>

            <div>
              <h3>
                Keep your reflections together
              </h3>

              <p>
                Your journal is your personal space
                to write, reflect, and revisit your
                thoughts whenever you need to.
              </p>
            </div>
          </div>

          <div className="journal-bottom-links">
            <Link to="/mood-history">
              ← Mood History
            </Link>

            <Link to="/dashboard">
              Back to Dashboard →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Journal;