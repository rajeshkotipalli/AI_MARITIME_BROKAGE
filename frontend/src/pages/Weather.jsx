import { useEffect, useState } from "react";

import {
  ORIGIN_PORTS,
  DEST_PORTS,
} from "../data/ports";

import "./Weather.css";


const API_BASE_URL = "http://127.0.0.1:8000";


function Weather() {

  const [origin, setOrigin] =
    useState(
      ORIGIN_PORTS[0] ||
      "Chennai"
    );

  const [destination, setDestination] =
    useState(
      DEST_PORTS[0] ||
      "Rotterdam"
    );

  const [originWeather, setOriginWeather] =
    useState(null);

  const [destinationWeather, setDestinationWeather] =
    useState(null);

  const [originForecast, setOriginForecast] =
    useState([]);

  const [destinationForecast, setDestinationForecast] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // -------------------------------------------------
  // FETCH WEATHER
  // -------------------------------------------------

  useEffect(() => {

    async function loadWeather() {

      if (!origin || !destination) {
        return;
      }

      setLoading(true);
      setError("");

      try {

        const [
          originResponse,
          destinationResponse
        ] = await Promise.all([

          fetch(
            `${API_BASE_URL}/api/weather?location=${encodeURIComponent(origin)}`
          ),

          fetch(
            `${API_BASE_URL}/api/weather?location=${encodeURIComponent(destination)}`
          )

        ]);


        if (
          !originResponse.ok ||
          !destinationResponse.ok
        ) {

          throw new Error(
            "Weather service returned an error."
          );

        }


        const originData =
          await originResponse.json();

        const destinationData =
          await destinationResponse.json();


        setOriginWeather(
          originData.current || originData
        );

        setDestinationWeather(
          destinationData.current ||
          destinationData
        );


        setOriginForecast(
          originData.forecast ||
          []
        );

        setDestinationForecast(
          destinationData.forecast ||
          []
        );


      } catch (err) {

        console.error(
          "Weather loading error:",
          err
        );

        setError(
          "Unable to load weather information. Please make sure the weather API is running."
        );

        setOriginWeather(null);
        setDestinationWeather(null);

        setOriginForecast([]);
        setDestinationForecast([]);

        try {
          localStorage.removeItem(
            "waypoint_ai_weather_context"
          );

          window.dispatchEvent(
            new CustomEvent(
              "waypoint-ai-weather-updated"
            )
          );
        } catch {
          // Ignore local context cleanup errors.
        }

      } finally {

        setLoading(false);

      }

    }


    loadWeather();

  }, [origin, destination]);


  // -------------------------------------------------
  // WEATHER RISK
  // -------------------------------------------------

  const getWeatherRisk =
    (weather) => {

      if (!weather) {
        return {
          level: "Unavailable",
          description:
            "Weather information is currently unavailable."
        };
      }


      const rain =
        Number(
          weather.rain_probability ||
          weather.pop ||
          0
        );

      const wind =
        Number(
          weather.wind_speed ||
          0
        );


      if (
        rain >= 70 ||
        wind >= 45
      ) {

        return {
          level: "High",
          description:
            "Severe weather conditions may affect operations."
        };

      }


      if (
        rain >= 40 ||
        wind >= 25
      ) {

        return {
          level: "Moderate",
          description:
            "Weather conditions should be monitored before shipment."
        };

      }


      return {
        level: "Low",
        description:
          "Weather conditions appear relatively favorable."
      };

    };


  const originRisk =
    getWeatherRisk(
      originWeather
    );

  const destinationRisk =
    getWeatherRisk(
      destinationWeather
    );


  // -------------------------------------------------
  // SHARE REAL WEATHER DATA WITH WAYPOINT AI
  // -------------------------------------------------

  useEffect(() => {

    if (
      !originWeather &&
      !destinationWeather
    ) {
      return;
    }

    const weatherContext = {

      origin,

      destination,

      originWeather,

      destinationWeather,

      originRisk,

      destinationRisk,

      originForecast,

      destinationForecast,

      updatedAt:
        new Date().toISOString()

    };

    try {

      localStorage.setItem(
        "waypoint_ai_weather_context",
        JSON.stringify(
          weatherContext
        )
      );

      window.dispatchEvent(
        new CustomEvent(
          "waypoint-ai-weather-updated"
        )
      );

    } catch (error) {

      console.warn(
        "Unable to save weather context for Waypoint AI:",
        error
      );

    }

  }, [
    origin,
    destination,
    originWeather,
    destinationWeather,
    originRisk,
    destinationRisk,
    originForecast,
    destinationForecast
  ]);


  // -------------------------------------------------
  // WEATHER ICON
  // -------------------------------------------------

  const getWeatherIcon =
    (condition = "") => {

      const text =
        condition
          .toLowerCase();

      if (
        text.includes("thunder")
      ) {
        return "⛈️";
      }

      if (
        text.includes("rain")
      ) {
        return "🌧️";
      }

      if (
        text.includes("drizzle")
      ) {
        return "🌦️";
      }

      if (
        text.includes("cloud")
      ) {
        return "☁️";
      }

      if (
        text.includes("snow")
      ) {
        return "❄️";
      }

      if (
        text.includes("mist") ||
        text.includes("fog")
      ) {
        return "🌫️";
      }

      return "☀️";
    };


  // -------------------------------------------------
  // WEATHER VALUE HELPERS
  // -------------------------------------------------

  const temperature =
    (weather) =>
      weather?.temperature ??
      weather?.temp ??
      "--";


  const feelsLike =
    (weather) =>
      weather?.feels_like ??
      "--";


  const humidity =
    (weather) =>
      weather?.humidity ??
      "--";


  const windSpeed =
    (weather) =>
      weather?.wind_speed ??
      weather?.wind ??
      "--";


  const windDirection =
    (weather) =>
      weather?.wind_direction ??
      "--";


  const pressure =
    (weather) =>
      weather?.pressure ??
      "--";


  const visibility =
    (weather) =>
      weather?.visibility ??
      "--";


  const rainProbability =
    (weather) =>
      weather?.rain_probability ??
      weather?.pop ??
      "--";


  const condition =
    (weather) =>
      weather?.condition ??
      weather?.description ??
      "Weather unavailable";


  // -------------------------------------------------
  // FORECAST CARD
  // -------------------------------------------------

  const ForecastCards =
    ({
      forecast
    }) => {

      if (
        !forecast ||
        forecast.length === 0
      ) {

        return (

          <div className="wp-weather-empty">

            Forecast data unavailable.

          </div>

        );

      }


      return (

        <div className="wp-weather-forecast-grid">

          {forecast
            .slice(0, 5)
            .map(
              (day, index) => (

                <div
                  className="wp-weather-day"
                  key={index}
                >

                  <div className="wp-weather-day-name">

                    {day.day ||
                      day.date ||
                      `Day ${index + 1}`}

                  </div>


                  <div className="wp-weather-day-icon">

                    {getWeatherIcon(
                      day.condition ||
                      day.description ||
                      ""
                    )}

                  </div>


                  <div className="wp-weather-day-temp">

                    {day.temperature ??
                      day.temp ??
                      "--"}°C

                  </div>


                  <div className="wp-weather-day-rain">

                    🌧️{" "}

                    {day.rain_probability ??
                      day.pop ??
                      "--"}%

                  </div>

                </div>

              )
            )}

        </div>

      );

    };


  // -------------------------------------------------
  // WEATHER LOCATION CARD
  // -------------------------------------------------

  const WeatherLocationCard =
    ({
      title,
      weather,
      risk
    }) => {

      return (

        <div className="wp-weather-location-card">

          <div className="wp-weather-location-header">

            <div>

              <span className="wp-weather-label">
                LOCATION
              </span>

              <h2>
                {title}
              </h2>

            </div>


            <div className="wp-weather-main-icon">

              {getWeatherIcon(
                condition(weather)
              )}

            </div>

          </div>


          <div className="wp-weather-main">

            <div>

              <div className="wp-weather-temperature">

                {temperature(weather)}
                °C

              </div>

              <p>

                {condition(weather)}

              </p>

            </div>


            <div className="wp-weather-risk">

              <span>
                Weather risk
              </span>

              <strong>
                {risk.level}
              </strong>

            </div>

          </div>


          <div className="wp-weather-metrics">

            <div className="wp-weather-metric">

              <span className="metric-icon">
                🌧️
              </span>

              <div>

                <small>
                  Rain probability
                </small>

                <strong>
                  {rainProbability(weather)}
                  {rainProbability(weather) !== "--"
                    ? "%"
                    : ""}
                </strong>

              </div>

            </div>


            <div className="wp-weather-metric">

              <span className="metric-icon">
                💨
              </span>

              <div>

                <small>
                  Wind speed
                </small>

                <strong>
                  {windSpeed(weather)}
                  {windSpeed(weather) !== "--"
                    ? " km/h"
                    : ""}
                </strong>

              </div>

            </div>


            <div className="wp-weather-metric">

              <span className="metric-icon">
                💧
              </span>

              <div>

                <small>
                  Humidity
                </small>

                <strong>
                  {humidity(weather)}
                  {humidity(weather) !== "--"
                    ? "%"
                    : ""}
                </strong>

              </div>

            </div>


            <div className="wp-weather-metric">

              <span className="metric-icon">
                🧭
              </span>

              <div>

                <small>
                  Wind direction
                </small>

                <strong>
                  {windDirection(weather)}
                </strong>

              </div>

            </div>


            <div className="wp-weather-metric">

              <span className="metric-icon">
                🌡️
              </span>

              <div>

                <small>
                  Feels like
                </small>

                <strong>
                  {feelsLike(weather)}
                  {feelsLike(weather) !== "--"
                    ? "°C"
                    : ""}
                </strong>

              </div>

            </div>


            <div className="wp-weather-metric">

              <span className="metric-icon">
                🧭
              </span>

              <div>

                <small>
                  Pressure
                </small>

                <strong>
                  {pressure(weather)}
                  {pressure(weather) !== "--"
                    ? " hPa"
                    : ""}
                </strong>

              </div>

            </div>


            <div className="wp-weather-metric">

              <span className="metric-icon">
                👁️
              </span>

              <div>

                <small>
                  Visibility
                </small>

                <strong>
                  {visibility(weather)}
                </strong>

              </div>

            </div>

          </div>


          <div className="wp-weather-advice">

            <span>
              ⚠️
            </span>

            <p>
              {risk.description}
            </p>

          </div>

        </div>

      );

    };


  // -------------------------------------------------
  // MAIN UI
  // -------------------------------------------------

  return (

    <main className="wp-page wp-weather-page wp-weather-cinematic">

      <div className="wp-weather-scene" aria-hidden="true">
        <div className="wp-weather-stars" />
        <div className="wp-weather-orbit wp-weather-orbit--one" />
        <div className="wp-weather-orbit wp-weather-orbit--two" />
        <div className="wp-weather-globe">
          <span className="wp-wglobe-line wp-wglobe-line--a" />
          <span className="wp-wglobe-line wp-wglobe-line--b" />
          <span className="wp-wglobe-line wp-wglobe-line--c" />
          <span className="wp-wglobe-route" />
          <i className="wp-wglobe-dot wp-wglobe-dot--a" />
          <i className="wp-wglobe-dot wp-wglobe-dot--b" />
        </div>
        <div className="wp-weather-wave wp-weather-wave--one" />
        <div className="wp-weather-wave wp-weather-wave--two" />
        <div className="wp-weather-ship">
          <div className="wp-wship-smoke wp-wship-smoke--a" />
          <div className="wp-wship-smoke wp-wship-smoke--b" />
          <div className="wp-wship-bridge"><b></b><b></b><b></b></div>
          <div className="wp-wship-containers"><i></i><i></i><i></i><i></i><b></b><b></b><b></b><b></b></div>
          <div className="wp-wship-deck" />
          <div className="wp-wship-hull"><strong>WAYPOINT</strong><em>⚓</em></div>
          <div className="wp-wship-water" />
        </div>
      </div>


      {/* HEADER */}

      <section className="wp-page-header wp-weather-hero-header">

        <div className="wp-weather-live-badge">
          <span />
          LIVE WEATHER INTELLIGENCE
        </div>

        <p className="wp-eyebrow">
          Weather intelligence
        </p>

        <h1>
          Weather & Conditions
        </h1>

        <p>
          Monitor live weather conditions
          and forecast information for
          important shipment locations.
        </p>

        <div className="wp-weather-hero-tags">
          <span>REAL-TIME CONDITIONS</span>
          <span>ROUTE RISK</span>
          <span>5-DAY OUTLOOK</span>
        </div>

      </section>


      {/* ROUTE SELECTOR */}

      <section className="wp-weather-route-selector wp-weather-glass-panel">

        <div className="wp-weather-selector">

          <label>
            Origin port
          </label>

          <select
            value={origin}
            onChange={(e) =>
              setOrigin(
                e.target.value
              )
            }
          >

            {ORIGIN_PORTS.map(
              (port) => (

                <option
                  key={port}
                  value={port}
                >
                  {port}
                </option>

              )
            )}

          </select>

        </div>


        <div className="wp-weather-route-arrow">

          →

        </div>


        <div className="wp-weather-selector">

          <label>
            Destination port
          </label>

          <select
            value={destination}
            onChange={(e) =>
              setDestination(
                e.target.value
              )
            }
          >

            {DEST_PORTS.map(
              (port) => (

                <option
                  key={port}
                  value={port}
                >
                  {port}
                </option>

              )
            )}

          </select>

        </div>

      </section>


      {/* LOADING */}

      {loading && (

        <div className="wp-weather-loading">

          <div className="wp-weather-spinner">
            ⟳
          </div>

          <p>
            Loading live weather information...
          </p>

        </div>

      )}


      {/* ERROR */}

      {error && (

        <div className="wp-weather-error">

          ⚠️

          <span>
            {error}
          </span>

        </div>

      )}


      {/* WEATHER CARDS */}

      {!loading && (

        <section className="wp-weather-locations">

          <WeatherLocationCard
            title={origin}
            weather={originWeather}
            risk={originRisk}
          />


          <WeatherLocationCard
            title={destination}
            weather={destinationWeather}
            risk={destinationRisk}
          />

        </section>

      )}


      {/* FORECAST */}

      {!loading && (

        <section className="wp-weather-forecast-section wp-weather-glass-section">

          <div className="wp-weather-section-header">

            <div>

              <p className="wp-eyebrow">
                Forecast
              </p>

              <h2>
                Weather outlook
              </h2>

            </div>

            <span>
              {origin} → {destination}
            </span>

          </div>


          <div className="wp-weather-forecast-block">

            <h3>
              {origin}
            </h3>

            <ForecastCards
              forecast={
                originForecast
              }
            />

          </div>


          <div className="wp-weather-forecast-block">

            <h3>
              {destination}
            </h3>

            <ForecastCards
              forecast={
                destinationForecast
              }
            />

          </div>

        </section>

      )}


      {/* OPERATIONAL INSTRUCTIONS */}

      <section className="wp-weather-instructions wp-weather-glass-section">

        <div>

          <p className="wp-eyebrow">
            Operational guidance
          </p>

          <h2>
            Weather-aware shipment planning
          </h2>

        </div>


        <div className="wp-weather-instruction-grid">

          <div>

            <span>
              🌧️
            </span>

            <h3>
              Monitor precipitation
            </h3>

            <p>
              Check rain probability and
              forecast changes before
              confirming shipment plans.
            </p>

          </div>


          <div>

            <span>
              💨
            </span>

            <h3>
              Check wind conditions
            </h3>

            <p>
              Strong winds may require
              additional operational
              attention.
            </p>

          </div>


          <div>

            <span>
              ⚠️
            </span>

            <h3>
              Review weather risk
            </h3>

            <p>
              Use weather information as
              an additional factor when
              comparing routes.
            </p>

          </div>

        </div>

      </section>

    </main>

  );

}


export default Weather;