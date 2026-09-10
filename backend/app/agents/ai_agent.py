import re
from typing import Any, Dict, Optional

from app.agents.route_agent import RouteAgent


class WaypointAIAgent:
    """
    Local rule-based AI assistant for Waypoint.

    No external AI API
    No API key
    No RAG

    Supports:
    - Waypoint guidance
    - Maritime terminology
    - Route explanations
    - Route comparison
    - Real weather context
    - Connected ports
    - Quotations
    """

    def __init__(self):
        self.name = "Waypoint AI"
        self.current_language = "en"

        # Supported AI response languages. The Waypoint application
        # itself remains in English; only Waypoint AI responses change.
        self.supported_languages = {
            "en": "English",
            "te": "Telugu",
            "ta": "Tamil",
            "hi": "Hindi",
        }

        # Use the same real route dataset/route agent as the
        # main Waypoint application. No dummy route data.
        self.route_agent = RouteAgent()

    # ============================================================
    # MAIN CHAT
    # ============================================================

    def chat(
        self,
        message: str,
        page: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:

        if not message or not message.strip():
            return {
                "success": False,
                "message": "Please enter a question."
            }

        question = message.strip()
        q = question.lower()

        # The frontend sends one of: en, te, ta, hi.
        # Unknown values safely fall back to English.
        self.current_language = self._normalize_language(language)

        try:

            # ====================================================
            # EXPLICIT ROUTE LOOKUP — BEFORE SAVED CONTEXT
            #
            # Example:
            # "best route for Chennai to Rotterdam"
            #
            # This uses the real route dataset directly, so the
            # assistant cannot accidentally answer using an old
            # route such as Chennai -> London.
            # ====================================================

            route_lookup = self._extract_route_request(
                question
            )

            if route_lookup:
                route_answer = self._answer_explicit_route_request(
                    route_lookup["origin"],
                    route_lookup["destination"],
                    route_lookup["containers"],
                    context
                )

                if route_answer:
                    return self._response(
                        route_answer
                    )

            # ====================================================
            # WEATHER — CHECK FIRST
            #
            # This is important because words such as "risk",
            # "condition", "wind", "rain" and "location" can also
            # appear in generic questions.
            # ====================================================

            if self._is_weather_question(q):

                weather_answer = self._answer_weather_question(
                    q,
                    context
                )

                if weather_answer:
                    return self._response(
                        weather_answer
                    )

            # ====================================================
            # GREETING
            # ====================================================

            if self._matches(q, [
                "hello",
                "hi",
                "hey",
                "hai",
                "good morning",
                "good afternoon",
                "good evening"
            ]):
                return self._response(
                    "Hello! 👋 I'm **Waypoint AI**.\n\n"
                    "I'm your maritime brokerage assistant. "
                    "I can help you understand routes, weather, "
                    "ports, quotations, maritime concepts and "
                    "the Waypoint platform."
                )

            # ====================================================
            # WAYPOINT
            # ====================================================

            if self._matches(q, [
                "what is waypoint",
                "about waypoint",
                "what does waypoint do",
                "explain waypoint",
                "waypoint platform",
                "what is this application",
                "what is this app"
            ]):
                return self._response(
                    "**Waypoint** is a maritime brokerage platform "
                    "designed to assist with shipping route planning "
                    "and operational decision-making.\n\n"
                    "The platform provides:\n\n"
                    "🚢 **Route Planning** — search routes between ports\n"
                    "⭐ **Route Recommendation** — identify recommended routes\n"
                    "📊 **Route Comparison** — compare transit, distance, "
                    "transshipments and freight\n"
                    "⚓ **Connected Ports** — explore port connections\n"
                    "🌦️ **Weather & Conditions** — check weather information\n"
                    "💰 **Quotation Requests** — submit shipping quotation requests\n"
                    "📜 **Search History** — review previous route searches\n"
                    "📈 **Operations Dashboard** — view operational statistics"
                )

            # ====================================================
            # BASIC MARITIME INFORMATION
            # ====================================================

            if self._matches(q, [
                "basic information",
                "basic info",
                "tell me about maritime",
                "maritime information",
                "shipping information",
                "basic shipping",
                "basic maritime",
                "learn maritime",
                "maritime basics"
            ]):
                return self._response(
                    "**Maritime Shipping Basics 🚢**\n\n"
                    "Maritime shipping is the transportation of "
                    "cargo by sea using commercial vessels between ports.\n\n"
                    "**Main elements include:**\n"
                    "• **Vessel** — ship used to transport cargo\n"
                    "• **Port** — location where cargo is loaded or unloaded\n"
                    "• **Cargo** — goods being transported\n"
                    "• **Container** — standardized unit used to carry cargo\n"
                    "• **Route** — path between origin and destination\n"
                    "• **Transit time** — estimated travel duration\n"
                    "• **Freight** — transportation charge\n"
                    "• **Transshipment** — transferring cargo between vessels"
                )

            # ====================================================
            # SHIPPING PROCESS
            # ====================================================

            if self._matches(q, [
                "how does shipping work",
                "how maritime shipping works",
                "how does maritime shipping work",
                "how shipping works",
                "shipping process",
                "maritime shipping process"
            ]):
                return self._response(
                    "**Basic Maritime Shipping Process 🚢**\n\n"
                    "1. **Cargo preparation** — goods are prepared and packed.\n"
                    "2. **Booking** — shipping space is arranged.\n"
                    "3. **Origin port** — cargo reaches the departure port.\n"
                    "4. **Loading** — cargo is loaded onto the vessel.\n"
                    "5. **Sea transportation** — the vessel travels toward the destination.\n"
                    "6. **Transshipment** — cargo may be transferred at an intermediate port.\n"
                    "7. **Destination port** — cargo is unloaded.\n"
                    "8. **Final delivery** — cargo continues to its final destination."
                )

            # ====================================================
            # MARITIME BROKERAGE
            # ====================================================

            if self._matches(q, [
                "maritime brokerage",
                "shipping brokerage",
                "what is a maritime broker",
                "what does a maritime broker do",
                "what does shipping broker do",
                "brokerage"
            ]):
                return self._response(
                    "**Maritime brokerage** involves helping connect "
                    "shipping requirements with suitable maritime "
                    "transport services.\n\n"
                    "A broker may help evaluate routes, freight costs, "
                    "transit time, port connections and cargo requirements.\n\n"
                    "Waypoint supports this decision-making process with "
                    "route analysis and quotation functionality."
                )

            # ====================================================
            # ROUTE PLANNING
            # ====================================================

            if self._matches(q, [
                "how to find route",
                "how do i find a route",
                "how to search route",
                "how do i search route",
                "plot route",
                "route planner",
                "plan a route",
                "find a route",
                "search for route"
            ]):
                return self._response(
                    "To plan a route in Waypoint:\n\n"
                    "1. Open **Plot Route**.\n"
                    "2. Select the origin port.\n"
                    "3. Select the destination port.\n"
                    "4. Enter the required shipment information.\n"
                    "5. Search for the route.\n"
                    "6. Review the available route options.\n"
                    "7. Compare their metrics.\n"
                    "8. Select the recommended route or another suitable option."
                )

            # ====================================================
            # BEST ROUTE
            # ====================================================

            if self._matches(q, [
                "best route",
                "recommended route",
                "which route is best",
                "which is the best route",
                "why is this route better",
                "why this route",
                "best option",
                "recommended option"
            ]):
                route_answer = self._explain_best_route(
                    context
                )

                if route_answer:
                    return self._response(
                        route_answer
                    )

                return self._response(
                    "Waypoint identifies a recommended route by "
                    "evaluating available route information such as "
                    "transit time, distance, transshipments and freight.\n\n"
                    "Run a route search first so I can explain the "
                    "actual recommended route."
                )

            # ====================================================
            # ROUTE COMPARISON
            # ====================================================

            if self._matches(q, [
                "compare routes",
                "route comparison",
                "compare route",
                "difference between routes",
                "which route should i choose",
                "compare shipping routes"
            ]):
                comparison = self._compare_routes(
                    context
                )

                if comparison:
                    return self._response(
                        comparison
                    )

                return self._response(
                    "Waypoint compares routes using transit time, "
                    "distance, transshipments, freight and the overall "
                    "route score. Search a route first and I can compare "
                    "the actual available options."
                )

            # ====================================================
            # TRANSIT
            # ====================================================

            if self._matches(q, [
                "transit time",
                "transit days",
                "what is transit",
                "meaning of transit time",
                "what does transit mean"
            ]):
                return self._response(
                    "**Transit time** is the estimated time required "
                    "for cargo to travel between the origin and destination.\n\n"
                    "Waypoint represents transit time in **days**."
                )

            # ====================================================
            # DISTANCE
            # ====================================================

            if self._matches(q, [
                "distance",
                "nautical mile",
                "nautical miles",
                "what is nm",
                "what does nm mean"
            ]):
                return self._response(
                    "**Nautical mile (NM)** is a standard distance unit "
                    "used in maritime navigation.\n\n"
                    "Waypoint uses nautical miles to represent route distance."
                )

            # ====================================================
            # TRANSSHIPMENT
            # ====================================================

            if self._matches(q, [
                "transshipment",
                "transshipments",
                "what is transshipment",
                "meaning of transshipment",
                "what does transshipment mean"
            ]):
                return self._response(
                    "**Transshipment** means transferring cargo from "
                    "one vessel or transport service to another before "
                    "it reaches its final destination.\n\n"
                    "For example:\n\n"
                    "**Chennai → Singapore → Rotterdam**\n\n"
                    "Cargo may be transferred at Singapore before "
                    "continuing toward Rotterdam."
                )

            # ====================================================
            # FREIGHT
            # ====================================================

            if self._matches(q, [
                "freight",
                "freight cost",
                "freight price",
                "shipping cost",
                "base freight",
                "cargo cost"
            ]):
                freight_answer = self._explain_freight(
                    context
                )

                if freight_answer:
                    return self._response(
                        freight_answer
                    )

                return self._response(
                    "**Freight** is the charge associated with "
                    "transporting cargo from one location to another.\n\n"
                    "Waypoint can display base freight and estimated "
                    "total cost when route data is available."
                )

            # ====================================================
            # ROUTE SCORE
            # ====================================================

            if self._matches(q, [
                "route score",
                "how is route score calculated",
                "how is score calculated",
                "why score",
                "score calculation",
                "ranking",
                "route ranking",
                "explain the route score"
            ]):
                route_score_answer = self._explain_route_score(
                    context
                )

                if route_score_answer:
                    return self._response(
                        route_score_answer
                    )

                return self._response(
                    "Waypoint's route score considers multiple factors:\n\n"
                    "• Transit time — 40%\n"
                    "• Distance — 25%\n"
                    "• Transshipments — 15%\n"
                    "• Base route component — 20%\n\n"
                    "The resulting score is used to rank available routes."
                )

            # ====================================================
            # PORT
            # ====================================================

            if self._matches(q, [
                "what is a port",
                "what is port",
                "port meaning",
                "explain port",
                "what does a port do"
            ]):
                return self._response(
                    "A **port** is a facility where vessels arrive "
                    "and cargo can be loaded, unloaded or transferred.\n\n"
                    "In Waypoint, ports act as origins and destinations "
                    "for route planning."
                )

            # ====================================================
            # VESSEL
            # ====================================================

            if self._matches(q, [
                "what is a vessel",
                "what is vessel",
                "vessel meaning",
                "explain vessel",
                "what does vessel mean"
            ]):
                return self._response(
                    "A **vessel** is a watercraft used for transportation "
                    "or other maritime activities.\n\n"
                    "Commercial vessels transport cargo between ports."
                )

            # ====================================================
            # CARGO
            # ====================================================

            if self._matches(q, [
                "what is cargo",
                "cargo meaning",
                "explain cargo",
                "what does cargo mean"
            ]):
                return self._response(
                    "**Cargo** refers to goods or materials transported "
                    "from one location to another."
                )

            # ====================================================
            # CONTAINER
            # ====================================================

            if self._matches(q, [
                "what is a container",
                "what is container",
                "container meaning",
                "shipping container",
                "explain container"
            ]):
                return self._response(
                    "A **shipping container** is a standardized cargo "
                    "unit designed to safely transport goods.\n\n"
                    "Containers make it easier to transfer cargo between "
                    "ships, trucks and trains."
                )

            # ====================================================
            # ETA
            # ====================================================

            if self._matches(q, [
                "what is eta",
                "eta meaning",
                "what does eta mean",
                "estimated time of arrival"
            ]):
                return self._response(
                    "**ETA** means **Estimated Time of Arrival**. "
                    "It represents the expected arrival time of a "
                    "vessel or shipment."
                )

            # ====================================================
            # ETD
            # ====================================================

            if self._matches(q, [
                "what is etd",
                "etd meaning",
                "what does etd mean",
                "estimated time of departure"
            ]):
                return self._response(
                    "**ETD** means **Estimated Time of Departure**. "
                    "It represents the expected time when a vessel "
                    "or shipment will leave its origin."
                )

            # ====================================================
            # BILL OF LADING
            # ====================================================

            if self._matches(q, [
                "bill of lading",
                "what is bol",
                "what is a bol",
                "what does bill of lading mean"
            ]):
                return self._response(
                    "A **Bill of Lading (B/L)** is an important shipping "
                    "document associated with the transportation of cargo.\n\n"
                    "It can contain information about the cargo, shipper, "
                    "consignee, origin, destination and transportation "
                    "arrangements."
                )

            # ====================================================
            # CONNECTED PORTS
            # ====================================================

            if self._matches(q, [
                "connected ports",
                "connected port",
                "what ports are connected",
                "show connected ports",
                "how to find connected ports"
            ]):
                return self._response(
                    "Open **Connected Ports** in the navigation bar.\n\n"
                    "Select an origin port and Waypoint will show "
                    "destinations connected to that origin according "
                    "to the available route dataset."
                )

            # ====================================================
            # QUOTATION
            # ====================================================

            if self._matches(q, [
                "quotation",
                "quote",
                "request quotation",
                "request a quote",
                "how to request quotation",
                "how to request quote",
                "quotation request"
            ]):
                return self._response(
                    "**Requesting a quotation in Waypoint:**\n\n"
                    "1. Search for your route.\n"
                    "2. Select the route you want.\n"
                    "3. Click **Request Quotation**.\n"
                    "4. Enter company information.\n"
                    "5. Enter contact information.\n"
                    "6. Provide cargo weight and container quantity.\n"
                    "7. Add special requirements if needed.\n"
                    "8. Submit the request."
                )

            # ====================================================
            # HISTORY
            # ====================================================

            if self._matches(q, [
                "history",
                "search history",
                "previous searches",
                "past searches",
                "view history"
            ]):
                return self._response(
                    "The **History** page stores your previous route "
                    "searches so you can review them later."
                )

            # ====================================================
            # DASHBOARD
            # ====================================================

            if self._matches(q, [
                "dashboard",
                "operations dashboard",
                "analytics",
                "statistics",
                "operations"
            ]):
                return self._response(
                    "The **Operations Dashboard** provides an overview "
                    "of Waypoint activity, including route searches, "
                    "available routes, recommended routes, connected "
                    "ports, quotation requests and operational statistics."
                )

            # ====================================================
            # NAVIGATION
            # ====================================================

            if self._matches(q, [
                "where is route planner",
                "where is plot route",
                "where is quotation",
                "where is weather",
                "where are connected ports",
                "where is history",
                "where is dashboard"
            ]):
                return self._navigation_help(q)

            # ====================================================
            # HELP
            # ====================================================

            if self._matches(q, [
                "help",
                "what can you do",
                "what can i ask",
                "commands",
                "features"
            ]):
                return self._response(
                    "You can ask me about:\n\n"
                    "🚢 **Routes** — planning, comparison and recommendations\n"
                    "🌦️ **Weather** — current conditions, risk, wind, rain and visibility\n"
                    "⚓ **Ports** — connected ports and port concepts\n"
                    "💰 **Quotations** — quotation requests\n"
                    "📚 **Maritime concepts** — shipping terminology\n"
                    "📊 **Dashboard** — operational statistics\n"
                    "🧭 **Waypoint** — how to use the application"
                )

            # ====================================================
            # PAGE HELP
            # ====================================================

            if page:
                return self._page_specific_help(
                    page
                )

            # ====================================================
            # UNKNOWN
            # ====================================================

            return self._response(
                "I can help with **Waypoint and basic maritime shipping**.\n\n"
                "Try asking:\n"
                "• \"What is maritime brokerage?\"\n"
                "• \"Why is this route better?\"\n"
                "• \"What is transshipment?\"\n"
                "• \"What is ETA?\"\n"
                "• \"How is the route score calculated?\"\n"
                "• \"How was the weather risk?\""
            )

        except Exception as exc:

            print(
                f"Waypoint AI error: "
                f"{type(exc).__name__}: {exc}"
            )

            return {
                "success": False,
                "message":
                    "Sorry, I couldn't process that question."
            }

    # ============================================================
    # EXPLICIT ROUTE REQUEST
    # ============================================================

    @staticmethod
    def _extract_route_request(
        question: str
    ) -> Optional[Dict[str, Any]]:

        text = question.strip()

        patterns = [
            r"(?:best|recommended|find|show|search|plot|analy[sz]e|compare)?"
            r".*?(?:route|routes|way|lane)"
            r".*?(?:for|from)\s+"
            r"(.+?)\s+(?:to|→|->)\s+(.+?)"
            r"(?:\s+with\s+(\d+)\s+(?:containers?|teu))?\s*$",

            r"(?:from)\s+(.+?)\s+(?:to|→|->)\s+(.+?)"
            r"(?:\s+with\s+(\d+)\s+(?:containers?|teu))?\s*$"
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                flags=re.IGNORECASE
            )

            if not match:
                continue

            origin = match.group(1).strip(
                " .?!,:"
            )

            destination = match.group(2).strip(
                " .?!,:"
            )

            if not origin or not destination:
                continue

            # Remove common trailing question words.
            destination = re.sub(
                r"\s+(?:please|thanks)$",
                "",
                destination,
                flags=re.IGNORECASE
            ).strip()

            containers = None

            if match.lastindex and match.lastindex >= 3:
                raw_containers = match.group(3)

                if raw_containers:
                    try:
                        containers = int(
                            raw_containers
                        )
                    except ValueError:
                        containers = None

            # Avoid interpreting generic maritime questions
            # as a route request.
            generic_words = {
                "shipping",
                "maritime",
                "the",
                "a",
                "this",
                "my",
                "your",
            }

            if (
                origin.lower() in generic_words
                or destination.lower() in generic_words
            ):
                continue

            return {
                "origin": origin,
                "destination": destination,
                "containers": containers
            }

        return None

    def _answer_explicit_route_request(
        self,
        origin: str,
        destination: str,
        containers: Optional[int],
        context: Optional[Dict[str, Any]]
    ) -> Optional[str]:

        # If the user did not specify a container count,
        # use the live page context when it belongs to the
        # same origin/destination. Otherwise use 1 only for
        # the cost estimate; route ranking itself is not
        # dependent on container count.
        container_count = containers

        if (
            container_count is None
            and isinstance(context, dict)
        ):
            context_origin = str(
                context.get("origin") or ""
            ).strip().lower()

            context_destination = str(
                context.get("destination") or ""
            ).strip().lower()

            if (
                context_origin == origin.lower()
                and context_destination == destination.lower()
            ):
                try:
                    container_count = int(
                        context.get("containers")
                    )
                except (
                    TypeError,
                    ValueError
                ):
                    container_count = None

        if (
            container_count is None
            or container_count <= 0
        ):
            container_count = 1

        try:

            result = self.route_agent.analyze_route(
                origin=origin,
                destination=destination,
                cargo_type="Containerized Cargo",
                containers=container_count
            )

        except Exception as exc:

            print(
                "Waypoint AI route lookup error:",
                exc
            )

            return (
                "I couldn't read the route dataset right now."
            )

        if not isinstance(
            result,
            dict
        ):
            return (
                "The route agent returned an unexpected result."
            )

        if result.get(
            "status"
        ) == "not_found":

            return (
                f"I couldn't find a route from "
                f"**{origin}** to **{destination}** "
                f"in the current Waypoint route dataset."
            )

        routes = result.get(
            "available_routes"
        )

        if not isinstance(
            routes,
            list
        ) or not routes:

            return (
                f"No available route options were returned for "
                f"**{origin} → {destination}**."
            )

        recommended = result.get(
            "recommended_route"
        )

        if isinstance(
            recommended,
            str
        ):
            recommended = next(
                (
                    route
                    for route in routes
                    if str(
                        route.get(
                            "route_id"
                        )
                    ) == str(
                        recommended
                    )
                ),
                None
            )

        if not isinstance(
            recommended,
            dict
        ):
            recommended = next(
                (
                    route
                    for route in routes
                    if route.get(
                        "is_best"
                    ) is True
                ),
                routes[0]
            )

        route_id = recommended.get(
            "route_id",
            "Recommended route"
        )

        transit = recommended.get(
            "transit_days",
            "N/A"
        )

        distance = recommended.get(
            "distance_nm",
            "N/A"
        )

        transshipments = recommended.get(
            "transshipments",
            "N/A"
        )

        score = recommended.get(
            "score",
            "N/A"
        )

        freight = recommended.get(
            "estimated_total_usd"
        )

        route_type = recommended.get(
            "route_type"
        )

        answer = (
            f"**Best route for {origin} → {destination}**\n\n"
            f"⭐ **{route_id}**"
        )

        if route_type:
            answer += (
                f" · {route_type}"
            )

        answer += "\n\n"

        answer += (
            f"• Transit time: **{transit} days**\n"
            f"• Distance: **{distance} NM**\n"
            f"• Transshipments: **{transshipments}**\n"
            f"• Route score: **{score}**\n"
        )

        if freight is not None:
            if isinstance(
                freight,
                (int, float)
            ):
                answer += (
                    f"• Estimated total for "
                    f"{container_count} container(s): "
                    f"**${freight:,.2f}**\n"
                )
            else:
                answer += (
                    f"• Estimated total: **${freight}**\n"
                )

        answer += (
            f"\nWaypoint selected **{route_id}** from "
            f"**{len(routes)} available route option(s)** "
            f"returned by the real route dataset."
        )

        return answer

    # ============================================================
    # WEATHER QUESTION DETECTION
    # ============================================================

    @staticmethod
    def _is_weather_question(
        q: str
    ) -> bool:

        weather_words = [
            "weather",
            "rain",
            "wind",
            "humidity",
            "temperature",
            "visibility",
            "forecast",
            "weather risk",
            "risk",
            "conditions",
            "condition"
        ]

        return any(
            word in q
            for word in weather_words
        )

    # ============================================================
    # REAL WEATHER ANSWER
    # ============================================================

    def _answer_weather_question(
        self,
        q: str,
        context: Optional[Dict[str, Any]]
    ) -> Optional[str]:

        if not context:
            return (
                "I don't have the latest weather values in the "
                "current chat context yet.\n\n"
                "Open **Weather & Conditions**, wait for the weather "
                "cards to load, and then ask me again."
            )

        # --------------------------------------------------------
        # Support the context format sent by WaypointAI.jsx
        # --------------------------------------------------------

        weather = context.get(
            "weather"
        )

        if not isinstance(
            weather,
            dict
        ):
            weather = context

        origin = (
            weather.get("origin")
            or context.get("origin")
            or "Origin"
        )

        destination = (
            weather.get("destination")
            or context.get("destination")
            or "Destination"
        )

        origin_weather = (
            weather.get("originWeather")
            or weather.get("origin_weather")
            or context.get("origin_weather")
        )

        destination_weather = (
            weather.get("destinationWeather")
            or weather.get("destination_weather")
            or context.get("destination_weather")
        )

        origin_risk = (
            weather.get("originRisk")
            or weather.get("origin_risk")
            or context.get("origin_weather_risk")
        )

        destination_risk = (
            weather.get("destinationRisk")
            or weather.get("destination_risk")
            or context.get("destination_weather_risk")
        )

        origin_forecast = (
            weather.get("originForecast")
            or weather.get("origin_forecast")
            or context.get("origin_forecast")
            or []
        )

        destination_forecast = (
            weather.get("destinationForecast")
            or weather.get("destination_forecast")
            or context.get("destination_forecast")
            or []
        )

        # --------------------------------------------------------
        # Normalize if API data is wrapped in "current"
        # --------------------------------------------------------

        origin_current = self._current_weather(
            origin_weather
        )

        destination_current = self._current_weather(
            destination_weather
        )

        has_origin = bool(
            origin_current
        )

        has_destination = bool(
            destination_current
        )

        if not has_origin and not has_destination:
            return (
                "I can see that Weather & Conditions is active, "
                "but the actual weather values were not included "
                "in the AI context.\n\n"
                "Refresh the weather data and ask again."
            )

        # --------------------------------------------------------
        # Specific question: risk
        # --------------------------------------------------------

        if "risk" in q:

            origin_level = self._risk_level(
                origin_risk,
                origin_current
            )

            destination_level = self._risk_level(
                destination_risk,
                destination_current
            )

            answer = (
                f"**Current weather risk for "
                f"{origin} → {destination}**\n\n"
            )

            if has_origin:
                answer += (
                    f"🌦️ **{origin}: {origin_level} risk**\n"
                )

                answer += self._weather_metric_lines(
                    origin_current
                )

                answer += "\n"

            if has_destination:
                answer += (
                    f"🌦️ **{destination}: "
                    f"{destination_level} risk**\n"
                )

                answer += self._weather_metric_lines(
                    destination_current
                )

            answer += "\n"

            comparison = self._compare_risk_levels(
                origin,
                origin_level,
                destination,
                destination_level
            )

            if comparison:
                answer += comparison

            return answer.strip()

        # --------------------------------------------------------
        # Specific question: which location is worse
        # --------------------------------------------------------

        if (
            "which" in q
            and (
                "worse" in q
                or "bad" in q
                or "riskier" in q
                or "higher" in q
            )
        ):
            origin_level = self._risk_level(
                origin_risk,
                origin_current
            )

            destination_level = self._risk_level(
                destination_risk,
                destination_current
            )

            comparison = self._compare_risk_levels(
                origin,
                origin_level,
                destination,
                destination_level
            )

            return comparison or (
                f"I can compare **{origin}** and "
                f"**{destination}**, but the risk information "
                f"is incomplete."
            )

        # --------------------------------------------------------
        # Specific question: wind
        # --------------------------------------------------------

        if "wind" in q:

            answer = (
                f"**Wind conditions for "
                f"{origin} → {destination}**\n\n"
            )

            if has_origin:
                answer += self._weather_wind_line(
                    origin,
                    origin_current
                )

            if has_destination:
                answer += self._weather_wind_line(
                    destination,
                    destination_current
                )

            return answer.strip()

        # --------------------------------------------------------
        # Specific question: rain / precipitation
        # --------------------------------------------------------

        if (
            "rain" in q
            or "precipitation" in q
        ):

            answer = (
                f"**Rain / precipitation information for "
                f"{origin} → {destination}**\n\n"
            )

            if has_origin:
                answer += self._weather_rain_line(
                    origin,
                    origin_current,
                    origin_forecast
                )

            if has_destination:
                answer += self._weather_rain_line(
                    destination,
                    destination_current,
                    destination_forecast
                )

            return answer.strip()

        # --------------------------------------------------------
        # Specific question: visibility
        # --------------------------------------------------------

        if "visibility" in q:

            answer = (
                f"**Visibility for "
                f"{origin} → {destination}**\n\n"
            )

            if has_origin:
                answer += self._weather_visibility_line(
                    origin,
                    origin_current
                )

            if has_destination:
                answer += self._weather_visibility_line(
                    destination,
                    destination_current
                )

            return answer.strip()

        # --------------------------------------------------------
        # General weather question
        # --------------------------------------------------------

        answer = (
            f"**Current weather for "
            f"{origin} → {destination}**\n\n"
        )

        if has_origin:
            origin_level = self._risk_level(
                origin_risk,
                origin_current
            )

            answer += (
                f"🌦️ **{origin} — {origin_level} risk**\n"
            )

            answer += self._weather_metric_lines(
                origin_current
            )

            answer += "\n"

        if has_destination:
            destination_level = self._risk_level(
                destination_risk,
                destination_current
            )

            answer += (
                f"🌦️ **{destination} — "
                f"{destination_level} risk**\n"
            )

            answer += self._weather_metric_lines(
                destination_current
            )

        return answer.strip()

    # ============================================================
    # WEATHER HELPERS
    # ============================================================

    @staticmethod
    def _current_weather(
        weather: Any
    ) -> Dict[str, Any]:

        if not isinstance(
            weather,
            dict
        ):
            return {}

        current = weather.get(
            "current"
        )

        if isinstance(
            current,
            dict
        ):
            return current

        return weather

    @staticmethod
    def _risk_level(
        risk: Any,
        weather: Dict[str, Any]
    ) -> str:

        if isinstance(
            risk,
            dict
        ):
            for key in [
                "level",
                "risk",
                "status",
                "label"
            ]:
                value = risk.get(key)

                if value:
                    return str(value).title()

        if isinstance(
            risk,
            str
        ) and risk.strip():
            return risk.strip().title()

        direct = (
            weather.get("weather_risk")
            or weather.get("risk")
            or weather.get("risk_level")
        )

        if direct:
            return str(direct).title()

        # If the backend supplied a numerical risk score,
        # use it only when explicitly present.
        score = weather.get(
            "weather_risk_score"
        )

        if isinstance(
            score,
            (int, float)
        ):
            if score >= 70:
                return "High"

            if score >= 40:
                return "Moderate"

            return "Low"

        return "Not available"

    @staticmethod
    def _weather_metric_lines(
        weather: Dict[str, Any]
    ) -> str:

        lines = []

        temperature = (
            weather.get("temperature")
            if weather.get("temperature") is not None
            else weather.get("temp")
        )

        humidity = weather.get(
            "humidity"
        )

        wind = (
            weather.get("wind_speed")
            if weather.get("wind_speed") is not None
            else weather.get("wind")
        )

        visibility = weather.get(
            "visibility"
        )

        condition = (
            weather.get("condition")
            or weather.get("description")
            or weather.get("weather")
        )

        rain = (
            weather.get("rain_probability")
            if weather.get("rain_probability") is not None
            else weather.get("precipitation_probability")
        )

        if temperature is not None:
            lines.append(
                f"• Temperature: **{temperature}°C**"
            )

        if condition:
            lines.append(
                f"• Condition: **{str(condition).title()}**"
            )

        if humidity is not None:
            lines.append(
                f"• Humidity: **{humidity}%**"
            )

        if wind is not None:
            lines.append(
                f"• Wind: **{wind} km/h**"
            )

        if visibility is not None:
            lines.append(
                f"• Visibility: **{visibility} km**"
            )

        if rain is not None:
            lines.append(
                f"• Rain probability: **{rain}%**"
            )

        return "\n".join(
            lines
        )

    def _weather_wind_line(
        self,
        location: str,
        weather: Dict[str, Any]
    ) -> str:

        wind = (
            weather.get("wind_speed")
            if weather.get("wind_speed") is not None
            else weather.get("wind")
        )

        direction = (
            weather.get("wind_direction")
            if weather.get("wind_direction") is not None
            else weather.get("wind_deg")
        )

        if wind is None:
            return (
                f"• **{location}:** wind data is not available.\n"
            )

        line = (
            f"• **{location}:** wind speed is "
            f"**{wind} km/h**"
        )

        if direction is not None:
            line += (
                f", direction **{direction}°**"
            )

        return line + ".\n"

    def _weather_rain_line(
        self,
        location: str,
        weather: Dict[str, Any],
        forecast: Any
    ) -> str:

        rain = (
            weather.get("rain_probability")
            if weather.get("rain_probability") is not None
            else weather.get("precipitation_probability")
        )

        line = f"• **{location}:** "

        if rain is not None:
            line += (
                f"current rain probability is **{rain}%**"
            )
        else:
            line += (
                "current rain probability is not available"
            )

        # Forecast can contain rain_probability values.
        if isinstance(
            forecast,
            list
        ) and forecast:

            probabilities = []

            for item in forecast:
                if not isinstance(
                    item,
                    dict
                ):
                    continue

                value = (
                    item.get("rain_probability")
                    if item.get("rain_probability") is not None
                    else item.get(
                        "precipitation_probability"
                    )
                )

                if isinstance(
                    value,
                    (int, float)
                ):
                    probabilities.append(
                        value
                    )

            if probabilities:
                line += (
                    f". Forecast rain probability reaches "
                    f"up to **{max(probabilities)}%**"
                )

        return line + ".\n"

    @staticmethod
    def _weather_visibility_line(
        location: str,
        weather: Dict[str, Any]
    ) -> str:

        visibility = weather.get(
            "visibility"
        )

        if visibility is None:
            return (
                f"• **{location}:** visibility data is not available.\n"
            )

        return (
            f"• **{location}:** visibility is "
            f"**{visibility} km**.\n"
        )

    @staticmethod
    def _compare_risk_levels(
        origin: str,
        origin_level: str,
        destination: str,
        destination_level: str
    ) -> Optional[str]:

        order = {
            "low": 1,
            "moderate": 2,
            "high": 3
        }

        a = order.get(
            origin_level.lower()
        )

        b = order.get(
            destination_level.lower()
        )

        if a is None or b is None:
            return None

        if a > b:
            return (
                f"⚠️ **{origin} currently has the higher "
                f"weather risk** than {destination}."
            )

        if b > a:
            return (
                f"⚠️ **{destination} currently has the higher "
                f"weather risk** than {origin}."
            )

        return (
            f"Both **{origin}** and **{destination}** are currently "
            f"at **{origin_level.lower()} weather risk**."
        )

    # ============================================================
    # ROUTE EXPLANATION
    # ============================================================

    def _explain_best_route(
        self,
        context: Optional[Dict[str, Any]]
    ) -> Optional[str]:

        if not context:
            return None

        route = (
            context.get("recommended_route")
            or context.get("best_route")
            or context.get("route")
        )

        if not isinstance(
            route,
            dict
        ):
            return None

        origin = route.get(
            "origin",
            context.get(
                "origin",
                "the selected origin"
            )
        )

        destination = route.get(
            "destination",
            context.get(
                "destination",
                "the selected destination"
            )
        )

        transit = route.get(
            "transit_days"
        )

        distance = route.get(
            "distance_nm"
        )

        transshipments = route.get(
            "transshipments"
        )

        score = route.get(
            "score"
        )

        freight = route.get(
            "estimated_total_usd"
        )

        details = []

        if transit is not None:
            details.append(
                f"Transit time: **{transit} days**"
            )

        if distance is not None:
            details.append(
                f"Distance: **{distance} NM**"
            )

        if transshipments is not None:
            details.append(
                f"Transshipments: **{transshipments}**"
            )

        if score is not None:
            details.append(
                f"Route score: **{score}**"
            )

        if freight is not None:

            if isinstance(
                freight,
                (int, float)
            ):
                details.append(
                    f"Estimated total: **${freight:,.2f}**"
                )
            else:
                details.append(
                    f"Estimated total: **${freight}**"
                )

        answer = (
            f"The recommended route is "
            f"**{origin} → {destination}**."
        )

        if details:
            answer += "\n\n"
            answer += "\n".join(
                f"• {item}"
                for item in details
            )

        answer += (
            "\n\nWaypoint recommends this route based on "
            "the route information available to the application."
        )

        return answer

    # ============================================================
    # ROUTE COMPARISON
    # ============================================================

    def _compare_routes(
        self,
        context: Optional[Dict[str, Any]]
    ) -> Optional[str]:

        if not context:
            return None

        routes = context.get(
            "available_routes"
        )

        if not isinstance(
            routes,
            list
        ) or not routes:
            return None

        routes = [
            route
            for route in routes
            if isinstance(
                route,
                dict
            )
        ]

        if not routes:
            return None

        recommended = (
            context.get(
                "recommended_route"
            )
            or context.get(
                "route"
            )
        )

        if not isinstance(
            recommended,
            dict
        ):
            recommended = next(
                (
                    route
                    for route in routes
                    if route.get(
                        "is_best"
                    ) is True
                ),
                routes[0]
            )

        origin = recommended.get(
            "origin",
            context.get(
                "origin",
                "Origin"
            )
        )

        destination = recommended.get(
            "destination",
            context.get(
                "destination",
                "Destination"
            )
        )

        answer = (
            f"**Route comparison: {origin} → {destination}**\n\n"
            f"Waypoint has **{len(routes)} available route(s)**.\n\n"
        )

        for index, route in enumerate(
            routes[:5],
            start=1
        ):

            route_id = route.get(
                "route_id",
                f"Route {index}"
            )

            transit = route.get(
                "transit_days",
                "N/A"
            )

            distance = route.get(
                "distance_nm",
                "N/A"
            )

            transshipments = route.get(
                "transshipments",
                "N/A"
            )

            score = route.get(
                "score",
                "N/A"
            )

            marker = (
                " ⭐ RECOMMENDED"
                if route.get(
                    "is_best"
                ) is True
                else ""
            )

            answer += (
                f"**{route_id}**{marker}\n"
                f"• Transit: **{transit} days**\n"
                f"• Distance: **{distance} NM**\n"
                f"• Transshipments: **{transshipments}**\n"
                f"• Score: **{score}**\n\n"
            )

        return answer.strip()

    # ============================================================
    # ROUTE SCORE
    # ============================================================

    def _explain_route_score(
        self,
        context: Optional[Dict[str, Any]]
    ) -> Optional[str]:

        if not context:
            return None

        route = (
            context.get(
                "recommended_route"
            )
            or context.get(
                "route"
            )
        )

        if not isinstance(
            route,
            dict
        ):
            return None

        score = route.get(
            "score"
        )

        if score is None:
            return None

        route_id = route.get(
            "route_id",
            "the selected route"
        )

        return (
            f"**{route_id} has a route score of "
            f"{score}.**\n\n"
            "Waypoint's scoring logic considers:\n"
            "• Transit time — 40%\n"
            "• Distance — 25%\n"
            "• Transshipments — 15%\n"
            "• Base route component — 20%\n\n"
            "The score is used to rank the available routes."
        )

    # ============================================================
    # FREIGHT
    # ============================================================

    def _explain_freight(
        self,
        context: Optional[Dict[str, Any]]
    ) -> Optional[str]:

        if not context:
            return None

        route = (
            context.get(
                "route"
            )
            or context.get(
                "recommended_route"
            )
        )

        if not isinstance(
            route,
            dict
        ):
            return None

        base = route.get(
            "base_freight_usd"
        )

        total = route.get(
            "estimated_total_usd"
        )

        containers = route.get(
            "containers"
        )

        if (
            base is None
            and total is None
        ):
            return None

        answer = (
            "Here is the freight information available "
            "for this route:\n\n"
        )

        if base is not None:
            if isinstance(
                base,
                (int, float)
            ):
                answer += (
                    f"• Base freight: **${base:,.2f}**\n"
                )
            else:
                answer += (
                    f"• Base freight: **${base}**\n"
                )

        if containers is not None:
            answer += (
                f"• Containers: **{containers}**\n"
            )

        if total is not None:
            if isinstance(
                total,
                (int, float)
            ):
                answer += (
                    f"• Estimated total: **${total:,.2f}**\n"
                )
            else:
                answer += (
                    f"• Estimated total: **${total}**\n"
                )

        return answer.strip()

    # ============================================================
    # NAVIGATION
    # ============================================================

    def _navigation_help(
        self,
        q: str
    ) -> Dict[str, Any]:

        if (
            "route" in q
            or "plot" in q
        ):
            location = "Plot Route"

        elif "quotation" in q:
            location = "Request Quotation"

        elif "weather" in q:
            location = "Weather & Conditions"

        elif "connected" in q:
            location = "Connected Ports"

        elif "history" in q:
            location = "History"

        elif "dashboard" in q:
            location = "Operations Dashboard"

        else:
            location = "the navigation bar"

        return self._response(
            f"You can find this under **{location}** "
            "in the Waypoint navigation menu."
        )

    # ============================================================
    # PAGE HELP
    # ============================================================

    def _page_specific_help(
        self,
        page: str
    ) -> Dict[str, Any]:

        page_lower = page.lower()

        if "route" in page_lower:
            answer = (
                "You're currently working with route planning. "
                "I can explain the route score, transit time, "
                "distance, transshipments, freight or recommended route."
            )

        elif "weather" in page_lower:
            answer = (
                "You're on the Weather & Conditions page. "
                "I can explain the actual temperature, wind, humidity, "
                "visibility, rain probability, forecast and weather risk "
                "when the weather data is loaded."
            )

        elif "quotation" in page_lower:
            answer = (
                "You're on the quotation page. "
                "I can guide you through the company, contact and "
                "cargo information required for a quotation request."
            )

        elif "port" in page_lower:
            answer = (
                "You're viewing Connected Ports. "
                "I can explain port connections and their relationship "
                "to Waypoint's route dataset."
            )

        elif "dashboard" in page_lower:
            answer = (
                "You're on the Operations Dashboard. "
                "I can explain its statistics and operational indicators."
            )

        elif "history" in page_lower:
            answer = (
                "You're viewing Search History. "
                "This section allows you to review previous route searches."
            )

        else:
            answer = (
                f"You're currently on **{page}**. "
                "Ask me about the information shown here."
            )

        return self._response(
            answer
        )

    # ============================================================
    # GENERIC RESPONSE
    # ============================================================

    # ============================================================
    # MULTILINGUAL RESPONSE SUPPORT
    # ============================================================

    @staticmethod
    def _normalize_language(language: Optional[str]) -> str:
        if not language:
            return "en"

        code = str(language).strip().lower()

        aliases = {
            "english": "en",
            "telugu": "te",
            "తెలుగు": "te",
            "tamil": "ta",
            "தமிழ்": "ta",
            "hindi": "hi",
            "हिन्दी": "hi",
        }

        code = aliases.get(code, code)

        return code if code in {"en", "te", "ta", "hi"} else "en"

    def _response(
        self,
        answer: str
    ) -> Dict[str, Any]:

        localized = self._localize_answer(answer)

        return {
            "success": True,
            "answer": localized,
            "agent": "Waypoint AI",
            "language": self.current_language
        }

    def _localize_answer(self, answer: str) -> str:
        """
        Translate Waypoint AI's local, rule-based responses without
        requiring an external translation API or API key.

        Important:
        - Port names, route IDs, numbers and units are preserved.
        - Markdown formatting is preserved as much as possible.
        - English remains the default language.
        """

        language = self.current_language

        if language == "en":
            return answer

        # IMPORTANT: never build a regional-language response by blindly
        # replacing individual English words. That creates mixed-language
        # answers (for example, English sentences containing Telugu words).
        # Whole-response translations are checked first for common replies.
        whole_answer_translations = {
            "te": {
                "Run a route search first so I can explain the actual recommended route.":
                    "ముందుగా రూట్ శోధనను పూర్తి చేయండి. ఆ తర్వాత నిజమైన సిఫార్సు చేసిన రూట్‌ను నేను వివరించగలను.",
                "Waypoint identifies a recommended route by evaluating available route information such as transit time, distance, transshipments and freight.\n\nRun a route search first so I can explain the actual recommended route.":
                    "Waypoint అందుబాటులో ఉన్న రూట్ సమాచారాన్ని పరిశీలించి సిఫార్సు చేసిన రూట్‌ను గుర్తిస్తుంది. ఇందులో ట్రాన్సిట్ సమయం, దూరం, ట్రాన్స్‌షిప్‌మెంట్లు మరియు ఫ్రైట్ వంటి అంశాలు ఉంటాయి.\n\nముందుగా రూట్ శోధనను పూర్తి చేయండి. ఆ తర్వాత నిజమైన సిఫార్సు చేసిన రూట్‌ను నేను వివరించగలను.",
            },
            "ta": {
                "Run a route search first so I can explain the actual recommended route.":
                    "முதலில் ஒரு வழித்தடத் தேடலை இயக்குங்கள். அதன் பிறகு உண்மையான பரிந்துரைக்கப்பட்ட வழித்தடத்தை நான் விளக்க முடியும்.",
                "Waypoint identifies a recommended route by evaluating available route information such as transit time, distance, transshipments and freight.\n\nRun a route search first so I can explain the actual recommended route.":
                    "Waypoint கிடைக்கும் வழித்தடத் தகவல்களை மதிப்பீடு செய்து பரிந்துரைக்கப்பட்ட வழித்தடத்தைத் தேர்வு செய்கிறது. இதில் பயண நேரம், தூரம், சரக்கு மாற்றங்கள் மற்றும் சரக்குக் கட்டணம் போன்றவை அடங்கும்.\n\nமுதலில் ஒரு வழித்தடத் தேடலை இயக்குங்கள். அதன் பிறகு உண்மையான பரிந்துரைக்கப்பட்ட வழித்தடத்தை நான் விளக்க முடியும்.",
            },
            "hi": {
                "Run a route search first so I can explain the actual recommended route.":
                    "पहले रूट सर्च चलाएँ। उसके बाद मैं वास्तविक अनुशंसित रूट को समझा सकता हूँ।",
                "Waypoint identifies a recommended route by evaluating available route information such as transit time, distance, transshipments and freight.\n\nRun a route search first so I can explain the actual recommended route.":
                    "Waypoint उपलब्ध रूट की जानकारी का मूल्यांकन करके अनुशंसित रूट की पहचान करता है। इसमें ट्रांज़िट समय, दूरी, ट्रांसशिपमेंट और फ्रेट जैसी जानकारी शामिल होती है।\n\nपहले रूट सर्च चलाएँ। उसके बाद मैं वास्तविक अनुशंसित रूट को समझा सकता हूँ।",
            },
        }

        # Normalize line endings/extra spaces only for matching.
        normalized_answer = re.sub(r"[ \t]+", " ", answer.strip())
        normalized_answer = re.sub(r"\n{3,}", "\n\n", normalized_answer)

        exact = whole_answer_translations.get(language, {}).get(
            normalized_answer
        )

        if exact:
            return exact

        # Phrase-level translations are used only for responses that can be
        # safely covered by the local dictionary. We do NOT partially
        # translate an unknown response because that produces mixed language.
        dictionaries = {
            "te": {
                "Hello! 👋 I'm **Waypoint AI**.": "హలో! 👋 నేను **Waypoint AI**.",
                "I'm your maritime brokerage assistant.": "నేను మీ మారిటైమ్ బ్రోకరేజ్ సహాయకుడిని.",
                "I can help you understand routes, weather, ports, quotations, maritime concepts and the Waypoint platform.": "రూట్లు, వాతావరణం, పోర్టులు, కోటేషన్లు, మారిటైమ్ భావనలు మరియు Waypoint ప్లాట్‌ఫారమ్‌ను అర్థం చేసుకోవడంలో నేను సహాయం చేయగలను.",

                "**Waypoint** is a maritime brokerage platform designed to assist with shipping route planning and operational decision-making.": "**Waypoint** అనేది షిప్పింగ్ రూట్ ప్లానింగ్ మరియు ఆపరేషనల్ నిర్ణయాలకు సహాయపడే మారిటైమ్ బ్రోకరేజ్ ప్లాట్‌ఫారమ్.",
                "The platform provides:": "ఈ ప్లాట్‌ఫారమ్ అందించేవి:",
                "🚢 **Route Planning** — search routes between ports": "🚢 **రూట్ ప్లానింగ్** — పోర్టుల మధ్య రూట్లను శోధించండి",
                "⭐ **Route Recommendation** — identify recommended routes": "⭐ **రూట్ సిఫార్సు** — సిఫార్సు చేయబడిన రూట్లను గుర్తించండి",
                "📊 **Route Comparison** — compare transit, distance, transshipments and freight": "📊 **రూట్ పోలిక** — ట్రాన్సిట్, దూరం, ట్రాన్స్‌షిప్‌మెంట్లు మరియు ఫ్రైట్‌ను పోల్చండి",
                "⚓ **Connected Ports** — explore port connections": "⚓ **కనెక్టెడ్ పోర్ట్స్** — పోర్ట్ కనెక్షన్లను చూడండి",
                "🌦️ **Weather & Conditions** — check weather information": "🌦️ **వాతావరణం & పరిస్థితులు** — వాతావరణ సమాచారాన్ని చూడండి",
                "💰 **Quotation Requests** — submit shipping quotation requests": "💰 **కోటేషన్ అభ్యర్థనలు** — షిప్పింగ్ కోటేషన్ అభ్యర్థనలు పంపండి",
                "📜 **Search History** — review previous route searches": "📜 **సెర్చ్ హిస్టరీ** — గత రూట్ శోధనలను చూడండి",
                "📈 **Operations Dashboard** — view operational statistics": "📈 **ఆపరేషన్స్ డ్యాష్‌బోర్డ్** — ఆపరేషనల్ గణాంకాలను చూడండి",

                "**Maritime Shipping Basics 🚢**": "**మారిటైమ్ షిప్పింగ్ ప్రాథమికాలు 🚢**",
                "Maritime shipping is the transportation of cargo by sea using commercial vessels between ports.": "మారిటైమ్ షిప్పింగ్ అంటే వాణిజ్య నౌకలను ఉపయోగించి పోర్టుల మధ్య సముద్ర మార్గంలో కార్గోను రవాణా చేయడం.",
                "**Main elements include:**": "**ప్రధాన అంశాలు:**",
                "• **Vessel** — ship used to transport cargo": "• **వెసెల్** — కార్గోను రవాణా చేయడానికి ఉపయోగించే నౌక",
                "• **Port** — location where cargo is loaded or unloaded": "• **పోర్ట్** — కార్గోను లోడ్ లేదా అన్‌లోడ్ చేసే ప్రదేశం",
                "• **Cargo** — goods being transported": "• **కార్గో** — రవాణా చేయబడుతున్న వస్తువులు",
                "• **Container** — standardized unit used to carry cargo": "• **కంటైనర్** — కార్గోను మోసే ప్రమాణీకరించిన యూనిట్",
                "• **Route** — path between origin and destination": "• **రూట్** — మూలం మరియు గమ్యం మధ్య మార్గం",
                "• **Transit time** — estimated travel duration": "• **ట్రాన్సిట్ సమయం** — అంచనా ప్రయాణ వ్యవధి",
                "• **Freight** — transportation charge": "• **ఫ్రైట్** — రవాణా ఛార్జీ",
                "• **Transshipment** — transferring cargo between vessels": "• **ట్రాన్స్‌షిప్‌మెంట్** — నౌకల మధ్య కార్గోను బదిలీ చేయడం",

                "**Basic Maritime Shipping Process 🚢**": "**ప్రాథమిక మారిటైమ్ షిప్పింగ్ ప్రక్రియ 🚢**",
                "1. **Cargo preparation** — goods are prepared and packed.": "1. **కార్గో సిద్ధం** — వస్తువులను సిద్ధం చేసి ప్యాక్ చేస్తారు.",
                "2. **Booking** — shipping space is arranged.": "2. **బుకింగ్** — షిప్పింగ్ స్థలం ఏర్పాటు చేస్తారు.",
                "3. **Origin port** — cargo reaches the departure port.": "3. **మూల పోర్ట్** — కార్గో బయలుదేరే పోర్టుకు చేరుతుంది.",
                "4. **Loading** — cargo is loaded onto the vessel.": "4. **లోడింగ్** — కార్గోను నౌకపై లోడ్ చేస్తారు.",
                "5. **Sea transportation** — the vessel travels toward the destination.": "5. **సముద్ర రవాణా** — నౌక గమ్యం వైపు ప్రయాణిస్తుంది.",
                "6. **Transshipment** — cargo may be transferred at an intermediate port.": "6. **ట్రాన్స్‌షిప్‌మెంట్** — మధ్యবর্তী పోర్టులో కార్గోను బదిలీ చేయవచ్చు.",
                "7. **Destination port** — cargo is unloaded.": "7. **గమ్య పోర్ట్** — కార్గోను అన్‌లోడ్ చేస్తారు.",
                "8. **Final delivery** — cargo continues to its final destination.": "8. **తుది డెలివరీ** — కార్గో తుది గమ్యానికి కొనసాగుతుంది.",

                "**Transshipment**": "**ట్రాన్స్‌షిప్‌మెంట్**",
                "means transferring cargo from one vessel or transport service to another before it reaches its final destination.": "అంటే కార్గో తుది గమ్యానికి చేరుకునే ముందు ఒక నౌక లేదా రవాణా సేవ నుంచి మరొకదానికి బదిలీ చేయడం.",
                "For example:": "ఉదాహరణకు:",
                "Cargo may be transferred at Singapore before continuing toward Rotterdam.": "Rotterdam వైపు కొనసాగించే ముందు Singapore వద్ద కార్గోను బదిలీ చేయవచ్చు.",

                "**Transit time** is the estimated time required for cargo to travel between the origin and destination.": "**ట్రాన్సిట్ సమయం** అంటే కార్గో మూలం నుంచి గమ్యానికి ప్రయాణించడానికి అవసరమైన అంచనా సమయం.",
                "Waypoint represents transit time in **days**.": "Waypoint ట్రాన్సిట్ సమయాన్ని **రోజుల్లో** చూపిస్తుంది.",
                "**Nautical mile (NM)** is a standard distance unit used in maritime navigation.": "**నాటికల్ మైల్ (NM)** అనేది మారిటైమ్ నావిగేషన్‌లో ఉపయోగించే ప్రామాణిక దూర యూనిట్.",
                "Waypoint uses nautical miles to represent route distance.": "Waypoint రూట్ దూరాన్ని చూపడానికి నాటికల్ మైళ్లను ఉపయోగిస్తుంది.",

                "A **port** is a facility where vessels arrive and cargo can be loaded, unloaded or transferred.": "ఒక **పోర్ట్** అనేది నౌకలు చేరే మరియు కార్గోను లోడ్, అన్‌లోడ్ లేదా బదిలీ చేసే సదుపాయం.",
                "In Waypoint, ports act as origins and destinations for route planning.": "Waypointలో పోర్టులు రూట్ ప్లానింగ్‌కు మూలాలు మరియు గమ్యాలుగా పనిచేస్తాయి.",
                "A **vessel** is a watercraft used for transportation or other maritime activities.": "ఒక **వెసెల్** అనేది రవాణా లేదా ఇతర మారిటైమ్ కార్యకలాపాలకు ఉపయోగించే జల రవాణా సాధనం.",
                "Commercial vessels transport cargo between ports.": "వాణిజ్య నౌకలు పోర్టుల మధ్య కార్గోను రవాణా చేస్తాయి.",
                "**Cargo** refers to goods or materials transported from one location to another.": "**కార్గో** అంటే ఒక ప్రదేశం నుంచి మరొక ప్రదేశానికి రవాణా చేయబడే వస్తువులు లేదా పదార్థాలు.",
                "A **shipping container** is a standardized cargo unit designed to safely transport goods.": "ఒక **షిప్పింగ్ కంటైనర్** అనేది వస్తువులను సురక్షితంగా రవాణా చేయడానికి రూపొందించిన ప్రమాణీకరించిన కార్గో యూనిట్.",
                "Containers make it easier to transfer cargo between ships, trucks and trains.": "కంటైనర్లు నౌకలు, ట్రక్కులు మరియు రైళ్ల మధ్య కార్గోను బదిలీ చేయడాన్ని సులభతరం చేస్తాయి.",
                "**ETA** means **Estimated Time of Arrival**. It represents the expected arrival time of a vessel or shipment.": "**ETA** అంటే **Estimated Time of Arrival**. ఇది నౌక లేదా షిప్‌మెంట్ చేరే అంచనా సమయాన్ని సూచిస్తుంది.",
                "**ETD** means **Estimated Time of Departure**. It represents the expected time when a vessel or shipment will leave its origin.": "**ETD** అంటే **Estimated Time of Departure**. ఇది నౌక లేదా షిప్‌మెంట్ మూలం నుంచి బయలుదేరే అంచనా సమయాన్ని సూచిస్తుంది.",

                "**Current weather for": "**ప్రస్తుత వాతావరణం:",
                "**Current weather risk for": "**ప్రస్తుత వాతావరణ ప్రమాదం:",
                "**Wind conditions for": "**గాలి పరిస్థితులు:",
                "**Rain / precipitation information for": "**వర్షం / అవపాతం సమాచారం:",
                "**Visibility for": "**దృశ్యమానత:",
                "Temperature": "ఉష్ణోగ్రత",
                "Condition": "పరిస్థితి",
                "Humidity": "తేమ",
                "Wind": "గాలి",
                "Visibility": "దృశ్యమానత",
                "Rain probability": "వర్షం సంభావ్యత",
                "Forecast rain probability reaches up to": "అంచనా వర్షం సంభావ్యత గరిష్టంగా",
                "risk": "ప్రమాదం",
                "Low": "తక్కువ",
                "Moderate": "మధ్యస్థ",
                "High": "అధిక",
                "Not available": "అందుబాటులో లేదు",
                "currently has the higher weather risk": "ప్రస్తుతం ఎక్కువ వాతావరణ ప్రమాదం ఉంది",
                "Both": "రెండింటికీ",
                "are currently at": "ప్రస్తుతం",
                "weather risk.": "వాతావరణ ప్రమాదం ఉంది.",

                "Best route for": "ఉత్తమ రూట్:",
                "Transit time": "ట్రాన్సిట్ సమయం",
                "Distance": "దూరం",
                "Transshipments": "ట్రాన్స్‌షిప్‌మెంట్లు",
                "Route score": "రూట్ స్కోర్",
                "Estimated total for": "అంచనా మొత్తం",
                "container(s)": "కంటైనర్(లు)",
                "Waypoint selected": "Waypoint ఎంపిక చేసింది",
                "available route option(s)": "అందుబాటులో ఉన్న రూట్ ఎంపిక(లు)",
                "returned by the real route dataset.": "నిజమైన రూట్ డేటాసెట్ ద్వారా అందించబడినవి.",

                "Waypoint's route score considers multiple factors:": "Waypoint రూట్ స్కోర్ అనేక అంశాలను పరిగణనలోకి తీసుకుంటుంది:",
                "Transit time — 40%": "ట్రాన్సిట్ సమయం — 40%",
                "Distance — 25%": "దూరం — 25%",
                "Transshipments — 15%": "ట్రాన్స్‌షిప్‌మెంట్లు — 15%",
                "Base route component — 20%": "బేస్ రూట్ భాగం — 20%",
                "The score is used to rank the available routes.": "అందుబాటులో ఉన్న రూట్లకు ర్యాంక్ ఇవ్వడానికి ఈ స్కోర్ ఉపయోగించబడుతుంది.",

                "Please enter a question.": "దయచేసి ఒక ప్రశ్నను నమోదు చేయండి.",
                "I couldn't find a route from": "నాకు రూట్ కనుగొనబడలేదు:",
                "in the current Waypoint route dataset.": "ప్రస్తుత Waypoint రూట్ డేటాసెట్‌లో.",
                "No available route options were returned for": "రూట్ ఎంపికలు అందుబాటులో లేవు:",
                "I couldn't read the route dataset right now.": "ప్రస్తుతం రూట్ డేటాసెట్‌ను చదవలేకపోయాను.",
                "Sorry, I couldn't process that question.": "క్షమించండి, ఆ ప్రశ్నను ప్రాసెస్ చేయలేకపోయాను.",
            },

            "ta": {
                "Hello! 👋 I'm **Waypoint AI**.": "வணக்கம்! 👋 நான் **Waypoint AI**.",
                "I'm your maritime brokerage assistant.": "நான் உங்கள் கடல்சார் தரகு உதவியாளர்.",
                "I can help you understand routes, weather, ports, quotations, maritime concepts and the Waypoint platform.": "வழித்தடங்கள், வானிலை, துறைமுகங்கள், மேற்கோள்கள், கடல்சார் கருத்துகள் மற்றும் Waypoint தளத்தைப் புரிந்துகொள்ள நான் உதவ முடியும்.",
                "**Waypoint** is a maritime brokerage platform designed to assist with shipping route planning and operational decision-making.": "**Waypoint** என்பது கப்பல் போக்குவரத்து வழித்தட திட்டமிடல் மற்றும் செயல்பாட்டு முடிவெடுப்புக்கு உதவும் கடல்சார் தரகு தளமாகும்.",
                "The platform provides:": "இந்த தளம் வழங்குவது:",
                "🚢 **Route Planning** — search routes between ports": "🚢 **வழித்தட திட்டமிடல்** — துறைமுகங்களுக்கு இடையிலான வழித்தடங்களைத் தேடுங்கள்",
                "⭐ **Route Recommendation** — identify recommended routes": "⭐ **வழித்தட பரிந்துரை** — பரிந்துரைக்கப்பட்ட வழித்தடங்களை கண்டறியுங்கள்",
                "📊 **Route Comparison** — compare transit, distance, transshipments and freight": "📊 **வழித்தட ஒப்பீடு** — பயண நேரம், தூரம், சரக்கு மாற்றங்கள் மற்றும் சரக்குக் கட்டணத்தை ஒப்பிடுங்கள்",
                "⚓ **Connected Ports** — explore port connections": "⚓ **இணைக்கப்பட்ட துறைமுகங்கள்** — துறைமுக இணைப்புகளைப் பாருங்கள்",
                "🌦️ **Weather & Conditions** — check weather information": "🌦️ **வானிலை & நிலைமைகள்** — வானிலை தகவலைப் பாருங்கள்",
                "💰 **Quotation Requests** — submit shipping quotation requests": "💰 **மேற்கோள் கோரிக்கைகள்** — கப்பல் போக்குவரத்து மேற்கோள் கோரிக்கைகளை அனுப்புங்கள்",
                "📜 **Search History** — review previous route searches": "📜 **தேடல் வரலாறு** — முந்தைய வழித்தட தேடல்களைப் பாருங்கள்",
                "📈 **Operations Dashboard** — view operational statistics": "📈 **செயல்பாட்டு டாஷ்போர்டு** — செயல்பாட்டு புள்ளிவிவரங்களைப் பாருங்கள்",
                "**Maritime Shipping Basics 🚢**": "**கடல்சார் கப்பல் போக்குவரத்து அடிப்படைகள் 🚢**",
                "Maritime shipping is the transportation of cargo by sea using commercial vessels between ports.": "கடல்சார் கப்பல் போக்குவரத்து என்பது வணிகக் கப்பல்களைப் பயன்படுத்தி துறைமுகங்களுக்கு இடையே கடல் வழியாக சரக்குகளை எடுத்துச் செல்வதாகும்.",
                "**Main elements include:**": "**முக்கிய அம்சங்கள்:**",
                "• **Vessel** — ship used to transport cargo": "• **கப்பல்** — சரக்குகளை எடுத்துச் செல்ல பயன்படுத்தப்படும் கப்பல்",
                "• **Port** — location where cargo is loaded or unloaded": "• **துறைமுகம்** — சரக்கு ஏற்றப்படும் அல்லது இறக்கப்படும் இடம்",
                "• **Cargo** — goods being transported": "• **சரக்கு** — எடுத்துச் செல்லப்படும் பொருட்கள்",
                "• **Container** — standardized unit used to carry cargo": "• **கண்டெய்னர்** — சரக்குகளை எடுத்துச் செல்லும் தரநிலைப்படுத்தப்பட்ட அலகு",
                "• **Route** — path between origin and destination": "• **வழித்தடம்** — தொடக்க இடத்துக்கும் இலக்குக்கும் இடையிலான பாதை",
                "• **Transit time** — estimated travel duration": "• **பயண நேரம்** — மதிப்பிடப்பட்ட பயண காலம்",
                "• **Freight** — transportation charge": "• **சரக்குக் கட்டணம்** — போக்குவரத்துக் கட்டணம்",
                "• **Transshipment** — transferring cargo between vessels": "• **Transshipment** — கப்பல்களுக்கு இடையே சரக்கை மாற்றுதல்",
                "**Transshipment**": "**Transshipment**",
                "means transferring cargo from one vessel or transport service to another before it reaches its final destination.": "என்பது சரக்கு இறுதி இலக்கை அடைவதற்கு முன் ஒரு கப்பல் அல்லது போக்குவரத்து சேவையிலிருந்து மற்றொன்றுக்கு மாற்றப்படுவதாகும்.",
                "For example:": "உதாரணமாக:",
                "Cargo may be transferred at Singapore before continuing toward Rotterdam.": "Rotterdam நோக்கி செல்லும் முன் Singapore-ல் சரக்கு மாற்றப்படலாம்.",
                "**Transit time** is the estimated time required for cargo to travel between the origin and destination.": "**பயண நேரம்** என்பது சரக்கு தொடக்க இடத்திலிருந்து இலக்கை அடைய தேவையான மதிப்பிடப்பட்ட நேரமாகும்.",
                "Waypoint represents transit time in **days**.": "Waypoint பயண நேரத்தை **நாட்களில்** காட்டுகிறது.",
                "**Nautical mile (NM)** is a standard distance unit used in maritime navigation.": "**Nautical mile (NM)** என்பது கடல்சார் வழிசெலுத்தலில் பயன்படுத்தப்படும் நிலையான தூர அலகாகும்.",
                "Waypoint uses nautical miles to represent route distance.": "Waypoint வழித்தட தூரத்தை காட்ட nautical miles-ஐ பயன்படுத்துகிறது.",
                "A **port** is a facility where vessels arrive and cargo can be loaded, unloaded or transferred.": "ஒரு **துறைமுகம்** என்பது கப்பல்கள் வந்து சரக்குகளை ஏற்ற, இறக்க அல்லது மாற்றக்கூடிய வசதியாகும்.",
                "In Waypoint, ports act as origins and destinations for route planning.": "Waypoint-ல் துறைமுகங்கள் வழித்தட திட்டமிடலுக்கான தொடக்கங்கள் மற்றும் இலக்குகளாக செயல்படுகின்றன.",
                "A **vessel** is a watercraft used for transportation or other maritime activities.": "ஒரு **கப்பல்** என்பது போக்குவரத்து அல்லது பிற கடல்சார் செயல்பாடுகளுக்குப் பயன்படுத்தப்படும் நீர்வழி வாகனமாகும்.",
                "Commercial vessels transport cargo between ports.": "வணிகக் கப்பல்கள் துறைமுகங்களுக்கு இடையே சரக்குகளை எடுத்துச் செல்கின்றன.",
                "**Cargo** refers to goods or materials transported from one location to another.": "**சரக்கு** என்பது ஒரு இடத்திலிருந்து மற்றொரு இடத்திற்கு எடுத்துச் செல்லப்படும் பொருட்கள் அல்லது பொருட்கூறுகளைக் குறிக்கும்.",
                "A **shipping container** is a standardized cargo unit designed to safely transport goods.": "ஒரு **shipping container** என்பது பொருட்களை பாதுகாப்பாக எடுத்துச் செல்ல வடிவமைக்கப்பட்ட தரநிலைப்படுத்தப்பட்ட சரக்கு அலகாகும்.",
                "Containers make it easier to transfer cargo between ships, trucks and trains.": "கண்டெய்னர்கள் கப்பல்கள், லாரிகள் மற்றும் ரயில்களுக்கு இடையே சரக்குகளை மாற்றுவதை எளிதாக்குகின்றன.",
                "**ETA** means **Estimated Time of Arrival**. It represents the expected arrival time of a vessel or shipment.": "**ETA** என்பது **Estimated Time of Arrival**. இது கப்பல் அல்லது சரக்கு வந்து சேரும் எதிர்பார்க்கப்படும் நேரத்தைக் குறிக்கிறது.",
                "**ETD** means **Estimated Time of Departure**. It represents the expected time when a vessel or shipment will leave its origin.": "**ETD** என்பது **Estimated Time of Departure**. இது கப்பல் அல்லது சரக்கு தொடக்க இடத்திலிருந்து புறப்படும் எதிர்பார்க்கப்படும் நேரத்தைக் குறிக்கிறது.",
                "**Current weather for": "**தற்போதைய வானிலை:",
                "**Current weather risk for": "**தற்போதைய வானிலை ஆபத்து:",
                "**Wind conditions for": "**காற்று நிலைமைகள்:",
                "**Rain / precipitation information for": "**மழை / மழைப்பொழிவு தகவல்:",
                "**Visibility for": "**தெரிவுத்திறன்:",
                "Temperature": "வெப்பநிலை",
                "Condition": "நிலைமை",
                "Humidity": "ஈரப்பதம்",
                "Wind": "காற்று",
                "Visibility": "தெரிவுத்திறன்",
                "Rain probability": "மழை சாத்தியம்",
                "Forecast rain probability reaches up to": "முன்னறிவிப்பு மழை சாத்தியம் அதிகபட்சம்",
                "risk": "ஆபத்து",
                "Low": "குறைவு",
                "Moderate": "மிதமான",
                "High": "அதிகம்",
                "Not available": "கிடைக்கவில்லை",
                "currently has the higher weather risk": "தற்போது அதிக வானிலை ஆபத்து உள்ளது",
                "Best route for": "சிறந்த வழித்தடம்:",
                "Transit time": "பயண நேரம்",
                "Distance": "தூரம்",
                "Transshipments": "சரக்கு மாற்றங்கள்",
                "Route score": "வழித்தட மதிப்பெண்",
                "Estimated total for": "மதிப்பிடப்பட்ட மொத்தம்",
                "Waypoint selected": "Waypoint தேர்ந்தெடுத்தது",
                "available route option(s)": "கிடைக்கும் வழித்தட விருப்பம்(கள்)",
                "returned by the real route dataset.": "உண்மையான வழித்தட தரவுத்தொகுப்பால் வழங்கப்பட்டவை.",
                "Waypoint's route score considers multiple factors:": "Waypoint வழித்தட மதிப்பெண் பல காரணிகளை கருத்தில் கொள்கிறது:",
                "Transit time — 40%": "பயண நேரம் — 40%",
                "Distance — 25%": "தூரம் — 25%",
                "Transshipments — 15%": "சரக்கு மாற்றங்கள் — 15%",
                "Base route component — 20%": "அடிப்படை வழித்தட கூறு — 20%",
                "The score is used to rank the available routes.": "கிடைக்கும் வழித்தடங்களுக்கு தரவரிசை வழங்க இந்த மதிப்பெண் பயன்படுத்தப்படுகிறது.",
                "Please enter a question.": "தயவுசெய்து ஒரு கேள்வியை உள்ளிடுங்கள்.",
                "Sorry, I couldn't process that question.": "மன்னிக்கவும், அந்தக் கேள்வியை செயலாக்க முடியவில்லை.",
            },

            "hi": {
                "Hello! 👋 I'm **Waypoint AI**.": "नमस्ते! 👋 मैं **Waypoint AI** हूँ।",
                "I'm your maritime brokerage assistant.": "मैं आपका समुद्री ब्रोकरेज सहायक हूँ।",
                "I can help you understand routes, weather, ports, quotations, maritime concepts and the Waypoint platform.": "मैं रूट, मौसम, बंदरगाह, कोटेशन, समुद्री अवधारणाओं और Waypoint प्लेटफ़ॉर्म को समझने में आपकी मदद कर सकता हूँ।",
                "**Waypoint** is a maritime brokerage platform designed to assist with shipping route planning and operational decision-making.": "**Waypoint** एक समुद्री ब्रोकरेज प्लेटफ़ॉर्म है जो शिपिंग रूट प्लानिंग और संचालन संबंधी निर्णयों में सहायता करता है।",
                "The platform provides:": "यह प्लेटफ़ॉर्म प्रदान करता है:",
                "🚢 **Route Planning** — search routes between ports": "🚢 **रूट प्लानिंग** — बंदरगाहों के बीच रूट खोजें",
                "⭐ **Route Recommendation** — identify recommended routes": "⭐ **रूट सुझाव** — सुझाए गए रूट पहचानें",
                "📊 **Route Comparison** — compare transit, distance, transshipments and freight": "📊 **रूट तुलना** — ट्रांज़िट, दूरी, ट्रांसशिपमेंट और फ्रेट की तुलना करें",
                "⚓ **Connected Ports** — explore port connections": "⚓ **कनेक्टेड पोर्ट्स** — पोर्ट कनेक्शन देखें",
                "🌦️ **Weather & Conditions** — check weather information": "🌦️ **मौसम और स्थितियाँ** — मौसम की जानकारी देखें",
                "💰 **Quotation Requests** — submit shipping quotation requests": "💰 **कोटेशन अनुरोध** — शिपिंग कोटेशन अनुरोध भेजें",
                "📜 **Search History** — review previous route searches": "📜 **सर्च हिस्ट्री** — पिछली रूट खोजें देखें",
                "📈 **Operations Dashboard** — view operational statistics": "📈 **ऑपरेशंस डैशबोर्ड** — संचालन संबंधी आँकड़े देखें",
                "**Maritime Shipping Basics 🚢**": "**समुद्री शिपिंग की मूल बातें 🚢**",
                "Maritime shipping is the transportation of cargo by sea using commercial vessels between ports.": "समुद्री शिपिंग का अर्थ वाणिज्यिक जहाज़ों द्वारा बंदरगाहों के बीच समुद्र के रास्ते कार्गो का परिवहन है।",
                "**Main elements include:**": "**मुख्य तत्व:**",
                "• **Vessel** — ship used to transport cargo": "• **Vessel** — कार्गो ले जाने के लिए इस्तेमाल किया जाने वाला जहाज़",
                "• **Port** — location where cargo is loaded or unloaded": "• **Port** — वह स्थान जहाँ कार्गो लोड या अनलोड किया जाता है",
                "• **Cargo** — goods being transported": "• **Cargo** — परिवहन की जा रही वस्तुएँ",
                "• **Container** — standardized unit used to carry cargo": "• **Container** — कार्गो ले जाने के लिए मानकीकृत इकाई",
                "• **Route** — path between origin and destination": "• **Route** — मूल स्थान और गंतव्य के बीच का मार्ग",
                "• **Transit time** — estimated travel duration": "• **Transit time** — अनुमानित यात्रा अवधि",
                "• **Freight** — transportation charge": "• **Freight** — परिवहन शुल्क",
                "• **Transshipment** — transferring cargo between vessels": "• **Transshipment** — जहाज़ों के बीच कार्गो स्थानांतरित करना",
                "**Transshipment**": "**Transshipment**",
                "means transferring cargo from one vessel or transport service to another before it reaches its final destination.": "का अर्थ है कार्गो के अंतिम गंतव्य तक पहुँचने से पहले उसे एक जहाज़ या परिवहन सेवा से दूसरी में स्थानांतरित करना।",
                "For example:": "उदाहरण के लिए:",
                "Cargo may be transferred at Singapore before continuing toward Rotterdam.": "Rotterdam की ओर आगे बढ़ने से पहले Singapore में कार्गो स्थानांतरित किया जा सकता है।",
                "**Transit time** is the estimated time required for cargo to travel between the origin and destination.": "**Transit time** मूल स्थान से गंतव्य तक कार्गो पहुँचने में लगने वाला अनुमानित समय है।",
                "Waypoint represents transit time in **days**.": "Waypoint ट्रांज़िट समय को **दिनों** में दिखाता है।",
                "**Nautical mile (NM)** is a standard distance unit used in maritime navigation.": "**Nautical mile (NM)** समुद्री नेविगेशन में उपयोग की जाने वाली मानक दूरी इकाई है।",
                "Waypoint uses nautical miles to represent route distance.": "Waypoint रूट की दूरी दिखाने के लिए nautical miles का उपयोग करता है।",
                "A **port** is a facility where vessels arrive and cargo can be loaded, unloaded or transferred.": "एक **port** वह सुविधा है जहाँ जहाज़ आते हैं और कार्गो को लोड, अनलोड या स्थानांतरित किया जा सकता है।",
                "In Waypoint, ports act as origins and destinations for route planning.": "Waypoint में पोर्ट रूट प्लानिंग के लिए origin और destination के रूप में काम करते हैं।",
                "A **vessel** is a watercraft used for transportation or other maritime activities.": "एक **vessel** परिवहन या अन्य समुद्री गतिविधियों के लिए उपयोग किया जाने वाला जलयान है।",
                "Commercial vessels transport cargo between ports.": "वाणिज्यिक जहाज़ बंदरगाहों के बीच कार्गो का परिवहन करते हैं।",
                "**Cargo** refers to goods or materials transported from one location to another.": "**Cargo** उन वस्तुओं या सामग्रियों को कहा जाता है जिन्हें एक स्थान से दूसरे स्थान तक ले जाया जाता है।",
                "A **shipping container** is a standardized cargo unit designed to safely transport goods.": "एक **shipping container** वस्तुओं को सुरक्षित रूप से ले जाने के लिए बनाई गई मानकीकृत कार्गो इकाई है।",
                "Containers make it easier to transfer cargo between ships, trucks and trains.": "कंटेनर जहाज़ों, ट्रकों और ट्रेनों के बीच कार्गो स्थानांतरण को आसान बनाते हैं।",
                "**ETA** means **Estimated Time of Arrival**. It represents the expected arrival time of a vessel or shipment.": "**ETA** का अर्थ **Estimated Time of Arrival** है। यह जहाज़ या शिपमेंट के अपेक्षित पहुँचने का समय बताता है।",
                "**ETD** means **Estimated Time of Departure**. It represents the expected time when a vessel or shipment will leave its origin.": "**ETD** का अर्थ **Estimated Time of Departure** है। यह जहाज़ या शिपमेंट के origin से रवाना होने का अपेक्षित समय बताता है।",
                "**Current weather for": "**वर्तमान मौसम:",
                "**Current weather risk for": "**वर्तमान मौसम जोखिम:",
                "**Wind conditions for": "**हवा की स्थिति:",
                "**Rain / precipitation information for": "**बारिश / वर्षा की जानकारी:",
                "**Visibility for": "**दृश्यता:",
                "Temperature": "तापमान",
                "Condition": "स्थिति",
                "Humidity": "आर्द्रता",
                "Wind": "हवा",
                "Visibility": "दृश्यता",
                "Rain probability": "बारिश की संभावना",
                "Forecast rain probability reaches up to": "पूर्वानुमान में बारिश की संभावना अधिकतम",
                "risk": "जोखिम",
                "Low": "कम",
                "Moderate": "मध्यम",
                "High": "उच्च",
                "Not available": "उपलब्ध नहीं",
                "currently has the higher weather risk": "वर्तमान में मौसम का जोखिम अधिक है",
                "Best route for": "सर्वोत्तम रूट:",
                "Transit time": "ट्रांज़िट समय",
                "Distance": "दूरी",
                "Transshipments": "ट्रांसशिपमेंट",
                "Route score": "रूट स्कोर",
                "Estimated total for": "अनुमानित कुल",
                "Waypoint selected": "Waypoint ने चुना",
                "available route option(s)": "उपलब्ध रूट विकल्प",
                "returned by the real route dataset.": "वास्तविक रूट डेटासेट द्वारा लौटाए गए हैं।",
                "Waypoint's route score considers multiple factors:": "Waypoint का रूट स्कोर कई कारकों पर आधारित है:",
                "Transit time — 40%": "ट्रांज़िट समय — 40%",
                "Distance — 25%": "दूरी — 25%",
                "Transshipments — 15%": "ट्रांसशिपमेंट — 15%",
                "Base route component — 20%": "बेस रूट घटक — 20%",
                "The score is used to rank the available routes.": "इस स्कोर का उपयोग उपलब्ध रूटों की रैंकिंग के लिए किया जाता है।",
                "Please enter a question.": "कृपया एक प्रश्न दर्ज करें।",
                "Sorry, I couldn't process that question.": "क्षमा करें, मैं उस प्रश्न को संसाधित नहीं कर सका।",
            },
        }

        replacements = dictionaries.get(language, {})

        # Longest phrases first prevents short terms from breaking
        # already translated sentences.
        for source, target in sorted(
            replacements.items(),
            key=lambda item: len(item[0]),
            reverse=True
        ):
            answer = re.sub(
                re.escape(source),
                target,
                answer,
                flags=re.IGNORECASE
            )

        # Translate common markdown labels that occur inside dynamic
        # route/weather responses.
        return answer

    # ============================================================
    # PHRASE MATCHING
    # ============================================================

    @staticmethod
    def _matches(
        question: str,
        phrases: list
    ) -> bool:

        normalized = re.sub(
            r"\s+",
            " ",
            question.lower()
        ).strip()

        return any(
            phrase.lower() in normalized
            for phrase in phrases
        )
