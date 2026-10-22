
from app.services.quotation_service import QuotationService
from app.agents.weather_agent import WeatherAgent
from app.agents.customs_agent import CustomsAgent


class FreightIntelligenceService:
    """Combines route pricing, weather and customs prototype intelligence."""

    def __init__(self):
        self.quotation_service = QuotationService()
        self.weather_agent = WeatherAgent()
        self.customs_agent = CustomsAgent()

    def generate_freight_intelligence(
        self, origin, destination, cargo_type, containers
    ):
        # 1. Generate the existing route and pricing analysis.
        quotation = self.quotation_service.generate_quotation(
            origin=origin,
            destination=destination,
            cargo_type=cargo_type,
            containers=containers,
        )

        if quotation.get("status") != "success":
            return {
                "success": False,
                "status": quotation.get("status", "error"),
                "message": quotation.get(
                    "message", "Unable to generate a quotation."
                ),
            }

        route_id = str(quotation.get("recommended_route", ""))

        routes = quotation.get("available_routes", [])
        recommended = next(
            (
                route for route in routes
                if str(route.get("route_id", "")) == route_id
            ),
            {},
        )

        pricing = recommended.get("pricing", {})
        if pricing.get("status") != "success":
            pricing = {
                "base_freight_usd": quotation.get("base_freight_usd"),
                "fuel_surcharge_usd": quotation.get("fuel_surcharge_usd"),
                "port_charge_usd": quotation.get("port_charge_usd"),
                "risk_surcharge_usd": quotation.get("risk_surcharge_usd"),
                "final_selling_price_usd": quotation.get(
                    "final_selling_price_usd"
                ),
                "estimated_total_customer_price_usd": quotation.get(
                    "total_customer_price_usd"
                ),
                "total_brokerage_profit_usd": quotation.get(
                    "total_brokerage_profit_usd"
                ),
                "target_margin_percent": quotation.get(
                    "target_margin_percent"
                ),
                "demand_factor": quotation.get("demand_factor"),
            }

        # 2. Analyze weather for the recommended route.
        try:
            weather_result = self.weather_agent.analyze_weather(route_id)
            if not weather_result.get("success"):
                weather_result = {
                    "success": False,
                    "status": "unavailable",
                    "message": weather_result.get(
                        "message", "Weather data is unavailable."
                    ),
                }
        except Exception as exc:
            weather_result = {
                "success": False,
                "status": "unavailable",
                "message": str(exc),
            }

        # 3. Analyze destination customs requirements.
        try:
            customs_result = self.customs_agent.analyze_customs(
                origin=origin,
                destination=destination,
                cargo_type=cargo_type,
                containers=containers,
            )
            if not customs_result.get("success"):
                customs_result = {
                    "success": False,
                    "status": "unavailable",
                    "message": customs_result.get(
                        "message", "Customs data is unavailable."
                    ),
                }
        except Exception as exc:
            customs_result = {
                "success": False,
                "status": "unavailable",
                "message": str(exc),
            }

        # 4. Normalize weather data for the existing frontend.
        weather_data = weather_result.get("weather", {})
        weather_risk_data = weather_result.get("risk", {})

        weather_level = (
            weather_risk_data.get("risk_level")
            if weather_result.get("success")
            else None
        )

        weather_score = None
        if weather_result.get("success"):
            weather_points = weather_risk_data.get("risk_points")
            if weather_points is not None:
                weather_score = round(
                    min(100, max(0, float(weather_points) / 6 * 100)), 2
                )

        normalized_weather = {
            "status": (
                "dataset_estimate"
                if weather_result.get("success")
                else "unavailable"
            ),
            "risk_level": weather_level,
            "legs": [
                {
                    "success": True,
                    "weather": weather_data,
                }
            ] if weather_result.get("success") else [],
            "message": weather_result.get("message"),
        }

        # 5. Normalize customs data for the existing frontend.
        customs_data = customs_result.get("customs", {})
        customs_risk_data = customs_result.get("risk", {})

        customs_score = (
            customs_risk_data.get("risk_score")
            if customs_result.get("success")
            else None
        )

        customs_level = (
            customs_data.get("compliance_risk")
            if customs_result.get("success")
            else None
        )

        normalized_customs = {
            "status": (
                "dataset_estimate"
                if customs_result.get("success")
                else "unavailable"
            ),
            "customs": customs_data,
            "risk": {
                "risk_score": customs_score,
                "risk_level": (
                    customs_risk_data.get("risk_level")
                    if customs_result.get("success")
                    else None
                ),
            },
            "message": customs_result.get("message"),
            "disclaimer": customs_result.get("disclaimer"),
        }

        # 6. Calculate an overall score only from available assessments.
        available_scores = [
            float(score)
            for score in (weather_score, customs_score)
            if score is not None
        ]

        overall_score = (
            round(sum(available_scores) / len(available_scores), 2)
            if available_scores
            else None
        )

        if overall_score is None:
            overall_level = "Unavailable"
        elif overall_score >= 70:
            overall_level = "High"
        elif overall_score >= 45:
            overall_level = "Medium"
        else:
            overall_level = "Low"

        recommendations = []

        if weather_level == "High":
            recommendations.append(
                "High weather risk in the route dataset; review conditions "
                "before dispatch."
            )
        elif weather_level in ("Medium", "Moderate"):
            recommendations.append(
                "Moderate weather risk in the route dataset; review "
                "conditions before dispatch."
            )

        if customs_level == "High":
            recommendations.append(
                "High customs compliance risk in the prototype profile; "
                "verify destination requirements."
            )

        if not weather_result.get("success"):
            recommendations.append(
                "Weather assessment is unavailable for the recommended route."
            )

        if not customs_result.get("success"):
            recommendations.append(
                "Customs assessment is unavailable for this destination "
                "and cargo type."
            )

        if not recommendations:
            recommendations.append(
                "Review the dataset-based weather and customs assessments "
                "before confirming shipment."
            )

        # 7. Return one unified response for the frontend.
        return {
            "success": True,
            "status": "success",
            "engine_version": "1.1.0",
            "shipment": {
                "origin": origin,
                "destination": destination,
                "cargo_type": cargo_type,
                "containers": containers,
            },
            "origin": origin,
            "destination": destination,
            "cargo_type": cargo_type,
            "containers": containers,
            "total_routes": quotation.get("total_routes", len(routes)),
            "recommended_route": route_id,
            "reason": quotation.get("reason"),
            "available_routes": routes,
            "alternatives": quotation.get("alternatives", []),
            "route_intelligence": {
                "recommended_route": route_id,
                "route_score": quotation.get("route_score"),
                "transit_time_days": quotation.get("transit_time_days"),
                "distance_nm": quotation.get("distance_nm"),
                "transshipments": quotation.get("transshipments"),
                "route_type": quotation.get("route_type"),
            },
            "pricing_intelligence": {
                **pricing,
                "currency": "USD",
                "total_customer_price_usd": quotation.get(
                    "total_customer_price_usd"
                ),
                "total_brokerage_profit_usd": quotation.get(
                    "total_brokerage_profit_usd"
                ),
            },
            "weather_intelligence": normalized_weather,
            "customs_intelligence": normalized_customs,
            "risk_intelligence": {
                "weather_risk": weather_level,
                "weather_risk_score": weather_score,
                "customs_risk": customs_level,
                "customs_risk_score": customs_score,
                "overall_risk_level": overall_level,
                "overall_risk_score": overall_score,
            },
            "business_recommendation": recommendations,
            "disclaimers": [
                "Weather figures are dataset-based estimates, not necessarily "
                "live conditions or forecasts.",
                "Customs information is a prototype profile. Verify current "
                "requirements with the destination authority before shipment.",
                "The overall risk score averages the available weather and "
                "customs scores; it is a prototype indicator, not a validated "
                "operational risk model.",
            ],
        }
