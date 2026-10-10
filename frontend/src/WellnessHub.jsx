import React, { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import "./WellnessHub.css";

const API_BASE = "http://localhost:5000";

const fallbackResources = [
  {
    id: "stress",
    title: "Understanding Stress",
    category: "Stress",
    description:
      "Learn how everyday stress can affect thoughts, emotions, focus, and routines.",
    content: `Stress is a natural response to situations that feel challenging or demanding. It can affect how we think, feel, and respond throughout the day.

Noticing situations that leave you feeling stressed can help you understand your own patterns. Everyone responds differently, and there is no single right way to manage stress.

Small steps such as taking a break, talking to someone you trust, or organizing a task into manageable parts may be useful.

If stress is affecting your everyday life, consider reaching out to a trusted adult or a qualified professional for support.`,
  },
  {
    id: "grounding",
    title: "Grounding and the Present Moment",
    category: "Grounding",
    description:
      "Explore simple ways to bring your attention back to what is happening around you.",
    content: `Grounding is a way of gently directing your attention to the present moment, using your surroundings or physical sensations.

You might look around and notice the colors, shapes, and sounds around you. You could also hold a familiar object and pay attention to its texture and temperature.

There is no need to force yourself to feel calm. If focusing on your body or breathing feels uncomfortable, you can simply look around the room or choose another activity.

Try grounding at your own pace and choose an approach that feels comfortable for you.`,
  },
  {
    id: "journaling",
    title: "Journaling for Self-Reflection",
    category: "Self-Reflection",
    description:
      "Use writing as a private space to notice thoughts, emotions, and daily patterns.",
    content: `Journaling can offer a space to organize thoughts and reflect on daily experiences.

You could write about something that stood out today, a question on your mind, or an experience you would like to understand better.

You do not need to write perfectly or follow a particular structure. A few words, a list, or a short paragraph can be enough.

Keep your journal somewhere that feels private and comfortable. You can choose what to write about and what you prefer to keep to yourself.`,
  },
  {
    id: "focus",
    title: "Building Better Focus",
    category: "Focus",
    description:
      "Explore practical ideas for creating a calmer and more manageable study routine.",
    content: `Focus can change from day to day. Sleep, distractions, stress, and the kind of task you are doing can all affect how easy it feels to concentrate.

It may help to identify one small task to begin with, arrange a comfortable workspace, and take breaks when needed.

You can also try writing down the next step instead of thinking about everything you need to do at once.

If concentrating feels difficult, try to be patient with yourself. Different routines work for different people, and it is okay to ask for support when you need it.`,
  },
];

const externalArticles = [
  {
    id: "nhs-student-stress",
    title: "Student stress: self-help tips",
    category: "Stress",
    publisher: "NHS",
    description:
      "Information about common sources of study-related stress, managing tasks, taking breaks and seeking support.",
    url: "https://www.nhs.uk/mental-health/children-and-young-adults/help-for-teenagers-young-adults-and-students/student-stress-self-help-tips/",
  },
  {
    id: "camhs-grounding",
    title: "Ground yourself",
    category: "Grounding",
    publisher: "Oxford Health CAMHS",
    description:
      "Explore a grounding exercise that uses your senses to help you notice your surroundings and the present moment.",
    url: "https://oxfordhealth.nhs.uk/camhs/self-care/sleep/relaxation/ground-yourself/",
  },
  {
    id: "camhs-relaxation",
    title: "Relaxation and distraction",
    category: "Relaxation",
    publisher: "Oxford Health CAMHS",
    description:
      "Learn about different approaches to relaxation, including breathing, grounding, visualization and muscle relaxation.",
    url: "https://oxfordhealth.nhs.uk/camhs/self-care/sleep/relaxation/",
  },
  {
    id: "camhs-breathing",
    title: "Focus on your breathing",
    category: "Breathing",
    publisher: "Oxford Health CAMHS",
    description:
      "A guided introduction to noticing your breathing and using it as a gentle focus, at your own pace.",
    url: "https://oxfordhealth.nhs.uk/camhs/self-care/sleep/relaxation/breathing/",
  },
  {
    id: "childmind-mindfulness",
    title: "Managing Social Media Stress With Mindfulness",
    category: "Self-Reflection",
    publisher: "Child Mind Institute",
    description:
      "Learn about mindfulness, noticing emotions and building awareness of how online experiences affect you.",
    url: "https://childmind.org/article/social-media-stress-mindfulness/",
  },
  {
    id: "camhs-sleep",
    title: "Understanding and dealing with poor sleep",
    category: "Sleep",
    publisher: "Oxford Health CAMHS",
    description:
      "Young-person-focused information and resources about sleep, bedtime routines and relaxation.",
    url: "https://oxfordhealth.nhs.uk/camhs/self-care/poor-sleep/",
  },
];

const videoResources = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    category: "Breathing",
    description:
      "An introduction to a steady breathing pattern. Keep your breathing comfortable and do not force it.",
    videoId: "FJJazKtH_9I",
  },
  {
    id: "safe-place",
    title: "Imagining a Calm Place",
    category: "Relaxation",
    description:
      "A guided visualization that you can follow along with or simply listen to.",
    videoId: "G1bxxiiXc48",
  },
  {
    id: "stress-breathing",
    title: "Breathing Exercise",
    category: "Stress",
    description:
      "A simple breathing exercise that introduces a gentle way to pause.",
    videoId: "IYTZwBzjNC0",
  },
  {
    id: "psych2go-stress",
    title: "6 Daily Habits to Reduce Stress & Anxiety",
    category: "Stress",
    description:
      "A Psych2Go video exploring everyday habits that may help with stress and anxiety.",
    videoId: "o18I23HCQtE",
  },
];

function normalizeResource(resource, index) {
  return {
    id: `server-${resource.id ?? index}`,
    title: resource.title || "Untitled Resource",
    category: resource.category || "General",
    description:
      resource.description || "A PsyTech wellness resource for self-reflection.",
    content:
      resource.content ||
      resource.description ||
      "This resource does not have additional content yet.",
  };
}

export default function WellnessHub() {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadResources() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/modules`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load wellness resources.");
        }

        const data = await response.json();
        if (!isMounted) return;

        const modules = Array.isArray(data)
          ? data
          : Array.isArray(data.modules)
            ? data.modules
            : [];

        const serverResources = modules.map(normalizeResource);
        const combined = [
          ...serverResources,
          ...fallbackResources.map((resource) => ({
            ...resource,
            id: `local-${resource.id}`,
          })),
        ];

        const seen = new Set();
        const uniqueResources = combined.filter((resource) => {
          const key = `${resource.title.toLowerCase()}-${resource.category.toLowerCase()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setResources(uniqueResources);
      } catch {
        if (!isMounted) return;
        setResources(
          fallbackResources.map((resource) => ({
            ...resource,
            id: `local-${resource.id}`,
          }))
        );
        setError(
          "Some app resources could not be loaded. Showing the available resources instead."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadResources();

    return () => {
      isMounted = false;
    };
  }, []);

  const allArticles = useMemo(
    () => [
      ...resources.map((resource) => ({
        ...resource,
        type: "internal",
      })),
      ...externalArticles.map((article) => ({
        ...article,
        type: "external",
      })),
    ],
    [resources]
  );

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set([
        ...allArticles.map((article) => article.category),
        ...videoResources.map((video) => video.category),
      ]),
    ];
    return ["All", ...uniqueCategories];
  }, [allArticles]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "All") return allArticles;
    return allArticles.filter(
      (article) => article.category === selectedCategory
    );
  }, [allArticles, selectedCategory]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === "All") return videoResources;
    return videoResources.filter(
      (video) => video.category === selectedCategory
    );
  }, [selectedCategory]);

  function closeResource() {
    setSelectedResource(null);
  }

  return (
    <div className="wellness-hub-page">
      <main className="wellness-hub-main">
        <section className="wellness-hub-hero">
          <div className="wellness-hub-hero-content">
            <span className="wellness-hub-eyebrow">
              EXPLORE • LEARN • REFLECT
            </span>

            <h1>A calmer space to learn about your wellbeing.</h1>

            <p>
              Explore practical, easy-to-understand articles and videos
              designed to help you learn more about emotions, stress,
              focus, self-reflection, and everyday wellbeing.
            </p>

            <div className="wellness-hub-hero-actions">
              <a href="#hub-videos" className="hub-primary-button">
                Explore videos
              </a>
              <a href="#hub-articles" className="hub-secondary-button">
                Read articles
              </a>
            </div>
          </div>

          <div className="wellness-hub-hero-art" aria-hidden="true">
            <div className="hub-orbit hub-orbit-one" />
            <div className="hub-orbit hub-orbit-two" />
            <div className="hub-leaf leaf-one">✦</div>
            <div className="hub-leaf leaf-two">✧</div>
            <div className="hub-hero-card">
              <span>Today</span>
              <strong>Take a moment</strong>
              <p>Learn something useful. Notice something new.</p>
            </div>
          </div>
        </section>

        <section className="wellness-hub-content" id="hub-articles">
          <div className="hub-section-heading">
            <div>
              <span className="hub-small-label">WELLNESS LIBRARY</span>
              <h2>Articles for everyday wellbeing</h2>
            </div>
            <p>
              Choose a topic that feels relevant to you today.
              Explore at your own pace.
            </p>
          </div>

          <div className="hub-source-note">
            Includes PsyTech learning resources and articles from external
            wellbeing organizations. External articles open on their
            publisher's website.
          </div>

          {error && <div className="hub-notice">{error}</div>}

          <div className="hub-category-bar" aria-label="Filter resources">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "hub-category active"
                    : "hub-category"
                }
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="hub-loading">
              <div className="hub-spinner" />
              <p>Loading your wellness resources...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="hub-empty">
              <div className="hub-empty-icon">○</div>
              <h3>No articles in this category yet</h3>
              <p>Try another topic from the categories above.</p>
            </div>
          ) : (
            <div className="hub-resource-grid">
              {filteredArticles.map((article) => (
                <article
                  className="hub-resource-card"
                  key={article.id}
                >
                  <div className="hub-card-top">
                    <span className="hub-resource-category">
                      {article.category}
                    </span>
                    <span className="hub-resource-type">
                      {article.type === "external" ? "WEB ARTICLE" : "PsyTech"}
                    </span>
                  </div>

                  <h3>{article.title}</h3>
                  {article.publisher && (
                    <span className="hub-article-publisher">
                      {article.publisher}
                    </span>
                  )}
                  <p>{article.description}</p>

                  {article.type === "external" ? (
                    <a
                      className="hub-read-button hub-external-link"
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read original article <span>↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="hub-read-button"
                      onClick={() => setSelectedResource(article)}
                    >
                      Read article <span>→</span>
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="wellness-hub-content hub-video-section"
          id="hub-videos"
        >
          <div className="hub-section-heading">
            <div>
              <span className="hub-small-label">WATCH & EXPLORE</span>
              <h2>Guided videos</h2>
            </div>
            <p>
              Watch embedded videos here, or open them directly on YouTube.
              Take part only in ways that feel comfortable for you.
            </p>
          </div>

          <div className="hub-video-grid">
            {filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <article className="hub-video-card" key={video.id}>
                  <div className="hub-video-frame">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                      title={video.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>

                  <div className="hub-video-details">
                    <div className="hub-video-meta">
                      <span className="hub-resource-category">
                        {video.category}
                      </span>
                      <span className="hub-resource-type">VIDEO</span>
                    </div>
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                    <a
                      className="hub-youtube-link"
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Play on YouTube <span>↗</span>
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div className="hub-empty hub-video-empty">
                <h3>No videos in this category yet</h3>
                <p>
                  Choose “All” or explore the other available categories.
                </p>
              </div>
            )}
          </div>

          <p className="hub-video-note">
            Videos are hosted by YouTube. Their availability and playback
            may depend on YouTube's settings and your network.
          </p>
        </section>

        <p className="hub-disclaimer">
          PsyTech provides general wellbeing information and self-help
          resources. It is not a replacement for professional mental-health
          care or emergency support. External articles are provided by their
          respective publishers.
        </p>
      </main>

      {selectedResource && (
        <div
          className="hub-modal-backdrop"
          onClick={closeResource}
          role="presentation"
        >
          <div
            className="hub-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="hub-modal-close"
              onClick={closeResource}
              aria-label="Close article"
            >
              ×
            </button>

            <span className="hub-resource-category">
              {selectedResource.category}
            </span>
            <span className="hub-resource-type hub-modal-type">
              PsyTech ARTICLE
            </span>

            <h2 id="resource-title">{selectedResource.title}</h2>
            <p className="hub-modal-description">
              {selectedResource.description}
            </p>

            <div className="hub-modal-content">
              {(selectedResource.content || "")
                .split("\n")
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={`${selectedResource.id}-${index}`}>
                    {paragraph}
                  </p>
                ))}
            </div>

            <div className="hub-modal-actions">
              <button
                type="button"
                className="hub-modal-secondary"
                onClick={closeResource}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}