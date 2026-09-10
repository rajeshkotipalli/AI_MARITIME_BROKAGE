from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey
)

from app.database import Base


# =========================================================
# QUOTATION MODEL
# =========================================================

class Quotation(Base):

    __tablename__ = "quotations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # -----------------------------------------------------
    # COMPANY INFORMATION
    # -----------------------------------------------------

    company_name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=False
    )

    phone = Column(
        String,
        nullable=False
    )

    # -----------------------------------------------------
    # ROUTE INFORMATION
    # -----------------------------------------------------

    origin = Column(
        String,
        nullable=False
    )

    destination = Column(
        String,
        nullable=False
    )

    route_id = Column(
        String,
        nullable=False
    )

    cargo_type = Column(
        String,
        nullable=False
    )

    # -----------------------------------------------------
    # SHIPMENT INFORMATION
    # -----------------------------------------------------

    cargo_weight = Column(
        Float,
        nullable=False
    )

    containers = Column(
        Integer,
        nullable=False
    )

    # -----------------------------------------------------
    # SPECIAL REQUIREMENTS
    # -----------------------------------------------------

    special_requirements = Column(
        Text,
        nullable=True
    )

    # -----------------------------------------------------
    # STATUS
    # -----------------------------------------------------

    status = Column(
        String,
        default="Pending",
        nullable=False
    )

    # -----------------------------------------------------
    # CREATED TIME
    # -----------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )