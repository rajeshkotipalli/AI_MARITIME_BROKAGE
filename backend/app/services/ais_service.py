import asyncio
import json
import os
import threading
import time
from typing import Dict, Any, List, Optional

import websockets
from dotenv import load_dotenv


load_dotenv()


# ============================================================
# WAYPOINT AI — AIS SERVICE
# ============================================================

AISSTREAM_URL = "wss://stream.aisstream.io/v0/stream"

AISSTREAM_API_KEY = os.getenv("AISSTREAM_API_KEY")


# Singapore / Singapore Strait
DEFAULT_BOUNDING_BOX = [
    [
        [1.0, 103.0],
        [1.6, 104.2]
    ]
]


class AISService:
    """
    Maintains a background connection to AISstream and stores
    the latest position received for each vessel.
    """

    def __init__(self):

        self.vessels: Dict[str, Dict[str, Any]] = {}

        self.running = False
        self.connected = False

        self.loop: Optional[asyncio.AbstractEventLoop] = None
        self.thread: Optional[threading.Thread] = None

        self.last_message_time = None
        self.last_error = None

        self.lock = threading.Lock()

    # ========================================================
    # START SERVICE
    # ========================================================

    def start(self):

        if self.running:
            print("AIS service is already running.")
            return

        if not AISSTREAM_API_KEY:
            print(
                "⚠ AISSTREAM_API_KEY is missing. "
                "AIS service will not start."
            )
            return

        self.running = True

        self.thread = threading.Thread(
            target=self._run_background_loop,
            daemon=True
        )

        self.thread.start()

        print("🚢 AIS background service started.")

    # ========================================================
    # BACKGROUND EVENT LOOP
    # ========================================================

    def _run_background_loop(self):

        try:

            self.loop = asyncio.new_event_loop()

            asyncio.set_event_loop(self.loop)

            self.loop.run_until_complete(
                self._connect_and_receive()
            )

        except Exception as exc:

            self.last_error = str(exc)

            print(
                f"❌ AIS background loop error: {exc}"
            )

        finally:

            self.connected = False

    # ========================================================
    # CONNECT TO AIS STREAM
    # ========================================================

    async def _connect_and_receive(self):

        subscription = {

            "APIKey": AISSTREAM_API_KEY,

            "BoundingBoxes": DEFAULT_BOUNDING_BOX,

            "FilterMessageTypes": [
                "PositionReport"
            ]
        }

        while self.running:

            try:

                print(
                    "🔌 Connecting to AISstream..."
                )

                async with websockets.connect(

                    AISSTREAM_URL,

                    compression="deflate",

                    ping_interval=20,

                    ping_timeout=20,

                    close_timeout=10

                ) as websocket:

                    self.connected = True
                    self.last_error = None

                    print(
                        "✅ AISstream connected."
                    )

                    await websocket.send(
                        json.dumps(subscription)
                    )

                    print(
                        "📡 AIS subscription sent."
                    )

                    async for raw_message in websocket:

                        if not self.running:
                            break

                        await self._process_message(
                            raw_message
                        )

            except Exception as exc:

                self.connected = False
                self.last_error = str(exc)

                print(
                    f"⚠ AIS connection error: {exc}"
                )

                if self.running:

                    print(
                        "🔄 Reconnecting to AISstream "
                        "in 5 seconds..."
                    )

                    await asyncio.sleep(5)

    # ========================================================
    # PROCESS AIS MESSAGE
    # ========================================================

    async def _process_message(
        self,
        raw_message
    ):

        try:

            if isinstance(raw_message, bytes):

                raw_message = raw_message.decode(
                    "utf-8"
                )

            message = json.loads(
                raw_message
            )

        except Exception as exc:

            self.last_error = (
                f"Message parsing error: {exc}"
            )

            return

        message_type = message.get(
            "MessageType"
        )

        if message_type != "PositionReport":

            return

        position = (
            message
            .get("Message", {})
            .get("PositionReport", {})
        )

        metadata = message.get(
            "MetaData",
            {}
        )

        # ----------------------------------------------------
        # Extract vessel identity
        # ----------------------------------------------------

        mmsi = (

            position.get("UserID")

            or metadata.get("MMSI")

            or metadata.get("mmsi")
        )

        if not mmsi:

            return

        mmsi = str(mmsi)

        # ----------------------------------------------------
        # Extract vessel information
        # ----------------------------------------------------

        vessel_name = (

            metadata.get("ShipName")

            or metadata.get("shipName")

            or "Unknown Vessel"
        )

        latitude = position.get(
            "Latitude"
        )

        longitude = position.get(
            "Longitude"
        )

        speed = position.get(
            "Sog"
        )

        course = position.get(
            "Cog"
        )

        heading = position.get(
            "TrueHeading"
        )

        navigation_status = position.get(
            "NavigationalStatus"
        )

        timestamp = time.time()

        # ----------------------------------------------------
        # Ignore invalid coordinates
        # ----------------------------------------------------

        if latitude is None or longitude is None:

            return

        # ----------------------------------------------------
        # Store latest vessel position
        # ----------------------------------------------------

        vessel_data = {

            "mmsi": mmsi,

            "name": vessel_name.strip(),

            "latitude": latitude,

            "longitude": longitude,

            "speed_knots": speed,

            "course": course,

            "heading": heading,

            "navigation_status":
                navigation_status,

            "last_update": timestamp
        }

        with self.lock:

            self.vessels[mmsi] = vessel_data

        self.last_message_time = timestamp

    # ========================================================
    # GET ALL LIVE VESSELS
    # ========================================================

    def get_vessels(
        self,
        max_age_seconds: int = 600
    ) -> List[Dict[str, Any]]:

        current_time = time.time()

        results = []

        with self.lock:

            for mmsi, vessel in self.vessels.items():

                age = (
                    current_time
                    - vessel["last_update"]
                )

                if age <= max_age_seconds:

                    vessel_copy = dict(
                        vessel
                    )

                    vessel_copy[
                        "age_seconds"
                    ] = round(age, 1)

                    results.append(
                        vessel_copy
                    )

        return results

    # ========================================================
    # GET ONE VESSEL
    # ========================================================

    def get_vessel(
        self,
        mmsi: str
    ) -> Optional[Dict[str, Any]]:

        with self.lock:

            vessel = self.vessels.get(
                str(mmsi)
            )

            if not vessel:

                return None

            vessel_copy = dict(
                vessel
            )

        age = (
            time.time()
            - vessel_copy["last_update"]
        )

        vessel_copy[
            "age_seconds"
        ] = round(age, 1)

        return vessel_copy

    # ========================================================
    # SERVICE STATUS
    # ========================================================

    def get_status(self):

        return {

            "running": self.running,

            "connected": self.connected,

            "vessel_count": len(
                self.vessels
            ),

            "last_message_time":
                self.last_message_time,

            "last_error":
                self.last_error
        }

    # ========================================================
    # STOP SERVICE
    # ========================================================

    def stop(self):

        self.running = False

        self.connected = False

        print(
            "🛑 AIS service stopped."
        )


# ============================================================
# GLOBAL AIS SERVICE INSTANCE
# ============================================================

ais_service = AISService()