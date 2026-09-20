import time

from app.services.ais_service import ais_service


print("=" * 65)
print("WAYPOINT AI — AIS SERVICE TEST")
print("=" * 65)

print()
print("Starting AIS service...")

ais_service.start()

print()
print("Waiting for live vessel data...")
print()

try:

    while True:

        time.sleep(10)

        print()
        print("-" * 65)

        status = ais_service.get_status()

        print(
            "AIS Connected:",
            status["connected"]
        )

        print(
            "Stored Vessels:",
            status["vessel_count"]
        )

        vessels = ais_service.get_vessels()

        for vessel in vessels[:10]:

            print()
            print(
                f"🚢 {vessel['name']}"
            )

            print(
                f"   MMSI       : {vessel['mmsi']}"
            )

            print(
                f"   Latitude   : {vessel['latitude']}"
            )

            print(
                f"   Longitude  : {vessel['longitude']}"
            )

            print(
                f"   Speed      : "
                f"{vessel['speed_knots']} knots"
            )

            print(
                f"   Course     : "
                f"{vessel['course']}°"
            )

            print(
                f"   Age        : "
                f"{vessel['age_seconds']} sec"
            )

except KeyboardInterrupt:

    print()
    print("Stopping AIS service...")

    ais_service.stop()