import {
<<<<<<< HEAD

  useEffect,

  useRef,

  useState,

} from "react";

import {

  useLocation,

=======
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
>>>>>>> origin/master
} from "react-router-dom";

import "./WaypointAI.css";

const QUICK_QUESTIONS = {
<<<<<<< HEAD

  route: [

    "Best route?",

    "Compare routes",

    "Route score?",

    "Transit time?",

    "Weather risk?",

    "Quotation logic?",

  ],

  weather: [

    "Weather risk?",

    "Wind & visibility?",

    "Forecast summary",

    "Route impact?",

    "Port conditions?",

    "Weather basics",

  ],

  quotation: [

    "How is price calculated?",

    "What affects freight?",

    "Explain my quotation",

    "Route used?",

    "Transit time?",

    "Shipment summary",

  ],

  general: [

    "What is transshipment?",

    "Explain ETA",

    "Connected ports?",

    "Shipping basics",

    "How does Waypoint work?",

    "What can I ask?",

  ],

};

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

  const [speakingId, setSpeakingId] =

    useState(null);

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

=======
  route: [
    "Best route?",
    "Compare routes",
    "Route score?",
    "Transit time?",
    "Weather risk?",
    "Quotation logic?",
  ],
  weather: [
    "Weather risk?",
    "Wind & visibility?",
    "Forecast summary",
    "Route impact?",
    "Port conditions?",
    "Weather basics",
  ],
  quotation: [
    "How is price calculated?",
    "What affects freight?",
    "Explain my quotation",
    "Route used?",
    "Transit time?",
    "Shipment summary",
  ],
  general: [
    "What is transshipment?",
    "Explain ETA",
    "Connected ports?",
    "Shipping basics",
    "How does Waypoint work?",
    "What can I ask?",
  ],
};

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

  const [speakingId, setSpeakingId] =
    useState(null);

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
>>>>>>> origin/master
    });

  useEffect(() => {

    const loadWeatherContext = () => {

      try {
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
    };

    loadWeatherContext();

    window.addEventListener(
<<<<<<< HEAD

      "waypoint-ai-weather-updated",

      loadWeatherContext

    );

    window.addEventListener(

      "storage",

      loadWeatherContext

=======
      "waypoint-ai-weather-updated",
      loadWeatherContext
    );

    window.addEventListener(
      "storage",
      loadWeatherContext
>>>>>>> origin/master
    );

    return () => {

      window.removeEventListener(
<<<<<<< HEAD

        "waypoint-ai-weather-updated",

        loadWeatherContext

      );

      window.removeEventListener(

        "storage",

        loadWeatherContext

=======
        "waypoint-ai-weather-updated",
        loadWeatherContext
      );

      window.removeEventListener(
        "storage",
        loadWeatherContext
>>>>>>> origin/master
      );

    };

  }, []);

  // ============================================================
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
          ) || null;

      }

      if (
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
          availableRoutes[0];

      }

      if (
<<<<<<< HEAD

        !recommendedRoute &&

        !availableRoutes.length

      ) {

        return null;

=======
        !recommendedRoute &&
        !availableRoutes.length
      ) {
        return null;
>>>>>>> origin/master
      }

      return {

        origin:
<<<<<<< HEAD

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

      
        pricing_intelligence:
          result?.pricing_intelligence ??
          result?.route_intelligence?.pricing_intelligence ??
          null,

        weather_intelligence:
          result?.weather_intelligence ??
          result?.route_intelligence?.weather_intelligence ??
          null,

        customs_intelligence:
          result?.customs_intelligence ??
          result?.route_intelligence?.customs_intelligence ??
          null,

        risk_intelligence:
          result?.risk_intelligence ??
          result?.route_intelligence?.risk_intelligence ??
          null,

        business_recommendation:
          result?.business_recommendation ??
          result?.route_intelligence?.business_recommendation ??
          null,

        disclaimers:
          result?.disclaimers ??
          result?.route_intelligence?.disclaimers ??
          [],
=======
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

>>>>>>> origin/master
      };

    })();

  // ============================================================
<<<<<<< HEAD

  // COMPACT QUICK PROMPTS

  // ============================================================

  const quickQuestions =

    isRoutePage && routeContext

      ? QUICK_QUESTIONS.route

      : isWeatherPage && weatherContext

        ? QUICK_QUESTIONS.weather

        : location.pathname === "/quotation"

          ? QUICK_QUESTIONS.quotation

          : QUICK_QUESTIONS.general;

  // ============================================================

  // STORE ONLY THE CURRENT REAL ROUTE RESULT

=======
  // COMPACT QUICK PROMPTS
  // ============================================================

  const quickQuestions =
    isRoutePage && routeContext
      ? QUICK_QUESTIONS.route
      : isWeatherPage && weatherContext
        ? QUICK_QUESTIONS.weather
        : location.pathname === "/quotation"
          ? QUICK_QUESTIONS.quotation
          : QUICK_QUESTIONS.general;


  // ============================================================
  // STORE ONLY THE CURRENT REAL ROUTE RESULT
>>>>>>> origin/master
  // ============================================================

  useEffect(() => {

    if (
<<<<<<< HEAD

      !isRoutePage ||

      !routeContext

    ) {

      return;

=======
      !isRoutePage ||
      !routeContext
    ) {
      return;
>>>>>>> origin/master
    }

    try {

      localStorage.setItem(
<<<<<<< HEAD

        "waypoint_ai_route_context",

        JSON.stringify(

          routeContext

        )

      );

      window.dispatchEvent(

        new CustomEvent(

          "waypoint-ai-context-updated"

        )

=======
        "waypoint_ai_route_context",
        JSON.stringify(
          routeContext
        )
      );

      window.dispatchEvent(
        new CustomEvent(
          "waypoint-ai-context-updated"
        )
>>>>>>> origin/master
      );

    } catch (error) {

      console.warn(
<<<<<<< HEAD

        "Unable to save route AI context:",

        error

=======
        "Unable to save route AI context:",
        error
>>>>>>> origin/master
      );

    }

  }, [
<<<<<<< HEAD

    isRoutePage,

    routeContext,

  ]);

  // ============================================================

  // AUTO SCROLL

=======
    isRoutePage,
    routeContext,
  ]);

  // ============================================================
  // AUTO SCROLL
>>>>>>> origin/master
  // ============================================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
<<<<<<< HEAD

      behavior: "smooth",

    });

  }, [

    messages,

    isTyping,

  ]);

  // ============================================================

  // FOCUS INPUT

=======
      behavior: "smooth",
    });

  }, [
    messages,
    isTyping,
  ]);

  // ============================================================
  // FOCUS INPUT
>>>>>>> origin/master
  // ============================================================

  useEffect(() => {

    if (!isOpen) {
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
    setIsTyping(true);

    try {

      const token =
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
       */

      if (isRoutePage) {

        try {

          const savedRoute =
<<<<<<< HEAD

            localStorage.getItem(

              "waypoint_ai_route_context"

=======
            localStorage.getItem(
              "waypoint_ai_route_context"
>>>>>>> origin/master
            );

          if (savedRoute) {

            const parsed =
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
            }

          }

        } catch {
<<<<<<< HEAD

          // Keep current in-memory route context.

=======
          // Keep current in-memory route context.
>>>>>>> origin/master
        }

      }

      if (isWeatherPage) {

        try {

          const savedWeather =
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
        }

      }

      const aiContext = {

        route:
<<<<<<< HEAD

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

        
        pricing_intelligence:
          currentRouteContext?.pricing_intelligence ?? null,

        weather_intelligence:
          currentRouteContext?.weather_intelligence ??
          (isWeatherPage ? currentWeatherContext : null),

        customs_intelligence:
          currentRouteContext?.customs_intelligence ?? null,

        risk_intelligence:
          currentRouteContext?.risk_intelligence ?? null,

        business_recommendation:
          currentRouteContext?.business_recommendation ?? null,

        disclaimers:
          currentRouteContext?.disclaimers ?? [],

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

=======
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
>>>>>>> origin/master
          [],

      };

      /*
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
            method: "POST",

            headers: {

              "Content-Type":
<<<<<<< HEAD

                "application/json",

              ...(token

                ? {

                    Authorization:

                      `Bearer ${token}`,

                  }

=======
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
>>>>>>> origin/master
                : {}),

            },

            body: JSON.stringify({

              message:
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
        );

      let data = {};

      try {
<<<<<<< HEAD

        data =

          await response.json();

      } catch {

        data = {};

=======
        data =
          await response.json();
      } catch {
        data = {};
>>>>>>> origin/master
      }

      if (!response.ok) {

        throw new Error(
<<<<<<< HEAD

          data?.detail?.message ||

          data?.detail ||

          data?.message ||

          `Waypoint AI request failed (${response.status}).`

=======
          data?.detail?.message ||
          data?.detail ||
          data?.message ||
          `Waypoint AI request failed (${response.status}).`
>>>>>>> origin/master
        );

      }

      const answer =
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
      );

    } catch (error) {

      console.error(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
      );

    } finally {

      setIsTyping(false);

    }

  };

  // ============================================================
<<<<<<< HEAD

  // ENTER

  // ============================================================

  const handleKeyDown = (

    event

  ) => {

    if (

      event.key === "Enter" &&

      !event.shiftKey

=======
  // ENTER
  // ============================================================

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
>>>>>>> origin/master
    ) {

      event.preventDefault();

      sendMessage();

    }

  };

  // ============================================================
<<<<<<< HEAD

  // AUDIO OUTPUT

  // ============================================================

  const speakMessage = (text, id) => {

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {

      return;

=======
  // AUDIO OUTPUT
  // ============================================================

  const speakMessage = (text, id) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
>>>>>>> origin/master
    }

    window.speechSynthesis.cancel();

    if (speakingId === id) {
<<<<<<< HEAD

      setSpeakingId(null);

      return;

    }

    const cleanText = String(text || "")

      .replace(/**/g, "")

      .replace(/[🚢⭐📊⚓🌦️💰📜📈🔊]/g, "")

      .trim();

    if (!cleanText) {

      return;

    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    const languageMap = {

      en: "en-IN",

      te: "te-IN",

      ta: "ta-IN",

      hi: "hi-IN",

    };

    utterance.lang = languageMap[aiLanguage] || "en-IN";

    utterance.rate = 0.95;

    utterance.pitch = 1;

    utterance.onend = () => setSpeakingId(null);

    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);

    window.speechSynthesis.speak(utterance);

  };

  // ============================================================

  // CLEAR

=======
      setSpeakingId(null);
      return;
    }

    const cleanText = String(text || "")
      .replace(/\*\*/g, "")
      .replace(/[🚢⭐📊⚓🌦️💰📜📈🔊]/g, "")
      .trim();

    if (!cleanText) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const languageMap = {
      en: "en-IN",
      te: "te-IN",
      ta: "ta-IN",
      hi: "hi-IN",
    };
    utterance.lang = languageMap[aiLanguage] || "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // ============================================================
  // CLEAR
>>>>>>> origin/master
  // ============================================================

  const clearChat = () => {

    setMessages([
<<<<<<< HEAD

      {

        id: Date.now(),

        type: "ai",

        text:

          "Chat cleared. 👋\n\n" +

          "How can I help you with Waypoint?",

      },

=======
      {
        id: Date.now(),
        type: "ai",
        text:
          "Chat cleared. 👋\n\n" +
          "How can I help you with Waypoint?",
      },
>>>>>>> origin/master
    ]);

  };

  // ============================================================
<<<<<<< HEAD

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

              /(\\*\\*.*?\\*\\*)/

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

=======
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
>>>>>>> origin/master
                    );

                  }

                  return (
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
      );

  };

  // ============================================================
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
          </span>

          <span className="wp-ai-online-dot" />

        </button>

      )}

      {isOpen && (

        <section
<<<<<<< HEAD

          className="wp-ai-chat"

          aria-label="Waypoint AI Assistant"

=======
          className="wp-ai-chat"
          aria-label="Waypoint AI Assistant"
>>>>>>> origin/master
        >

          <header className="wp-ai-header">

            <div className="wp-ai-brand">

              <div className="wp-ai-avatar">
<<<<<<< HEAD

                ✦

=======
                ✦
>>>>>>> origin/master
              </div>

              <div>

                <div className="wp-ai-title">
<<<<<<< HEAD

                  Waypoint AI

                </div>

                <div className="wp-ai-status">

                  <span />

                  Gemini AI · Online

=======
                  Waypoint AI
                </div>

                <div className="wp-ai-status">
                  <span />
                  Gemini AI · Online
>>>>>>> origin/master
                </div>

              </div>

            </div>

            {/* ==================================================
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
            </div>

            <div className="wp-ai-header-actions">

              <button
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
              </button>

            </div>

          </header>

          <div className="wp-ai-context">

            <span>●</span>

            {routeContext
<<<<<<< HEAD

              ? `Live route data · ${routeContext.origin} → ${routeContext.destination}`

              : isWeatherPage && weatherContext

                ? `Live weather data · ${weatherContext.origin} → ${weatherContext.destination}`

=======
              ? `Live route data · ${routeContext.origin} → ${routeContext.destination}`
              : isWeatherPage && weatherContext
                ? `Live weather data · ${weatherContext.origin} → ${weatherContext.destination}`
>>>>>>> origin/master
                : `Assisting on ${detectedPage}`}

          </div>

          <div className="wp-ai-messages">

            {messages.map(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
                    </div>

                  )}

                  <div
<<<<<<< HEAD

                    className={

                      `wp-ai-bubble ${item.type}`

                    }

                  >

                    {formatText(

                      item.text

                    )}

                    {item.type === "ai" && (

                      <button

                        type="button"

                        className={`wp-ai-audio ${

                          speakingId === item.id ? "active" : ""

                        }`}

                        onClick={() =>

                          speakMessage(item.text, item.id)

                        }

                        title={

                          speakingId === item.id

                            ? "Stop audio"

                            : "Read this response aloud"

                        }

                        aria-label={

                          speakingId === item.id

                            ? "Stop audio"

                            : "Read response aloud"

                        }

                      >

                        {speakingId === item.id ? "■" : "🔊"}

                      </button>

                    )}

=======
                    className={
                      `wp-ai-bubble ${item.type}`
                    }
                  >
                    {formatText(
                      item.text
                    )}

                    {item.type === "ai" && (
                      <button
                        type="button"
                        className={`wp-ai-audio ${
                          speakingId === item.id ? "active" : ""
                        }`}
                        onClick={() =>
                          speakMessage(item.text, item.id)
                        }
                        title={
                          speakingId === item.id
                            ? "Stop audio"
                            : "Read this response aloud"
                        }
                        aria-label={
                          speakingId === item.id
                            ? "Stop audio"
                            : "Read response aloud"
                        }
                      >
                        {speakingId === item.id ? "■" : "🔊"}
                      </button>
                    )}
>>>>>>> origin/master
                  </div>

                </div>

              )
<<<<<<< HEAD

=======
>>>>>>> origin/master
            )}

            {isTyping && (

              <div className="wp-ai-message-row ai">

                <div className="wp-ai-small-avatar">
<<<<<<< HEAD

                  ✦

                </div>

                <div className="wp-ai-bubble ai wp-ai-typing">

                  <span />

                  <span />

                  <span />

=======
                  ✦
                </div>

                <div className="wp-ai-bubble ai wp-ai-typing">
                  <span />
                  <span />
                  <span />
>>>>>>> origin/master
                </div>

              </div>

            )}

            <div
<<<<<<< HEAD

              ref={

                messagesEndRef

              }

=======
              ref={
                messagesEndRef
              }
>>>>>>> origin/master
            />

          </div>

          <div className="wp-ai-quick">

            <div className="wp-ai-quick-title">
<<<<<<< HEAD

              Suggested

=======
              Suggested
>>>>>>> origin/master
            </div>

            <div className="wp-ai-quick-list">

              {quickQuestions.map(
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
              )}

            </div>

          </div>

          <div className="wp-ai-input-area">

            <div className="wp-ai-input-wrap">

              <textarea
<<<<<<< HEAD

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

=======
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
>>>>>>> origin/master
              </button>

            </div>

            <div className="wp-ai-disclaimer">
<<<<<<< HEAD

              Waypoint AI uses actual application data when available.

=======
              Waypoint AI uses actual application data when available.
>>>>>>> origin/master
            </div>

          </div>

        </section>

      )}
<<<<<<< HEAD

    </>

  );

=======
    </>
  );
>>>>>>> origin/master
}

export default WaypointAI;
