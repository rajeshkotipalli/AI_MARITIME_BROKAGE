import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import "./WaypointAI.css";

const QUICK_QUESTIONS = [
  "What is the best route?",
  "Why is this route better?",
  "Explain the route score",
  "What is transshipment?",
];

function WaypointAI({
  currentPage = "Waypoint",
}) {
  const location = useLocation();

  const [isOpen, setIsOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        id: 1,
        type: "ai",
        text:
          "Hello! 👋 I'm **Waypoint AI**.\n\n" +
          "I can help you understand Waypoint, " +
          "maritime concepts, routes, weather, ports " +
          "and quotations.",
      },
    ]);

  const [isTyping, setIsTyping] =
    useState(false);

  // ============================================================
  // AI RESPONSE LANGUAGE
  // ============================================================

  const [aiLanguage, setAiLanguage] =
    useState("en");

  const AI_LANGUAGES = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
    },
    {
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
    },
    {
      code: "ta",
      name: "Tamil",
      nativeName: "தமிழ்",
    },
    {
      code: "hi",
      name: "Hindi",
      nativeName: "हिन्दी",
    },
  ];

  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);

  // ============================================================
  // CURRENT PAGE
  // ============================================================

  const detectedPage =
    (() => {
      const path =
        location.pathname.toLowerCase();

      if (path === "/routes") {
        return "Route Results";
      }

      if (path === "/weather") {
        return "Weather & Conditions";
      }

      if (
        path === "/connected-ports"
      ) {
        return "Connected Ports";
      }

      if (path === "/quotation") {
        return "Request Quotation";
      }

      if (path === "/history") {
        return "Search History";
      }

      if (path === "/dashboard") {
        return "Operations Dashboard";
      }

      return currentPage;
    })();

  const isRoutePage =
    location.pathname === "/routes";

  const isWeatherPage =
    location.pathname === "/weather";

  // ============================================================
  // REAL WEATHER CONTEXT
  // ============================================================

  const [weatherContext, setWeatherContext] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "waypoint_ai_weather_context"
          );

        return saved
          ? JSON.parse(saved)
          : null;
      } catch {
        return null;
      }
    });

  useEffect(() => {

    const loadWeatherContext = () => {

      try {
        const saved =
          localStorage.getItem(
            "waypoint_ai_weather_context"
          );

        setWeatherContext(
          saved
            ? JSON.parse(saved)
            : null
        );

      } catch {
        setWeatherContext(null);
      }
    };

    loadWeatherContext();

    window.addEventListener(
      "waypoint-ai-weather-updated",
      loadWeatherContext
    );

    window.addEventListener(
      "storage",
      loadWeatherContext
    );

    return () => {

      window.removeEventListener(
        "waypoint-ai-weather-updated",
        loadWeatherContext
      );

      window.removeEventListener(
        "storage",
        loadWeatherContext
      );

    };

  }, []);

  // ============================================================
  // REAL ROUTE CONTEXT
  //
  // IMPORTANT:
  // We only trust route context when the user is actually
  // on the Route Results page.
  //
  // We DO NOT fall back to an old saved route while the user
  // is on the planner/home page.
  // ============================================================

  const routeContext =
    (() => {

      if (!isRoutePage) {
        return null;
      }

      const state =
        location.state || {};

      const result =
        state.result || null;

      const routeFromState =
        state.route || null;

      if (
        !result &&
        !routeFromState
      ) {
        return null;
      }

      const availableRoutes =
        Array.isArray(
          result?.available_routes
        )
          ? result.available_routes
          : [];

      let recommendedRoute =
        result?.recommended_route ||
        null;

      if (
        typeof recommendedRoute ===
        "string"
      ) {

        recommendedRoute =
          availableRoutes.find(
            (item) =>
              String(
                item?.route_id
              ) ===
              String(
                recommendedRoute
              )
          ) || null;

      }

      if (
        routeFromState &&
        typeof routeFromState ===
          "object"
      ) {
        recommendedRoute =
          routeFromState;
      }

      if (
        !recommendedRoute &&
        availableRoutes.length > 0
      ) {

        recommendedRoute =
          availableRoutes.find(
            (item) =>
              item?.is_best === true
          ) ||
          availableRoutes[0];

      }

      if (
        !recommendedRoute &&
        !availableRoutes.length
      ) {
        return null;
      }

      return {

        origin:
          result?.origin ||
          recommendedRoute?.origin,

        destination:
          result?.destination ||
          recommendedRoute?.destination,

        cargo_type:
          result?.cargo_type ||
          recommendedRoute?.cargo_type,

        containers:
          result?.containers ??
          recommendedRoute?.containers ??
          null,

        recommended_route:
          recommendedRoute,

        available_routes:
          availableRoutes,

        total_routes:
          result?.total_routes ??
          availableRoutes.length,

        recommended_score:
          result?.recommended_score ??
          recommendedRoute?.score,

        reason:
          result?.reason ||
          null,

      };

    })();

  // ============================================================
  // STORE ONLY THE CURRENT REAL ROUTE RESULT
  // ============================================================

  useEffect(() => {

    if (
      !isRoutePage ||
      !routeContext
    ) {
      return;
    }

    try {

      localStorage.setItem(
        "waypoint_ai_route_context",
        JSON.stringify(
          routeContext
        )
      );

      window.dispatchEvent(
        new CustomEvent(
          "waypoint-ai-context-updated"
        )
      );

    } catch (error) {

      console.warn(
        "Unable to save route AI context:",
        error
      );

    }

  }, [
    isRoutePage,
    routeContext,
  ]);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [
    messages,
    isTyping,
  ]);

  // ============================================================
  // FOCUS INPUT
  // ============================================================

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

  }, [
    isOpen,
  ]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = async (
    text = message
  ) => {

    const question =
      text.trim();

    if (
      !question ||
      isTyping
    ) {
      return;
    }

    setMessages(
      (previous) => [
        ...previous,
        {
          id: Date.now(),
          type: "user",
          text: question,
        },
      ]
    );

    setMessage("");
    setIsTyping(true);

    try {

      const token =
        localStorage.getItem(
          "waypoint_token"
        );

      /*
       * IMPORTANT:
       *
       * Route context is used ONLY on Route Results.
       * We do not send stale route data when the user is
       * on Home / Route Planner.
       */

      let currentRouteContext =
        isRoutePage
          ? routeContext
          : null;

      /*
       * Weather context is used ONLY on Weather page.
       * This prevents an old Antwerp weather result from
       * being mixed into a route-planning question.
       */

      let currentWeatherContext =
        isWeatherPage
          ? weatherContext
          : null;

      /*
       * Re-read the latest values immediately before
       * sending the request.
       */

      if (isRoutePage) {

        try {

          const savedRoute =
            localStorage.getItem(
              "waypoint_ai_route_context"
            );

          if (savedRoute) {

            const parsed =
              JSON.parse(
                savedRoute
              );

            /*
             * Only accept saved route context if it
             * matches the current Route Results page.
             */
            if (
              parsed?.origin ===
                routeContext?.origin &&
              parsed?.destination ===
                routeContext?.destination
            ) {
              currentRouteContext =
                routeContext;
            }

          }

        } catch {
          // Keep current in-memory route context.
        }

      }

      if (isWeatherPage) {

        try {

          const savedWeather =
            localStorage.getItem(
              "waypoint_ai_weather_context"
            );

          if (savedWeather) {
            currentWeatherContext =
              JSON.parse(
                savedWeather
              );
          }

        } catch {
          // Keep current in-memory weather context.
        }

      }

      const aiContext = {

        route:
          currentRouteContext?.recommended_route ||
          null,

        recommended_route:
          currentRouteContext?.recommended_route ||
          null,

        available_routes:
          currentRouteContext?.available_routes ||
          [],

        origin:
          currentRouteContext?.origin ||
          currentWeatherContext?.origin ||
          null,

        destination:
          currentRouteContext?.destination ||
          currentWeatherContext?.destination ||
          null,

        cargo_type:
          currentRouteContext?.cargo_type ||
          null,

        containers:
          currentRouteContext?.containers ??
          null,

        total_routes:
          currentRouteContext?.total_routes ||
          0,

        recommended_score:
          currentRouteContext?.recommended_score ??
          null,

        reason:
          currentRouteContext?.reason ||
          null,

        weather:
          currentWeatherContext ||
          null,

        origin_weather:
          currentWeatherContext?.originWeather ||
          null,

        destination_weather:
          currentWeatherContext?.destinationWeather ||
          null,

        origin_weather_risk:
          currentWeatherContext?.originRisk ||
          null,

        destination_weather_risk:
          currentWeatherContext?.destinationRisk ||
          null,

        origin_forecast:
          currentWeatherContext?.originForecast ||
          [],

        destination_forecast:
          currentWeatherContext?.destinationForecast ||
          [],

      };

      /*
       * If the page has no live context, still send the
       * question. The backend can resolve explicit route
       * questions such as:
       *
       * "best route for Chennai to Rotterdam"
       */

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/ai/chat",
          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),

            },

            body: JSON.stringify({

              message:
                question,

              page:
                detectedPage,

              language:
                aiLanguage,

              context:
                Object.values(
                  aiContext
                ).some(
                  (value) =>
                    value !== null &&
                    value !== undefined &&
                    (
                      !Array.isArray(value) ||
                      value.length > 0
                    )
                )
                  ? aiContext
                  : null,

            }),
          }
        );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {

        throw new Error(
          data?.detail?.message ||
          data?.detail ||
          data?.message ||
          `Waypoint AI request failed (${response.status}).`
        );

      }

      const answer =
        data?.answer ||
        data?.message ||
        "I couldn't generate an answer.";

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              Date.now() + 1,
            type: "ai",
            text: answer,
          },
        ]
      );

    } catch (error) {

      console.error(
        "Waypoint AI error:",
        error
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              Date.now() + 1,
            type: "error",
            text:
              error.message ||
              "I couldn't connect to Waypoint AI.",
          },
        ]
      );

    } finally {

      setIsTyping(false);

    }

  };

  // ============================================================
  // ENTER
  // ============================================================

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  };

  // ============================================================
  // CLEAR
  // ============================================================

  const clearChat = () => {

    setMessages([
      {
        id: Date.now(),
        type: "ai",
        text:
          "Chat cleared. 👋\n\n" +
          "How can I help you with Waypoint?",
      },
    ]);

  };

  // ============================================================
  // FORMAT
  // ============================================================

  const formatText = (
    text
  ) => {

    return text
      .split("\n")
      .map(
        (
          line,
          index
        ) => {

          const parts =
            line.split(
              /(\*\*.*?\*\*)/
            );

          return (
            <span
              key={index}
              className="wp-ai-line"
            >
              {parts.map(
                (
                  part,
                  partIndex
                ) => {

                  if (
                    part.startsWith(
                      "**"
                    ) &&
                    part.endsWith(
                      "**"
                    )
                  ) {

                    return (
                      <strong
                        key={
                          partIndex
                        }
                      >
                        {part.slice(
                          2,
                          -2
                        )}
                      </strong>
                    );

                  }

                  return (
                    <span
                      key={
                        partIndex
                      }
                    >
                      {part}
                    </span>
                  );

                }
              )}
            </span>
          );

        }
      );

  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {!isOpen && (

        <button
          type="button"
          className="wp-ai-launcher"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="Open Waypoint AI"
        >

          <span className="wp-ai-launcher-icon">
            ✦
          </span>

          <span className="wp-ai-launcher-text">
            Waypoint AI
          </span>

          <span className="wp-ai-online-dot" />

        </button>

      )}

      {isOpen && (

        <section
          className="wp-ai-chat"
          aria-label="Waypoint AI Assistant"
        >

          <header className="wp-ai-header">

            <div className="wp-ai-brand">

              <div className="wp-ai-avatar">
                ✦
              </div>

              <div>

                <div className="wp-ai-title">
                  Waypoint AI
                </div>

                <div className="wp-ai-status">
                  <span />
                  Local assistant · Online
                </div>

              </div>

            </div>

            {/* ==================================================
                AI RESPONSE LANGUAGE
                ================================================== */}

            <div className="wp-ai-language">
              <span className="wp-ai-language-label">
                Language
              </span>

              <select
                value={aiLanguage}
                onChange={(event) =>
                  setAiLanguage(event.target.value)
                }
                aria-label="AI response language"
              >
                {AI_LANGUAGES.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="wp-ai-header-actions">

              <button
                type="button"
                onClick={
                  clearChat
                }
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                ↺
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                title="Close Waypoint AI"
                aria-label="Close Waypoint AI"
              >
                ×
              </button>

            </div>

          </header>

          <div className="wp-ai-context">

            <span>●</span>

            {routeContext
              ? `Live route data · ${routeContext.origin} → ${routeContext.destination}`
              : isWeatherPage && weatherContext
                ? `Live weather data · ${weatherContext.origin} → ${weatherContext.destination}`
                : `Assisting on ${detectedPage}`}

          </div>

          <div className="wp-ai-messages">

            {messages.map(
              (item) => (

                <div
                  key={item.id}
                  className={
                    `wp-ai-message-row ${item.type}`
                  }
                >

                  {item.type !==
                    "user" && (

                    <div className="wp-ai-small-avatar">
                      ✦
                    </div>

                  )}

                  <div
                    className={
                      `wp-ai-bubble ${item.type}`
                    }
                  >
                    {formatText(
                      item.text
                    )}
                  </div>

                </div>

              )
            )}

            {isTyping && (

              <div className="wp-ai-message-row ai">

                <div className="wp-ai-small-avatar">
                  ✦
                </div>

                <div className="wp-ai-bubble ai wp-ai-typing">
                  <span />
                  <span />
                  <span />
                </div>

              </div>

            )}

            <div
              ref={
                messagesEndRef
              }
            />

          </div>

          <div className="wp-ai-quick">

            <div className="wp-ai-quick-title">

              {routeContext
                ? "Ask about this route"
                : isWeatherPage &&
                  weatherContext
                  ? "Ask about this weather"
                  : "Try asking"}

            </div>

            <div className="wp-ai-quick-list">

              {QUICK_QUESTIONS.map(
                (
                  question
                ) => (

                  <button
                    type="button"
                    key={
                      question
                    }
                    onClick={() =>
                      sendMessage(
                        question
                      )
                    }
                  >
                    {question}
                  </button>

                )
              )}

            </div>

          </div>

          <div className="wp-ai-input-area">

            <div className="wp-ai-input-wrap">

              <textarea
                ref={inputRef}
                value={message}
                onChange={(
                  event
                ) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Ask Waypoint AI..."
                rows={1}
                disabled={
                  isTyping
                }
              />

              <button
                type="button"
                className="wp-ai-send"
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  !message.trim() ||
                  isTyping
                }
                aria-label="Send message"
              >
                ➤
              </button>

            </div>

            <div className="wp-ai-disclaimer">
              Waypoint AI uses actual application data when available.
            </div>

          </div>

        </section>

      )}
    </>
  );
}

export default WaypointAI;
