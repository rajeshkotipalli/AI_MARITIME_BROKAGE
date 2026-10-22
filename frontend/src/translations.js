// ============================================================
// WAYPOINT LOCAL TRANSLATION SYSTEM
// No external API / No API key required
//
// Supported languages:
// English, Hindi, Tamil, Telugu
// ============================================================

export const LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
  },
];

export const DEFAULT_LANGUAGE = "en";

export const translations = {
  // ==========================================================
  // ENGLISH
  // ==========================================================

  en: {
    common: {
      home: "Home",
      plotRoute: "Plot Route",
      routeResults: "Route Results",
      history: "History",
      connectedPorts: "Connected Ports",
      weather: "Weather & Conditions",
      quotation: "Request Quotation",
      dashboard: "Operations Dashboard",

      logout: "Logout",
      login: "Login",
      register: "Register",

      submit: "Submit",
      cancel: "Cancel",
      search: "Search",
      refresh: "Refresh",
      clear: "Clear",
      loading: "Loading...",
      select: "Select",

      origin: "Origin",
      destination: "Destination",

      status: "Status",
      date: "Date",
      actions: "Actions",

      back: "Back",
      next: "Next",
      close: "Close",
      save: "Save",
      send: "Send",

      language: "Language",

      lightMode: "Light Mode",
      darkMode: "Dark Mode",

      noData: "No data available",
      error: "Something went wrong.",
    },

    home: {
      eyebrow: "MARITIME BROKERAGE",

      title:
        "Navigate smarter. Trade better.",

      subtitle:
        "Waypoint helps you compare maritime routes, understand operational conditions, and make better shipping decisions.",

      getStarted: "Get Started",
      exploreRoutes: "Explore Routes",

      routePlanning:
        "Route Planning",

      routePlanningText:
        "Compare available maritime routes using transit time, distance, transshipments and freight information.",

      weatherConditions:
        "Weather & Conditions",

      weatherConditionsText:
        "Monitor current weather conditions, forecast information and operational risk.",

      connectedPorts:
        "Connected Ports",

      connectedPortsText:
        "Explore destinations connected to your selected origin port.",

      requestQuotation:
        "Request Quotation",

      requestQuotationText:
        "Submit your cargo and company information to request a quotation.",

      operationsDashboard:
        "Operations Dashboard",

      operationsDashboardText:
        "Review route searches, quotations, connected ports and operational statistics.",
    },

    routePlanner: {
      eyebrow: "ROUTE PLANNER",

      title:
        "Find your maritime route",

      subtitle:
        "Enter your shipment details to compare every available route.",

      loadPort: "Load Port",

      dischargePort:
        "Discharge Port",

      cargoType:
        "Cargo Type",

      containers:
        "Containers (TEU)",

      plotRoute:
        "Plot Route",

      analyzing:
        "Analyzing route...",

      selectOrigin:
        "Select origin port",

      selectDestination:
        "Select destination port",

      routeFound:
        "Route found",

      routeNotFound:
        "No route found",
    },

    routes: {
      title:
        "Available Routes",

      bestRoute:
        "Best Route",

      recommended:
        "Recommended",

      availableRoutes:
        "Available Routes",

      routeId:
        "Route ID",

      transitTime:
        "Transit Time",

      distance:
        "Distance",

      transshipments:
        "Transshipments",

      freight:
        "Base Freight",

      estimatedTotal:
        "Estimated Total",

      score:
        "Score",

      routeType:
        "Route Type",

      selectRoute:
        "Select Route",

      requestQuotation:
        "Request Quotation",

      noRoutes:
        "No available routes for this search.",

      days:
        "days",

      nauticalMiles:
        "NM",
    },

    weather: {
      eyebrow:
        "WEATHER & CONDITIONS",

      title:
        "Maritime Weather",

      subtitle:
        "Review current conditions and forecast information for your route.",

      originWeather:
        "Origin Weather",

      destinationWeather:
        "Destination Weather",

      temperature:
        "Temperature",

      feelsLike:
        "Feels Like",

      humidity:
        "Humidity",

      pressure:
        "Pressure",

      wind:
        "Wind",

      windDirection:
        "Wind Direction",

      visibility:
        "Visibility",

      condition:
        "Condition",

      precipitation:
        "Precipitation",

      rainProbability:
        "Rain Probability",

      forecast:
        "Forecast",

      weatherRisk:
        "Weather Risk",

      low:
        "Low",

      moderate:
        "Moderate",

      high:
        "High",

      warnings:
        "Warnings",

      operationalInstructions:
        "Operational Instructions",

      selectLocation:
        "Select a location",

      loadingWeather:
        "Loading weather...",

      weatherUnavailable:
        "Weather information unavailable.",
    },

    ports: {
      eyebrow:
        "PORT NETWORK",

      title:
        "Connected Ports",

      subtitle:
        "Explore destinations connected to your selected origin.",

      selectOrigin:
        "Select Origin Port",

      connectedDestination:
        "Connected Destination",

      availableRoute:
        "available route",

      availableRoutes:
        "available routes",

      totalRoutes:
        "Total Routes",

      noConnections:
        "No connected destinations found.",
    },

    quotation: {
      eyebrow:
        "COMMERCIAL REQUEST",

      title:
        "Request a Quotation",

      subtitle:
        "Provide your company and cargo details to submit a quotation request.",

      companyName:
        "Company Name",

      email:
        "Email",

      phone:
        "Phone",

      cargoWeight:
        "Cargo Weight",

      containers:
        "Containers",

      specialRequirements:
        "Special Requirements",

      submitQuotation:
        "Submit Quotation",

      pending:
        "Pending",

      approved:
        "Approved",

      rejected:
        "Rejected",

      quotationSubmitted:
        "Quotation submitted successfully.",

      noQuotations:
        "No quotation requests found.",

      recentRequests:
        "Recent Requests",
    },

    history: {
      eyebrow:
        "SEARCH RECORDS",

      title:
        "Search History",

      subtitle:
        "Review your previous maritime route searches.",

      searchedRoute:
        "Searched Route",

      searchedAt:
        "Searched At",

      viewRoute:
        "View Route",

      noHistory:
        "No search history available.",
    },

    dashboard: {
      eyebrow:
        "OPERATIONS",

      title:
        "Operations Dashboard",

      subtitle:
        "Monitor route activity, quotations, ports and operational indicators.",

      routeSearches:
        "Route Searches",

      availableRoutes:
        "Available Routes",

      bestRoutes:
        "Best Routes",

      connectedPorts:
        "Connected Ports",

      quotationRequests:
        "Quotation Requests",

      mostSearchedRoute:
        "Most Searched Route",

      averageTransit:
        "Average Transit",

      averageDistance:
        "Average Distance",

      recentSearches:
        "Recent Searches",

      weatherAlerts:
        "Weather Alerts",

      operationalOverview:
        "Operational Overview",
    },

    ai: {
      title:
        "Waypoint AI",

      online:
        "Local assistant · Online",

      offline:
        "Local assistant · Offline",

      placeholder:
        "Ask Waypoint AI...",

      tryAsking:
        "Try asking",

      askAboutRoute:
        "Ask about this route",

      askAboutWeather:
        "Ask about this weather",

      clearChat:
        "Clear conversation",

      closeChat:
        "Close Waypoint AI",

      greeting:
        "Hello! 👋 I'm Waypoint AI. I can help you understand Waypoint, maritime concepts, routes, weather, ports and quotations.",

      chatCleared:
        "Chat cleared. 👋\n\nHow can I help you with Waypoint?",

      localData:
        "Waypoint AI uses actual application data when available.",
    },
  },

  // ==========================================================
  // HINDI
  // ==========================================================

  hi: {
    common: {
      home: "होम",
      plotRoute: "रूट प्लॉट करें",
      routeResults: "रूट परिणाम",
      history: "इतिहास",
      connectedPorts: "कनेक्टेड पोर्ट्स",
      weather: "मौसम और स्थितियाँ",
      quotation: "कोटेशन का अनुरोध करें",
      dashboard: "ऑपरेशंस डैशबोर्ड",

      logout: "लॉग आउट",
      login: "लॉगिन",
      register: "रजिस्टर",

      submit: "सबमिट करें",
      cancel: "रद्द करें",
      search: "खोजें",
      refresh: "रिफ्रेश",
      clear: "साफ करें",
      loading: "लोड हो रहा है...",
      select: "चुनें",

      origin: "प्रस्थान पोर्ट",
      destination: "गंतव्य पोर्ट",

      status: "स्थिति",
      date: "तारीख",
      actions: "कार्रवाई",

      back: "वापस",
      next: "आगे",
      close: "बंद करें",
      save: "सहेजें",
      send: "भेजें",

      language: "भाषा",

      lightMode: "लाइट मोड",
      darkMode: "डार्क मोड",

      noData: "कोई डेटा उपलब्ध नहीं है",
      error: "कुछ गलत हो गया।",
    },

    home: {
      eyebrow:
        "समुद्री ब्रोकरेज",

      title:
        "स्मार्ट नेविगेशन। बेहतर व्यापार।",

      subtitle:
        "Waypoint आपको समुद्री रूट की तुलना करने, परिचालन स्थितियों को समझने और बेहतर शिपिंग निर्णय लेने में मदद करता है।",

      getStarted:
        "शुरू करें",

      exploreRoutes:
        "रूट देखें",

      routePlanning:
        "रूट प्लानिंग",

      routePlanningText:
        "ट्रांजिट समय, दूरी, ट्रांसशिपमेंट और फ्रेट जानकारी के आधार पर उपलब्ध समुद्री रूट की तुलना करें।",

      weatherConditions:
        "मौसम और स्थितियाँ",

      weatherConditionsText:
        "वर्तमान मौसम, पूर्वानुमान और परिचालन जोखिम देखें।",

      connectedPorts:
        "कनेक्टेड पोर्ट्स",

      connectedPortsText:
        "चयनित प्रस्थान पोर्ट से जुड़े गंतव्यों को देखें।",

      requestQuotation:
        "कोटेशन का अनुरोध",

      requestQuotationText:
        "कोटेशन के लिए अपना कार्गो और कंपनी विवरण जमा करें।",

      operationsDashboard:
        "ऑपरेशंस डैशबोर्ड",

      operationsDashboardText:
        "रूट खोज, कोटेशन, पोर्ट और परिचालन आँकड़ों की समीक्षा करें।",
    },

    routePlanner: {
      eyebrow:
        "रूट प्लानर",

      title:
        "अपना समुद्री रूट खोजें",

      subtitle:
        "सभी उपलब्ध रूट की तुलना करने के लिए शिपमेंट विवरण दर्ज करें।",

      loadPort:
        "लोड पोर्ट",

      dischargePort:
        "डिस्चार्ज पोर्ट",

      cargoType:
        "कार्गो प्रकार",

      containers:
        "कंटेनर (TEU)",

      plotRoute:
        "रूट प्लॉट करें",

      analyzing:
        "रूट का विश्लेषण हो रहा है...",

      selectOrigin:
        "प्रस्थान पोर्ट चुनें",

      selectDestination:
        "गंतव्य पोर्ट चुनें",

      routeFound:
        "रूट मिला",

      routeNotFound:
        "कोई रूट नहीं मिला",
    },

    routes: {
      title:
        "उपलब्ध रूट",

      bestRoute:
        "सर्वश्रेष्ठ रूट",

      recommended:
        "अनुशंसित",

      availableRoutes:
        "उपलब्ध रूट",

      routeId:
        "रूट आईडी",

      transitTime:
        "ट्रांजिट समय",

      distance:
        "दूरी",

      transshipments:
        "ट्रांसशिपमेंट",

      freight:
        "बेस फ्रेट",

      estimatedTotal:
        "अनुमानित कुल",

      score:
        "स्कोर",

      routeType:
        "रूट प्रकार",

      selectRoute:
        "रूट चुनें",

      requestQuotation:
        "कोटेशन का अनुरोध करें",

      noRoutes:
        "इस खोज के लिए कोई उपलब्ध रूट नहीं है।",

      days:
        "दिन",

      nauticalMiles:
        "NM",
    },

    weather: {
      eyebrow:
        "मौसम और स्थितियाँ",

      title:
        "समुद्री मौसम",

      subtitle:
        "अपने रूट के लिए वर्तमान स्थितियों और पूर्वानुमान की समीक्षा करें।",

      originWeather:
        "प्रस्थान पोर्ट का मौसम",

      destinationWeather:
        "गंतव्य पोर्ट का मौसम",

      temperature:
        "तापमान",

      feelsLike:
        "महसूस होने वाला तापमान",

      humidity:
        "नमी",

      pressure:
        "दबाव",

      wind:
        "हवा",

      windDirection:
        "हवा की दिशा",

      visibility:
        "दृश्यता",

      condition:
        "स्थिति",

      precipitation:
        "वर्षण",

      rainProbability:
        "बारिश की संभावना",

      forecast:
        "पूर्वानुमान",

      weatherRisk:
        "मौसम जोखिम",

      low:
        "कम",

      moderate:
        "मध्यम",

      high:
        "उच्च",

      warnings:
        "चेतावनियाँ",

      operationalInstructions:
        "परिचालन निर्देश",

      selectLocation:
        "स्थान चुनें",

      loadingWeather:
        "मौसम लोड हो रहा है...",

      weatherUnavailable:
        "मौसम की जानकारी उपलब्ध नहीं है।",
    },

    ports: {
      eyebrow:
        "पोर्ट नेटवर्क",

      title:
        "कनेक्टेड पोर्ट्स",

      subtitle:
        "अपने चुने हुए प्रस्थान पोर्ट से जुड़े गंतव्यों को देखें।",

      selectOrigin:
        "प्रस्थान पोर्ट चुनें",

      connectedDestination:
        "कनेक्टेड गंतव्य",

      availableRoute:
        "उपलब्ध रूट",

      availableRoutes:
        "उपलब्ध रूट",

      totalRoutes:
        "कुल रूट",

      noConnections:
        "कोई कनेक्टेड गंतव्य नहीं मिला।",
    },

    quotation: {
      eyebrow:
        "वाणिज्यिक अनुरोध",

      title:
        "कोटेशन का अनुरोध करें",

      subtitle:
        "कोटेशन अनुरोध जमा करने के लिए कंपनी और कार्गो विवरण दें।",

      companyName:
        "कंपनी का नाम",

      email:
        "ईमेल",

      phone:
        "फोन",

      cargoWeight:
        "कार्गो वजन",

      containers:
        "कंटेनर",

      specialRequirements:
        "विशेष आवश्यकताएँ",

      submitQuotation:
        "कोटेशन जमा करें",

      pending:
        "लंबित",

      approved:
        "स्वीकृत",

      rejected:
        "अस्वीकृत",

      quotationSubmitted:
        "कोटेशन सफलतापूर्वक जमा किया गया।",

      noQuotations:
        "कोई कोटेशन अनुरोध नहीं मिला।",

      recentRequests:
        "हाल के अनुरोध",
    },

    history: {
      eyebrow:
        "खोज रिकॉर्ड",

      title:
        "खोज इतिहास",

      subtitle:
        "अपने पिछले समुद्री रूट खोजों की समीक्षा करें।",

      searchedRoute:
        "खोजा गया रूट",

      searchedAt:
        "खोज का समय",

      viewRoute:
        "रूट देखें",

      noHistory:
        "कोई खोज इतिहास उपलब्ध नहीं है।",
    },

    dashboard: {
      eyebrow:
        "ऑपरेशंस",

      title:
        "ऑपरेशंस डैशबोर्ड",

      subtitle:
        "रूट गतिविधि, कोटेशन, पोर्ट और परिचालन संकेतकों की निगरानी करें।",

      routeSearches:
        "रूट खोज",

      availableRoutes:
        "उपलब्ध रूट",

      bestRoutes:
        "सर्वश्रेष्ठ रूट",

      connectedPorts:
        "कनेक्टेड पोर्ट्स",

      quotationRequests:
        "कोटेशन अनुरोध",

      mostSearchedRoute:
        "सबसे अधिक खोजा गया रूट",

      averageTransit:
        "औसत ट्रांजिट",

      averageDistance:
        "औसत दूरी",

      recentSearches:
        "हाल की खोज",

      weatherAlerts:
        "मौसम अलर्ट",

      operationalOverview:
        "परिचालन अवलोकन",
    },

    ai: {
      title:
        "Waypoint AI",

      online:
        "लोकल असिस्टेंट · ऑनलाइन",

      offline:
        "लोकल असिस्टेंट · ऑफलाइन",

      placeholder:
        "Waypoint AI से पूछें...",

      tryAsking:
        "यह पूछकर देखें",

      askAboutRoute:
        "इस रूट के बारे में पूछें",

      askAboutWeather:
        "इस मौसम के बारे में पूछें",

      clearChat:
        "बातचीत साफ करें",

      closeChat:
        "Waypoint AI बंद करें",

      greeting:
        "नमस्ते! 👋 मैं Waypoint AI हूँ। मैं Waypoint, समुद्री अवधारणाओं, रूट, मौसम, पोर्ट और कोटेशन को समझने में आपकी मदद कर सकता हूँ।",

      chatCleared:
        "चैट साफ कर दी गई। 👋\n\nWaypoint में मैं आपकी कैसे मदद कर सकता हूँ?",

      localData:
        "Waypoint AI उपलब्ध होने पर वास्तविक एप्लिकेशन डेटा का उपयोग करता है।",
    },
  },

  // ==========================================================
  // TAMIL
  // ==========================================================

  ta: {
    common: {
      home: "முகப்பு",
      plotRoute: "வழித்தடத்தைத் திட்டமிடு",
      routeResults: "வழித்தட முடிவுகள்",
      history: "வரலாறு",
      connectedPorts: "இணைக்கப்பட்ட துறைமுகங்கள்",
      weather: "வானிலை மற்றும் நிலைமைகள்",
      quotation: "மேற்கோள் கோரிக்கை",
      dashboard: "செயல்பாட்டு டாஷ்போர்டு",

      logout: "வெளியேறு",
      login: "உள்நுழை",
      register: "பதிவு செய்",

      submit: "சமர்ப்பி",
      cancel: "ரத்து செய்",
      search: "தேடு",
      refresh: "புதுப்பி",
      clear: "அழி",
      loading: "ஏற்றப்படுகிறது...",
      select: "தேர்ந்தெடு",

      origin: "புறப்படும் துறைமுகம்",
      destination: "இலக்கு துறைமுகம்",

      status: "நிலை",
      date: "தேதி",
      actions: "செயல்கள்",

      back: "பின்",
      next: "அடுத்து",
      close: "மூடு",
      save: "சேமி",
      send: "அனுப்பு",

      language: "மொழி",

      lightMode: "லைட் மோடு",
      darkMode: "டார்க் மோடு",

      noData: "தரவு இல்லை",
      error: "ஏதோ தவறு ஏற்பட்டது.",
    },

    home: {
      eyebrow:
        "கடல் சரக்கு தரகு",

      title:
        "சிறந்த வழிசெலுத்தல். சிறந்த வர்த்தகம்.",

      subtitle:
        "Waypoint கடல் வழித்தடங்களை ஒப்பிடவும், செயல்பாட்டு நிலைமைகளைப் புரிந்துகொள்ளவும், சிறந்த கப்பல் போக்குவரத்து முடிவுகளை எடுக்கவும் உதவுகிறது.",

      getStarted:
        "தொடங்குங்கள்",

      exploreRoutes:
        "வழித்தடங்களைப் பார்க்கவும்",

      routePlanning:
        "வழித்தட திட்டமிடல்",

      routePlanningText:
        "பயண நேரம், தூரம், இடமாற்றங்கள் மற்றும் சரக்கு கட்டணத் தகவல்களைப் பயன்படுத்தி கிடைக்கும் கடல் வழித்தடங்களை ஒப்பிடுங்கள்.",

      weatherConditions:
        "வானிலை மற்றும் நிலைமைகள்",

      weatherConditionsText:
        "தற்போதைய வானிலை, முன்னறிவிப்பு மற்றும் செயல்பாட்டு அபாயத்தைப் பார்க்கவும்.",

      connectedPorts:
        "இணைக்கப்பட்ட துறைமுகங்கள்",

      connectedPortsText:
        "தேர்ந்தெடுக்கப்பட்ட புறப்படும் துறைமுகத்துடன் இணைக்கப்பட்ட இலக்குகளைப் பார்க்கவும்.",

      requestQuotation:
        "மேற்கோள் கோரிக்கை",

      requestQuotationText:
        "மேற்கோளுக்காக உங்கள் சரக்கு மற்றும் நிறுவனத் தகவல்களைச் சமர்ப்பிக்கவும்.",

      operationsDashboard:
        "செயல்பாட்டு டாஷ்போர்டு",

      operationsDashboardText:
        "வழித்தட தேடல்கள், மேற்கோள்கள், துறைமுகங்கள் மற்றும் செயல்பாட்டு புள்ளிவிவரங்களைப் பார்க்கவும்.",
    },

    routePlanner: {
      eyebrow:
        "வழித்தட திட்டமிடல்",

      title:
        "உங்கள் கடல் வழித்தடத்தைக் கண்டறியவும்",

      subtitle:
        "கிடைக்கும் அனைத்து வழித்தடங்களையும் ஒப்பிட உங்கள் சரக்கு விவரங்களை உள்ளிடவும்.",

      loadPort:
        "சரக்கு ஏற்றும் துறைமுகம்",

      dischargePort:
        "சரக்கு இறக்கும் துறைமுகம்",

      cargoType:
        "சரக்கு வகை",

      containers:
        "கண்டெய்னர்கள் (TEU)",

      plotRoute:
        "வழித்தடத்தைத் திட்டமிடு",

      analyzing:
        "வழித்தடம் பகுப்பாய்வு செய்யப்படுகிறது...",

      selectOrigin:
        "புறப்படும் துறைமுகத்தைத் தேர்ந்தெடுக்கவும்",

      selectDestination:
        "இலக்கு துறைமுகத்தைத் தேர்ந்தெடுக்கவும்",

      routeFound:
        "வழித்தடம் கிடைத்தது",

      routeNotFound:
        "வழித்தடம் கிடைக்கவில்லை",
    },

    routes: {
      title:
        "கிடைக்கும் வழித்தடங்கள்",

      bestRoute:
        "சிறந்த வழித்தடம்",

      recommended:
        "பரிந்துரைக்கப்பட்டது",

      availableRoutes:
        "கிடைக்கும் வழித்தடங்கள்",

      routeId:
        "வழித்தட ID",

      transitTime:
        "பயண நேரம்",

      distance:
        "தூரம்",

      transshipments:
        "இடமாற்றங்கள்",

      freight:
        "அடிப்படை சரக்கு கட்டணம்",

      estimatedTotal:
        "மதிப்பிடப்பட்ட மொத்தம்",

      score:
        "மதிப்பெண்",

      routeType:
        "வழித்தட வகை",

      selectRoute:
        "வழித்தடத்தைத் தேர்ந்தெடு",

      requestQuotation:
        "மேற்கோள் கோரிக்கை",

      noRoutes:
        "இந்த தேடலுக்கு வழித்தடங்கள் இல்லை.",

      days:
        "நாட்கள்",

      nauticalMiles:
        "NM",
    },

    weather: {
      eyebrow:
        "வானிலை மற்றும் நிலைமைகள்",

      title:
        "கடல் வானிலை",

      subtitle:
        "உங்கள் வழித்தடத்திற்கான தற்போதைய நிலைமைகள் மற்றும் முன்னறிவிப்பைப் பார்க்கவும்.",

      originWeather:
        "புறப்படும் துறைமுக வானிலை",

      destinationWeather:
        "இலக்கு துறைமுக வானிலை",

      temperature:
        "வெப்பநிலை",

      feelsLike:
        "உணரப்படும் வெப்பநிலை",

      humidity:
        "ஈரப்பதம்",

      pressure:
        "அழுத்தம்",

      wind:
        "காற்று",

      windDirection:
        "காற்றின் திசை",

      visibility:
        "தெரிவுத்திறன்",

      condition:
        "நிலை",

      precipitation:
        "மழைப்பொழிவு",

      rainProbability:
        "மழை வாய்ப்பு",

      forecast:
        "முன்னறிவிப்பு",

      weatherRisk:
        "வானிலை அபாயம்",

      low:
        "குறைவு",

      moderate:
        "மிதமான",

      high:
        "அதிகம்",

      warnings:
        "எச்சரிக்கைகள்",

      operationalInstructions:
        "செயல்பாட்டு வழிமுறைகள்",

      selectLocation:
        "இடத்தைத் தேர்ந்தெடுக்கவும்",

      loadingWeather:
        "வானிலை ஏற்றப்படுகிறது...",

      weatherUnavailable:
        "வானிலை தகவல் கிடைக்கவில்லை.",
    },

    ports: {
      eyebrow:
        "துறைமுக வலையமைப்பு",

      title:
        "இணைக்கப்பட்ட துறைமுகங்கள்",

      subtitle:
        "தேர்ந்தெடுக்கப்பட்ட புறப்படும் துறைமுகத்துடன் இணைக்கப்பட்ட இலக்குகளைப் பார்க்கவும்.",

      selectOrigin:
        "புறப்படும் துறைமுகத்தைத் தேர்ந்தெடுக்கவும்",

      connectedDestination:
        "இணைக்கப்பட்ட இலக்கு",

      availableRoute:
        "கிடைக்கும் வழித்தடம்",

      availableRoutes:
        "கிடைக்கும் வழித்தடங்கள்",

      totalRoutes:
        "மொத்த வழித்தடங்கள்",

      noConnections:
        "இணைக்கப்பட்ட இலக்குகள் எதுவும் கிடைக்கவில்லை.",
    },

    quotation: {
      eyebrow:
        "வணிக கோரிக்கை",

      title:
        "மேற்கோள் கோரிக்கை",

      subtitle:
        "மேற்கோள் கோரிக்கையைச் சமர்ப்பிக்க உங்கள் நிறுவனம் மற்றும் சரக்கு விவரங்களை வழங்கவும்.",

      companyName:
        "நிறுவனத்தின் பெயர்",

      email:
        "மின்னஞ்சல்",

      phone:
        "தொலைபேசி",

      cargoWeight:
        "சரக்கு எடை",

      containers:
        "கண்டெய்னர்கள்",

      specialRequirements:
        "சிறப்பு தேவைகள்",

      submitQuotation:
        "மேற்கோளைச் சமர்ப்பி",

      pending:
        "நிலுவையில்",

      approved:
        "அங்கீகரிக்கப்பட்டது",

      rejected:
        "நிராகரிக்கப்பட்டது",

      quotationSubmitted:
        "மேற்கோள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.",

      noQuotations:
        "மேற்கோள் கோரிக்கைகள் எதுவும் இல்லை.",

      recentRequests:
        "சமீபத்திய கோரிக்கைகள்",
    },

    history: {
      eyebrow:
        "தேடல் பதிவுகள்",

      title:
        "தேடல் வரலாறு",

      subtitle:
        "உங்கள் முந்தைய கடல் வழித்தட தேடல்களைப் பார்க்கவும்.",

      searchedRoute:
        "தேடிய வழித்தடம்",

      searchedAt:
        "தேடிய நேரம்",

      viewRoute:
        "வழித்தடத்தைப் பார்க்கவும்",

      noHistory:
        "தேடல் வரலாறு இல்லை.",
    },

    dashboard: {
      eyebrow:
        "செயல்பாடுகள்",

      title:
        "செயல்பாட்டு டாஷ்போர்டு",

      subtitle:
        "வழித்தட செயல்பாடு, மேற்கோள்கள், துறைமுகங்கள் மற்றும் செயல்பாட்டு குறிகாட்டிகளை கண்காணிக்கவும்.",

      routeSearches:
        "வழித்தட தேடல்கள்",

      availableRoutes:
        "கிடைக்கும் வழித்தடங்கள்",

      bestRoutes:
        "சிறந்த வழித்தடங்கள்",

      connectedPorts:
        "இணைக்கப்பட்ட துறைமுகங்கள்",

      quotationRequests:
        "மேற்கோள் கோரிக்கைகள்",

      mostSearchedRoute:
        "அதிகம் தேடப்பட்ட வழித்தடம்",

      averageTransit:
        "சராசரி பயண நேரம்",

      averageDistance:
        "சராசரி தூரம்",

      recentSearches:
        "சமீபத்திய தேடல்கள்",

      weatherAlerts:
        "வானிலை எச்சரிக்கைகள்",

      operationalOverview:
        "செயல்பாட்டு மேலோட்டம்",
    },

    ai: {
      title:
        "Waypoint AI",

      online:
        "உள்ளூர் உதவியாளர் · ஆன்லைன்",

      offline:
        "உள்ளூர் உதவியாளர் · ஆஃப்லைன்",

      placeholder:
        "Waypoint AI-யிடம் கேளுங்கள்...",

      tryAsking:
        "இதை கேட்கலாம்",

      askAboutRoute:
        "இந்த வழித்தடத்தைப் பற்றி கேளுங்கள்",

      askAboutWeather:
        "இந்த வானிலையைப் பற்றி கேளுங்கள்",

      clearChat:
        "உரையாடலை அழி",

      closeChat:
        "Waypoint AI-யை மூடு",

      greeting:
        "வணக்கம்! 👋 நான் Waypoint AI. Waypoint, கடல் கருத்துகள், வழித்தடங்கள், வானிலை, துறைமுகங்கள் மற்றும் மேற்கோள்களைப் புரிந்துகொள்ள உதவுகிறேன்.",

      chatCleared:
        "உரையாடல் அழிக்கப்பட்டது. 👋\n\nWaypoint-ல் நான் எப்படி உதவலாம்?",

      localData:
        "கிடைக்கும் போது Waypoint AI உண்மையான பயன்பாட்டுத் தரவைப் பயன்படுத்துகிறது.",
    },
  },

  // ==========================================================
  // TELUGU
  // ==========================================================

  te: {
    common: {
      home: "హోమ్",
      plotRoute: "రూట్ ప్లాన్",
      routeResults: "రూట్ ఫలితాలు",
      history: "చరిత్ర",
      connectedPorts: "కనెక్టెడ్ పోర్ట్స్",
      weather: "వాతావరణం & పరిస్థితులు",
      quotation: "కొటేషన్ అభ్యర్థన",
      dashboard: "ఆపరేషన్స్ డ్యాష్‌బోర్డ్",

      logout: "లాగ్ అవుట్",
      login: "లాగిన్",
      register: "రిజిస్టర్",

      submit: "సమర్పించండి",
      cancel: "రద్దు చేయండి",
      search: "శోధించండి",
      refresh: "రిఫ్రెష్",
      clear: "క్లియర్",
      loading: "లోడ్ అవుతోంది...",
      select: "ఎంచుకోండి",

      origin: "ప్రారంభ పోర్ట్",
      destination: "గమ్యస్థాన పోర్ట్",

      status: "స్థితి",
      date: "తేదీ",
      actions: "చర్యలు",

      back: "వెనుకకు",
      next: "తదుపరి",
      close: "మూసివేయండి",
      save: "సేవ్ చేయండి",
      send: "పంపండి",

      language: "భాష",

      lightMode: "లైట్ మోడ్",
      darkMode: "డార్క్ మోడ్",

      noData: "డేటా అందుబాటులో లేదు",
      error: "ఏదో తప్పు జరిగింది.",
    },

    home: {
      eyebrow:
        "మారిటైమ్ బ్రోకరేజ్",

      title:
        "స్మార్ట్ నావిగేషన్. మెరుగైన వాణిజ్యం.",

      subtitle:
        "Waypoint సముద్ర మార్గాలను పోల్చి, ఆపరేషనల్ పరిస్థితులను అర్థం చేసుకుని, మెరుగైన షిప్పింగ్ నిర్ణయాలు తీసుకోవడంలో సహాయపడుతుంది.",

      getStarted:
        "ప్రారంభించండి",

      exploreRoutes:
        "రూట్లను చూడండి",

      routePlanning:
        "రూట్ ప్లానింగ్",

      routePlanningText:
        "ట్రాన్సిట్ సమయం, దూరం, ట్రాన్స్‌షిప్‌మెంట్లు మరియు ఫ్రైట్ సమాచారంతో అందుబాటులో ఉన్న సముద్ర మార్గాలను పోల్చండి.",

      weatherConditions:
        "వాతావరణం & పరిస్థితులు",

      weatherConditionsText:
        "ప్రస్తుత వాతావరణం, అంచనా మరియు ఆపరేషనల్ రిస్క్‌ను చూడండి.",

      connectedPorts:
        "కనెక్టెడ్ పోర్ట్స్",

      connectedPortsText:
        "ఎంచుకున్న ప్రారంభ పోర్ట్‌కు కనెక్ట్ అయిన గమ్యస్థానాలను చూడండి.",

      requestQuotation:
        "కొటేషన్ అభ్యర్థన",

      requestQuotationText:
        "కొటేషన్ కోసం మీ కార్గో మరియు కంపెనీ వివరాలను సమర్పించండి.",

      operationsDashboard:
        "ఆపరేషన్స్ డ్యాష్‌బోర్డ్",

      operationsDashboardText:
        "రూట్ శోధనలు, కొటేషన్లు, పోర్టులు మరియు ఆపరేషనల్ గణాంకాలను చూడండి.",
    },

    routePlanner: {
      eyebrow:
        "రూట్ ప్లానర్",

      title:
        "మీ సముద్ర మార్గాన్ని కనుగొనండి",

      subtitle:
        "అందుబాటులో ఉన్న అన్ని మార్గాలను పోల్చడానికి షిప్‌మెంట్ వివరాలను నమోదు చేయండి.",

      loadPort:
        "లోడ్ పోర్ట్",

      dischargePort:
        "డిశ్చార్జ్ పోర్ట్",

      cargoType:
        "కార్గో రకం",

      containers:
        "కంటైనర్లు (TEU)",

      plotRoute:
        "రూట్ ప్లాన్ చేయండి",

      analyzing:
        "రూట్ విశ్లేషణ జరుగుతోంది...",

      selectOrigin:
        "ప్రారంభ పోర్ట్ ఎంచుకోండి",

      selectDestination:
        "గమ్యస్థాన పోర్ట్ ఎంచుకోండి",

      routeFound:
        "రూట్ కనుగొనబడింది",

      routeNotFound:
        "రూట్ కనుగొనబడలేదు",
    },

    routes: {
      title:
        "అందుబాటులో ఉన్న రూట్లు",

      bestRoute:
        "ఉత్తమ రూట్",

      recommended:
        "సిఫార్సు చేయబడింది",

      availableRoutes:
        "అందుబాటులో ఉన్న రూట్లు",

      routeId:
        "రూట్ ID",

      transitTime:
        "ట్రాన్సిట్ సమయం",

      distance:
        "దూరం",

      transshipments:
        "ట్రాన్స్‌షిప్‌మెంట్లు",

      freight:
        "బేస్ ఫ్రైట్",

      estimatedTotal:
        "అంచనా మొత్తం",

      score:
        "స్కోర్",

      routeType:
        "రూట్ రకం",

      selectRoute:
        "రూట్ ఎంచుకోండి",

      requestQuotation:
        "కొటేషన్ అభ్యర్థన",

      noRoutes:
        "ఈ శోధనకు రూట్లు అందుబాటులో లేవు.",

      days:
        "రోజులు",

      nauticalMiles:
        "NM",
    },

    weather: {
      eyebrow:
        "వాతావరణం & పరిస్థితులు",

      title:
        "సముద్ర వాతావరణం",

      subtitle:
        "మీ రూట్ కోసం ప్రస్తుత పరిస్థితులు మరియు వాతావరణ అంచనాను సమీక్షించండి.",

      originWeather:
        "ప్రారంభ పోర్ట్ వాతావరణం",

      destinationWeather:
        "గమ్యస్థాన పోర్ట్ వాతావరణం",

      temperature:
        "ఉష్ణోగ్రత",

      feelsLike:
        "అనుభూతి ఉష్ణోగ్రత",

      humidity:
        "తేమ",

      pressure:
        "పీడనం",

      wind:
        "గాలి",

      windDirection:
        "గాలి దిశ",

      visibility:
        "దృశ్యమానత",

      condition:
        "పరిస్థితి",

      precipitation:
        "వర్షపాతం",

      rainProbability:
        "వర్షం అవకాశం",

      forecast:
        "అంచనా",

      weatherRisk:
        "వాతావరణ రిస్క్",

      low:
        "తక్కువ",

      moderate:
        "మధ్యస్థ",

      high:
        "అధిక",

      warnings:
        "హెచ్చరికలు",

      operationalInstructions:
        "ఆపరేషనల్ సూచనలు",

      selectLocation:
        "స్థానం ఎంచుకోండి",

      loadingWeather:
        "వాతావరణం లోడ్ అవుతోంది...",

      weatherUnavailable:
        "వాతావరణ సమాచారం అందుబాటులో లేదు.",
    },

    ports: {
      eyebrow:
        "పోర్ట్ నెట్‌వర్క్",

      title:
        "కనెక్టెడ్ పోర్ట్స్",

      subtitle:
        "మీరు ఎంచుకున్న ప్రారంభ పోర్ట్‌కు కనెక్ట్ అయిన గమ్యస్థానాలను చూడండి.",

      selectOrigin:
        "ప్రారంభ పోర్ట్ ఎంచుకోండి",

      connectedDestination:
        "కనెక్టెడ్ గమ్యస్థానం",

      availableRoute:
        "అందుబాటులో ఉన్న రూట్",

      availableRoutes:
        "అందుబాటులో ఉన్న రూట్లు",

      totalRoutes:
        "మొత్తం రూట్లు",

      noConnections:
        "కనెక్టెడ్ గమ్యస్థానాలు కనుగొనబడలేదు.",
    },

    quotation: {
      eyebrow:
        "వాణిజ్య అభ్యర్థన",

      title:
        "కొటేషన్ అభ్యర్థించండి",

      subtitle:
        "కొటేషన్ అభ్యర్థనను సమర్పించడానికి కంపెనీ మరియు కార్గో వివరాలను అందించండి.",

      companyName:
        "కంపెనీ పేరు",

      email:
        "ఇమెయిల్",

      phone:
        "ఫోన్",

      cargoWeight:
        "కార్గో బరువు",

      containers:
        "కంటైనర్లు",

      specialRequirements:
        "ప్రత్యేక అవసరాలు",

      submitQuotation:
        "కొటేషన్ సమర్పించండి",

      pending:
        "పెండింగ్",

      approved:
        "ఆమోదించబడింది",

      rejected:
        "తిరస్కరించబడింది",

      quotationSubmitted:
        "కొటేషన్ విజయవంతంగా సమర్పించబడింది.",

      noQuotations:
        "కొటేషన్ అభ్యర్థనలు కనుగొనబడలేదు.",

      recentRequests:
        "ఇటీవలి అభ్యర్థనలు",
    },

    history: {
      eyebrow:
        "శోధన రికార్డులు",

      title:
        "శోధన చరిత్ర",

      subtitle:
        "మీ గత సముద్ర రూట్ శోధనలను సమీక్షించండి.",

      searchedRoute:
        "శోధించిన రూట్",

      searchedAt:
        "శోధించిన సమయం",

      viewRoute:
        "రూట్ చూడండి",

      noHistory:
        "శోధన చరిత్ర అందుబాటులో లేదు.",
    },

    dashboard: {
      eyebrow:
        "ఆపరేషన్స్",

      title:
        "ఆపరేషన్స్ డ్యాష్‌బోర్డ్",

      subtitle:
        "రూట్ కార్యకలాపాలు, కొటేషన్లు, పోర్టులు మరియు ఆపరేషనల్ సూచికలను పర్యవేక్షించండి.",

      routeSearches:
        "రూట్ శోధనలు",

      availableRoutes:
        "అందుబాటులో ఉన్న రూట్లు",

      bestRoutes:
        "ఉత్తమ రూట్లు",

      connectedPorts:
        "కనెక్టెడ్ పోర్ట్స్",

      quotationRequests:
        "కొటేషన్ అభ్యర్థనలు",

      mostSearchedRoute:
        "ఎక్కువగా శోధించిన రూట్",

      averageTransit:
        "సగటు ట్రాన్సిట్",

      averageDistance:
        "సగటు దూరం",

      recentSearches:
        "ఇటీవలి శోధనలు",

      weatherAlerts:
        "వాతావరణ హెచ్చరికలు",

      operationalOverview:
        "ఆపరేషనల్ అవలోకనం",
    },

    ai: {
      title:
        "Waypoint AI",

      online:
        "లోకల్ అసిస్టెంట్ · ఆన్‌లైన్",

      offline:
        "లోకల్ అసిస్టెంట్ · ఆఫ్‌లైన్",

      placeholder:
        "Waypoint AIని అడగండి...",

      tryAsking:
        "ఇలా అడగండి",

      askAboutRoute:
        "ఈ రూట్ గురించి అడగండి",

      askAboutWeather:
        "ఈ వాతావరణం గురించి అడగండి",

      clearChat:
        "చాట్ క్లియర్ చేయండి",

      closeChat:
        "Waypoint AI మూసివేయండి",

      greeting:
        "నమస్కారం! 👋 నేను Waypoint AI. Waypoint, సముద్ర భావనలు, రూట్లు, వాతావరణం, పోర్టులు మరియు కొటేషన్లను అర్థం చేసుకోవడంలో సహాయపడగలను.",

      chatCleared:
        "చాట్ క్లియర్ చేయబడింది. 👋\n\nWaypointలో నేను ఎలా సహాయపడగలను?",

      localData:
        "అందుబాటులో ఉన్నప్పుడు Waypoint AI నిజమైన అప్లికేషన్ డేటాను ఉపయోగిస్తుంది.",
    },
  },
};

// ============================================================
// GET TRANSLATION
//
// Example:
//
// t("common.home")
// t("routes.bestRoute")
// t("weather.temperature")
// ============================================================

export function getTranslation(
  language,
  key
) {
  const languageData =
    translations[language] ||
    translations[DEFAULT_LANGUAGE];

  const englishData =
    translations[DEFAULT_LANGUAGE];

  const getValue = (
    source,
    path
  ) => {
    return path
      .split(".")
      .reduce(
        (
          value,
          part
        ) => value?.[part],
        source
      );
  };

  const value =
    getValue(
      languageData,
      key
    );

  if (
    value !== undefined &&
    value !== null
  ) {
    return value;
  }

  const fallback =
    getValue(
      englishData,
      key
    );

  if (
    fallback !== undefined &&
    fallback !== null
  ) {
    return fallback;
  }

  return key;
}

// ============================================================
// LANGUAGE STORAGE
// ============================================================

export const LANGUAGE_STORAGE_KEY =
  "waypoint_language";

// ============================================================
// GET SAVED LANGUAGE
// ============================================================

export function getSavedLanguage() {

  const saved =
    localStorage.getItem(
      LANGUAGE_STORAGE_KEY
    );

  const supported =
    LANGUAGES.some(
      (
        language
      ) =>
        language.code ===
        saved
    );

  return supported
    ? saved
    : DEFAULT_LANGUAGE;
}

// ============================================================
// SAVE LANGUAGE
// ============================================================

export function saveLanguage(
  language
) {

  const supported =
    LANGUAGES.some(
      (
        item
      ) =>
        item.code ===
        language
    );

  if (!supported) {
    return;
  }

  localStorage.setItem(
    LANGUAGE_STORAGE_KEY,
    language
  );

  window.dispatchEvent(
    new CustomEvent(
      "waypoint-language-changed",
      {
        detail: {
          language,
        },
      }
    )
  );
}