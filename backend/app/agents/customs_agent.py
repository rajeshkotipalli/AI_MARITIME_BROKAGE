"""
Customs Agent for Waypoint AI.

This agent is intentionally dataset-backed, following the same pattern as
RouteAgent and WeatherAgent. The bundled customs.csv is a prototype/demo
compliance dataset, not a live tariff or legal-regulatory source.
"""

import os
import pandas as pd


class CustomsAgent:
    def __init__(self):
        current_file = os.path.abspath(__file__)
        project_root = os.path.dirname(
            os.path.dirname(
                os.path.dirname(current_file)
            )
        )

        self.dataset_path = os.path.join(
            project_root,
            "app",
            "data",
            "customs.csv"
        )

        self.customs = pd.read_csv(self.dataset_path)

    @staticmethod
    def _normalise(value):
        return str(value or "").strip().lower()

    def analyze_customs(
        self,
        origin,
        destination,
        cargo_type,
        containers=1
    ):
        origin = str(origin or "").strip()
        destination = str(destination or "").strip()
        cargo_type = str(cargo_type or "").strip()

        if not origin or not destination:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "Origin and destination are required."
            }

        if not cargo_type:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "Cargo type is required."
            }

        try:
            containers = int(containers)
        except (TypeError, ValueError):
            return {
                "success": False,
                "status": "invalid_request",
                "message": "Containers must be a valid integer."
            }

        if containers <= 0:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "Containers must be greater than zero."
            }

        matches = self.customs[
            (self.customs["destination_port"].map(self._normalise)
             == self._normalise(destination))
            &
            (self.customs["cargo_type"].map(self._normalise)
             == self._normalise(cargo_type))
        ].copy()

        if matches.empty:
            # Fallback to general cargo for a known destination.
            fallback = self.customs[
                (self.customs["destination_port"].map(self._normalise)
                 == self._normalise(destination))
                &
                (self.customs["cargo_type"].map(self._normalise)
                 == "general cargo")
            ].copy()

            if fallback.empty:
                return {
                    "success": False,
                    "status": "not_found",
                    "message": (
                        f"No customs profile found for "
                        f"{cargo_type} arriving at {destination}."
                    )
                }

            row = fallback.iloc[0]
            profile_source = "fallback_general_cargo"
        else:
            row = matches.iloc[0]
            profile_source = "cargo_specific"

        inspection = float(row["inspection_probability_percent"])

        # A simple operational risk score for the prototype:
        # base inspection signal + controlled-cargo signal.
        risk_map = {"Low": 25, "Medium": 55, "High": 80}
        base_score = risk_map.get(
            str(row["compliance_risk"]),
            50
        )

        risk_score = min(
            100,
            round(
                0.70 * base_score
                + 0.30 * min(100, inspection * 2),
                2
            )
        )

        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 45:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "success": True,
            "status": "success",
            "origin": origin,
            "destination": destination,
            "cargo_type": cargo_type,
            "containers": containers,
            "customs": {
                "customs_id": str(row["customs_id"]),
                "destination_country": str(row["destination_country"]),
                "documentation_level": str(row["documentation_level"]),
                "required_documents": [
                    item.strip()
                    for item in str(row["required_documents"]).split(";")
                    if item.strip()
                ],
                "compliance_risk": str(row["compliance_risk"]),
                "inspection_probability_percent": inspection,
                "estimated_clearance_days": str(
                    row["estimated_clearance_days"]
                ),
                "special_requirements": str(
                    row["special_requirements"]
                ),
                "profile_source": profile_source
            },
            "risk": {
                "risk_score": risk_score,
                "risk_level": risk_level
            },
            "disclaimer": (
                "Prototype customs intelligence. "
                "Verify current customs, tariff, permit and "
                "sanitary requirements with the destination authority "
                "before shipment."
            )
        }
