
from app.agents.ai_agent import WaypointAIAgent
from pydantic import BaseModel

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    Request
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from jose import jwt, JWTError

# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

from dotenv import load_dotenv

load_dotenv()

from typing import Optional, Dict, Any

import os
import json
from datetime import datetime
from math import radians, sin, cos, asin, sqrt
import urllib.parse
import urllib.request
import urllib.error
import io
import traceback
import csv
import smtplib
from email.message import EmailMessage


# =========================================================
# SAFE PDF FORMATTERS
# =========================================================

def _pdf_money(value, fallback="-"):
    """Format a monetary value without turning missing data into $0.00."""
    try:
        if value is None or value == "":
            return fallback
        number = float(value)
        if number != number or number in (float("inf"), float("-inf")):
            return fallback
        return f"${number:,.2f}"
    except (TypeError, ValueError):
        return fallback


def _pdf_number(value, decimals=2, fallback="-"):
    """Safely format numeric quotation fields for PDF output."""
    try:
        if value is None or value == "":
            return fallback
        number = float(value)
        if number != number or number in (float("inf"), float("-inf")):
            return fallback
        return f"{number:,.{decimals}f}"
    except (TypeError, ValueError):
        return fallback


def _pdf_percent(value, decimals=2, fallback="-"):
    """Safely format percentage values for PDF output."""
    formatted = _pdf_number(value, decimals=decimals, fallback=fallback)
    return fallback if formatted == fallback else f"{formatted}%"


def _pdf_text(value, fallback="-"):
    """Make dynamic text safe for ReportLab standard Helvetica fonts."""
    if value is None or value == "":
        return fallback
    try:
        text = str(value)
        return text.encode("latin-1", "replace").decode("latin-1")
    except Exception:
        return fallback


# =========================================================
# DATABASE
# =========================================================

from app.database import (
    Base,
    engine,
    get_db
)


# =========================================================
# MODELS
# =========================================================

from app.models import (
    RouteRequest,
    RegisterRequest,
    LoginRequest,
    OTPRequest
)


# =========================================================
# AUTHENTICATION
# =========================================================

from app.auth import (
    User,
    register_user,
    authenticate_user,
    create_user_token,
    create_admin_token,
    is_admin
)


# =========================================================
# SECURITY
# =========================================================

from app.security import (
    SECRET_KEY,
    ALGORITHM
)


# =========================================================
# OTP
# =========================================================

from app.otp import (
    generate_otp,
    save_otp,
    verify_otp,
    send_otp_email
)


# =========================================================
# SEARCH HISTORY
# =========================================================

from app.history import (
    SearchHistory,
    save_search,
    get_user_history,
    get_history_item,
    delete_history_item
)


# =========================================================
# QUOTATION
# =========================================================
from app.quotation import Quotation
from app.reviews import UserReview
from app.shipment import Shipment


# =========================================================
# ROUTE AGENT
# =========================================================

from app.agents.route_agent import RouteAgent
from app.agents.weather_agent import WeatherAgent
from app.agents.customs_agent import CustomsAgent
from app.services.quotation_service import QuotationService
from app.services.freight_intelligence_service import FreightIntelligenceService
from app.services.ais_service import ais_service


# =========================================================
# DATABASE TABLE CREATION
# =========================================================

Base.metadata.create_all(
    bind=engine
)

# =========================================================
# MAP TRACING DATABASE TABLE
# =========================================================
# Stores user-drawn maritime traces without affecting existing tables.

try:
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS map_traces (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    points_json TEXT NOT NULL,
                    total_distance_nm REAL NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
        )
except Exception as trace_schema_error:
    print("Map trace schema warning:", trace_schema_error)

# =========================================================
# SAFE DATABASE SCHEMA UPGRADE
# =========================================================
# create_all() does not add columns to an existing table.
# Add the quotation pricing snapshot column when upgrading
# an existing SQLite database without deleting old data.

try:
    quotation_columns = {
        column["name"]
        for column in inspect(engine).get_columns("quotations")
    }

    if "pricing_snapshot" not in quotation_columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE quotations "
                    "ADD COLUMN pricing_snapshot TEXT"
                )
            )
        print("Database upgraded: pricing_snapshot column added.")

except Exception as schema_error:
    print("Quotation schema upgrade warning:", schema_error)

# =========================================================
# REVIEW REPLY DATABASE UPGRADE
# =========================================================
# Existing SQLite installations may already have user_reviews.
# Add administrator response columns without deleting review data.

try:
    review_columns = {
        column["name"]
        for column in inspect(engine).get_columns("user_reviews")
    }

    review_upgrade_columns = {
        "admin_reply": "ALTER TABLE user_reviews ADD COLUMN admin_reply TEXT",
        "admin_reply_at": "ALTER TABLE user_reviews ADD COLUMN admin_reply_at DATETIME",
        "admin_replied_by": "ALTER TABLE user_reviews ADD COLUMN admin_replied_by INTEGER",
    }

    for column_name, alter_sql in review_upgrade_columns.items():
        if column_name not in review_columns:
            with engine.begin() as connection:
                connection.execute(text(alter_sql))
            print(f"Database upgraded: {column_name} column added to user_reviews.")

except Exception as review_schema_error:
    print("Review reply schema warning:", review_schema_error)



# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Agentic Maritime Brokerage Platform",

    description=(
        "AI-powered maritime freight quotation, "
        "route intelligence, authentication, "
        "weather intelligence, analytics and "
        "search history platform."
    ),

    version="4.1.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =========================================================
# MARITIME ROUTING GEOMETRY
# =========================================================

@app.get("/api/maritime-route")
def get_maritime_route(
    origin_lon: float,
    origin_lat: float,
    destination_lon: float,
    destination_lat: float,
):
    """Return GeoJSON-style [longitude, latitude] sea-route coordinates.

    Requires the `searoute` package. This is approximate planning geometry,
    not an authoritative navigational route or a guarantee of avoiding every
    shoal, restricted area, or land pixel at every map zoom level.
    """
    values = (origin_lon, origin_lat, destination_lon, destination_lat)
    if not all(map(lambda value: isinstance(value, (int, float)), values)):
        raise HTTPException(status_code=400, detail="Coordinates must be numeric.")
    if not (-180 <= origin_lon <= 180 and -180 <= destination_lon <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180.")
    if not (-90 <= origin_lat <= 90 and -90 <= destination_lat <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90.")

    try:
        import searoute as sr
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Maritime routing dependency is missing. Install it with: python -m pip install searoute",
        ) from exc

    try:
        feature = sr.searoute(
            [origin_lon, origin_lat],
            [destination_lon, destination_lat],
            units="naut",
        )
        geometry = feature.get("geometry", {}) if isinstance(feature, dict) else {}
        coordinates = geometry.get("coordinates", [])
        if not isinstance(coordinates, list) or len(coordinates) < 2:
            raise ValueError("Routing library returned no usable geometry.")
        cleaned = []
        for coordinate in coordinates:
            if not isinstance(coordinate, (list, tuple)) or len(coordinate) < 2:
                continue
            lon, lat = float(coordinate[0]), float(coordinate[1])
            if not (-180 <= lon <= 180 and -90 <= lat <= 90):
                raise ValueError("Routing library returned out-of-range coordinates.")
            cleaned.append([lon, lat])
        if len(cleaned) < 2:
            raise ValueError("Routing library returned fewer than two valid points.")
        return {
            "status": "success",
            "coordinates": cleaned,
            "distance": feature.get("properties", {}).get("length"),
            "unit": "nautical miles",
            "source": "searoute",
            "disclaimer": "Approximate maritime planning geometry; verify with authoritative navigational data.",
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to calculate maritime route: {exc}",
        ) from exc


# =========================================================
# AIS LIVE VESSEL SERVICE
# =========================================================

@app.on_event("startup")
async def start_ais_service():
    """Start the background AISstream listener when FastAPI starts."""
    ais_service.start()


@app.get("/api/vessels/status")
def get_ais_status():
    """Return AISstream connection and cache status."""
    return {
        "success": True,
        "service": "AISstream",
        **ais_service.get_status()
    }


@app.get("/api/vessels/live")
def get_live_vessels():
    """Return recently received live AIS vessel positions."""
    vessels = ais_service.get_vessels(max_age_seconds=600)
    return {
        "success": True,
        "count": len(vessels),
        "vessels": vessels
    }


@app.get("/api/vessels/{mmsi}")
def get_vessel(mmsi: str):
    """Return the latest cached AIS position for one MMSI."""
    vessel = ais_service.get_vessel(mmsi)
    if vessel is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "VESSEL_NOT_FOUND",
                "message": "Vessel was not found in the recent AIS cache."
            }
        )
    return {
        "success": True,
        "vessel": vessel
    }



# =========================================================
# ROUTE AGENT
# =========================================================

route_agent = RouteAgent()
weather_agent = WeatherAgent()
customs_agent = CustomsAgent()
quotation_service = QuotationService()
freight_intelligence_service = FreightIntelligenceService()
ai_agent = WaypointAIAgent()


# =========================================================
# SECURITY SCHEME
# =========================================================

security = HTTPBearer()


# =========================================================
# AI CHAT REQUEST
# =========================================================

class AIChatRequest(BaseModel):
    message: str
    page: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    language: str = "en"


class FreightIntelligenceRequest(BaseModel):
    origin: str
    destination: str
    cargo_type: str = "General Cargo"
    containers: int = 1


# =========================================================
# MAP TRACING REQUEST MODEL + HELPERS
# =========================================================

class MapTraceRequest(BaseModel):
    name: str = "Untitled Maritime Trace"
    points: list[Dict[str, float]]


def _trace_distance_nm(points):
    earth_radius_nm = 3440.065
    total = 0.0

    for index in range(1, len(points)):
        lat1 = radians(float(points[index - 1]["latitude"]))
        lat2 = radians(float(points[index]["latitude"]))
        delta_lat = lat2 - lat1
        delta_lon = radians(
            float(points[index]["longitude"])
        ) - radians(
            float(points[index - 1]["longitude"])
        )

        haversine = (
            sin(delta_lat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(delta_lon / 2) ** 2
        )

        total += (
            2
            * earth_radius_nm
            * asin(sqrt(min(1.0, haversine)))
        )

    return total


def _validate_trace_points(points):
    if not isinstance(points, list) or len(points) < 2:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_TRACE",
                "message": "A trace must contain at least two points."
            }
        )

    clean = []

    for point in points:
        try:
            latitude = float(point["latitude"])
            longitude = float(point["longitude"])
        except (KeyError, TypeError, ValueError):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_COORDINATE",
                    "message": "Every trace point must contain latitude and longitude."
                }
            )

        if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_COORDINATE",
                    "message": "Latitude/longitude values are outside valid ranges."
                }
            )

        clean.append({
            "latitude": round(latitude, 6),
            "longitude": round(longitude, 6)
        })

    return clean


# =========================================================
# ADMIN LOGIN REQUEST
# =========================================================

class AdminLoginRequest(BaseModel):
    email: str


class ShipmentCreateRequest(BaseModel):
    quotation_id: int
    tracking_reference: Optional[str] = None
    vessel_name: Optional[str] = None
    estimated_departure: Optional[str] = None
    estimated_arrival: Optional[str] = None
    current_location: Optional[str] = None
    notes: Optional[str] = None


class ShipmentUpdateRequest(BaseModel):
    status: Optional[str] = None
    tracking_reference: Optional[str] = None
    vessel_name: Optional[str] = None
    current_location: Optional[str] = None
    estimated_departure: Optional[str] = None
    actual_departure: Optional[str] = None
    estimated_arrival: Optional[str] = None
    actual_arrival: Optional[str] = None
    notes: Optional[str] = None


SHIPMENT_STATUSES = [
    "Booked",
    "Preparing",
    "In Transit",
    "Delayed",
    "Arrived",
    "Delivered",
    "Cancelled",
]




# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {

        "success": True,

        "message":
            "Agentic Maritime Brokerage API is running",

        "project":
            "Maritime Freight Quotation Platform",

        "version":
            "4.0.0",

        "features": [

            "User Registration",

            "User Login",

            "Password Hashing",

            "Gmail OTP Verification",

            "Two-Step Verification",

            "JWT Authentication",

            "Route Intelligence",

            "Multiple Route Comparison",

            "Best Route Recommendation",

            "Connected Ports",

            "Search History",

            "Quotation Requests",

            "My Quotations",

            "Quotation Status Tracking",
            "Quotation Email Delivery",
            "Quotation PDF Generation",
            "Quotation Status Management",
            "Quotation Details",
            "Shipment Tracking",

            "Data Analytics",

            "Operations Dashboard API",

            "Weather Intelligence",

            "Weather Forecast",

            "Weather Risk Assessment",

            "Container Validation",

            "Error Handling"

        ]
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health_check():

    return {

        "success": True,

        "status": "healthy",

        "service":
            "Waypoint Maritime Brokerage API"

    }


# =========================================================
# GET CURRENT USER FROM JWT
# =========================================================

def get_current_user(

    credentials: HTTPAuthorizationCredentials =
        Depends(security),

    db: Session =
        Depends(get_db)

):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(
                status_code=401,

                detail={
                    "error":
                        "INVALID_TOKEN",

                    "message":
                        "Invalid authentication token."
                }
            )

        user = (
            db.query(User)
            .filter(
                User.id == int(user_id)
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=401,

                detail={
                    "error":
                        "USER_NOT_FOUND",

                    "message":
                        "User account no longer exists."
                }
            )

        return user

    except JWTError:

        raise HTTPException(
            status_code=401,

            detail={
                "error":
                    "INVALID_TOKEN",

                "message":
                    "Your session has expired or is invalid."
            }
        )

    except ValueError:

        raise HTTPException(
            status_code=401,

            detail={
                "error":
                    "INVALID_TOKEN",

                "message":
                    "Invalid user identity in token."
            }
        )


# =========================================================
# GET CURRENT ADMIN FROM JWT
# =========================================================

def get_current_admin(
    credentials: HTTPAuthorizationCredentials =
        Depends(security),
    db: Session =
        Depends(get_db)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        token_role = payload.get("role")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail={
                    "error": "INVALID_ADMIN_TOKEN",
                    "message": "Invalid administrator authentication token."
                }
            )

        if token_role != "admin":
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "ADMIN_ACCESS_REQUIRED",
                    "message": "Administrator access is required."
                }
            )

        admin = (
            db.query(User)
            .filter(User.id == int(user_id))
            .first()
        )

        if not admin:
            raise HTTPException(
                status_code=401,
                detail={
                    "error": "ADMIN_NOT_FOUND",
                    "message": "Administrator account no longer exists."
                }
            )

        if not is_admin(admin):
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "ADMIN_ACCESS_DENIED",
                    "message": "This account is no longer an administrator."
                }
            )

        return admin

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "INVALID_ADMIN_TOKEN",
                "message": "Your administrator session has expired or is invalid."
            }
        )

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "INVALID_ADMIN_TOKEN",
                "message": "Invalid administrator identity in token."
            }
        )


def _shipment_record(shipment, quotation=None):
    record = {
        "id": shipment.id,
        "quotation_id": shipment.quotation_id,
        "user_id": shipment.user_id,
        "tracking_reference": shipment.tracking_reference,
        "vessel_name": shipment.vessel_name,
        "status": shipment.status,
        "current_location": shipment.current_location,
        "estimated_departure": shipment.estimated_departure,
        "actual_departure": shipment.actual_departure,
        "estimated_arrival": shipment.estimated_arrival,
        "actual_arrival": shipment.actual_arrival,
        "notes": shipment.notes,
        "created_at": shipment.created_at.isoformat() if shipment.created_at else None,
        "updated_at": shipment.updated_at.isoformat() if shipment.updated_at else None,
    }
    if quotation is not None:
        record.update({
            "company_name": quotation.company_name,
            "email": quotation.email,
            "origin": quotation.origin,
            "destination": quotation.destination,
            "route_id": quotation.route_id,
            "cargo_type": quotation.cargo_type,
            "cargo_weight": quotation.cargo_weight,
            "containers": quotation.containers,
        })
    return record


@app.get("/api/shipment-health")
def shipment_health():
    return {
        "success": True,
        "service": "Shipment Tracking",
        "status": "healthy",
    }


@app.get("/api/my-shipments")
def get_my_shipments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    shipments = (
        db.query(Shipment)
        .filter(Shipment.user_id == current_user.id)
        .order_by(Shipment.created_at.desc())
        .all()
    )
    records = []
    for shipment in shipments:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == shipment.quotation_id)
            .first()
        )
        records.append(_shipment_record(shipment, quotation))
    return {"success": True, "count": len(records), "shipments": records}


@app.get("/api/admin/shipments/options")
def get_shipment_quotation_options(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    eligible_statuses = {"Approved", "Booked", "In Shipping"}
    existing_ids = {row[0] for row in db.query(Shipment.quotation_id).all()}
    quotations = (
        db.query(Quotation)
        .order_by(Quotation.created_at.desc())
        .all()
    )
    options = []
    for quotation in quotations:
        status = (quotation.status or "Pending").strip()
        if status not in eligible_statuses or quotation.id in existing_ids:
            continue
        options.append({
            "id": quotation.id,
            "company_name": quotation.company_name,
            "email": quotation.email,
            "origin": quotation.origin,
            "destination": quotation.destination,
            "route_id": quotation.route_id,
            "cargo_type": quotation.cargo_type,
            "cargo_weight": quotation.cargo_weight,
            "containers": quotation.containers,
            "status": status,
            "created_at": quotation.created_at.isoformat() if quotation.created_at else None,
        })
    return {"success": True, "count": len(options), "quotations": options}


@app.get("/api/admin/shipments")
def get_all_shipments(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    shipments = (
        db.query(Shipment)
        .order_by(Shipment.created_at.desc())
        .all()
    )
    records = []
    for shipment in shipments:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == shipment.quotation_id)
            .first()
        )
        record = _shipment_record(shipment, quotation)
        if quotation is not None:
            record["customer_email"] = quotation.email
        records.append(record)
    return {"success": True, "count": len(records), "shipments": records}


@app.post("/api/admin/shipments")
def create_shipment(
    request: ShipmentCreateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == request.quotation_id)
        .first()
    )
    if quotation is None:
        raise HTTPException(status_code=404, detail="Quotation not found.")

    eligible_statuses = {"Approved", "Booked", "In Shipping"}
    quotation_status = (quotation.status or "Pending").strip()
    if quotation_status not in eligible_statuses:
        raise HTTPException(
            status_code=400,
            detail="Only approved quotations can be converted into shipments.",
        )

    existing = (
        db.query(Shipment)
        .filter(Shipment.quotation_id == quotation.id)
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="A shipment already exists for this quotation.",
        )

    tracking_reference = (
        request.tracking_reference or f"WPA-{quotation.id:06d}"
    ).strip()
    if not tracking_reference:
        raise HTTPException(status_code=400, detail="Tracking reference cannot be empty.")

    duplicate_reference = (
        db.query(Shipment)
        .filter(Shipment.tracking_reference == tracking_reference)
        .first()
    )
    if duplicate_reference is not None:
        raise HTTPException(
            status_code=409,
            detail="Tracking reference is already in use.",
        )

    shipment = Shipment(
        quotation_id=quotation.id,
        user_id=quotation.user_id,
        tracking_reference=tracking_reference,
        vessel_name=request.vessel_name,
        status="Booked",
        current_location=request.current_location or quotation.origin,
        estimated_departure=request.estimated_departure,
        estimated_arrival=request.estimated_arrival,
        notes=request.notes,
    )
    try:
        db.add(shipment)
        db.commit()
        db.refresh(shipment)
    except Exception as exc:
        db.rollback()
        print("Create shipment error:", exc)
        raise HTTPException(status_code=500, detail="Unable to create shipment.")

    return {
        "success": True,
        "message": "Shipment created successfully.",
        "shipment": _shipment_record(shipment, quotation),
    }


@app.patch("/api/admin/shipments/{shipment_id}")
def update_shipment(
    shipment_id: int,
    request: ShipmentUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    shipment = (
        db.query(Shipment)
        .filter(Shipment.id == shipment_id)
        .first()
    )
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found.")

    updates = request.dict(exclude_unset=True)
    if updates.get("status") is not None and updates["status"] not in SHIPMENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid shipment status.",
                "allowed_statuses": SHIPMENT_STATUSES,
            },
        )

    if updates.get("tracking_reference") is not None:
        updates["tracking_reference"] = updates["tracking_reference"].strip()
        if not updates["tracking_reference"]:
            raise HTTPException(status_code=400, detail="Tracking reference cannot be empty.")
        duplicate = (
            db.query(Shipment)
            .filter(
                Shipment.tracking_reference == updates["tracking_reference"],
                Shipment.id != shipment_id,
            )
            .first()
        )
        if duplicate is not None:
            raise HTTPException(status_code=409, detail="Tracking reference is already in use.")

    for field, value in updates.items():
        setattr(shipment, field, value)
    shipment.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(shipment)
    except Exception as exc:
        db.rollback()
        print("Update shipment error:", exc)
        raise HTTPException(status_code=500, detail="Unable to update shipment.")

    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == shipment.quotation_id)
        .first()
    )
    return {
        "success": True,
        "message": "Shipment updated successfully.",
        "shipment": _shipment_record(shipment, quotation),
    }




# =========================================================
# ADMIN OVERVIEW
# =========================================================

@app.get("/api/admin/overview")
def admin_overview(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    try:

        total_users = db.query(User).count()

        quotations = (
            db.query(Quotation)
            .order_by(Quotation.created_at.desc())
            .all()
        )

        total_quotations = len(quotations)
        total_customer_value = 0.0
        total_brokerage_profit = 0.0
        margin_values = []

        pending_quotations = 0
        reviewed_quotations = 0
        completed_quotations = 0

        recent_quotations = []

        for quotation in quotations:

            status = quotation.status or "Pending"
            normalized_status = status.strip().lower()

            if normalized_status == "pending":
                pending_quotations += 1
            elif normalized_status == "reviewed":
                reviewed_quotations += 1
            elif normalized_status == "completed":
                completed_quotations += 1

            pricing = {}

            if quotation.pricing_snapshot:
                try:
                    pricing = json.loads(quotation.pricing_snapshot)
                except (TypeError, ValueError, json.JSONDecodeError):
                    pricing = {}

            customer_value = (
                pricing.get("estimated_total_customer_price_usd")
                or pricing.get("total_customer_price_usd")
                or 0
            )

            try:
                customer_value = float(customer_value)
            except (TypeError, ValueError):
                customer_value = 0.0

            total_customer_value += customer_value

            brokerage_profit = (
                pricing.get("total_brokerage_profit_usd")
                or 0
            )

            try:
                brokerage_profit = float(brokerage_profit)
            except (TypeError, ValueError):
                brokerage_profit = 0.0

            total_brokerage_profit += brokerage_profit

            margin = pricing.get("target_margin_percent")

            try:
                if margin is not None:
                    margin_values.append(float(margin))
            except (TypeError, ValueError):
                pass

            if len(recent_quotations) < 10:
                recent_quotations.append({
                    "id": quotation.id,
                    "company_name": quotation.company_name,
                    "email": quotation.email,
                    "origin": quotation.origin,
                    "destination": quotation.destination,
                    "route_id": quotation.route_id,
                    "cargo_type": quotation.cargo_type,
                    "containers": quotation.containers,
                    "status": status,
                    "customer_value_usd": round(customer_value, 2),
                    "brokerage_profit_usd": round(brokerage_profit, 2),
                    "created_at": (
                        quotation.created_at.isoformat()
                        if quotation.created_at
                        else None
                    )
                })

        average_margin = (
            sum(margin_values) / len(margin_values)
            if margin_values
            else 0.0
        )

        return {
            "success": True,
            "admin": {
                "id": admin.id,
                "name": admin.name,
                "username": admin.username,
                "email": admin.email,
                "role": admin.role
            },
            "overview": {
                "total_customers": total_users,
                "total_quotations": total_quotations,
                "pending_quotations": pending_quotations,
                "reviewed_quotations": reviewed_quotations,
                "completed_quotations": completed_quotations,
                "total_customer_value_usd": round(total_customer_value, 2),
                "total_brokerage_profit_usd": round(total_brokerage_profit, 2),
                "average_margin_percent": round(average_margin, 2)
            },
            "recent_quotations": recent_quotations
        }

    except Exception as e:

        print("Admin overview error:", e)

        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_OVERVIEW_ERROR",
                "message": "Unable to load administrator overview."
            }
        )


# =========================================================
# ADMIN QUOTATIONS
# =========================================================

@app.get("/api/admin/quotations")
def admin_quotations(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        quotations = (
            db.query(Quotation)
            .order_by(Quotation.created_at.desc())
            .all()
        )

        quotation_list = []

        for quotation in quotations:

            # -------------------------------------------------
            # READ PRICING SNAPSHOT
            # -------------------------------------------------

            pricing = {}

            if quotation.pricing_snapshot:
                try:
                    pricing = json.loads(
                        quotation.pricing_snapshot
                    )
                except (TypeError, ValueError, json.JSONDecodeError):
                    pricing = {}

            # -------------------------------------------------
            # CUSTOMER VALUE
            # -------------------------------------------------

            customer_value = (
                pricing.get(
                    "estimated_total_customer_price_usd"
                )
                or pricing.get(
                    "total_customer_price_usd"
                )
                or 0
            )

            try:
                customer_value = float(customer_value)
            except (TypeError, ValueError):
                customer_value = 0.0

            # -------------------------------------------------
            # BROKERAGE PROFIT
            # -------------------------------------------------

            brokerage_profit = (
                pricing.get(
                    "total_brokerage_profit_usd"
                )
                or 0
            )

            try:
                brokerage_profit = float(brokerage_profit)
            except (TypeError, ValueError):
                brokerage_profit = 0.0

            # -------------------------------------------------
            # MARGIN
            # -------------------------------------------------

            margin = (
                pricing.get(
                    "target_margin_percent"
                )
                or 0
            )

            try:
                margin = float(margin)
            except (TypeError, ValueError):
                margin = 0.0

            # -------------------------------------------------
            # BUILD ADMIN QUOTATION RECORD
            # -------------------------------------------------

            quotation_list.append({
                "id": quotation.id,
                "company_name": quotation.company_name,
                "email": quotation.email,
                "phone": quotation.phone,
                "origin": quotation.origin,
                "destination": quotation.destination,
                "route_id": quotation.route_id,
                "cargo_type": quotation.cargo_type,
                "cargo_weight": quotation.cargo_weight,
                "containers": quotation.containers,
                "special_requirements": quotation.special_requirements,
                "status": quotation.status or "Pending",
                "customer_value_usd": round(customer_value, 2),
                "brokerage_profit_usd": round(brokerage_profit, 2),
                "margin_percent": round(margin, 2),
                "created_at": (
                    quotation.created_at.isoformat()
                    if quotation.created_at
                    else None
                )
            })

        return {
            "success": True,
            "count": len(quotation_list),
            "quotations": quotation_list
        }

    except Exception as e:
        print("Admin quotations error:", e)

        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_QUOTATIONS_ERROR",
                "message": "Unable to load administrator quotations."
            }
        )


# =========================================================
# ADMIN QUOTATION EXPORTS / CUSTOMER DECISION NOTIFICATION
# =========================================================

def send_quotation_decision_email(quotation, status):
    """
    Notify the customer after an administrator approves/rejects
    a quotation. SMTP_USERNAME/SMTP_PASSWORD are supported, with
    the existing Gmail environment variables as a fallback.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = (
        os.getenv("SMTP_USERNAME")
        or os.getenv("GMAIL_SENDER_EMAIL")
    )
    smtp_password = (
        os.getenv("SMTP_PASSWORD")
        or os.getenv("GMAIL_APP_PASSWORD")
    )

    if not smtp_username or not smtp_password:
        return False, (
            "SMTP credentials are not configured. "
            "Set SMTP_USERNAME/SMTP_PASSWORD or "
            "GMAIL_SENDER_EMAIL/GMAIL_APP_PASSWORD."
        )

    approved = status == "Approved"
    subject = (
        f"Waypoint AI — Quotation #{quotation.id} Approved"
        if approved
        else f"Waypoint AI — Quotation #{quotation.id} Rejected"
    )

    if approved:
        message_body = f"""
Dear {quotation.company_name},

Your quotation request #{quotation.id} has been APPROVED by Waypoint AI's brokerage team.

Route: {quotation.origin} → {quotation.destination}
Route ID: {quotation.route_id}
Cargo Type: {quotation.cargo_type}
Containers: {quotation.containers}

Your quotation is now approved and ready for the next stage.

Regards,
Waypoint AI Maritime Brokerage
"""
    else:
        message_body = f"""
Dear {quotation.company_name},

Your quotation request #{quotation.id} has been REJECTED by Waypoint AI's brokerage team.

Route: {quotation.origin} → {quotation.destination}
Route ID: {quotation.route_id}
Cargo Type: {quotation.cargo_type}
Containers: {quotation.containers}

Please contact our brokerage team if you need clarification or would like to submit a revised request.

Regards,
Waypoint AI Maritime Brokerage
"""

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = smtp_username
    message["To"] = quotation.email
    message.set_content(message_body.strip())

    try:
        with smtplib.SMTP(
            smtp_host,
            smtp_port,
            timeout=30
        ) as smtp:
            smtp.starttls()
            smtp.login(
                smtp_username,
                smtp_password
            )
            smtp.send_message(message)

        return True, "Customer notification email sent successfully."

    except Exception as email_error:
        print("Quotation decision email error:", email_error)
        return False, str(email_error)


@app.get("/api/admin/quotations/{quotation_id}/csv")
def admin_download_quotation_csv(
    quotation_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == quotation_id)
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_NOT_FOUND",
                    "message": "Quotation was not found."
                }
            )

        pricing = {}
        if quotation.pricing_snapshot:
            try:
                pricing = json.loads(quotation.pricing_snapshot)
            except (TypeError, ValueError, json.JSONDecodeError):
                pricing = {}

        fields = [
            ("quotation_id", quotation.id),
            ("company_name", quotation.company_name),
            ("email", quotation.email),
            ("phone", quotation.phone),
            ("origin", quotation.origin),
            ("destination", quotation.destination),
            ("route_id", quotation.route_id),
            ("cargo_type", quotation.cargo_type),
            ("cargo_weight", quotation.cargo_weight),
            ("containers", quotation.containers),
            ("special_requirements", quotation.special_requirements),
            ("status", quotation.status or "Pending"),
            ("created_at", quotation.created_at.isoformat() if quotation.created_at else ""),
            ("customer_price_per_container_usd", pricing.get("final_selling_price_usd", "")),
            ("total_customer_price_usd", pricing.get("total_customer_price_usd", pricing.get("estimated_total_customer_price_usd", ""))),
            ("operating_cost_usd", pricing.get("operating_cost_usd", "")),
            ("brokerage_profit_usd", pricing.get("total_brokerage_profit_usd", "")),
            ("target_margin_percent", pricing.get("target_margin_percent", "")),
            ("demand_factor", pricing.get("demand_factor", "")),
            ("fuel_surcharge_usd", pricing.get("fuel_surcharge_usd", "")),
            ("port_charge_usd", pricing.get("port_charge_usd", "")),
            ("risk_surcharge_usd", pricing.get("risk_surcharge_usd", "")),
        ]

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["Field", "Value"])
        writer.writerows(fields)

        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="quotation_{quotation.id}_admin_data.csv"'
                )
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print("Admin quotation CSV error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_QUOTATION_CSV_ERROR",
                "message": "Unable to export quotation data."
            }
        )


@app.get("/api/admin/quotations/{quotation_id}/pdf")
def admin_download_quotation_pdf(
    quotation_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == quotation_id)
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_NOT_FOUND",
                    "message": "Quotation was not found."
                }
            )

        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import (
                getSampleStyleSheet,
                ParagraphStyle
            )
            from reportlab.lib.enums import TA_CENTER, TA_RIGHT
            from reportlab.platypus import (
                SimpleDocTemplate,
                Paragraph,
                Spacer,
                Table,
                TableStyle
            )
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "PDF_DEPENDENCY_MISSING",
                    "message": (
                        "PDF generation requires reportlab. "
                        "Install it with: pip install reportlab"
                    )
                }
            )

        pricing = {}
        if quotation.pricing_snapshot:
            try:
                pricing = json.loads(quotation.pricing_snapshot)
            except (TypeError, ValueError, json.JSONDecodeError):
                pricing = {}

        money = _pdf_money

        buffer = io.BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
            title=f"Waypoint Admin Quotation #{quotation.id}"
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "AdminQuotationTitle",
            parent=styles["Title"],
            alignment=TA_CENTER,
            fontSize=20,
            spaceAfter=8
        )
        right_style = ParagraphStyle(
            "AdminQuotationRight",
            parent=styles["Normal"],
            alignment=TA_RIGHT
        )

        story = [
            Paragraph("WAYPOINT", title_style),
            Paragraph(
                "AI MARITIME BROKERAGE — ADMIN EXPORT",
                ParagraphStyle(
                    "AdminSubtitle",
                    parent=styles["Normal"],
                    alignment=TA_CENTER,
                    fontSize=10,
                    spaceAfter=18
                )
            ),
            Paragraph(
                f"<b>Quotation #{quotation.id}</b>",
                styles["Heading2"]
            ),
            Paragraph(
                f"Created: {quotation.created_at.strftime('%d %b %Y %H:%M') if quotation.created_at else '-'}",
                styles["Normal"]
            ),
            Paragraph(
                f"Status: <b>{quotation.status or 'Pending'}</b>",
                styles["Normal"]
            ),
            Spacer(1, 14)
        ]

        customer_data = [
            ["CUSTOMER", "CONTACT"],
            [_pdf_text(quotation.company_name), _pdf_text(quotation.email)],
            [
                f"Phone: {_pdf_text(quotation.phone)}",
                f"Cargo: {_pdf_text(quotation.cargo_type)}"
            ]
        ]

        customer_table = Table(customer_data, colWidths=[250, 250])
        customer_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12344d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 8)
            ])
        )
        story += [customer_table, Spacer(1, 16)]

        shipment_data = [
            ["SHIPMENT DETAIL", "VALUE"],
            [
                "Route",
                f"{_pdf_text(quotation.origin)} -> {_pdf_text(quotation.destination)}"
            ],
            ["Route ID", _pdf_text(quotation.route_id)],
            ["Cargo Type", _pdf_text(quotation.cargo_type)],
            ["Cargo Weight", _pdf_number(quotation.cargo_weight)],
            [
                "Containers",
                str(quotation.containers)
                if quotation.containers is not None
                else "-"
            ],
            ["Special Requirements", quotation.special_requirements or "None"]
        ]

        shipment_table = Table(shipment_data, colWidths=[200, 300])
        shipment_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12344d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("PADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP")
            ])
        )
        story += [shipment_table, Spacer(1, 16)]

        commercial_data = [
            ["INTERNAL COMMERCIAL METRIC", "VALUE"],
            ["Customer Price / Container", money(pricing.get("final_selling_price_usd"))],
            ["Total Customer Price", money(
                    pricing.get("total_customer_price_usd")
                    if pricing.get("total_customer_price_usd") is not None
                    else pricing.get("estimated_total_customer_price_usd")
                )],
            ["Operating Cost", money(pricing.get("operating_cost_usd"))],
            ["Brokerage Profit", money(pricing.get("total_brokerage_profit_usd"))],
            ["Target Margin", _pdf_percent(pricing.get("target_margin_percent"))],
            ["Demand Factor", str(pricing.get("demand_factor", "-"))],
            ["Fuel Surcharge", money(pricing.get("fuel_surcharge_usd"))],
            ["Port Charge", money(pricing.get("port_charge_usd"))],
            ["Risk Surcharge", money(pricing.get("risk_surcharge_usd"))]
        ]

        commercial_table = Table(commercial_data, colWidths=[330, 170])
        commercial_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f8f87")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("PADDING", (0, 0), (-1, -1), 8),
                ("FONTNAME", (0, -4), (-1, -1), "Helvetica-Bold")
            ])
        )
        story += [
            Paragraph(
                "<b>ADMIN-ONLY INTERNAL COMMERCIAL DATA</b>",
                styles["Heading3"]
            ),
            Spacer(1, 7),
            commercial_table,
            Spacer(1, 18),
            Paragraph(
                "This export contains internal brokerage pricing and margin information and must not be shared with customers.",
                styles["Normal"]
            ),
            Spacer(1, 14),
            Paragraph(
                "Generated by Waypoint AI Maritime Brokerage.",
                right_style
            )
        ]

        document.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="quotation_{quotation.id}_admin.pdf"'
                )
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print("Admin quotation PDF error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_QUOTATION_PDF_ERROR",
                "message": "Unable to generate admin quotation PDF."
            }
        )


# =========================================================
# ADMIN QUOTATION APPROVAL / REJECTION
# =========================================================

@app.patch("/api/admin/quotations/{quotation_id}/status")
def admin_update_quotation_status(
    quotation_id: int,
    request: dict,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == quotation_id)
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_NOT_FOUND",
                    "message": "Quotation was not found."
                }
            )

        requested_status = str(request.get("status", "")).strip().title()

        if requested_status not in {"Approved", "Rejected"}:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_ADMIN_QUOTATION_STATUS",
                    "message": "Administrator can only approve or reject a quotation."
                }
            )

        current_status = (quotation.status or "Pending").strip().title()

        if current_status in {"Approved", "Rejected"}:
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "QUOTATION_ALREADY_DECIDED",
                    "message": f"This quotation has already been {current_status.lower()}."
                }
            )

        quotation.status = requested_status
        db.commit()
        db.refresh(quotation)

        # The decision is persisted first. If email delivery fails,
        # the quotation decision remains valid and the admin is informed.
        notification_sent, notification_message = (
            send_quotation_decision_email(
                quotation,
                requested_status
            )
        )

        return {
            "success": True,
            "message": (
                "Quotation accepted successfully."
                if requested_status == "Approved"
                else "Quotation rejected successfully."
            ),
            "quotation_id": quotation.id,
            "status": quotation.status,
            "reviewed_by": admin.email,
            "customer_notification_sent": notification_sent,
            "customer_notification_message": notification_message
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Admin quotation status update error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_QUOTATION_STATUS_ERROR",
                "message": "Unable to update quotation decision."
            }
        )


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.post("/api/admin/login")
def admin_login(
    request: AdminLoginRequest,
    db: Session = Depends(get_db)
):

    try:

        email = str(request.email).strip().lower()

        if not email:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "EMAIL_REQUIRED",
                    "message": "Administrator email is required."
                }
            )

        admin = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not admin or not is_admin(admin):
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "ADMIN_ACCESS_DENIED",
                    "message": "Administrator access denied."
                }
            )

        otp = generate_otp()

        save_otp(
            email=admin.email,
            otp=otp
        )

        email_sent, email_message = send_otp_email(
            recipient_email=admin.email,
            otp=otp
        )

        if not email_sent:
            print("Admin OTP email failed:", email_message)

            raise HTTPException(
                status_code=500,
                detail={
                    "error": "ADMIN_OTP_EMAIL_FAILED",
                    "message": "Unable to send administrator OTP. Please check the Gmail configuration."
                }
            )

        return {
            "success": True,
            "requires_2fa": True,
            "message": "Administrator OTP sent successfully.",
            "email": admin.email,
            "otp_sent": True
        }

    except HTTPException:
        raise

    except Exception as e:

        print("Admin login error:", e)

        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_LOGIN_ERROR",
                "message": "Unable to process administrator login."
            }
        )


# =========================================================
# ADMIN OTP VERIFICATION
# =========================================================

@app.post("/api/admin/verify-otp")
def verify_admin_otp(
    request: OTPRequest,
    db: Session = Depends(get_db)
):

    try:

        email = str(request.email).strip().lower()
        entered_otp = request.otp.strip()

        if not email:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "EMAIL_REQUIRED",
                    "message": "Administrator email is required."
                }
            )

        if len(entered_otp) != 6 or not entered_otp.isdigit():
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_OTP_FORMAT",
                    "message": "OTP must contain exactly 6 digits."
                }
            )

        admin = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not admin or not is_admin(admin):
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "ADMIN_ACCESS_DENIED",
                    "message": "Administrator access denied."
                }
            )

        valid, message = verify_otp(
            email=email,
            entered_otp=entered_otp
        )

        if not valid:
            raise HTTPException(
                status_code=401,
                detail={
                    "error": "INVALID_ADMIN_OTP",
                    "message": message
                }
            )

        admin.is_verified = True
        db.commit()

        token = create_admin_token(admin)

        return {
            "success": True,
            "message": "Administrator two-step verification successful.",
            "access_token": token,
            "token_type": "bearer",
            "admin": {
                "id": admin.id,
                "name": admin.name,
                "username": admin.username,
                "email": admin.email,
                "role": admin.role
            }
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print("Admin OTP verification error:", e)

        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_OTP_VERIFICATION_ERROR",
                "message": "Unable to verify administrator OTP."
            }
        )


# =========================================================
# ADMIN PROFILE
# =========================================================

@app.get("/api/admin/me")
def get_admin_profile(
    current_admin: User =
        Depends(get_current_admin)
):

    return {
        "success": True,
        "admin": {
            "id": current_admin.id,
            "name": current_admin.name,
            "username": current_admin.username,
            "email": current_admin.email,
            "role": current_admin.role
        }
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/api/auth/register")
def register(

    request: RegisterRequest,

    db: Session =
        Depends(get_db)

):

    try:

        if (
            request.password
            !=
            request.confirm_password
        ):

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "PASSWORD_MISMATCH",

                    "message":
                        "Passwords do not match."
                }
            )


        if len(request.password) < 8:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "WEAK_PASSWORD",
                    "message": "Password must contain at least 8 characters."
                }
            )

        if not any(char.isupper() for char in request.password):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "PASSWORD_UPPERCASE_REQUIRED",
                    "message": "Password must contain at least one uppercase letter."
                }
            )

        if not any(not char.isalnum() for char in request.password):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "PASSWORD_SPECIAL_CHARACTER_REQUIRED",
                    "message": "Password must contain at least one special character."
                }
            )


        username = request.username.strip()

        if not username:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_USERNAME",

                    "message":
                        "Username cannot be empty."
                }
            )


        email = str(
            request.email
        ).strip().lower()

        if not email:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_EMAIL",

                    "message":
                        "Email address is required."
                }
            )


        user, result = register_user(

            db=db,

            name=request.name.strip(),

            email=email,

            phone=request.phone.strip(),

            country=request.country.strip(),

            username=username,

            password=request.password
        )


        if result == "USERNAME_EXISTS":

            raise HTTPException(
                status_code=409,

                detail={
                    "error":
                        "USERNAME_EXISTS",

                    "message":
                        "Username already exists. "
                        "Please choose another username."
                }
            )


        if result == "EMAIL_EXISTS":

            raise HTTPException(
                status_code=409,

                detail={
                    "error":
                        "EMAIL_EXISTS",

                    "message":
                        "Email is already registered."
                }
            )


        otp = generate_otp()

        save_otp(
            email=user.email,
            otp=otp
        )


        email_sent, email_message = send_otp_email(

            recipient_email=user.email,

            otp=otp
        )


        if not email_sent:

            print(
                "Registration OTP email failed:",
                email_message
            )

            raise HTTPException(
                status_code=500,

                detail={
                    "error":
                        "OTP_EMAIL_FAILED",

                    "message":
                        "Account was created, but we could not "
                        "send the verification OTP to your email. "
                        "Please check the Gmail configuration."
                }
            )


        return {

            "success": True,

            "message":
                "Registration successful. "
                "A verification OTP has been sent to your email.",

            "email":
                user.email,

            "requires_2fa":
                True,

            "otp_sent":
                True

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "Registration error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "REGISTRATION_ERROR",

                "message":
                    "Unable to create your account."
            }
        )


# =========================================================
# LOGIN
# =========================================================

@app.post("/api/auth/login")
def login(

    request: LoginRequest,

    db: Session =
        Depends(get_db)

):

    try:

        username = request.username.strip()


        if not username:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "USERNAME_REQUIRED",

                    "message":
                        "Please enter your username."
                }
            )


        if not request.password:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "PASSWORD_REQUIRED",

                    "message":
                        "Please enter your password."
                }
            )


        user, status = authenticate_user(

            db=db,

            username=username,

            password=request.password
        )


        if status == "USERNAME_INCORRECT":

            raise HTTPException(
                status_code=401,

                detail={
                    "error":
                        "USERNAME_INCORRECT",

                    "message":
                        "Incorrect username."
                }
            )


        if status == "PASSWORD_INCORRECT":

            raise HTTPException(
                status_code=401,

                detail={
                    "error":
                        "PASSWORD_INCORRECT",

                    "message":
                        "Incorrect password."
                }
            )


        otp = generate_otp()

        save_otp(
            email=user.email,
            otp=otp
        )


        email_sent, email_message = send_otp_email(

            recipient_email=user.email,

            otp=otp
        )


        if not email_sent:

            print(
                "Login OTP email failed:",
                email_message
            )

            raise HTTPException(
                status_code=500,

                detail={
                    "error":
                        "OTP_EMAIL_FAILED",

                    "message":
                        "Unable to send OTP to your registered "
                        "email address. Please check the Gmail "
                        "configuration."
                }
            )


        return {

            "success": True,

            "requires_2fa":
                True,

            "message":
                "Login credentials verified. "
                "An OTP has been sent to your registered email.",

            "email":
                user.email,

            "otp_sent":
                True

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "Login error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "LOGIN_ERROR",

                "message":
                    "Unable to process login."
            }
        )


# =========================================================
# OTP VERIFICATION
# =========================================================

@app.post("/api/auth/verify-otp")
def verify_user_otp(

    request: OTPRequest,

    db: Session =
        Depends(get_db)

):

    try:

        email = str(
            request.email
        ).strip().lower()

        entered_otp = request.otp.strip()


        if not email:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "EMAIL_REQUIRED",

                    "message":
                        "Email is required."
                }
            )


        if not entered_otp:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "OTP_REQUIRED",

                    "message":
                        "Please enter the OTP."
                }
            )


        if len(entered_otp) != 6:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_OTP_FORMAT",

                    "message":
                        "OTP must contain 6 digits."
                }
            )


        if not entered_otp.isdigit():

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_OTP_FORMAT",

                    "message":
                        "OTP must contain only numbers."
                }
            )


        valid, message = verify_otp(

            email=email,

            entered_otp=entered_otp
        )


        if not valid:

            raise HTTPException(
                status_code=401,

                detail={
                    "error":
                        "INVALID_OTP",

                    "message":
                        message
                }
            )


        user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )


        if not user:

            raise HTTPException(
                status_code=404,

                detail={
                    "error":
                        "USER_NOT_FOUND",

                    "message":
                        "User account could not be found."
                }
            )


        user.is_verified = True

        db.commit()


        token = create_user_token(
            user
        )


        return {

            "success": True,

            "message":
                "Two-step verification successful.",

            "access_token":
                token,

            "token_type":
                "bearer",

            "user": {

                "id":
                    user.id,

                "name":
                    user.name,

                "username":
                    user.username,

                "email":
                    user.email,

                "phone":
                    user.phone,

                "country":
                    user.country
            }
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "OTP verification error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "OTP_VERIFICATION_ERROR",

                "message":
                    "Unable to verify OTP."
            }
        )


# =========================================================
# WAYPOINT AI CHAT
# =========================================================

@app.post("/api/ai/chat")
def ai_chat(
    request: AIChatRequest
):
    """
    Local Waypoint AI endpoint.

    This uses the rule-based WaypointAIAgent and does not require
    OpenAI, an external AI API key, RAG, or an internet connection.
    """

    try:
        message = request.message.strip()

        if not message:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "EMPTY_MESSAGE",
                    "message": "Please enter a question."
                }
            )

        # Supported Waypoint AI response languages.
        # The AI agent handles the actual local, rule-based
        # multilingual response generation.
        supported_languages = {"en", "te", "ta", "hi"}

        language = (
            request.language
            or "en"
        ).strip().lower()

        if language not in supported_languages:
            language = "en"

        result = ai_agent.chat(
            message=message,
            page=request.page,
            context=request.context,
            language=language
        )

        return result

    except HTTPException:
        raise

    except Exception as e:
        print(
            "AI chat error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail={
                "error": "AI_CHAT_ERROR",
                "message": "Unable to process the AI request."
            }
        )


# =========================================================
# FREIGHT INTELLIGENCE
# =========================================================

@app.post("/api/freight-intelligence")
def generate_freight_intelligence(
    request: FreightIntelligenceRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Return the unified Freight Intelligence result for a shipment.

    This endpoint intentionally delegates to the existing service so the
    Route, Pricing, Margin, Weather and Customs logic remains unchanged.
    """
    try:
        origin = request.origin.strip()
        destination = request.destination.strip()
        cargo_type = request.cargo_type.strip() or "General Cargo"
        containers = int(request.containers)

        if not origin:
            raise HTTPException(status_code=400, detail="Origin port is required.")
        if not destination:
            raise HTTPException(status_code=400, detail="Destination port is required.")
        if origin.lower() == destination.lower():
            raise HTTPException(
                status_code=400,
                detail="Origin and destination cannot be the same port.",
            )
        if containers < 1:
            raise HTTPException(
                status_code=400,
                detail="Containers must be at least 1.",
            )

        result = freight_intelligence_service.generate_freight_intelligence(
            origin=origin,
            destination=destination,
            cargo_type=cargo_type,
            containers=containers,
        )

        return result

    except HTTPException:
        raise
    except Exception as exc:
        print("Freight Intelligence error:", exc)
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "error": "FREIGHT_INTELLIGENCE_ERROR",
                "message": str(exc),
            },
        ) from exc


# =========================================================
# ROUTE ANALYSIS
# =========================================================

@app.post("/api/routes/analyze")
def analyze_route(

    request: RouteRequest,

    current_user: User =
        Depends(get_current_user),

    db: Session =
        Depends(get_db)

):

    try:

        origin = request.origin.strip()

        destination = request.destination.strip()

        cargo_type = request.cargo_type.strip()

        containers = request.containers


        if not origin:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_ORIGIN",

                    "message":
                        "Origin port is required."
                }
            )


        if not destination:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_DESTINATION",

                    "message":
                        "Destination port is required."
                }
            )


        if (
            origin.lower()
            ==
            destination.lower()
        ):

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "SAME_PORT",

                    "message":
                        "Origin and destination cannot be the same."
                }
            )


        if not cargo_type:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_CARGO",

                    "message":
                        "Cargo type is required."
                }
            )


        if containers <= 0:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_CONTAINER_COUNT",

                    "message":
                        "Container quantity must be greater than zero."
                }
            )


        result = quotation_service.generate_quotation(

            origin=origin,

            destination=destination,

            cargo_type=cargo_type,

            containers=containers
        )


        if result.get("status") == "not_found":

            return result


        # ---------------------------------------------------------
        # INTELLIGENT MAP / DATA INTELLIGENCE
        # ---------------------------------------------------------
        # The quotation service keeps the quotation workflow intact.
        # For the user portal, also expose EVERY route returned by
        # the Route Agent so the map can compare all candidates,
        # including transit time, distance, transshipments and score.

        route_analysis = route_agent.analyze_route(

            origin=origin,

            destination=destination,

            cargo_type=cargo_type,

            containers=containers
        )

        if route_analysis.get("status") == "success":

            result["available_routes"] = (
                route_analysis.get(
                    "available_routes",
                    []
                )
            )

            result["total_routes"] = (
                route_analysis.get(
                    "total_routes",
                    len(
                        result["available_routes"]
                    )
                )
            )

            # Keep the scoring fields available at the top level
            # for the selected/recommended route.
            result["recommended_route"] = (
                route_analysis.get(
                    "recommended_route",
                    result.get("recommended_route")
                )
            )

            result["route_score"] = (
                route_analysis.get(
                    "route_score",
                    result.get("route_score")
                )
            )

            result["transit_time_days"] = (
                route_analysis.get(
                    "transit_time_days",
                    result.get("transit_time_days")
                )
            )

            result["distance_nm"] = (
                route_analysis.get(
                    "distance_nm",
                    result.get("distance_nm")
                )
            )

            result["transshipments"] = (
                route_analysis.get(
                    "transshipments",
                    result.get("transshipments")
                )
            )

            result["route_type"] = (
                route_analysis.get(
                    "route_type",
                    result.get("route_type")
                )
            )


        try:

            save_search(

                db=db,

                user_id=current_user.id,

                route_result=result
            )

        except Exception as history_error:

            print(
                "History save error:",
                history_error
            )

            db.rollback()


        return result


    except HTTPException:

        raise


    except FileNotFoundError:

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "ROUTE_DATASET_MISSING",

                "message":
                    "Route dataset could not be found."
            }
        )


    except Exception as e:

        print(
            "Route analysis error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "ROUTE_ANALYSIS_ERROR",

                "message":
                    "Unable to analyze the requested route."
            }
        )


# =========================================================
# INTELLIGENT MAP — ROUTE DATASET CATALOG
# =========================================================
# Returns every origin/destination represented in routes.csv.
# This keeps the user portal dropdowns synchronized with the
# actual Route Agent dataset instead of a hard-coded frontend list.

@app.get("/api/routes/catalog")
def get_route_catalog(
    current_user: User = Depends(get_current_user)
):

    try:

        routes = getattr(
            route_agent,
            "routes",
            None
        )

        if routes is None:

            raise HTTPException(
                status_code=500,
                detail={
                    "error": "ROUTE_DATASET_UNAVAILABLE",
                    "message": "Route dataset is not available."
                }
            )

        origin_column = routes["origin"].astype(str).str.strip()
        destination_column = routes["destination"].astype(str).str.strip()

        origins = sorted(
            {
                value
                for value in origin_column.tolist()
                if value
            }
        )

        destinations = sorted(
            {
                value
                for value in destination_column.tolist()
                if value
            }
        )

        return {
            "status": "success",
            "total_routes": int(len(routes)),
            "origins": origins,
            "destinations": destinations
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "Route catalog error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail={
                "error": "ROUTE_CATALOG_ERROR",
                "message": "Unable to load route dataset catalog."
            }
        )


# =========================================================
# GET ALL ORIGIN PORTS
# =========================================================

@app.get("/api/ports/origins")
def get_origin_ports(

    current_user: User =
        Depends(get_current_user)

):

    try:

        origins = (
            route_agent.routes["origin"]
            .dropna()
            .astype(str)
            .str.strip()
            .drop_duplicates()
            .sort_values()
            .tolist()
        )

        return {

            "success": True,

            "origins":
                origins

        }


    except Exception as e:

        print(
            "Origin ports error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "PORT_ORIGIN_ERROR",

                "message":
                    "Unable to load origin ports."
            }
        )


# =========================================================
# GET CONNECTED DESTINATION PORTS
# =========================================================

@app.get("/api/ports/connections")
def get_connected_ports(

    origin: str,

    current_user: User =
        Depends(get_current_user)

):

    try:

        origin = origin.strip()


        if not origin:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "ORIGIN_REQUIRED",

                    "message":
                        "Origin port is required."
                }
            )


        result = route_agent.get_connected_ports(
            origin
        )


        if result.get("status") == "error":

            raise HTTPException(
                status_code=500,

                detail={
                    "error":
                        "PORT_CONNECTION_ERROR",

                    "message":
                        result.get(
                            "message",
                            "Unable to load connected ports."
                        )
                }
            )


        return result


    except HTTPException:

        raise


    except Exception as e:

        print(
            "Connected ports error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "PORT_CONNECTION_ERROR",

                "message":
                    "Unable to load connected ports."
            }
        )


# =========================================================
# GET USER SEARCH HISTORY
# =========================================================

@app.get("/api/history")
def get_history(

    current_user: User =
        Depends(get_current_user),

    db: Session =
        Depends(get_db)

):

    try:

        history_items = get_user_history(

            db=db,

            user_id=current_user.id,

            limit=50
        )


        history = []


        for item in history_items:

            history.append({

                "id":
                    item.id,

                "origin":
                    item.origin,

                "destination":
                    item.destination,

                "cargo_type":
                    item.cargo_type,

                "containers":
                    item.containers,

                "recommended_route":
                    item.recommended_route,

                "transit_time_days":
                    item.transit_time_days,

                "distance_nm":
                    item.distance_nm,

                "base_freight_usd":
                    item.base_freight_usd,

                "reason":
                    item.reason,

                "searched_at":
                    item.searched_at.isoformat()
                    if item.searched_at
                    else None
            })


        return {

            "success": True,

            "count":
                len(history),

            "history":
                history
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "History retrieval error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "HISTORY_ERROR",

                "message":
                    "Unable to retrieve search history."
            }
        )


# =========================================================
# GET ONE HISTORY ITEM
# =========================================================

@app.get("/api/history/{history_id}")
def get_history_details(

    history_id: int,

    current_user: User =
        Depends(get_current_user),

    db: Session =
        Depends(get_db)

):

    try:

        item = get_history_item(

            db=db,

            user_id=current_user.id,

            history_id=history_id
        )


        if not item:

            raise HTTPException(
                status_code=404,

                detail={
                    "error":
                        "HISTORY_NOT_FOUND",

                    "message":
                        "Previous search was not found."
                }
            )


        return {

            "success": True,

            "history": {

                "id":
                    item.id,

                "origin":
                    item.origin,

                "destination":
                    item.destination,

                "cargo_type":
                    item.cargo_type,

                "containers":
                    item.containers,

                "recommended_route":
                    item.recommended_route,

                "transit_time_days":
                    item.transit_time_days,

                "distance_nm":
                    item.distance_nm,

                "base_freight_usd":
                    item.base_freight_usd,

                "reason":
                    item.reason,

                "searched_at":
                    item.searched_at.isoformat()
                    if item.searched_at
                    else None
            }
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "History detail error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "HISTORY_DETAIL_ERROR",

                "message":
                    "Unable to retrieve this search."
            }
        )


# =========================================================
# DELETE HISTORY ITEM
# =========================================================

@app.delete("/api/history/{history_id}")
def delete_history(

    history_id: int,

    current_user: User =
        Depends(get_current_user),

    db: Session =
        Depends(get_db)

):

    try:

        deleted = delete_history_item(

            db=db,

            user_id=current_user.id,

            history_id=history_id
        )


        if not deleted:

            raise HTTPException(
                status_code=404,

                detail={
                    "error":
                        "HISTORY_NOT_FOUND",

                    "message":
                        "Previous search was not found."
                }
            )


        return {

            "success": True,

            "message":
                "Previous search deleted successfully."
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "History deletion error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "HISTORY_DELETE_ERROR",

                "message":
                    "Unable to delete this search."
            }
        )


# =========================================================
# CUSTOMER-SAFE QUOTATION DATA
# =========================================================
# Internal brokerage intelligence is stored in pricing_snapshot
# for administrator use, but is never returned by customer APIs.
CUSTOMER_SAFE_PRICING_FIELDS = {
    "status",
    "message",
    "origin",
    "destination",
    "route_id",
    "recommended_route",
    "route_score",
    "route_type",
    "transshipments",
    "transit_time_days",
    "transit_days",
    "distance_nm",
    "cargo_type",
    "containers",
    "final_selling_price_usd",
    "total_customer_price_usd",
    "estimated_total_customer_price_usd",
}


def customer_safe_pricing(pricing):
    if not isinstance(pricing, dict):
        return {}

    return {
        key: pricing[key]
        for key in CUSTOMER_SAFE_PRICING_FIELDS
        if key in pricing
    }


def load_customer_safe_pricing(pricing_snapshot):
    if not pricing_snapshot:
        return {}

    try:
        pricing = json.loads(pricing_snapshot)
    except (TypeError, ValueError, json.JSONDecodeError):
        return {}

    return customer_safe_pricing(pricing)


# =========================================================
# SUBMIT QUOTATION REQUEST
# =========================================================

@app.post("/api/quotations")
def submit_quotation(

    request: dict,

    current_user: User =
        Depends(get_current_user),

    db: Session =
        Depends(get_db)

):

    try:

        company_name = str(
            request.get("company_name", "")
        ).strip()

        email = str(
            request.get("email", "")
        ).strip().lower()

        phone = str(
            request.get("phone", "")
        ).strip()

        origin = str(
            request.get("origin", "")
        ).strip()

        destination = str(
            request.get("destination", "")
        ).strip()

        route_id = str(
            request.get("route_id", "")
        ).strip()

        cargo_type = str(
            request.get("cargo_type", "")
        ).strip()

        special_requirements = str(
            request.get("special_requirements", "")
        ).strip()


        try:

            cargo_weight = float(
                request.get(
                    "cargo_weight",
                    0
                )
            )

            containers = int(
                request.get(
                    "containers",
                    0
                )
            )

        except (
            ValueError,
            TypeError
        ):

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_SHIPMENT_DATA",

                    "message":
                        "Cargo weight and number of containers "
                        "must be valid numbers."
                }
            )


        if not company_name:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "COMPANY_REQUIRED",

                    "message":
                        "Company name is required."
                }
            )


        if not email:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "EMAIL_REQUIRED",

                    "message":
                        "Email address is required."
                }
            )


        if not phone:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "PHONE_REQUIRED",

                    "message":
                        "Phone number is required."
                }
            )


        if not origin:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "ORIGIN_REQUIRED",

                    "message":
                        "Origin port is required."
                }
            )


        if not destination:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "DESTINATION_REQUIRED",

                    "message":
                        "Destination port is required."
                }
            )


        if not route_id:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "ROUTE_REQUIRED",

                    "message":
                        "Please select a route before "
                        "requesting a quotation."
                }
            )


        if cargo_weight <= 0:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_CARGO_WEIGHT",

                    "message":
                        "Cargo weight must be greater than zero."
                }
            )


        if containers <= 0:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_CONTAINER_COUNT",

                    "message":
                        "Number of containers must be greater than zero."
                }
            )


        if not isinstance(containers, int):

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "INVALID_CONTAINER_COUNT",

                    "message":
                        "Number of containers must be a whole number."
                }
            )


        # =========================================================
        # GENERATE COMPLETE DYNAMIC QUOTATION
        # =========================================================

        quotation_result = quotation_service.generate_quotation(
            origin=origin,
            destination=destination,
            cargo_type=cargo_type,
            containers=containers
        )

        if quotation_result.get("status") != "success":
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "QUOTATION_GENERATION_FAILED",
                    "message": quotation_result.get(
                        "message",
                        "Unable to generate quotation."
                    )
                }
            )


        # =========================================================
        # SAVE QUOTATION REQUEST
        # =========================================================

        quotation = Quotation(

            user_id=current_user.id,

            company_name=company_name,

            email=email,

            phone=phone,

            origin=origin,

            destination=destination,

            route_id=route_id,

            cargo_type=cargo_type,

            cargo_weight=cargo_weight,

            containers=containers,

            special_requirements=
                special_requirements,

            pricing_snapshot=json.dumps(
                quotation_result,
                default=str
            ),

            status="Pending"
        )


        db.add(quotation)

        db.commit()

        db.refresh(quotation)


        return {

            "success": True,

            "message":
                "Quotation request submitted successfully.",

            "quotation": {

                "id":
                    quotation.id,

                "company_name":
                    quotation.company_name,

                "email":
                    quotation.email,

                "phone":
                    quotation.phone,

                "origin":
                    quotation.origin,

                "destination":
                    quotation.destination,

                "route_id":
                    quotation.route_id,

                "cargo_type":
                    quotation.cargo_type,

                "cargo_weight":
                    quotation.cargo_weight,

                "containers":
                    quotation.containers,

                "special_requirements":
                    quotation.special_requirements,

                "status":
                    quotation.status,

                "created_at":
                    quotation.created_at.isoformat()
                    if quotation.created_at
                    else None
            },

            # =====================================================
            # CUSTOMER-SAFE PRICING RESULT
            # =====================================================
            # The complete quotation_result remains stored internally
            # for the Admin Dashboard. Only customer-safe fields leave
            # this endpoint.
            "pricing":
                customer_safe_pricing(quotation_result)
        }


    except HTTPException:

        raise


    except Exception as e:

        db.rollback()

        print(
            "Quotation submission error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "QUOTATION_ERROR",

                "message":
                    "Unable to save quotation request."
            }
        )


# =========================================================
# GET MY QUOTATIONS
# =========================================================

@app.get("/api/quotations")
def get_my_quotations(

    current_user: User =
        Depends(get_current_user),

    db: Session =
        Depends(get_db)

):

    try:

        quotations = (
            db.query(Quotation)
            .filter(
                Quotation.user_id ==
                current_user.id
            )
            .order_by(
                Quotation.created_at.desc()
            )
            .all()
        )


        quotation_list = []


        for quotation in quotations:

            quotation_list.append({

                "id":
                    quotation.id,

                "company_name":
                    quotation.company_name,

                "email":
                    quotation.email,

                "phone":
                    quotation.phone,

                "origin":
                    quotation.origin,

                "destination":
                    quotation.destination,

                "route_id":
                    quotation.route_id,

                "cargo_type":
                    quotation.cargo_type,

                "cargo_weight":
                    quotation.cargo_weight,

                "containers":
                    quotation.containers,

                "special_requirements":
                    quotation.special_requirements,

                "pricing":
                    load_customer_safe_pricing(
                        quotation.pricing_snapshot
                    ),
"status":
                    quotation.status or "Pending",

                "created_at":
                    quotation.created_at.isoformat()
                    if quotation.created_at
                    else None

            })


        return {

            "success": True,

            "count":
                len(quotation_list),

            "quotations":
                quotation_list

        }


    except Exception as e:

        print(
            "Quotation retrieval error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "QUOTATION_RETRIEVAL_ERROR",

                "message":
                    "Unable to retrieve your quotations."
            }
        )


# =========================================================
# GET ONE QUOTATION DETAILS
# =========================================================



# =========================================================
# SHARED QUOTATION REVIEWS
# =========================================================
# These endpoints are intentionally separate from /api/quotations.
# /api/quotations remains private to the logged-in owner.
# The review endpoints expose only sanitized quotation information
# that can be viewed by any authenticated Waypoint user.
# =========================================================

def _build_public_quotation_review(quotation):
    pricing = load_customer_safe_pricing(
        quotation.pricing_snapshot
    )

    return {
        "id": quotation.id,
        "route": {
            "origin": quotation.origin,
            "destination": quotation.destination,
            "route_id": quotation.route_id,
            "route_score": pricing.get("route_score"),
            "route_type": pricing.get("route_type"),
            "transit_time_days": (
                pricing.get("transit_time_days")
                or pricing.get("transit_days")
            ),
            "distance_nm": pricing.get("distance_nm"),
            "transshipments": pricing.get("transshipments"),
        },
        "shipment": {
            "cargo_type": quotation.cargo_type,
            "containers": quotation.containers,
        },
        "quotation": {
            "customer_price_per_container_usd": (
                pricing.get("final_selling_price_usd")
            ),
            "total_customer_price_usd": (
                pricing.get("total_customer_price_usd")
                or pricing.get("estimated_total_customer_price_usd")
            ),
        },
        "status": quotation.status or "Pending",
        "created_at": (
            quotation.created_at.isoformat()
            if quotation.created_at
            else None
        ),
        "citation": {
            "route_source": "Waypoint AI Route Agent",
            "pricing_source": "Waypoint AI Freight Pricing Engine",
            "quotation_source": "Waypoint AI Quotation Service",
            "record": (
                f"Waypoint AI Maritime Brokerage Platform. "
                f"Quotation #{quotation.id}, "
                f"{quotation.origin}–{quotation.destination}, "
                f"Route {quotation.route_id}."
            ),
        },
    }


@app.get("/api/quotation-reviews")
def get_shared_quotation_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        quotations = (
            db.query(Quotation)
            .order_by(Quotation.created_at.desc())
            .all()
        )

        reviews = [
            _build_public_quotation_review(quotation)
            for quotation in quotations
        ]

        return {
            "success": True,
            "count": len(reviews),
            "reviews": reviews,
        }

    except Exception as e:
        print("Shared quotation reviews error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "QUOTATION_REVIEWS_ERROR",
                "message": "Unable to load quotation reviews.",
            },
        )


@app.get("/api/quotation-reviews/{quotation_id}")
def get_shared_quotation_review(
    quotation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == quotation_id)
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_REVIEW_NOT_FOUND",
                    "message": "Quotation review was not found.",
                },
            )

        return {
            "success": True,
            "review": _build_public_quotation_review(quotation),
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Shared quotation review detail error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "QUOTATION_REVIEW_ERROR",
                "message": "Unable to load quotation review.",
            },
        )


@app.get("/api/quotations/{quotation_id}")
def get_quotation_details(
    quotation_id: int,
    current_user: User =
        Depends(get_current_user),
    db: Session =
        Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(
                Quotation.id == quotation_id,
                Quotation.user_id == current_user.id
            )
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_NOT_FOUND",
                    "message": "Quotation was not found."
                }
            )

        pricing = load_customer_safe_pricing(quotation.pricing_snapshot)

        return {
            "success": True,
            "quotation": {
                "id": quotation.id,
                "company_name": quotation.company_name,
                "email": quotation.email,
                "phone": quotation.phone,
                "origin": quotation.origin,
                "destination": quotation.destination,
                "route_id": quotation.route_id,
                "cargo_type": quotation.cargo_type,
                "cargo_weight": quotation.cargo_weight,
                "containers": quotation.containers,
                "special_requirements": quotation.special_requirements,
                "status": quotation.status or "Pending",
                "created_at": (
                    quotation.created_at.isoformat()
                    if quotation.created_at
                    else None
                ),
                "pricing": pricing
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Quotation details error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "QUOTATION_DETAILS_ERROR",
                "message": "Unable to retrieve quotation details."
            }
        )


# =========================================================
# UPDATE QUOTATION STATUS
# =========================================================

@app.patch("/api/quotations/{quotation_id}/status")
def update_quotation_status(
    quotation_id: int,
    request: dict,
    current_user: User =
        Depends(get_current_user),
    db: Session =
        Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(
                Quotation.id == quotation_id,
                Quotation.user_id == current_user.id
            )
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_NOT_FOUND",
                    "message": "Quotation was not found."
                }
            )

        status = str(
            request.get("status", "")
        ).strip().title()

        allowed_statuses = {
            "Reviewed"
        }

        if status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_QUOTATION_STATUS",
                    "message": (
                        "Status must be one of: "
                        + ", ".join(sorted(allowed_statuses))
                    )
                }
            )

        quotation.status = status
        db.commit()
        db.refresh(quotation)

        return {
            "success": True,
            "message": "Quotation status updated successfully.",
            "quotation_id": quotation.id,
            "status": quotation.status
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Quotation status update error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "QUOTATION_STATUS_ERROR",
                "message": "Unable to update quotation status."
            }
        )


# =========================================================
# GENERATE QUOTATION PDF
# =========================================================

@app.get("/api/quotations/{quotation_id}/pdf")
def generate_quotation_pdf(
    quotation_id: int,
    current_user: User =
        Depends(get_current_user),
    db: Session =
        Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(
                Quotation.id == quotation_id,
                Quotation.user_id == current_user.id
            )
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_NOT_FOUND",
                    "message": "Quotation was not found."
                }
            )

        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.enums import TA_CENTER, TA_RIGHT
            from reportlab.platypus import (
                SimpleDocTemplate,
                Paragraph,
                Spacer,
                Table,
                TableStyle
            )
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "PDF_DEPENDENCY_MISSING",
                    "message": (
                        "PDF generation requires reportlab. "
                        "Install it with: pip install reportlab"
                    )
                }
            )

        pricing = load_customer_safe_pricing(quotation.pricing_snapshot)

        money = _pdf_money

        buffer = io.BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
            title=f"Waypoint Quotation #{quotation.id}"
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "QuotationTitle",
            parent=styles["Title"],
            alignment=TA_CENTER,
            fontSize=20,
            spaceAfter=8
        )
        right_style = ParagraphStyle(
            "Right",
            parent=styles["Normal"],
            alignment=TA_RIGHT
        )

        story = []

        story.append(
            Paragraph(
                "WAYPOINT",
                title_style
            )
        )
        story.append(
            Paragraph(
                "AI MARITIME BROKERAGE",
                ParagraphStyle(
                    "Subtitle",
                    parent=styles["Normal"],
                    alignment=TA_CENTER,
                    fontSize=10,
                    spaceAfter=18
                )
            )
        )

        story.append(
            Paragraph(
                f"<b>Quotation #{quotation.id}</b>",
                styles["Heading2"]
            )
        )
        story.append(
            Paragraph(
                f"Created: {quotation.created_at.strftime('%d %b %Y') if quotation.created_at else '-'}",
                styles["Normal"]
            )
        )
        story.append(
            Paragraph(
                f"Status: <b>{quotation.status or 'Pending'}</b>",
                styles["Normal"]
            )
        )
        story.append(Spacer(1, 14))

        customer_data = [
            ["CUSTOMER", "CONTACT"],
            [
                _pdf_text(quotation.company_name),
                _pdf_text(quotation.email)
            ],
            [
                f"Phone: {_pdf_text(quotation.phone)}",
                f"Cargo: {_pdf_text(quotation.cargo_type)}"
            ]
        ]

        customer_table = Table(
            customer_data,
            colWidths=[250, 250]
        )
        customer_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12344d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 8)
            ])
        )
        story.append(customer_table)
        story.append(Spacer(1, 16))

        shipment_data = [
            ["SHIPMENT DETAIL", "VALUE"],
            [
                "Route",
                f"{_pdf_text(quotation.origin)} -> {_pdf_text(quotation.destination)}"
            ],
            ["Route ID", _pdf_text(quotation.route_id)],
            ["Cargo Type", _pdf_text(quotation.cargo_type)],
            ["Cargo Weight", _pdf_number(quotation.cargo_weight)],
            [
                "Containers",
                str(quotation.containers)
                if quotation.containers is not None
                else "-"
            ]
        ]

        shipment_table = Table(
            shipment_data,
            colWidths=[200, 300]
        )
        shipment_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12344d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("PADDING", (0, 0), (-1, -1), 8)
            ])
        )
        story.append(shipment_table)
        story.append(Spacer(1, 16))

        pricing_data = [
            ["QUOTATION", "AMOUNT"],
            [
                "Customer Price / Container",
                money(pricing.get("final_selling_price_usd"))
            ],
            [
                "Final Customer Quotation",
                money(
                    pricing.get("total_customer_price_usd")
                    or pricing.get("estimated_total_customer_price_usd")
                )
            ]
        ]

        pricing_table = Table(
            pricing_data,
            colWidths=[330, 170]
        )
        pricing_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12344d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("PADDING", (0, 0), (-1, -1), 8),
                ("FONTNAME", (0, -2), (-1, -1), "Helvetica-Bold")
            ])
        )
        story.append(pricing_table)
        story.append(Spacer(1, 16))

        story.append(
            Paragraph(
                "<b>Special Requirements:</b> "
                + _pdf_text(quotation.special_requirements, "None"),
                styles["Normal"]
            )
        )
        story.append(Spacer(1, 18))
        story.append(
            Paragraph(
                "Generated by Waypoint AI Maritime Brokerage.",
                right_style
            )
        )

        document.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="quotation_{quotation.id}.pdf"'
                )
            }
        )

    except HTTPException:
        raise

    except Exception as e:
        print("\n===== QUOTATION PDF ERROR =====")
        print("Quotation ID:", quotation_id)
        print("Error type:", type(e).__name__)
        print("Error:", repr(e))
        traceback.print_exc()
        print("===== END QUOTATION PDF ERROR =====\n")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "QUOTATION_PDF_ERROR",
                "message": f"Unable to generate quotation PDF: {type(e).__name__}: {str(e)}"
            }
        )


# =========================================================
# EMAIL QUOTATION
# =========================================================

@app.post("/api/quotations/{quotation_id}/email")
def email_quotation(
    quotation_id: int,
    current_user: User =
        Depends(get_current_user),
    db: Session =
        Depends(get_db)
):
    try:
        quotation = (
            db.query(Quotation)
            .filter(
                Quotation.id == quotation_id,
                Quotation.user_id == current_user.id
            )
            .first()
        )

        if not quotation:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "QUOTATION_NOT_FOUND",
                    "message": "Quotation was not found."
                }
            )

        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")

        if not smtp_username or not smtp_password:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "EMAIL_CONFIGURATION_MISSING",
                    "message": (
                        "SMTP_USERNAME and SMTP_PASSWORD must be "
                        "configured in the backend .env file."
                    )
                }
            )

        pricing = load_customer_safe_pricing(quotation.pricing_snapshot)

        money = _pdf_money

        pdf_buffer = io.BytesIO()

        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.platypus import (
                SimpleDocTemplate,
                Paragraph,
                Spacer,
                Table,
                TableStyle
            )
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "PDF_DEPENDENCY_MISSING",
                    "message": (
                        "Email attachment generation requires reportlab. "
                        "Install it with: pip install reportlab"
                    )
                }
            )

        document = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        story = [
            Paragraph(
                "WAYPOINT AI MARITIME BROKERAGE",
                styles["Title"]
            ),
            Paragraph(
                f"Quotation #{quotation.id}",
                styles["Heading2"]
            ),
            Spacer(1, 10),
            Paragraph(
                f"<b>Company:</b> {quotation.company_name}",
                styles["Normal"]
            ),
            Paragraph(
                f"<b>Route:</b> {quotation.origin} → {quotation.destination}",
                styles["Normal"]
            ),
            Paragraph(
                f"<b>Route ID:</b> {quotation.route_id}",
                styles["Normal"]
            ),
            Paragraph(
                f"<b>Cargo:</b> {quotation.cargo_type}",
                styles["Normal"]
            ),
            Paragraph(
                f"<b>Containers:</b> {quotation.containers}",
                styles["Normal"]
            ),
            Spacer(1, 14),
            Table(
                [
                    ["QUOTATION", "AMOUNT"],
                    [
                        "Customer Price / Container",
                        money(pricing.get("final_selling_price_usd"))
                    ],
                    [
                        "Final Customer Quotation",
                        money(
                            pricing.get("total_customer_price_usd")
                            or pricing.get("estimated_total_customer_price_usd")
                        )
                    ]
                ],
                colWidths=[330, 170]
            )
        ]

        story[-1].setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12344d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ("PADDING", (0, 0), (-1, -1), 8)
            ])
        )

        document.build(story)
        pdf_data = pdf_buffer.getvalue()

        message = EmailMessage()
        message["Subject"] = (
            f"Waypoint Maritime Quotation #{quotation.id}"
        )
        message["From"] = smtp_username
        message["To"] = quotation.email

        message.set_content(
            f"""Dear {quotation.company_name},

Please find attached your maritime freight quotation #{quotation.id}.

Route: {quotation.origin} → {quotation.destination}
Cargo: {quotation.cargo_type}
Containers: {quotation.containers}
Status: {quotation.status or 'Pending'}

Final Customer Quotation: {
    money(
        pricing.get("total_customer_price_usd")
        or pricing.get("estimated_total_customer_price_usd")
    )
}

Thank you,
Waypoint AI Maritime Brokerage
"""
        )

        message.add_attachment(
            pdf_data,
            maintype="application",
            subtype="pdf",
            filename=f"quotation_{quotation.id}.pdf"
        )

        with smtplib.SMTP(
            smtp_host,
            smtp_port,
            timeout=30
        ) as smtp:
            smtp.starttls()
            smtp.login(
                smtp_username,
                smtp_password
            )
            smtp.send_message(message)

        return {
            "success": True,
            "message": "Quotation emailed successfully.",
            "quotation_id": quotation.id,
            "recipient": quotation.email
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Quotation email error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "QUOTATION_EMAIL_ERROR",
                "message": (
                    "Unable to email the quotation. "
                    "Check SMTP configuration."
                )
            }
        )




# =========================================================
# USER EXPERIENCE REVIEWS
# =========================================================

@app.get("/api/reviews")
def get_user_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return aggregate customer feedback plus recent reviews.
    Review text is user-generated content; no customer email/phone is exposed.
    """
    reviews = (
        db.query(UserReview)
        .order_by(UserReview.created_at.desc())
        .all()
    )

    ratings = [int(r.rating) for r in reviews if r.rating is not None]
    average_rating = (
        round(sum(ratings) / len(ratings), 1)
        if ratings
        else 0
    )

    distribution = {
        "5": sum(1 for value in ratings if value == 5),
        "4": sum(1 for value in ratings if value == 4),
        "3": sum(1 for value in ratings if value == 3),
        "2": sum(1 for value in ratings if value == 2),
        "1": sum(1 for value in ratings if value == 1),
    }

    recent = []
    for review in reviews[:8]:
        recent.append({
            "id": review.id,
            "rating": review.rating,
            "title": review.title or "",
            "review": review.review,
            "service_area": review.service_area or "Overall Experience",
            "created_at": (
                review.created_at.isoformat()
                if review.created_at
                else None
            ),
            "is_mine": review.user_id == current_user.id,
            "admin_reply": review.admin_reply or "",
            "admin_reply_at": (
                review.admin_reply_at.isoformat()
                if review.admin_reply_at
                else None
            ),
            "admin_replied": bool(review.admin_reply),
        })

    my_review = (
        db.query(UserReview)
        .filter(UserReview.user_id == current_user.id)
        .order_by(UserReview.updated_at.desc())
        .first()
    )

    return {
        "success": True,
        "total_reviews": len(reviews),
        "average_rating": average_rating,
        "distribution": distribution,
        "my_review": (
            {
                "id": my_review.id,
                "rating": my_review.rating,
                "title": my_review.title or "",
                "review": my_review.review,
                "service_area": my_review.service_area or "Overall Experience",
                "created_at": (
                    my_review.created_at.isoformat()
                    if my_review.created_at
                    else None
                ),
                "admin_reply": my_review.admin_reply or "",
                "admin_reply_at": (
                    my_review.admin_reply_at.isoformat()
                    if my_review.admin_reply_at
                    else None
                ),
                "admin_replied": bool(my_review.admin_reply),
            }
            if my_review
            else None
        ),
        "recent_reviews": recent,
    }


@app.post("/api/reviews")
def submit_user_review(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        rating = int(request.get("rating", 0))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_RATING",
                "message": "Rating must be a whole number from 1 to 5."
            },
        )

    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_RATING",
                "message": "Rating must be between 1 and 5."
            },
        )

    title = str(request.get("title", "") or "").strip()
    review_text = str(request.get("review", "") or "").strip()
    service_area = str(
        request.get("service_area", "Overall Experience") or "Overall Experience"
    ).strip()

    if not review_text:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "REVIEW_REQUIRED",
                "message": "Please write a short review before submitting."
            },
        )

    if len(review_text) < 10:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "REVIEW_TOO_SHORT",
                "message": "Please write at least 10 characters."
            },
        )

    if len(review_text) > 1200:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "REVIEW_TOO_LONG",
                "message": "Please keep the review below 1200 characters."
            },
        )

    if len(title) > 120:
        title = title[:120]

    allowed_services = {
        "Overall Experience",
        "Route Planning",
        "Weather Intelligence",
        "Connected Ports",
        "Quotation Service",
        "Waypoint AI",
        "Operations Dashboard",
    }

    if service_area not in allowed_services:
        service_area = "Overall Experience"

    existing = (
        db.query(UserReview)
        .filter(UserReview.user_id == current_user.id)
        .order_by(UserReview.updated_at.desc())
        .first()
    )

    if existing:
        existing.rating = rating
        existing.title = title
        existing.review = review_text
        existing.service_area = service_area
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)

        return {
            "success": True,
            "message": "Your review has been updated.",
            "review": {
                "id": existing.id,
                "rating": existing.rating,
                "title": existing.title or "",
                "review": existing.review,
                "service_area": existing.service_area,
                "created_at": (
                    existing.created_at.isoformat()
                    if existing.created_at
                    else None
                ),
            },
        }

    review = UserReview(
        user_id=current_user.id,
        rating=rating,
        title=title,
        review=review_text,
        service_area=service_area,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    customer_name = (
        getattr(current_user, "username", None)
        or getattr(current_user, "name", None)
        or "Waypoint Customer"
    )
    notification_sent, notification_message = send_review_notification_to_admin(
        review, customer_name
    )

    return {
        "success": True,
        "message": "Thank you for sharing your experience with Waypoint.",
        "admin_notification_sent": notification_sent,
        "admin_notification_message": notification_message,
        "review": {
            "id": review.id,
            "rating": review.rating,
            "title": review.title or "",
            "review": review.review,
            "service_area": review.service_area,
            "created_at": (
                review.created_at.isoformat()
                if review.created_at
                else None
            ),
        },
    }


# =========================================================
# ADMIN CUSTOMER FEEDBACK / REVIEW RESPONSES
# =========================================================

@app.get("/api/admin/reviews")
def admin_get_reviews(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        reviews = (
            db.query(UserReview)
            .order_by(UserReview.created_at.desc())
            .all()
        )

        result = []
        unreplied_count = 0

        for review in reviews:
            customer = db.query(User).filter(User.id == review.user_id).first()
            replied = bool(review.admin_reply and review.admin_reply.strip())
            if not replied:
                unreplied_count += 1

            result.append({
                "id": review.id,
                "user_id": review.user_id,
                "customer_name": (
                    getattr(customer, "username", None)
                    or getattr(customer, "name", None)
                    or "Waypoint Customer"
                ),
                "customer_email": getattr(customer, "email", "") or "",
                "rating": review.rating,
                "title": review.title or "",
                "review": review.review,
                "service_area": review.service_area or "Overall Experience",
                "created_at": review.created_at.isoformat() if review.created_at else None,
                "updated_at": review.updated_at.isoformat() if review.updated_at else None,
                "admin_reply": review.admin_reply or "",
                "admin_reply_at": review.admin_reply_at.isoformat() if review.admin_reply_at else None,
                "admin_replied": replied,
                "admin_replied_by": review.admin_replied_by,
            })

        return {
            "success": True,
            "count": len(result),
            "unreplied_count": unreplied_count,
            "reviews": result,
        }
    except Exception as e:
        print("Admin reviews error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_REVIEWS_ERROR",
                "message": "Unable to load customer feedback.",
            },
        )


class AdminReviewReplyRequest(BaseModel):
    reply: str


def send_review_notification_to_admin(review, customer_name):
    """Email the configured administrator when a new customer review is created."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME") or os.getenv("GMAIL_SENDER_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")
    admin_email = os.getenv("REVIEW_ADMIN_EMAIL") or smtp_username

    if not smtp_username or not smtp_password or not admin_email:
        return False, "Review notification email is not configured."

    message = EmailMessage()
    message["Subject"] = f"Waypoint AI — New Customer Review #{review.id}"
    message["From"] = smtp_username
    message["To"] = admin_email
    message.set_content(
        f"""A new customer review has been submitted to Waypoint AI.

Customer: {customer_name}
Rating: {review.rating}/5
Service: {review.service_area}
Title: {review.title or 'No title'}

Review:
{review.review}

Open the Waypoint AI Admin Portal to review the feedback and reply to the customer.
""".strip()
    )

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as smtp:
            smtp.starttls()
            smtp.login(smtp_username, smtp_password)
            smtp.send_message(message)
        return True, "Review notification sent to administrator."
    except Exception as email_error:
        print("Admin review notification email error:", email_error)
        return False, str(email_error)


def send_review_reply_email(review, customer_email, customer_name, reply):
    """Email the customer when an administrator responds to their review."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME") or os.getenv("GMAIL_SENDER_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")

    if not smtp_username or not smtp_password or not customer_email:
        return False, "Customer reply email is not configured."

    message = EmailMessage()
    message["Subject"] = f"Waypoint AI — Response to Your Review #{review.id}"
    message["From"] = smtp_username
    message["To"] = customer_email
    message.set_content(
        f"""Dear {customer_name},

Thank you for sharing your experience with Waypoint AI. Our administrator has responded to your review.

Your review:
{review.review}

Waypoint AI response:
{reply}

You can also view this response in your Waypoint AI Operations Dashboard.

Regards,
Waypoint AI Maritime Brokerage Team
""".strip()
    )

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as smtp:
            smtp.starttls()
            smtp.login(smtp_username, smtp_password)
            smtp.send_message(message)
        return True, "Customer response email sent."
    except Exception as email_error:
        print("Customer review reply email error:", email_error)
        return False, str(email_error)


@app.post("/api/admin/reviews/{review_id}/reply")
def admin_reply_to_review(
    review_id: int,
    request: AdminReviewReplyRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    reply = (request.reply or "").strip()

    if not reply:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "REPLY_REQUIRED",
                "message": "Please write a response before sending.",
            },
        )

    if len(reply) > 2000:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "REPLY_TOO_LONG",
                "message": "Please keep the administrator response below 2000 characters.",
            },
        )

    review = db.query(UserReview).filter(UserReview.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "REVIEW_NOT_FOUND",
                "message": "Customer review not found.",
            },
        )

    review.admin_reply = reply
    review.admin_reply_at = datetime.utcnow()
    review.admin_replied_by = admin.id
    review.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(review)

    customer = db.query(User).filter(User.id == review.user_id).first()
    customer_name = (
        getattr(customer, "username", None)
        or getattr(customer, "name", None)
        or "Waypoint Customer"
    ) if customer else "Waypoint Customer"
    customer_email = getattr(customer, "email", "") if customer else ""
    customer_notification_sent, customer_notification_message = send_review_reply_email(
        review, customer_email, customer_name, reply
    )

    return {
        "success": True,
        "message": "Response sent to the customer successfully.",
        "customer_notification_sent": customer_notification_sent,
        "customer_notification_message": customer_notification_message,
        "review": {
            "id": review.id,
            "admin_reply": review.admin_reply,
            "admin_reply_at": review.admin_reply_at.isoformat() if review.admin_reply_at else None,
            "admin_replied_by": review.admin_replied_by,
        },
    }


# =========================================================
# DATA ANALYTICS
# =========================================================

@app.get("/api/analytics")
def get_analytics(

    current_user: User =
        Depends(get_current_user),

    db: Session =
        Depends(get_db)

):

    try:

        # =================================================
        # SEARCH HISTORY
        # =================================================

        history_items = (
            db.query(SearchHistory)
            .filter(
                SearchHistory.user_id ==
                current_user.id
            )
            .order_by(
                SearchHistory.searched_at.desc()
            )
            .all()
        )


        # =================================================
        # QUOTATIONS
        # =================================================

        quotations = (
            db.query(Quotation)
            .filter(
                Quotation.user_id ==
                current_user.id
            )
            .order_by(
                Quotation.created_at.desc()
            )
            .all()
        )


        # =================================================
        # TOTAL SEARCHES
        # =================================================

        total_searches = len(
            history_items
        )


        # =================================================
        # BEST ROUTES
        # =================================================

        best_route_count = 0

        for item in history_items:

            if item.recommended_route:

                best_route_count += 1


        # =================================================
        # AVAILABLE ROUTES
        # =================================================

        try:

            available_routes = int(
                len(
                    route_agent.routes
                )
            )

        except Exception:

            available_routes = 0


        # =================================================
        # CONNECTED PORTS
        # =================================================

        try:

            origins = set(

                route_agent.routes[
                    "origin"
                ]
                .dropna()
                .astype(str)
                .str.strip()
                .tolist()

            )


            destinations = set(

                route_agent.routes[
                    "destination"
                ]
                .dropna()
                .astype(str)
                .str.strip()
                .tolist()

            )


            connected_ports = len(
                origins.union(
                    destinations
                )
            )

        except Exception as port_error:

            print(
                "Analytics port error:",
                port_error
            )

            connected_ports = 0


        # =================================================
        # MOST SEARCHED ROUTES
        # =================================================

        route_counts = {}


        for item in history_items:

            origin = (
                item.origin or ""
            ).strip()

            destination = (
                item.destination or ""
            ).strip()


            if not origin or not destination:

                continue


            route_key = (
                f"{origin} → {destination}"
            )


            route_counts[route_key] = (
                route_counts.get(
                    route_key,
                    0
                ) + 1
            )


        most_searched_routes = sorted(

            [
                {
                    "route":
                        route,

                    "searches":
                        count
                }

                for route, count
                in route_counts.items()
            ],

            key=lambda item:
                item["searches"],

            reverse=True

        )[:5]


        # =================================================
        # AVERAGE TRANSIT TIME
        # =================================================

        transit_values = []


        for item in history_items:

            if (
                item.transit_time_days
                is not None
            ):

                try:

                    transit_values.append(
                        float(
                            item.transit_time_days
                        )
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    pass


        average_transit_days = (

            round(
                sum(transit_values)
                /
                len(transit_values),
                1
            )

            if transit_values

            else 0

        )


        # =================================================
        # AVERAGE FREIGHT
        # =================================================

        freight_values = []


        for item in history_items:

            if (
                item.base_freight_usd
                is not None
            ):

                try:

                    freight_values.append(
                        float(
                            item.base_freight_usd
                        )
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    pass


        average_freight_usd = (

            round(
                sum(freight_values)
                /
                len(freight_values),
                2
            )

            if freight_values

            else 0

        )


        # =================================================
        # QUOTATION STATUS
        # =================================================

        quotation_status = {

            "Pending": 0,

            "Approved": 0,

            "Rejected": 0

        }


        for quotation in quotations:

            status = (
                quotation.status
                or "Pending"
            ).strip()


            if status not in quotation_status:

                quotation_status[status] = 0


            quotation_status[status] += 1


        # =================================================
        # RECENT SEARCHES
        # =================================================

        recent_searches = []


        for item in history_items[:8]:

            recent_searches.append({

                "id":
                    item.id,

                "origin":
                    item.origin,

                "destination":
                    item.destination,

                "route":
                    item.recommended_route,

                "transit_days":
                    item.transit_time_days,

                "freight_usd":
                    item.base_freight_usd,

                "searched_at":
                    item.searched_at.isoformat()
                    if item.searched_at
                    else None

            })


        # =================================================
        # RECENT QUOTATIONS
        # =================================================

        recent_quotations = []


        for quotation in quotations[:5]:

            recent_quotations.append({

                "id":
                    quotation.id,

                "company_name":
                    quotation.company_name,

                "origin":
                    quotation.origin,

                "destination":
                    quotation.destination,

                "status":
                    quotation.status
                    or "Pending",

                "created_at":
                    quotation.created_at.isoformat()
                    if quotation.created_at
                    else None

            })


        # =================================================
        # ANALYTICS RESPONSE
        # =================================================

        return {

            "success": True,

            "summary": {

                "total_searches":
                    total_searches,

                "best_routes":
                    best_route_count,

                "available_routes":
                    available_routes,

                "connected_ports":
                    connected_ports,

                "total_quotations":
                    len(quotations),

                "average_transit_days":
                    average_transit_days,

                "average_freight_usd":
                    average_freight_usd

            },

            "route_analytics": {

                "most_searched_routes":
                    most_searched_routes

            },

            "quotation_analytics": {

                "total":
                    len(quotations),

                "status":
                    quotation_status

            },

            "recent_searches":
                recent_searches,

            "recent_quotations":
                recent_quotations

        }


    except Exception as e:

        print(
            "Analytics error:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail={
                "error":
                    "ANALYTICS_ERROR",

                "message":
                    "Unable to generate analytics."
            }
        )



# =========================================================
# CUSTOMS AGENT - CARGO & CLEARANCE INTELLIGENCE
# =========================================================

@app.get("/api/customs/analyze")
def analyze_customs(
    origin: str,
    destination: str,
    cargo_type: str,
    containers: int = 1
):
    """Return dataset-backed customs and compliance intelligence."""

    try:
        result = customs_agent.analyze_customs(
            origin=origin,
            destination=destination,
            cargo_type=cargo_type,
            containers=containers
        )

        if not result.get("success"):
            status = result.get("status")

            if status == "invalid_request":
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "CUSTOMS_INVALID_REQUEST",
                        "message": result.get(
                            "message",
                            "Invalid customs request."
                        )
                    }
                )

            raise HTTPException(
                status_code=404,
                detail={
                    "error": "CUSTOMS_PROFILE_NOT_FOUND",
                    "message": result.get(
                        "message",
                        "No customs profile was found."
                    )
                }
            )

        return result

    except HTTPException:
        raise

    except Exception as e:
        print("Customs agent error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "CUSTOMS_AGENT_ERROR",
                "message": "Unable to analyze customs requirements."
            }
        )


# =========================================================
# WEATHER AGENT - ROUTE WEATHER & RISK
# =========================================================

@app.get("/api/weather/route/{route_id}")
def get_route_weather(route_id: str):
    """Return dataset-backed weather and calculated risk for a route."""

    try:
        result = weather_agent.analyze_weather(route_id)

        if not result.get("success"):
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "WEATHER_ROUTE_NOT_FOUND",
                    "message": result.get(
                        "message",
                        f"No weather data found for route {route_id}."
                    )
                }
            )

        return result

    except HTTPException:
        raise

    except Exception as e:
        print("Route weather agent error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "WEATHER_AGENT_ERROR",
                "message": "Unable to analyze weather for the requested route."
            }
        )


# =========================================================
# WEATHER & CONDITIONS
# =========================================================

@app.get("/api/weather/route-by-locations")
def get_route_weather_by_locations(origin: str, destination: str):
    """Resolve a selected origin/destination to the recommended route and return route weather intelligence."""
    try:
        origin = origin.strip()
        destination = destination.strip()

        if not origin or not destination:
            raise api_error(
                400,
                "ROUTE_LOCATIONS_REQUIRED",
                "Origin and destination are required."
            )

        if origin.lower() == destination.lower():
            raise api_error(
                400,
                "SAME_PORT",
                "Origin and destination cannot be the same."
            )

        # Use the existing Route Agent to resolve the best matching route.
        # This keeps the new weather feature connected to the same route
        # intelligence already used elsewhere in Waypoint.
        route_result = route_agent.analyze_route(
            origin=origin,
            destination=destination,
            cargo_type="General Cargo",
            containers=1
        )

        if route_result.get("status") != "success":
            raise api_error(
                404,
                "ROUTE_NOT_FOUND",
                route_result.get(
                    "message",
                    f"No route found from {origin} to {destination}."
                )
            )

        route_id = route_result.get("recommended_route")

        if not route_id:
            raise api_error(
                404,
                "ROUTE_ID_NOT_FOUND",
                "A route was found, but no route ID was returned."
            )

        weather_result = weather_agent.analyze_weather(str(route_id))

        if not weather_result.get("success"):
            raise api_error(
                404,
                "WEATHER_ROUTE_NOT_FOUND",
                weather_result.get(
                    "message",
                    f"No weather data found for route {route_id}."
                )
            )

        return {
            **weather_result,
            "route_selection": {
                "origin": origin,
                "destination": destination,
                "route_id": route_id,
                "route_score": route_result.get("route_score"),
                "transit_time_days": route_result.get("transit_time_days"),
                "distance_nm": route_result.get("distance_nm"),
                "transshipments": route_result.get("transshipments"),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Route weather-by-locations error:", e)
        raise api_error(
            500,
            "WEATHER_ROUTE_RESOLUTION_ERROR",
            "Unable to resolve route weather for the selected ports."
        )


@app.get("/api/weather")
def get_weather(

    location: str

):

    try:

        # =================================================
        # VALIDATE LOCATION
        # =================================================

        location = location.strip()


        if not location:

            raise HTTPException(
                status_code=400,

                detail={
                    "error":
                        "LOCATION_REQUIRED",

                    "message":
                        "Weather location is required."
                }
            )


        # =================================================
        # OPENWEATHER API KEY
        # =================================================

        api_key = os.getenv(
            "OPENWEATHER_API_KEY"
        )


        if not api_key:

            raise HTTPException(
                status_code=500,

                detail={
                    "error":
                        "WEATHER_API_KEY_MISSING",

                    "message":
                        "OpenWeather API key is not configured "
                        "in the backend .env file."
                }
            )


        # =================================================
        # GEOCODING
        # =================================================

        encoded_location = urllib.parse.quote(
            location
        )


        geocode_url = (

            "https://api.openweathermap.org/"
            "geo/1.0/direct"

            f"?q={encoded_location}"

            "&limit=1"

            f"&appid={api_key}"

        )


        with urllib.request.urlopen(
            geocode_url,
            timeout=15
        ) as response:

            geocode_data = json.loads(
                response.read().decode(
                    "utf-8"
                )
            )


        if not geocode_data:

            raise HTTPException(
                status_code=404,

                detail={
                    "error":
                        "LOCATION_NOT_FOUND",

                    "message":
                        f"Could not find weather location: {location}"
                }
            )


        latitude = geocode_data[0]["lat"]

        longitude = geocode_data[0]["lon"]


        resolved_name = geocode_data[0].get(
            "name",
            location
        )


        country = geocode_data[0].get(
            "country",
            ""
        )


        # =================================================
        # CURRENT WEATHER
        # =================================================

        current_url = (

            "https://api.openweathermap.org/"
            "data/2.5/weather"

            f"?lat={latitude}"

            f"&lon={longitude}"

            f"&appid={api_key}"

            "&units=metric"

        )


        with urllib.request.urlopen(
            current_url,
            timeout=15
        ) as response:

            current_data = json.loads(
                response.read().decode(
                    "utf-8"
                )
            )


        # =================================================
        # FORECAST
        # =================================================

        forecast_url = (

            "https://api.openweathermap.org/"
            "data/2.5/forecast"

            f"?lat={latitude}"

            f"&lon={longitude}"

            f"&appid={api_key}"

            "&units=metric"

        )


        with urllib.request.urlopen(
            forecast_url,
            timeout=15
        ) as response:

            forecast_data = json.loads(
                response.read().decode(
                    "utf-8"
                )
            )


        # =================================================
        # CURRENT DATA
        # =================================================

        main_data = current_data.get(
            "main",
            {}
        )


        wind_data = current_data.get(
            "wind",
            {}
        )


        weather_list = current_data.get(
            "weather",
            []
        )


        weather_info = (

            weather_list[0]

            if weather_list

            else {}

        )


        forecast_list = forecast_data.get(
            "list",
            []
        )


        # =================================================
        # RAIN PROBABILITY
        # =================================================

        rain_probability = 0


        if forecast_list:

            rain_probability = round(

                forecast_list[0].get(
                    "pop",
                    0
                ) * 100

            )


        # =================================================
        # VISIBILITY
        # =================================================

        visibility_m = current_data.get(
            "visibility",
            0
        )


        visibility_km = round(

            visibility_m / 1000,

            1

        )


        # =================================================
        # CURRENT WEATHER OBJECT
        # =================================================

        current_weather = {

            "temperature":
                round(
                    main_data.get(
                        "temp",
                        0
                    ),
                    1
                ),

            "feels_like":
                round(
                    main_data.get(
                        "feels_like",
                        0
                    ),
                    1
                ),

            "humidity":
                main_data.get(
                    "humidity",
                    0
                ),

            "pressure":
                main_data.get(
                    "pressure",
                    0
                ),

            "wind_speed":
                round(
                    wind_data.get(
                        "speed",
                        0
                    ) * 3.6,
                    1
                ),

            "wind_direction":
                wind_data.get(
                    "deg",
                    0
                ),

            "visibility":
                visibility_km,

            "condition":
                weather_info.get(
                    "main",
                    "Unknown"
                ),

            "description":
                weather_info.get(
                    "description",
                    "Weather information unavailable"
                ),

            "rain_probability":
                rain_probability,

            "clouds":
                current_data.get(
                    "clouds",
                    {}
                ).get(
                    "all",
                    0
                )

        }


        # =================================================
        # FORECAST
        # =================================================

        forecast = []


        for item in forecast_list[:8]:

            forecast_weather = item.get(
                "weather",
                []
            )


            forecast_condition = (

                forecast_weather[0]

                if forecast_weather

                else {}

            )


            forecast.append({

                "date":
                    item.get(
                        "dt_txt",
                        ""
                    ),

                "temperature":
                    round(
                        item.get(
                            "main",
                            {}
                        ).get(
                            "temp",
                            0
                        ),
                        1
                    ),

                "feels_like":
                    round(
                        item.get(
                            "main",
                            {}
                        ).get(
                            "feels_like",
                            0
                        ),
                        1
                    ),

                "humidity":
                    item.get(
                        "main",
                        {}
                    ).get(
                        "humidity",
                        0
                    ),

                "wind_speed":
                    round(
                        item.get(
                            "wind",
                            {}
                        ).get(
                            "speed",
                            0
                        ) * 3.6,
                        1
                    ),

                "wind_direction":
                    item.get(
                        "wind",
                        {}
                    ).get(
                        "deg",
                        0
                    ),

                "rain_probability":
                    round(
                        item.get(
                            "pop",
                            0
                        ) * 100
                    ),

                "condition":
                    forecast_condition.get(
                        "main",
                        "Unknown"
                    ),

                "description":
                    forecast_condition.get(
                        "description",
                        ""
                    )

            })


        # =================================================
        # WEATHER RISK
        # =================================================

        risk = "Low"


        if (

            current_weather[
                "rain_probability"
            ] >= 70

            or

            current_weather[
                "wind_speed"
            ] >= 35

        ):

            risk = "High"


        elif (

            current_weather[
                "rain_probability"
            ] >= 40

            or

            current_weather[
                "wind_speed"
            ] >= 20

        ):

            risk = "Moderate"


        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success": True,

            "location":
                resolved_name,

            "country":
                country,

            "coordinates": {

                "latitude":
                    latitude,

                "longitude":
                    longitude

            },

            "current":
                current_weather,

            "forecast":
                forecast,

            "weather_risk":
                risk

        }


    except HTTPException:

        raise


    except urllib.error.HTTPError as e:

        print(
            "OpenWeather HTTP error:",
            e
        )


        raise HTTPException(

            status_code=502,

            detail={

                "error":
                    "WEATHER_SERVICE_ERROR",

                "message":
                    "OpenWeather rejected the weather request. "
                    "Check your API key and OpenWeather access."

            }

        )


    except urllib.error.URLError as e:

        print(
            "OpenWeather connection error:",
            e
        )


        raise HTTPException(

            status_code=503,

            detail={

                "error":
                    "WEATHER_CONNECTION_ERROR",

                "message":
                    "Unable to connect to OpenWeather."

            }

        )


    except Exception as e:

        print(
            "Weather API error:",
            e
        )


        raise HTTPException(

            status_code=500,

            detail={

                "error":
                    "WEATHER_ERROR",

                "message":
                    "Unable to retrieve weather information."

            }

        )


# =========================================================
# ADMIN ROUTE INTELLIGENCE
# =========================================================

@app.get("/api/admin/routes")
def admin_routes(
    admin: User = Depends(get_current_admin)
):
    try:
        route_records = []
        routes = route_agent.routes.copy()

        for _, row in routes.iterrows():
            route_records.append({
                "route_id": str(row.get("route_id", "")),
                "origin": str(row.get("origin", "")),
                "destination": str(row.get("destination", "")),
                "distance_nm": int(float(row.get("distance_nm", 0) or 0)),
                "transit_days": int(float(row.get("transit_days", 0) or 0)),
                "transshipments": int(float(row.get("transshipments", 0) or 0)),
                "route_type": str(row.get("route_type", "")),
                "base_freight_usd": float(row.get("base_freight_usd", 0) or 0),
            })

        return {
            "success": True,
            "total_routes": len(route_records),
            "routes": route_records,
        }
    except Exception as e:
        print("Admin route intelligence error:", e)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ADMIN_ROUTES_ERROR",
                "message": "Unable to load route intelligence data.",
            },
        )


# =========================================================
# ADMIN CUSTOMER MANAGEMENT
# =========================================================

@app.get("/api/admin/customers")
def admin_customers(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        users = db.query(User).order_by(User.id.desc()).all()
        quotations = db.query(Quotation).order_by(Quotation.created_at.desc()).all()

        quote_by_user = {}
        quote_by_email = {}
        for q in quotations:
            uid = getattr(q, "user_id", None)
            if uid is not None:
                quote_by_user.setdefault(uid, []).append(q)
            if getattr(q, "email", None):
                quote_by_email.setdefault(str(q.email).lower(), []).append(q)

        customers = []
        for user in users:
            # Admin accounts are still returned, but clearly marked; frontend can filter them.
            qlist = quote_by_user.get(user.id, [])
            if not qlist:
                qlist = quote_by_email.get(str(getattr(user, "email", "")).lower(), [])

            status_counts = {}
            total_value = 0.0
            for q in qlist:
                status = getattr(q, "status", None) or "Pending"
                status_counts[status] = status_counts.get(status, 0) + 1
                pricing = {}
                raw = getattr(q, "pricing_snapshot", None)
                if raw:
                    try:
                        pricing = json.loads(raw)
                    except Exception:
                        pricing = {}
                try:
                    total_value += float(
                        pricing.get("estimated_total_customer_price_usd")
                        or pricing.get("total_customer_price_usd")
                        or 0
                    )
                except (TypeError, ValueError):
                    pass

            customers.append({
                "id": user.id,
                "name": getattr(user, "name", None) or getattr(user, "username", ""),
                "username": getattr(user, "username", ""),
                "email": getattr(user, "email", ""),
                "phone": getattr(user, "phone", "") or "",
                "country": getattr(user, "country", "") or "",
                "role": getattr(user, "role", "user") or "user",
                "is_verified": bool(getattr(user, "is_verified", False)),
                "created_at": (
                    user.created_at.isoformat()
                    if getattr(user, "created_at", None) else None
                ),
                "quotation_count": len(qlist),
                "status_counts": status_counts,
                "total_customer_value_usd": round(total_value, 2),
            })

        return {"success": True, "count": len(customers), "customers": customers}
    except Exception as e:
        print("Admin customers error:", e)
        raise HTTPException(
            status_code=500,
            detail={"error": "ADMIN_CUSTOMERS_ERROR", "message": "Unable to load customer records."},
        )


@app.get("/api/admin/customers/{customer_id}/history")
def admin_customer_history(
    customer_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        user = db.query(User).filter(User.id == customer_id).first()
        if not user:
            raise HTTPException(status_code=404, detail={"error": "CUSTOMER_NOT_FOUND", "message": "Customer was not found."})

        quotations = db.query(Quotation).filter(Quotation.user_id == customer_id).order_by(Quotation.created_at.desc()).all()
        history = db.query(SearchHistory).filter(SearchHistory.user_id == customer_id).order_by(SearchHistory.searched_at.desc()).all()

        quote_records = []
        for q in quotations:
            pricing = {}
            raw = getattr(q, "pricing_snapshot", None)
            if raw:
                try:
                    pricing = json.loads(raw)
                except Exception:
                    pricing = {}
            quote_records.append({
                "id": q.id,
                "origin": q.origin,
                "destination": q.destination,
                "route_id": q.route_id,
                "cargo_type": q.cargo_type,
                "containers": q.containers,
                "status": q.status or "Pending",
                "customer_value_usd": round(float(pricing.get("estimated_total_customer_price_usd") or pricing.get("total_customer_price_usd") or 0), 2),
                "created_at": q.created_at.isoformat() if q.created_at else None,
            })

        search_records = []
        for item in history:
            record = {
                "id": getattr(item, "id", None),
                "origin": getattr(item, "origin", ""),
                "destination": getattr(item, "destination", ""),
                "route_id": getattr(item, "route_id", ""),
                "searched_at": getattr(item, "searched_at", None).isoformat() if getattr(item, "searched_at", None) else None,
            }
            search_records.append(record)

        return {
            "success": True,
            "customer": {"id": user.id, "name": getattr(user, "name", ""), "email": user.email},
            "quotations": quote_records,
            "search_history": search_records,
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Admin customer history error:", e)
        raise HTTPException(status_code=500, detail={"error": "ADMIN_CUSTOMER_HISTORY_ERROR", "message": "Unable to load customer history."})


# =========================================================
# ADMIN COMMERCIAL ANALYTICS
# =========================================================

@app.get("/api/admin/commercial")
def admin_commercial_analytics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        quotations = db.query(Quotation).order_by(Quotation.created_at.asc()).all()
        total_value = total_profit = 0.0
        margins = []
        status_counts = {}
        monthly = {}
        route_profit = {}
        cargo_counts = {}

        for q in quotations:
            status = q.status or "Pending"
            status_counts[status] = status_counts.get(status, 0) + 1
            pricing = {}
            raw = getattr(q, "pricing_snapshot", None)
            if raw:
                try:
                    pricing = json.loads(raw)
                except Exception:
                    pricing = {}

            try: value = float(pricing.get("estimated_total_customer_price_usd") or pricing.get("total_customer_price_usd") or 0)
            except (TypeError, ValueError): value = 0.0
            try: profit = float(pricing.get("total_brokerage_profit_usd") or 0)
            except (TypeError, ValueError): profit = 0.0
            try:
                margin = float(pricing.get("target_margin_percent"))
                margins.append(margin)
            except (TypeError, ValueError):
                margin = 0.0

            total_value += value
            total_profit += profit
            month = q.created_at.strftime("%Y-%m") if q.created_at else "Unknown"
            monthly.setdefault(month, {"customer_value_usd": 0.0, "brokerage_profit_usd": 0.0, "quotations": 0})
            monthly[month]["customer_value_usd"] += value
            monthly[month]["brokerage_profit_usd"] += profit
            monthly[month]["quotations"] += 1

            route = q.route_id or f"{q.origin} → {q.destination}"
            route_profit.setdefault(route, {"quotations": 0, "customer_value_usd": 0.0, "brokerage_profit_usd": 0.0})
            route_profit[route]["quotations"] += 1
            route_profit[route]["customer_value_usd"] += value
            route_profit[route]["brokerage_profit_usd"] += profit
            cargo = q.cargo_type or "Unknown"
            cargo_counts[cargo] = cargo_counts.get(cargo, 0) + 1

        monthly_list = [{"month": k, **{x: round(v, 2) if isinstance(v, float) else v for x, v in val.items()}} for k, val in sorted(monthly.items())]
        route_list = [{"route_id": k, **{x: round(v, 2) if isinstance(v, float) else v for x, v in val.items()}} for k, val in sorted(route_profit.items(), key=lambda x: x[1]["brokerage_profit_usd"], reverse=True)]
        avg_margin = sum(margins) / len(margins) if margins else 0.0

        return {
            "success": True,
            "summary": {
                "total_quotations": len(quotations),
                "total_customer_value_usd": round(total_value, 2),
                "total_brokerage_profit_usd": round(total_profit, 2),
                "average_margin_percent": round(avg_margin, 2),
                "approved_quotations": status_counts.get("Approved", 0),
                "rejected_quotations": status_counts.get("Rejected", 0),
                "pending_quotations": status_counts.get("Pending", 0),
                "completed_quotations": status_counts.get("Completed", 0),
            },
            "monthly": monthly_list,
            "route_profitability": route_list[:12],
            "cargo_mix": [{"cargo_type": k, "quotations": v} for k, v in sorted(cargo_counts.items(), key=lambda x: x[1], reverse=True)],
            "status_counts": status_counts,
            "satisfaction": {"available": False, "message": "No customer satisfaction ratings are recorded in the current database."},
        }
    except Exception as e:
        print("Admin commercial analytics error:", e)
        raise HTTPException(status_code=500, detail={"error": "ADMIN_COMMERCIAL_ERROR", "message": "Unable to load commercial analytics."})


# =========================================================
# ADMIN OPERATIONS
# =========================================================

@app.get("/api/admin/operations")
def admin_operations(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        quotations = db.query(Quotation).order_by(Quotation.created_at.desc()).all()
        operations = []
        counts = {"Needs Review": 0, "Approved": 0, "In Shipping": 0, "Completed": 0, "Rejected": 0}
        for q in quotations:
            raw_status = q.status or "Pending"
            status_map = {"Pending": "Needs Review", "Reviewed": "Needs Review", "Approved": "Approved", "In Shipping": "In Shipping", "Completed": "Completed", "Rejected": "Rejected"}
            operational_status = status_map.get(raw_status, raw_status)
            if operational_status not in counts:
                counts[operational_status] = 0
            counts[operational_status] += 1
            operations.append({
                "quotation_id": q.id,
                "company_name": q.company_name,
                "email": q.email,
                "origin": q.origin,
                "destination": q.destination,
                "route_id": q.route_id,
                "cargo_type": q.cargo_type,
                "containers": q.containers,
                "quotation_status": raw_status,
                "operation_status": operational_status,
                "created_at": q.created_at.isoformat() if q.created_at else None,
            })
        return {"success": True, "summary": counts, "operations": operations}
    except Exception as e:
        print("Admin operations error:", e)
        raise HTTPException(status_code=500, detail={"error": "ADMIN_OPERATIONS_ERROR", "message": "Unable to load operations data."})


@app.patch("/api/admin/operations/{quotation_id}/status")
def admin_update_operation_status(
    quotation_id: int,
    request: dict,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    allowed = {"Approved", "In Shipping", "Completed", "Rejected"}
    requested = str(request.get("status", "")).strip().title()
    if requested == "In Shipping":
        requested = "In Shipping"
    if requested not in allowed:
        raise HTTPException(status_code=400, detail={"error": "INVALID_OPERATION_STATUS", "message": "Invalid operation status."})
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail={"error": "QUOTATION_NOT_FOUND", "message": "Quotation was not found."})
    try:
        q.status = requested
        db.commit()
        return {"success": True, "quotation_id": q.id, "status": q.status, "updated_by": admin.email}
    except Exception as e:
        db.rollback()
        print("Admin operation update error:", e)
        raise HTTPException(status_code=500, detail={"error": "ADMIN_OPERATION_UPDATE_ERROR", "message": "Unable to update operation status."})


# =========================================================
# ADMIN / SYSTEM SETTINGS
# =========================================================

@app.get("/api/admin/admins")
def list_admins(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    admins = db.query(User).filter(User.role == "admin").order_by(User.id.asc()).all()
    return {
        "success": True,
        "count": len(admins),
        "admins": [
            {
                "id": a.id,
                "name": getattr(a, "name", ""),
                "username": getattr(a, "username", ""),
                "email": a.email,
                "is_verified": bool(getattr(a, "is_verified", False)),
                "created_at": a.created_at.isoformat() if getattr(a, "created_at", None) else None,
            }
            for a in admins
        ],
    }


@app.post("/api/admin/admins")
def add_admin(
    request: dict,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    email = str(request.get("email", "")).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail={"error": "EMAIL_REQUIRED", "message": "A registered user's Gmail address is required."})
    target = db.query(User).filter(User.email == email).first()
    if not target:
        raise HTTPException(status_code=404, detail={"error": "USER_NOT_FOUND", "message": "No registered user exists with that email address."})
    if is_admin(target):
        return {"success": True, "message": "User is already an administrator.", "admin": {"id": target.id, "email": target.email}}
    try:
        target.role = "admin"
        db.commit()
        db.refresh(target)
        return {"success": True, "message": "Administrator added successfully.", "admin": {"id": target.id, "name": getattr(target, "name", ""), "email": target.email}}
    except Exception as e:
        db.rollback()
        print("Admin add error:", e)
        raise HTTPException(status_code=500, detail={"error": "ADMIN_ADD_ERROR", "message": "Unable to add administrator."})


@app.delete("/api/admin/admins/{admin_id}")
def remove_admin(
    admin_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == admin_id).first()
    if not target or not is_admin(target):
        raise HTTPException(status_code=404, detail={"error": "ADMIN_NOT_FOUND", "message": "Administrator was not found."})
    admin_count = db.query(User).filter(User.role == "admin").count()
    if admin_count <= 1:
        raise HTTPException(status_code=409, detail={"error": "LAST_ADMIN", "message": "The last administrator cannot be removed."})
    try:
        target.role = "user"
        db.commit()
        return {"success": True, "message": "Administrator access removed successfully.", "admin_id": admin_id}
    except Exception as e:
        db.rollback()
        print("Admin remove error:", e)
        raise HTTPException(status_code=500, detail={"error": "ADMIN_REMOVE_ERROR", "message": "Unable to remove administrator."})


# =========================================================
# INTELLIGENT MAP — USER TRACE STORAGE & ANALYSIS
# =========================================================

@app.post("/api/map/traces")
def save_map_trace(
    request: MapTraceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate and normalize coordinates before storing them.
    points = _validate_trace_points(request.points)
    distance_nm = _trace_distance_nm(points)
    trace_name = request.name.strip() or "Untitled Maritime Trace"

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                INSERT INTO map_traces
                (user_id, name, points_json, total_distance_nm, created_at)
                VALUES
                (:user_id, :name, :points_json, :distance_nm, :created_at)
                """
            ),
            {
                "user_id": current_user.id,
                "name": trace_name,
                "points_json": json.dumps(points),
                "distance_nm": distance_nm,
                "created_at": datetime.utcnow().isoformat()
            }
        )

    return {
        "success": True,
        "message": "Map trace saved successfully.",
        "trace": {
            "name": trace_name,
            "point_count": len(points),
            "total_distance_nm": round(distance_nm, 2),
            "points": points
        }
    }


@app.post("/api/map/traces/analyze")
def analyze_map_trace(
    request: MapTraceRequest,
    current_user: User = Depends(get_current_user)
):
    points = _validate_trace_points(request.points)
    distance_nm = _trace_distance_nm(points)

    return {
        "success": True,
        "name": request.name.strip() or "Untitled Maritime Trace",
        "point_count": len(points),
        "total_distance_nm": round(distance_nm, 2),
        "start": points[0],
        "end": points[-1],
        "segments": len(points) - 1,
        "source": "Waypoint traced-map analysis"
    }


@app.get("/api/map/traces")
def get_map_traces(
    current_user: User = Depends(get_current_user)
):
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                """
                SELECT id, name, points_json, total_distance_nm, created_at
                FROM map_traces
                WHERE user_id = :user_id
                ORDER BY id DESC
                """
            ),
            {"user_id": current_user.id}
        ).mappings().all()

    return {
        "success": True,
        "traces": [
            {
                "id": row["id"],
                "name": row["name"],
                "points": json.loads(row["points_json"]),
                "total_distance_nm": round(float(row["total_distance_nm"]), 2),
                "created_at": row["created_at"]
            }
            for row in rows
        ]
    }


# =========================================================
# GLOBAL EXCEPTION HANDLER
# =========================================================

@app.exception_handler(Exception)
async def global_exception_handler(

    request: Request,

    exc: Exception

):

    print(
        f"Unhandled server error: {exc}"
    )


    return JSONResponse(

        status_code=500,

        content={

            "success": False,

            "error":
                "INTERNAL_SERVER_ERROR",

            "message":
                "An unexpected server error occurred."

        }

    )


# =========================================================
# SHIPMENT TRACKING (CUSTOMER + ADMIN)
# =========================================================

SHIPMENT_STATUSES = [
    "Booked",
    "Preparing",
    "In Transit",
    "Delayed",
    "Arrived",
    "Delivered",
    "Cancelled",
]


class ShipmentCreateRequest(BaseModel):
    quotation_id: int
    tracking_reference: Optional[str] = None
    vessel_name: Optional[str] = None
    estimated_departure: Optional[str] = None
    estimated_arrival: Optional[str] = None
    current_location: Optional[str] = None
    notes: Optional[str] = None


class ShipmentUpdateRequest(BaseModel):
    status: Optional[str] = None
    tracking_reference: Optional[str] = None
    vessel_name: Optional[str] = None
    current_location: Optional[str] = None
    estimated_departure: Optional[str] = None
    actual_departure: Optional[str] = None
    estimated_arrival: Optional[str] = None
    actual_arrival: Optional[str] = None
    notes: Optional[str] = None


def _shipment_record(shipment, quotation):
    return {
        "id": shipment.id,
        "quotation_id": shipment.quotation_id,
        "tracking_reference": shipment.tracking_reference,
        "company_name": quotation.company_name,
        "origin": quotation.origin,
        "destination": quotation.destination,
        "route_id": quotation.route_id,
        "cargo_type": quotation.cargo_type,
        "containers": quotation.containers,
        "status": shipment.status,
        "vessel_name": shipment.vessel_name or "",
        "current_location": shipment.current_location or "",
        "estimated_departure": shipment.estimated_departure or "",
        "actual_departure": shipment.actual_departure or "",
        "estimated_arrival": shipment.estimated_arrival or "",
        "actual_arrival": shipment.actual_arrival or "",
        "notes": shipment.notes or "",
        "created_at": (
            shipment.created_at.isoformat()
            if shipment.created_at else None
        ),
        "updated_at": (
            shipment.updated_at.isoformat()
            if shipment.updated_at else None
        ),
    }


@app.get("/api/shipment-health")
def shipment_health():
    """Confirm that shipment tracking routes are loaded."""
    return {
        "success": True,
        "service": "Waypoint shipment tracking",
        "statuses": SHIPMENT_STATUSES,
    }


@app.get("/api/my-shipments")
def get_my_shipments(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Shipment)
        .filter(Shipment.user_id == user.id)
        .order_by(Shipment.updated_at.desc())
        .all()
    )

    records = []
    for shipment in rows:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == shipment.quotation_id)
            .first()
        )
        if quotation:
            records.append(_shipment_record(shipment, quotation))

    return {
        "success": True,
        "count": len(records),
        "shipments": records,
    }


@app.get("/api/admin/shipments/options")
def get_shipment_quotation_options(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing_ids = {
        row[0] for row in db.query(Shipment.quotation_id).all()
    }

    # In this project, the quotation status endpoint sets "Approved".
    eligible_statuses = ["Approved", "Booked", "In Shipping"]
    quotations = (
        db.query(Quotation)
        .filter(Quotation.status.in_(eligible_statuses))
        .order_by(Quotation.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "quotations": [
            {
                "id": quotation.id,
                "company_name": quotation.company_name,
                "origin": quotation.origin,
                "destination": quotation.destination,
                "route_id": quotation.route_id,
                "status": quotation.status,
                "containers": quotation.containers,
            }
            for quotation in quotations
            if quotation.id not in existing_ids
        ],
    }


@app.get("/api/admin/shipments")
def get_all_shipments(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Shipment)
        .order_by(Shipment.updated_at.desc())
        .all()
    )

    records = []
    for shipment in rows:
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == shipment.quotation_id)
            .first()
        )
        if not quotation:
            continue

        record = _shipment_record(shipment, quotation)
        customer = (
            db.query(User)
            .filter(User.id == shipment.user_id)
            .first()
        )
        record["customer_email"] = (
            customer.email if customer else quotation.email
        )
        records.append(record)

    return {
        "success": True,
        "count": len(records),
        "shipments": records,
    }


@app.post("/api/admin/shipments")
def create_shipment(
    request: ShipmentCreateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == request.quotation_id)
        .first()
    )
    if not quotation:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found.",
        )

    if (quotation.status or "").strip().title() not in {
        "Approved", "Booked", "In Shipping"
    }:
        raise HTTPException(
            status_code=400,
            detail="Only approved or booked quotations can become shipments.",
        )

    existing = (
        db.query(Shipment)
        .filter(Shipment.quotation_id == quotation.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="A shipment already exists for this quotation.",
        )

    reference = (
        request.tracking_reference or f"WPA-{quotation.id:06d}"
    ).strip().upper()

    if not reference:
        raise HTTPException(
            status_code=400,
            detail="Tracking reference cannot be empty.",
        )

    duplicate = (
        db.query(Shipment)
        .filter(Shipment.tracking_reference == reference)
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Tracking reference already exists.",
        )

    shipment = Shipment(
        quotation_id=quotation.id,
        user_id=quotation.user_id,
        tracking_reference=reference,
        vessel_name=(request.vessel_name or "").strip() or None,
        status="Booked",
        current_location=(
            (request.current_location or quotation.origin).strip() or None
        ),
        estimated_departure=(
            (request.estimated_departure or "").strip() or None
        ),
        estimated_arrival=(
            (request.estimated_arrival or "").strip() or None
        ),
        notes=(request.notes or "").strip() or None,
    )

    try:
        db.add(shipment)
        db.commit()
        db.refresh(shipment)
    except Exception:
        db.rollback()
        raise

    return {
        "success": True,
        "message": "Shipment created.",
        "shipment": _shipment_record(shipment, quotation),
    }


@app.patch("/api/admin/shipments/{shipment_id}")
def update_shipment(
    shipment_id: int,
    request: ShipmentUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    shipment = (
        db.query(Shipment)
        .filter(Shipment.id == shipment_id)
        .first()
    )
    if not shipment:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found.",
        )

    # dict() works with both Pydantic v1 and v2.
    payload = request.dict(exclude_unset=True)

    if "status" in payload:
        status = (payload["status"] or "").strip()
        if status not in SHIPMENT_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Status must be one of: "
                    + ", ".join(SHIPMENT_STATUSES)
                ),
            )
        payload["status"] = status

    if "tracking_reference" in payload:
        reference = (
            payload["tracking_reference"] or ""
        ).strip().upper()
        if not reference:
            raise HTTPException(
                status_code=400,
                detail="Tracking reference cannot be empty.",
            )

        duplicate = (
            db.query(Shipment)
            .filter(
                Shipment.tracking_reference == reference,
                Shipment.id != shipment.id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=409,
                detail="Tracking reference already exists.",
            )
        payload["tracking_reference"] = reference

    permitted_fields = {
        "status",
        "tracking_reference",
        "vessel_name",
        "current_location",
        "estimated_departure",
        "actual_departure",
        "estimated_arrival",
        "actual_arrival",
        "notes",
    }

    for key, value in payload.items():
        if key not in permitted_fields:
            continue
        if key != "status":
            value = (value or "").strip() or None
        setattr(shipment, key, value)

    shipment.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(shipment)
    except Exception:
        db.rollback()
        raise

    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == shipment.quotation_id)
        .first()
    )
    if not quotation:
        raise HTTPException(
            status_code=404,
            detail="Associated quotation not found.",
        )

    return {
        "success": True,
        "message": "Shipment updated.",
        "shipment": _shipment_record(shipment, quotation),
    }

