import os
import pandas as pd


class PricingAgent:

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
            "pricing.csv"
        )

        self.pricing = pd.read_csv(
            self.dataset_path
        )

    def calculate_price(
        self,
        route_id,
        base_freight_usd,
        route_type="Standard",
        distance_nm=0,
        transshipments=0,
        transit_days=0
    ):

        # =====================================================
        # FIND PRICING RECORD
        # =====================================================

        matching_pricing = self.pricing[
            self.pricing["route_id"]
            .astype(str)
            .str.strip()
            .str.lower()
            == str(route_id).strip().lower()
        ]

        # =====================================================
        # FALLBACK FOR MULTI-LEG ROUTES
        # =====================================================

        if matching_pricing.empty:

            # Multi-leg routes have combined route IDs
            # such as R001 → R004.
            #
            # In that case we calculate the surcharges
            # dynamically instead of requiring one CSV row.

            route_type_clean = (
                str(route_type)
                .strip()
                .lower()
            )

            if route_type_clean == "express":
                fuel_rate = 0.06

            elif route_type_clean == "economy":
                fuel_rate = 0.045

            elif route_type_clean == "alternative":
                fuel_rate = 0.048

            else:
                fuel_rate = 0.05

            fuel_surcharge = (
                float(base_freight_usd)
                * fuel_rate
            )

            port_charge = (
                55
                + min(
                    float(distance_nm) / 300,
                    45
                )
                + (
                    int(transshipments) * 8
                )
            )

            risk_surcharge = (
                30
                + (
                    int(transshipments) * 20
                )
                + max(
                    int(transit_days) - 20,
                    0
                ) * 2
            )

            # Dynamic demand factor
            demand_factor = 1.00

            if float(distance_nm) >= 10000:
                demand_factor += 0.05

            elif float(distance_nm) >= 6000:
                demand_factor += 0.02

            if route_type_clean == "express":
                demand_factor += 0.03

            if int(transshipments) >= 2:
                demand_factor += 0.02

            demand_factor = min(
                demand_factor,
                1.10
            )

            target_margin = 15.0

        else:

            # =================================================
            # USE DATASET PRICING
            # =================================================

            pricing = matching_pricing.iloc[0]

            fuel_surcharge = float(
                pricing["fuel_surcharge_usd"]
            )

            port_charge = float(
                pricing["port_charge_usd"]
            )

            risk_surcharge = float(
                pricing["risk_surcharge_usd"]
            )

            demand_factor = float(
                pricing["demand_factor"]
            )

            target_margin = float(
                pricing["target_margin_percent"]
            )

        # =====================================================
        # OPERATING COST
        # =====================================================

        operating_cost = (
            float(base_freight_usd)
            + fuel_surcharge
            + port_charge
            + risk_surcharge
        )

        # =====================================================
        # DEMAND ADJUSTMENT
        # =====================================================

        demand_adjusted_cost = (
            operating_cost
            * demand_factor
        )

        # =====================================================
        # RESULT
        # =====================================================

        return {

            "status": "success",

            "route_id": str(route_id),

            "base_freight_usd": round(
                float(base_freight_usd),
                2
            ),

            "fuel_surcharge_usd": round(
                fuel_surcharge,
                2
            ),

            "port_charge_usd": round(
                port_charge,
                2
            ),

            "risk_surcharge_usd": round(
                risk_surcharge,
                2
            ),

            "operating_cost_usd": round(
                operating_cost,
                2
            ),

            "demand_factor": round(
                demand_factor,
                2
            ),

            "demand_adjusted_cost_usd": round(
                demand_adjusted_cost,
                2
            ),

            "target_margin_percent": round(
                target_margin,
                2
            )
        }