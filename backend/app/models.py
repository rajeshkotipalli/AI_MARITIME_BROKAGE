<<<<<<< HEAD
from pydantic import BaseModel, Field, EmailStr, field_validator
=======
from pydantic import BaseModel, Field, EmailStr
>>>>>>> origin/master


# ======================================================
# ROUTE REQUEST
# ======================================================

class RouteRequest(BaseModel):
<<<<<<< HEAD
    origin: str
    destination: str
    cargo_type: str
    containers: int = Field(..., gt=0)
=======

    origin: str

    destination: str

    cargo_type: str

    containers: int = Field(
        ...,
        gt=0
    )
>>>>>>> origin/master


# ======================================================
# REGISTER REQUEST
# ======================================================

class RegisterRequest(BaseModel):
<<<<<<< HEAD
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    country: str = Field(..., min_length=2, max_length=60)
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must contain at least 8 characters.")
        if not any(character.isupper() for character in value):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(not character.isalnum() for character in value):
            raise ValueError("Password must contain at least one special character.")
        return value
=======

    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: EmailStr

    phone: str = Field(
        ...,
        min_length=10,
        max_length=15
    )

    country: str = Field(
        ...,
        min_length=2,
        max_length=60
    )

    username: str = Field(
        ...,
        min_length=3,
        max_length=30
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=100
    )

    confirm_password: str
>>>>>>> origin/master


# ======================================================
# LOGIN REQUEST
# ======================================================

class LoginRequest(BaseModel):
<<<<<<< HEAD
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)
=======

    username: str = Field(
        ...,
        min_length=3
    )

    password: str = Field(
        ...,
        min_length=1
    )
>>>>>>> origin/master


# ======================================================
# OTP REQUEST
# ======================================================

class OTPRequest(BaseModel):
<<<<<<< HEAD
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
=======

    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6
    )
>>>>>>> origin/master
