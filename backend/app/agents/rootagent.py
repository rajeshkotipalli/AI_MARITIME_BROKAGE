from app.agents.route_agent import RouteAgent


class RootAgent:
    """
    Root agent responsible for orchestrating
    the maritime route analysis process.
    """

    def __init__(self):
        self.route_agent = RouteAgent()

    def analyze_route(
        self,
        origin,
        destination,
        cargo_type,
        containers
    ):
        """
        Send the route request to RouteAgent.

        RouteAgent is responsible for:
        - Finding all available routes
        - Comparing routes
        - Calculating route scores
        - Selecting the recommended route
        """

        result = self.route_agent.analyze_route(
            origin=origin,
            destination=destination,
            cargo_type=cargo_type,
            containers=containers
        )

        return result