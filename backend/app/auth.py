from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import Session

from app.database import Base

from app.security import (
    hash_password,
    verify_password,
    create_access_token
)

from app.otp import (
    generate_otp,
    save_otp
)


# ======================================================
# USER DATABASE TABLE
# ======================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    country = Column(
        String(100),
        nullable=False
    )

    username = Column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    is_verified = Column(
        Boolean,
        default=False,
        nullable=False
    )


# ======================================================
# REGISTER USER
# ======================================================

def register_user(
    db: Session,
    name: str,
    email: str,
    phone: str,
    country: str,
    username: str,
    password: str
):

    # --------------------------------------------------
    # CLEAN INPUT
    # --------------------------------------------------

    email = email.strip().lower()

    username = username.strip()


    # --------------------------------------------------
    # CHECK USERNAME
    # --------------------------------------------------

    existing_username = (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )

    if existing_username:

        return None, "USERNAME_EXISTS"


    # --------------------------------------------------
    # CHECK EMAIL
    # --------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing_email:

        return None, "EMAIL_EXISTS"


    # --------------------------------------------------
    # HASH PASSWORD
    # --------------------------------------------------

    password_hash = hash_password(
        password
    )


    # --------------------------------------------------
    # CREATE USER
    # --------------------------------------------------

    user = User(

        name=name.strip(),

        email=email,

        phone=phone.strip(),

        country=country.strip(),

        username=username,

        password_hash=password_hash,

        is_verified=False
    )


    # --------------------------------------------------
    # SAVE USER
    # --------------------------------------------------

    try:

        db.add(user)

        db.commit()

        db.refresh(user)

    except Exception:

        db.rollback()

        raise


    # --------------------------------------------------
    # GENERATE OTP
    # --------------------------------------------------

    otp = generate_otp()

    save_otp(
        email=email,
        otp=otp
    )


    return user, otp


# ======================================================
# AUTHENTICATE USER
# ======================================================

def authenticate_user(
    db: Session,
    username: str,
    password: str
):

    username = username.strip()


    # --------------------------------------------------
    # FIND USER
    # --------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )


    # --------------------------------------------------
    # USERNAME NOT FOUND
    # --------------------------------------------------

    if not user:

        return None, "USERNAME_INCORRECT"


    # --------------------------------------------------
    # PASSWORD INCORRECT
    # --------------------------------------------------

    if not verify_password(
        password,
        user.password_hash
    ):

        return None, "PASSWORD_INCORRECT"


    # --------------------------------------------------
    # SUCCESS
    # --------------------------------------------------

    return user, "SUCCESS"


# ======================================================
# CREATE JWT TOKEN
# ======================================================

def create_user_token(
    user: User
):

    token_data = {

        "sub": str(user.id),

        "username": user.username,

        "email": user.email

    }


    return create_access_token(
        token_data
    )