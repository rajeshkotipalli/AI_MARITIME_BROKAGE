from pydantic import BaseModel, Field, EmailStr, field_validator


# ======================================================
# ROUTE REQUEST
# ======================================================

class RouteRequest(BaseModel):
    origin: str
    destination: str
    cargo_type: str
    containers: int = Field(..., gt=0)


# ======================================================
# REGISTER REQUEST
# ======================================================

class RegisterRequest(BaseModel):
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


# ======================================================
# LOGIN REQUEST
# ======================================================

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)


# ======================================================
# OTP REQUEST
# ======================================================

class OTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
