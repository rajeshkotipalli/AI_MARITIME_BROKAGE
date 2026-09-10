import os
import pandas as pd


class RouteAgent:

    def __init__(self):

        # =====================================================
        # FIND PROJECT ROOT
        # =====================================================

        current_file = os.path.abspath(__file__)

        project_root = os.path.dirname(
            os.path.dirname(
                os.path.dirname(current_file)
            )
        )

        data_folder = os.path.join(
            project_root,
            "app",
            "data"
        )

        # =====================================================
        # DATASET
        # =====================================================

        possible_paths = [
            os.path.join(data_folder, "routes.csv"),
            os.path.join(project_root, "routes.csv"),
        ]

        self.dataset_path = None

        for path in possible_paths:

            if os.path.exists(path):

                self.dataset_path = path
                break

        if self.dataset_path is None:

            raise FileNotFoundError(
                "routes.csv not found.\n\n"
                "Checked:\n"
                + "\n".join(possible_paths)
            )

        # =====================================================
        # LOAD CSV
        # =====================================================

        self.routes = pd.read_csv(
            self.dataset_path
        )

        # =====================================================
        # NORMALIZE COLUMN NAMES
        # =====================================================

        self.routes.columns = [
            str(column)
            .strip()
            .lower()
            for column in self.routes.columns
        ]

        # =====================================================
        # REQUIRED COLUMNS
        # =====================================================

        required_columns = [
            "origin",
            "destination",
            "route_id",
            "transit_days",
            "distance_nm",
            "transshipments",
            "route_type",
            "base_freight_usd",
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in self.routes.columns
        ]

        if missing_columns:

            raise ValueError(
                "Missing columns in routes.csv: "
                f"{missing_columns}"
            )

        # =====================================================
        # CLEAN TEXT
        # =====================================================

        text_columns = [
            "origin",
            "destination",
            "route_id",
            "route_type",
        ]

        for column in text_columns:

            self.routes[column] = (
                self.routes[column]
                .astype(str)
                .str.strip()
            )

        # =====================================================
        # CLEAN NUMERIC VALUES
        # =====================================================

        numeric_columns = [
            "transit_days",
            "distance_nm",
            "transshipments",
            "base_freight_usd",
        ]

        for column in numeric_columns:

            self.routes[column] = pd.to_numeric(
                self.routes[column],
                errors="coerce"
            )

        # =====================================================
        # REMOVE INVALID RECORDS
        # =====================================================

        self.routes = self.routes.dropna(
            subset=[
                "origin",
                "destination",
                "route_id",
                "transit_days",
                "distance_nm",
                "transshipments",
                "base_freight_usd",
            ]
        ).copy()

        # =====================================================
        # NORMALIZED LOOKUP COLUMNS
        # =====================================================

        self.routes["_origin_key"] = (
            self.routes["origin"]
            .str.strip()
            .str.lower()
        )

        self.routes["_destination_key"] = (
            self.routes["destination"]
            .str.strip()
            .str.lower()
        )

        # =====================================================
        # STARTUP INFORMATION
        # =====================================================

        print()
        print("=" * 65)
        print("WAYPOINT ROUTE AGENT")
        print("=" * 65)

        print(
            f"Route dataset loaded successfully: "
            f"{len(self.routes)} routes"
        )

        print(
            f"Dataset location: "
            f"{self.dataset_path}"
        )

        lane_counts = (
            self.routes
            .groupby(
                [
                    "_origin_key",
                    "_destination_key"
                ]
            )
            .size()
        )

        multiple_direct_routes = lane_counts[
            lane_counts > 1
        ]

        print(
            f"Direct origin-destination lanes: "
            f"{len(lane_counts)}"
        )

        print(
            f"Lanes with multiple direct route records: "
            f"{len(multiple_direct_routes)}"
        )

        print(
            "Multi-leg route discovery: ENABLED"
        )

        print("=" * 65)
        print()

    # =========================================================
    # GET DIRECT ROUTE
    # =========================================================

    def _get_direct_routes(
        self,
        origin_key,
        destination_key
    ):

        matches = self.routes[
            (
                self.routes["_origin_key"]
                == origin_key
            )
            &
            (
                self.routes["_destination_key"]
                == destination_key
            )
        ].copy()

        return matches

    # =========================================================
    # GET ONE-STOP ROUTES
    # =========================================================
    #
    # Example:
    #
    # Chennai -> Singapore -> Melbourne
    #
    # Both legs MUST exist in routes.csv.
    #
    # No synthetic data is generated.
    # =========================================================

    def _get_one_stop_routes(
        self,
        origin_key,
        destination_key
    ):

        first_legs = self.routes[
            self.routes["_origin_key"]
            == origin_key
        ]

        routes = []

        for _, first_leg in first_legs.iterrows():

            intermediate_key = (
                first_leg["_destination_key"]
            )

            # Do not create loops
            if intermediate_key == origin_key:
                continue

            if intermediate_key == destination_key:
                continue

            # Find second leg
            second_legs = self.routes[
                (
                    self.routes["_origin_key"]
                    == intermediate_key
                )
                &
                (
                    self.routes["_destination_key"]
                    == destination_key
                )
            ]

            for _, second_leg in second_legs.iterrows():

                routes.append(
                    (
                        first_leg,
                        second_leg
                    )
                )

        return routes

    # =========================================================
    # CREATE DIRECT ROUTE OBJECT
    # =========================================================

    def _build_direct_route(
        self,
        row,
        containers
    ):

        base_freight = float(
            row["base_freight_usd"]
        )

        transit_days = int(
            row["transit_days"]
        )

        distance_nm = int(
            row["distance_nm"]
        )

        transshipments = int(
            row["transshipments"]
        )

        estimated_cost = (
            base_freight * containers
        )

        return {

            "route_id":
                str(row["route_id"]),

            "origin":
                str(row["origin"]),

            "destination":
                str(row["destination"]),

            "route_path": [
                str(row["origin"]),
                str(row["destination"])
            ],

            "route_display":
                (
                    f"{row['origin']} → "
                    f"{row['destination']}"
                ),

            "legs": 1,

            "route_ids": [
                str(row["route_id"])
            ],

            "transit_days":
                transit_days,

            "distance_nm":
                distance_nm,

            "transshipments":
                transshipments,

            "route_type":
                str(row["route_type"]),

            "base_freight_usd":
                round(base_freight, 2),

            "estimated_total_usd":
                round(estimated_cost, 2),

            "score": 0,

            "rank": 0,

            "is_best": False,

            "is_direct": True,

        }

    # =========================================================
    # CREATE MULTI-LEG ROUTE OBJECT
    # =========================================================

    def _build_one_stop_route(
        self,
        first_leg,
        second_leg,
        containers
    ):

        first_freight = float(
            first_leg["base_freight_usd"]
        )

        second_freight = float(
            second_leg["base_freight_usd"]
        )

        total_freight = (
            first_freight
            +
            second_freight
        )

        total_days = (
            int(first_leg["transit_days"])
            +
            int(second_leg["transit_days"])
        )

        total_distance = (
            int(first_leg["distance_nm"])
            +
            int(second_leg["distance_nm"])
        )

        # Each leg's transshipments plus the
        # connection between the two legs.
        total_transshipments = (
            int(first_leg["transshipments"])
            +
            int(second_leg["transshipments"])
            +
            1
        )

        estimated_cost = (
            total_freight * containers
        )

        first_origin = str(
            first_leg["origin"]
        )

        intermediate = str(
            first_leg["destination"]
        )

        final_destination = str(
            second_leg["destination"]
        )

        route_ids = [
            str(first_leg["route_id"]),
            str(second_leg["route_id"])
        ]

        route_id = " → ".join(
            route_ids
        )

        route_type = (
            "Multi-leg"
        )

        return {

            "route_id":
                route_id,

            "origin":
                first_origin,

            "destination":
                final_destination,

            "route_path": [
                first_origin,
                intermediate,
                final_destination
            ],

            "route_display":
                (
                    f"{first_origin} → "
                    f"{intermediate} → "
                    f"{final_destination}"
                ),

            "legs": 2,

            "route_ids":
                route_ids,

            "transit_days":
                total_days,

            "distance_nm":
                total_distance,

            "transshipments":
                total_transshipments,

            "route_type":
                route_type,

            "base_freight_usd":
                round(total_freight, 2),

            "estimated_total_usd":
                round(estimated_cost, 2),

            "score": 0,

            "rank": 0,

            "is_best": False,

            "is_direct": False,

        }

    # =========================================================
    # CALCULATE ROUTE SCORES
    # =========================================================
    #
    # Lower is better for:
    # - transit days
    # - distance
    # - transshipments
    #
    # We normalize against the actual candidate routes.
    #
    # Weights:
    # Transit       40%
    # Distance      25%
    # Transshipment 15%
    # Overall       20%
    # =========================================================

    def _score_routes(
        self,
        routes
    ):

        if not routes:
            return routes

        # -----------------------------------------------------
        # Extract values
        # -----------------------------------------------------

        days = [
            float(route["transit_days"])
            for route in routes
        ]

        distances = [
            float(route["distance_nm"])
            for route in routes
        ]

        transshipments = [
            float(route["transshipments"])
            for route in routes
        ]

        min_days = min(days)
        max_days = max(days)

        min_distance = min(distances)
        max_distance = max(distances)

        min_transshipments = min(
            transshipments
        )

        max_transshipments = max(
            transshipments
        )

        for route in routes:

            # =============================================
            # TRANSIT SCORE
            # =============================================

            if max_days == min_days:

                transit_score = 40

            else:

                transit_score = (

                    (
                        max_days
                        -
                        route["transit_days"]
                    )
                    /
                    (
                        max_days
                        -
                        min_days
                    )

                ) * 40

            # =============================================
            # DISTANCE SCORE
            # =============================================

            if max_distance == min_distance:

                distance_score = 25

            else:

                distance_score = (

                    (
                        max_distance
                        -
                        route["distance_nm"]
                    )
                    /
                    (
                        max_distance
                        -
                        min_distance
                    )

                ) * 25

            # =============================================
            # TRANSSHIPMENT SCORE
            # =============================================

            if (
                max_transshipments
                ==
                min_transshipments
            ):

                transshipment_score = 15

            else:

                transshipment_score = (

                    (
                        max_transshipments
                        -
                        route["transshipments"]
                    )
                    /
                    (
                        max_transshipments
                        -
                        min_transshipments
                    )

                ) * 15

            # =============================================
            # OVERALL SCORE
            # =============================================

            # Base reliability / route availability
            base_score = 20

            score = (
                transit_score
                +
                distance_score
                +
                transshipment_score
                +
                base_score
            )

            route["score"] = round(
                max(
                    0,
                    min(
                        100,
                        score
                    )
                ),
                1
            )

        # -----------------------------------------------------
        # Sort best to worst
        # -----------------------------------------------------

        routes.sort(
            key=lambda route: (
                route["score"],
                -route["transit_days"],
                -route["distance_nm"]
            ),
            reverse=True
        )

        # -----------------------------------------------------
        # Assign rank
        # -----------------------------------------------------

        for index, route in enumerate(
            routes
        ):

            route["rank"] = index + 1

            route["is_best"] = (
                index == 0
            )

        return routes

    # =========================================================
    # ROUTE ANALYSIS
    # =========================================================

    def analyze_route(
        self,
        origin,
        destination,
        cargo_type,
        containers
    ):

        try:

            # =================================================
            # INPUT VALIDATION
            # =================================================

            origin_clean = str(
                origin
            ).strip()

            destination_clean = str(
                destination
            ).strip()

            origin_key = (
                origin_clean.lower()
            )

            destination_key = (
                destination_clean.lower()
            )

            try:

                container_count = int(
                    containers
                )

            except (
                TypeError,
                ValueError
            ):

                return {

                    "status":
                        "error",

                    "message":
                        "Container count must be a valid number.",

                    "available_routes":
                        [],

                    "total_routes":
                        0

                }

            if container_count <= 0:

                return {

                    "status":
                        "error",

                    "message":
                        "Container count must be greater than zero.",

                    "available_routes":
                        [],

                    "total_routes":
                        0

                }

            if not origin_key:

                return {

                    "status":
                        "error",

                    "message":
                        "Origin port is required.",

                    "available_routes":
                        [],

                    "total_routes":
                        0

                }

            if not destination_key:

                return {

                    "status":
                        "error",

                    "message":
                        "Destination port is required.",

                    "available_routes":
                        [],

                    "total_routes":
                        0

                }

            if origin_key == destination_key:

                return {

                    "status":
                        "error",

                    "message":
                        "Origin and destination cannot be the same.",

                    "available_routes":
                        [],

                    "total_routes":
                        0

                }

            # =================================================
            # FIND DIRECT ROUTES
            # =================================================

            direct_routes = self._get_direct_routes(
                origin_key,
                destination_key
            )

            routes = []

            # =================================================
            # ADD DIRECT ROUTES
            # =================================================

            for _, row in direct_routes.iterrows():

                routes.append(
                    self._build_direct_route(
                        row,
                        container_count
                    )
                )

            # =================================================
            # FIND ONE-STOP ROUTES
            # =================================================
            #
            # Example:
            #
            # Chennai
            #    ↓
            # Singapore
            #    ↓
            # Melbourne
            #
            # Both CSV records must exist.
            # =================================================

            one_stop_routes = (
                self._get_one_stop_routes(
                    origin_key,
                    destination_key
                )
            )

            for first_leg, second_leg in (
                one_stop_routes
            ):

                routes.append(
                    self._build_one_stop_route(
                        first_leg,
                        second_leg,
                        container_count
                    )
                )

            # =================================================
            # REMOVE DUPLICATE PATHS
            # =================================================

            unique_routes = {}

            for route in routes:

                path_key = (
                    tuple(
                        route["route_path"]
                    )
                )

                if path_key not in unique_routes:

                    unique_routes[path_key] = route

            routes = list(
                unique_routes.values()
            )

            # =================================================
            # NO ROUTES
            # =================================================

            if not routes:

                return {

                    "status":
                        "not_found",

                    "message":
                        (
                            f"No route found from "
                            f"{origin_clean} to "
                            f"{destination_clean}"
                        ),

                    "available_routes":
                        [],

                    "total_routes":
                        0

                }

            # =================================================
            # SCORE ALL ROUTES
            # =================================================

            routes = self._score_routes(
                routes
            )

            # =================================================
            # BEST ROUTE
            # =================================================

            best_route = routes[0]

            # =================================================
            # DEBUG
            # =================================================

            print()
            print("-" * 65)

            print(
                f"Route search: "
                f"{origin_clean} → "
                f"{destination_clean}"
            )

            print(
                f"Available route options: "
                f"{len(routes)}"
            )

            print(
                f"Best route: "
                f"{best_route['route_display']}"
            )

            print(
                f"Best score: "
                f"{best_route['score']}"
            )

            print(
                "Route options:"
            )

            for route in routes:

                print(
                    f"  #{route['rank']} "
                    f"{route['route_display']} "
                    f"| Score: {route['score']} "
                    f"| {route['transit_days']} days "
                    f"| {route['distance_nm']} NM"
                )

            print("-" * 65)
            print()

            # =================================================
            # FINAL RESPONSE
            # =================================================

            return {

                "status":
                    "success",

                "origin":
                    origin_clean,

                "destination":
                    destination_clean,

                "cargo_type":
                    cargo_type,

                "containers":
                    container_count,

                # -------------------------------------------------
                # SUMMARY
                # -------------------------------------------------

                "total_routes":
                    len(routes),

                "recommended_route":
                    best_route["route_id"],

                "recommended_route_display":
                    best_route["route_display"],

                "recommended_score":
                    best_route["score"],

                "transit_time_days":
                    best_route["transit_days"],

                "distance_nm":
                    best_route["distance_nm"],

                "transshipments":
                    best_route["transshipments"],

                "route_type":
                    best_route["route_type"],

                "base_freight_usd":
                    best_route["base_freight_usd"],

                "estimated_total_usd":
                    best_route["estimated_total_usd"],

                "reason":
                    (
                        "Recommended based on the highest "
                        "combined route score considering "
                        "transit time, distance and "
                        "transshipments."
                    ),

                # -------------------------------------------------
                # ALL AVAILABLE ROUTES
                # -------------------------------------------------

                "available_routes":
                    routes

            }

        # =====================================================
        # EXCEPTION HANDLING
        # =====================================================

        except Exception as error:

            print(
                "Route analysis error:",
                error
            )

            return {

                "status":
                    "error",

                "message":
                    (
                        "Route analysis failed: "
                        f"{str(error)}"
                    ),

                "available_routes":
                    [],

                "total_routes":
                    0

            }

    # =========================================================
    # CONNECTED PORTS
    # =========================================================

    def get_connected_ports(
        self,
        origin
    ):

        try:

            origin_clean = str(
                origin
            ).strip()

            origin_key = (
                origin_clean.lower()
            )

            matching_routes = self.routes[
                self.routes["_origin_key"]
                == origin_key
            ].copy()

            # =================================================
            # NO CONNECTIONS
            # =================================================

            if matching_routes.empty:

                return {

                    "status":
                        "success",

                    "origin":
                        origin_clean,

                    "total_destinations":
                        0,

                    "connections":
                        []

                }

            # =================================================
            # GROUP BY DESTINATION
            # =================================================

            connections = []

            grouped = matching_routes.groupby(
                "destination",
                sort=False
            )

            for destination, group in grouped:

                route_list = []

                for _, row in group.iterrows():

                    route_list.append({

                        "route_id":
                            str(
                                row["route_id"]
                            ),

                        "origin":
                            str(
                                row["origin"]
                            ),

                        "destination":
                            str(
                                row["destination"]
                            ),

                        "transit_days":
                            int(
                                row["transit_days"]
                            ),

                        "distance_nm":
                            int(
                                row["distance_nm"]
                            ),

                        "transshipments":
                            int(
                                row["transshipments"]
                            ),

                        "route_type":
                            str(
                                row["route_type"]
                            ),

                        "base_freight_usd":
                            float(
                                row["base_freight_usd"]
                            )

                    })

                route_count = len(
                    route_list
                )

                connections.append({

                    "destination":
                        str(destination),

                    "route_count":
                        route_count,

                    "total_routes":
                        route_count,

                    "routes":
                        route_list,

                    "available_routes":
                        route_list

                })

            # =================================================
            # SORT
            # =================================================

            connections.sort(
                key=lambda item:
                    item["destination"].lower()
            )

            # =================================================
            # RESPONSE
            # =================================================

            return {

                "status":
                    "success",

                "origin":
                    origin_clean,

                "total_destinations":
                    len(connections),

                "connections":
                    connections

            }

        except Exception as error:

            print(
                "Connected ports error:",
                error
            )

            return {

                "status":
                    "error",

                "message":
                    (
                        "Could not load connected "
                        f"ports: {str(error)}"
                    ),

                "total_destinations":
                    0,

                "connections":
                    []

            }