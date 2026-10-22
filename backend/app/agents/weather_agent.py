import os
import pandas as pd


class WeatherAgent:

    def __init__(self):
        # backend/app/agents/
        agents_dir = os.path.dirname(__file__)

        # backend/app/
        app_dir = os.path.dirname(agents_dir)

        # backend/app/data/
        data_dir = os.path.join(app_dir, "data")

        routes_path = os.path.join(data_dir, "routes.csv")
        weather_path = os.path.join(data_dir, "weather.csv")

        # Load both datasets
        self.routes = pd.read_csv(routes_path)
        self.weather = pd.read_csv(weather_path)

    def analyze_weather(self, route_id: str):

        # -----------------------------------
        # 1. Validate route_id
        # -----------------------------------

        route = self.routes[
            self.routes["route_id"].astype(str).str.upper()
            == route_id.upper()
        ]

        if route.empty:
            return {
                "success": False,
                "message": f"Route {route_id} does not exist in routes.csv"
            }

        # -----------------------------------
        # 2. Find matching weather record
        # -----------------------------------

        weather = self.weather[
            self.weather["route_id"].astype(str).str.upper()
            == route_id.upper()
        ]

        if weather.empty:
            return {
                "success": False,
                "message": f"No weather data found for route {route_id}"
            }

        # Get first matching records
        route = route.iloc[0]
        weather = weather.iloc[0]

        # -----------------------------------
        # 3. Extract weather values
        # -----------------------------------

        wind_speed = float(weather["wind_speed_knots"])
        wave_height = float(weather["wave_height_m"])

        # -----------------------------------
        # 4. Calculate weather risk
        # -----------------------------------

        risk_points = 0

        # Wind risk
        if wind_speed >= 35:
            risk_points += 3

        elif wind_speed >= 25:
            risk_points += 2

        else:
            risk_points += 1

        # Wave risk
        if wave_height >= 4.5:
            risk_points += 3

        elif wave_height >= 3:
            risk_points += 2

        else:
            risk_points += 1

        # -----------------------------------
        # 5. Determine basic risk level
        # -----------------------------------

        if risk_points >= 5:
            risk_level = "High"

        elif risk_points >= 3:
            risk_level = "Medium"

        else:
            risk_level = "Low"

        # -----------------------------------
        # 6. Return result
        # -----------------------------------

        return {
            "success": True,

            "route": {
                "route_id": route["route_id"],
                "origin": route["origin"],
                "destination": route["destination"]
            },

            "weather": {
                "region": weather["region"],
                "wind_speed_knots": wind_speed,
                "wave_height_m": float(weather["wave_height_m"]),
                "visibility_km": float(weather["visibility_km"]),
                "storm_probability": float(
                    weather["storm_probability"]
                ),
                "weather_condition": weather["weather_condition"]
            },

            "risk": {
                "risk_points": risk_points,
                "risk_level": risk_level
            }
        }