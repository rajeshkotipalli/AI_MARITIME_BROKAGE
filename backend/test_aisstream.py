import asyncio
import json
import os

import websockets
from dotenv import load_dotenv


# ============================================================
# WAYPOINT AI — AIS STREAM LIVE VESSEL TEST
# ============================================================

load_dotenv()

AISSTREAM_API_KEY = os.getenv("AISSTREAM_API_KEY")

if not AISSTREAM_API_KEY:
    raise RuntimeError(
        "AISSTREAM_API_KEY is missing from backend/.env"
    )


AISSTREAM_URL = "wss://stream.aisstream.io/v0/stream"


async def connect_ais_stream():

    # --------------------------------------------------------
    # Subscription
    # --------------------------------------------------------
    #
    # Singapore / Singapore Strait maritime area
    #
    # Bounding box:
    # Latitude  : 1.0 → 1.6
    # Longitude : 103.0 → 104.2
    #
    # --------------------------------------------------------

    subscription = {
        "APIKey": AISSTREAM_API_KEY,

        "BoundingBoxes": [
            [
                [1.0, 103.0],
                [1.6, 104.2]
            ]
        ],

        "FilterMessageTypes": [
            "PositionReport"
        ]
    }

    print("=" * 65)
    print("WAYPOINT AI — AIS STREAM TEST")
    print("=" * 65)
    print()
    print("Target area : Singapore / Singapore Strait")
    print("Latitude    : 1.0 → 1.6")
    print("Longitude   : 103.0 → 104.2")
    print()
    print("Connecting to AIS Stream...")
    print()

    try:

        async with websockets.connect(
            AISSTREAM_URL,
            compression="deflate",
            ping_interval=20,
            ping_timeout=20,
            close_timeout=10
        ) as websocket:

            print("✅ Connected successfully.")
            print()
            print("Sending AIS subscription...")

            await websocket.send(
                json.dumps(subscription)
            )

            print("✅ Subscription sent.")
            print()
            print("Waiting for live AIS messages...")
            print("-" * 65)

            vessel_count = 0
            message_count = 0

            async for raw_message in websocket:

                # ------------------------------------------------
                # Decode incoming WebSocket message
                # ------------------------------------------------

                try:

                    if isinstance(raw_message, bytes):
                        raw_message = raw_message.decode(
                            "utf-8"
                        )

                    message = json.loads(
                        raw_message
                    )

                except UnicodeDecodeError as exc:

                    print(
                        f"⚠ Could not decode WebSocket data: {exc}"
                    )

                    continue

                except json.JSONDecodeError as exc:

                    print(
                        f"⚠ Invalid JSON received: {exc}"
                    )

                    continue

                message_count += 1

                # ------------------------------------------------
                # Identify message type
                # ------------------------------------------------

                message_type = message.get(
                    "MessageType"
                )

                print(
                    f"📡 Message #{message_count}: "
                    f"{message_type}"
                )

                # ------------------------------------------------
                # Subscription confirmation
                # ------------------------------------------------

                if message_type == "SubscriptionConfirmation":

                    confirmation = message.get(
                        "Message",
                        {}
                    )

                    compression_enabled = confirmation.get(
                        "CompressionEnabled"
                    )

                    print()
                    print("✅ AIS subscription confirmed.")
                    print(
                        "Compression enabled:",
                        compression_enabled
                    )
                    print()
                    print(
                        "Waiting for vessel PositionReport messages..."
                    )
                    print("-" * 65)

                    continue

                # ------------------------------------------------
                # Ignore messages that aren't vessel positions
                # ------------------------------------------------

                if message_type != "PositionReport":

                    continue

                # ------------------------------------------------
                # Extract PositionReport
                # ------------------------------------------------

                position = (
                    message
                    .get("Message", {})
                    .get("PositionReport", {})
                )

                metadata = message.get(
                    "MetaData",
                    {}
                )

                # ------------------------------------------------
                # Vessel identity
                # ------------------------------------------------

                mmsi = (
                    position.get("UserID")
                    or metadata.get("MMSI")
                    or metadata.get("mmsi")
                )

                ship_name = (
                    metadata.get("ShipName")
                    or metadata.get("shipName")
                    or "Unknown Vessel"
                )

                # ------------------------------------------------
                # Position
                # ------------------------------------------------

                latitude = (
                    position.get("Latitude")
                    or metadata.get("Latitude")
                    or metadata.get("latitude")
                )

                longitude = (
                    position.get("Longitude")
                    or metadata.get("Longitude")
                    or metadata.get("longitude")
                )

                # ------------------------------------------------
                # Movement information
                # ------------------------------------------------

                speed = position.get("Sog")
                course = position.get("Cog")
                heading = position.get("TrueHeading")

                navigation_status = position.get(
                    "NavigationalStatus"
                )

                # ------------------------------------------------
                # Print vessel information
                # ------------------------------------------------

                vessel_count += 1

                print()
                print("=" * 65)
                print(
                    f"🚢 LIVE VESSEL #{vessel_count}"
                )
                print("=" * 65)

                print(
                    f"Vessel Name       : {ship_name}"
                )

                print(
                    f"MMSI              : {mmsi}"
                )

                print(
                    f"Latitude          : {latitude}"
                )

                print(
                    f"Longitude         : {longitude}"
                )

                print(
                    f"Speed             : {speed} knots"
                )

                print(
                    f"Course            : {course}°"
                )

                print(
                    f"Heading           : {heading}°"
                )

                print(
                    f"Navigation Status : {navigation_status}"
                )

                print("=" * 65)

                # ------------------------------------------------
                # Stop after receiving 10 vessels
                # ------------------------------------------------

                if vessel_count >= 10:

                    print()
                    print("=" * 65)
                    print(
                        "✅ Received 10 live vessel updates."
                    )
                    print(
                        "AIS STREAM TEST SUCCESSFUL"
                    )
                    print("=" * 65)

                    break

    except websockets.exceptions.ConnectionClosed as exc:

        print()
        print("=" * 65)
        print("⚠ AIS CONNECTION CLOSED")
        print("=" * 65)

        print(
            f"Code   : {exc.code}"
        )

        print(
            f"Reason : {exc.reason}"
        )

    except asyncio.TimeoutError:

        print()
        print("=" * 65)
        print("⚠ AIS CONNECTION TIMEOUT")
        print("=" * 65)

    except Exception as exc:

        print()
        print("=" * 65)
        print("❌ AIS STREAM ERROR")
        print("=" * 65)

        print(
            f"Type    : {type(exc).__name__}"
        )

        print(
            f"Message : {exc}"
        )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    try:

        asyncio.run(
            connect_ais_stream()
        )

    except KeyboardInterrupt:

        print()
        print("=" * 65)
        print("AIS test stopped by user.")
        print("=" * 65)