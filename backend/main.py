
from app.agents.ai_agent import WaypointAIAgent
from pydantic import BaseModel

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    Request
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session
from jose import jwt, JWTError

# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

from dotenv import load_dotenv

load_dotenv()

from typing import Optional, Dict, Any

import os
import json
import urllib.parse
import urllib.request
import urllib.error


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
    create_user_token
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


# =========================================================
# ROUTE AGENT
# =========================================================

from app.agents.route_agent import RouteAgent


# =========================================================
# DATABASE TABLE CREATION
# =========================================================

Base.metadata.create_all(
    bind=engine
)


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

    version="4.0.0"
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
# ROUTE AGENT
# =========================================================

route_agent = RouteAgent()
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
                    "error":
                        "WEAK_PASSWORD",

                    "message":
                        "Password must contain at least 8 characters."
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


        result = route_agent.analyze_route(

            origin=origin,

            destination=destination,

            cargo_type=cargo_type,

            containers=containers
        )


        if result.get("status") == "not_found":

            return result


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
            }
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
# WEATHER & CONDITIONS
# =========================================================

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