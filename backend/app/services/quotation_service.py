from app.agents.route_agent import RouteAgent
from app.agents.pricing_agent import PricingAgent
from app.agents.margin_agent import MarginAgent


class QuotationService:

    def __init__(self):
        self.route_agent = RouteAgent()
        self.pricing_agent = PricingAgent()
        self.margin_agent = MarginAgent()

    def _calculate_route_pricing(self, route, containers):
        """
        Calculate Pricing Agent + Margin Agent results
        for a single route.
        """

        route_id = str(route.get("route_id", ""))

        base_freight = float(
            route.get("base_freight_usd", 0)
        )

        route_type = route.get(
            "route_type",
            "Standard"
        )

        distance_nm = float(
            route.get("distance_nm", 0)
        )

        transshipments = int(
            route.get("transshipments", 0)
        )

        transit_days = int(
            route.get(
                "transit_time_days",
                route.get("transit_days", 0)
            )
        )

        # -----------------------------------------------------
        # PRICING AGENT
        # -----------------------------------------------------

        pricing_result = self.pricing_agent.calculate_price(
            route_id=route_id,
            base_freight_usd=base_freight,
            route_type=route_type,
            distance_nm=distance_nm,
            transshipments=transshipments,
            transit_days=transit_days
        )

        if pricing_result["status"] != "success":
            return {
                "status": "error",
                "route_id": route_id,
                "message": pricing_result.get(
                    "message",
                    f"Pricing failed for route {route_id}"
                )
            }

        # -----------------------------------------------------
        # MARGIN AGENT
        # -----------------------------------------------------

        margin_result = self.margin_agent.calculate_margin(
            demand_adjusted_cost_usd=(
                pricing_result[
                    "demand_adjusted_cost_usd"
                ]
            ),
            target_margin_percent=(
                pricing_result[
                    "target_margin_percent"
                ]
            ),
            demand_factor=(
                pricing_result[
                    "demand_factor"
                ]
            ),
            transshipments=transshipments,
            transit_days=transit_days,
            route_type=route_type
        )

        # -----------------------------------------------------
        # TOTAL VALUES
        # -----------------------------------------------------

        final_selling_price = float(
            margin_result[
                "final_selling_price_usd"
            ]
        )

        brokerage_profit = float(
            margin_result[
                "brokerage_profit_usd"
            ]
        )

        total_customer_price = (
            final_selling_price * containers
        )

        total_brokerage_profit = (
            brokerage_profit * containers
        )

        # -----------------------------------------------------
        # ROUTE PRICING RESULT
        # -----------------------------------------------------

        return {
            "status": "success",

            "route_id": route_id,

            "route_display": route.get(
                "route_display",
                route_id
            ),

            "route_path": route.get(
                "route_path",
                route.get("route_display", route_id)
            ),

            "route_type": route_type,

            "route_score": route.get(
                "route_score",
                route.get("score")
            ),

            "transit_days": transit_days,

            "distance_nm": distance_nm,

            "transshipments": transshipments,

            # -------------------------------
            # PRICING
            # -------------------------------

            "base_freight_usd": pricing_result[
                "base_freight_usd"
            ],

            "fuel_surcharge_usd": pricing_result[
                "fuel_surcharge_usd"
            ],

            "port_charge_usd": pricing_result[
                "port_charge_usd"
            ],

            "risk_surcharge_usd": pricing_result[
                "risk_surcharge_usd"
            ],

            "operating_cost_usd": pricing_result[
                "operating_cost_usd"
            ],

            "demand_factor": pricing_result[
                "demand_factor"
            ],

            "demand_adjusted_cost_usd": pricing_result[
                "demand_adjusted_cost_usd"
            ],

            # -------------------------------
            # MARGIN
            # -------------------------------

            "base_margin_percent": margin_result[
                "base_margin_percent"
            ],

            "margin_adjustment_percent": margin_result[
                "margin_adjustment_percent"
            ],

            "target_margin_percent": margin_result[
                "target_margin_percent"
            ],

            "brokerage_profit_usd": margin_result[
                "brokerage_profit_usd"
            ],

            "final_selling_price_usd": margin_result[
                "final_selling_price_usd"
            ],

            "optimization_reasons": margin_result[
                "optimization_reasons"
            ],

            # -------------------------------
            # TOTAL SHIPMENT PRICE
            # -------------------------------

            "estimated_total_customer_price_usd": round(
                total_customer_price,
                2
            ),

            "total_brokerage_profit_usd": round(
                total_brokerage_profit,
                2
            ),

            "containers": containers
        }

    def generate_quotation(
        self,
        origin,
        destination,
        cargo_type,
        containers
    ):

        # =====================================================
        # STEP 1: FIND AND SCORE ROUTES
        # =====================================================

        route_result = self.route_agent.analyze_route(
            origin=origin,
            destination=destination,
            cargo_type=cargo_type,
            containers=containers
        )

        if route_result["status"] != "success":
            return route_result

        available_routes = route_result.get(
            "available_routes",
            []
        )

        recommended_route_id = str(
            route_result["recommended_route"]
        )

        # =====================================================
        # STEP 2: FIND RECOMMENDED ROUTE OBJECT
        # =====================================================

        recommended_route = None

        for route in available_routes:

            if str(
                route.get("route_id", "")
            ) == recommended_route_id:

                recommended_route = route
                break

        # -----------------------------------------------------
        # Fallback: build recommended route from route_result
        # -----------------------------------------------------

        if recommended_route is None:

            recommended_route = {
                "route_id": recommended_route_id,

                "route_display": recommended_route_id,

                "route_path": recommended_route_id,

                "route_type": route_result.get(
                    "route_type",
                    "Standard"
                ),

                "route_score": route_result.get(
                    "route_score",
                    route_result.get(
                        "recommended_score"
                    )
                ),

                "transit_time_days": route_result.get(
                    "transit_time_days",
                    0
                ),

                "distance_nm": route_result.get(
                    "distance_nm",
                    0
                ),

                "transshipments": route_result.get(
                    "transshipments",
                    0
                ),

                "base_freight_usd": route_result.get(
                    "base_freight_usd",
                    0
                )
            }

        # =====================================================
        # STEP 3: PRICE RECOMMENDED ROUTE
        # =====================================================

        recommended_pricing = (
            self._calculate_route_pricing(
                recommended_route,
                containers
            )
        )

        if recommended_pricing["status"] != "success":
            return recommended_pricing

        # =====================================================
        # STEP 4: PRICE ALL ALTERNATIVE ROUTES
        # =====================================================

        alternatives = []

        for route in available_routes:

            route_id = str(
                route.get("route_id", "")
            )

            # Skip recommended route
            if route_id == recommended_route_id:
                continue

            route_pricing = (
                self._calculate_route_pricing(
                    route,
                    containers
                )
            )

            if route_pricing["status"] == "success":

                alternatives.append(
                    route_pricing
                )

        # =====================================================
        # STEP 5: ADD PRICING TO ALL AVAILABLE ROUTES
        # =====================================================

        priced_routes = []

        for route in available_routes:

            route_id = str(
                route.get("route_id", "")
            )

            if route_id == recommended_route_id:

                priced_routes.append(
                    {
                        **route,
                        "pricing": recommended_pricing
                    }
                )

            else:

                matching_alternative = next(
                    (
                        item
                        for item in alternatives
                        if str(
                            item["route_id"]
                        ) == route_id
                    ),
                    None
                )

                if matching_alternative:

                    priced_routes.append(
                        {
                            **route,
                            "pricing": matching_alternative
                        }
                    )

                else:

                    priced_routes.append(route)

        # =====================================================
        # STEP 6: FINAL RECOMMENDED TOTALS
        # =====================================================

        total_selling_price = (
            recommended_pricing[
                "final_selling_price_usd"
            ] * containers
        )

        total_brokerage_profit = (
            recommended_pricing[
                "brokerage_profit_usd"
            ] * containers
        )

        # =====================================================
        # STEP 7: FINAL QUOTATION
        # =====================================================

        quotation = {

            "status": "success",

            # -------------------------------------------------
            # SHIPMENT INFORMATION
            # -------------------------------------------------

            "origin": origin,

            "destination": destination,

            "cargo_type": cargo_type,

            "containers": containers,

            # -------------------------------------------------
            # ROUTE INFORMATION
            # -------------------------------------------------

            "total_routes": route_result.get(
                "total_routes",
                len(available_routes)
            ),

            "recommended_route": recommended_route_id,

            "route_score": recommended_pricing[
                "route_score"
            ],

            "transit_time_days": recommended_pricing[
                "transit_days"
            ],

            "distance_nm": recommended_pricing[
                "distance_nm"
            ],

            "transshipments": recommended_pricing[
                "transshipments"
            ],

            "route_type": recommended_pricing[
                "route_type"
            ],

            "reason": route_result.get(
                "reason"
            ),

            # -------------------------------------------------
            # ALL ROUTES WITH PRICING
            # -------------------------------------------------

            "available_routes": priced_routes,

            "alternatives": alternatives,

            # -------------------------------------------------
            # RECOMMENDED ROUTE PRICING
            # -------------------------------------------------

            "base_freight_usd": recommended_pricing[
                "base_freight_usd"
            ],

            "fuel_surcharge_usd": recommended_pricing[
                "fuel_surcharge_usd"
            ],

            "port_charge_usd": recommended_pricing[
                "port_charge_usd"
            ],

            "risk_surcharge_usd": recommended_pricing[
                "risk_surcharge_usd"
            ],

            "operating_cost_usd": recommended_pricing[
                "operating_cost_usd"
            ],

            "demand_factor": recommended_pricing[
                "demand_factor"
            ],

            "demand_adjusted_cost_usd": recommended_pricing[
                "demand_adjusted_cost_usd"
            ],

            # -------------------------------------------------
            # DYNAMIC MARGIN
            # -------------------------------------------------

            "base_margin_percent": recommended_pricing[
                "base_margin_percent"
            ],

            "margin_adjustment_percent": recommended_pricing[
                "margin_adjustment_percent"
            ],

            "target_margin_percent": recommended_pricing[
                "target_margin_percent"
            ],

            "brokerage_profit_usd": recommended_pricing[
                "brokerage_profit_usd"
            ],

            "final_selling_price_usd": recommended_pricing[
                "final_selling_price_usd"
            ],

            "optimization_reasons": recommended_pricing[
                "optimization_reasons"
            ],

            # -------------------------------------------------
            # TOTAL SHIPMENT VALUES
            # -------------------------------------------------

            "total_brokerage_profit_usd": round(
                total_brokerage_profit,
                2
            ),

            "total_customer_price_usd": round(
                total_selling_price,
                2
            )
        }

        return quotation