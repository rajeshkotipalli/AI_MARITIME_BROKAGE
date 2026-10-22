class MarginAgent:

    def calculate_margin(
        self,
        demand_adjusted_cost_usd,
        target_margin_percent,
        demand_factor=1.0,
        transshipments=0,
        transit_days=0,
        route_type="Standard"
    ):
        # ---------------------------------------------
        # BASE MARGIN
        # ---------------------------------------------

        base_margin = float(target_margin_percent)

        # ---------------------------------------------
        # DYNAMIC MARGIN ADJUSTMENT
        # ---------------------------------------------

        margin_adjustment = 0.0
        adjustment_reasons = []

        # Demand-based optimization
        if demand_factor >= 1.08:
            margin_adjustment += 3.0
            adjustment_reasons.append(
                "Very high demand"
            )

        elif demand_factor >= 1.05:
            margin_adjustment += 2.0
            adjustment_reasons.append(
                "High demand"
            )

        elif demand_factor <= 0.98:
            margin_adjustment -= 2.0
            adjustment_reasons.append(
                "Low demand"
            )

        # Transshipment adjustment
        if transshipments >= 2:
            margin_adjustment += 1.0
            adjustment_reasons.append(
                "Multiple transshipments"
            )

        # Long transit adjustment
        if transit_days >= 35:
            margin_adjustment += 1.0
            adjustment_reasons.append(
                "Long transit time"
            )

        # Express route premium
        if str(route_type).strip().lower() == "express":
            margin_adjustment += 1.0
            adjustment_reasons.append(
                "Express service"
            )

        # ---------------------------------------------
        # OPTIMIZED MARGIN
        # ---------------------------------------------

        optimized_margin = base_margin + margin_adjustment

        # Keep margin commercially reasonable
        optimized_margin = max(
            10.0,
            min(22.0, optimized_margin)
        )

        # ---------------------------------------------
        # SELLING PRICE
        # ---------------------------------------------

        margin = optimized_margin / 100

        final_selling_price = (
            demand_adjusted_cost_usd
            / (1 - margin)
        )

        brokerage_profit = (
            final_selling_price
            - demand_adjusted_cost_usd
        )

        # ---------------------------------------------
        # RESULT
        # ---------------------------------------------

        return {
            "status": "success",
            "base_margin_percent": round(
                base_margin, 2
            ),
            "margin_adjustment_percent": round(
                margin_adjustment, 2
            ),
            "target_margin_percent": round(
                optimized_margin, 2
            ),
            "brokerage_profit_usd": round(
                brokerage_profit, 2
            ),
            "final_selling_price_usd": round(
                final_selling_price, 2
            ),
            "optimization_reasons":
                adjustment_reasons
        }