from datetime import datetime, timedelta, timezone
import os

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext


# ======================================================
# LOAD ENVIRONMENT VARIABLES
# ======================================================

load_dotenv()


# ======================================================
# JWT CONFIGURATION
# ======================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "waypoint-development-secret-change-this"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# ======================================================
# PASSWORD HASHING
# ======================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ======================================================
# CREATE ACCESS TOKEN
# ======================================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
):

    to_encode = data.copy()

    if expires_delta:

        expire = (
            datetime.now(timezone.utc)
            + expires_delta
        )

    else:

        expire = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt
