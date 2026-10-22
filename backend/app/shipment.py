
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)

from app.database import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)

    quotation_id = Column(
        Integer,
        ForeignKey("quotations.id"),
        unique=True,
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    tracking_reference = Column(
        String(80),
        unique=True,
        nullable=False,
        index=True,
    )

    vessel_name = Column(String(160), nullable=True)
    status = Column(String(40), nullable=False, default="Booked")
    current_location = Column(String(200), nullable=True)

    estimated_departure = Column(String(40), nullable=True)
    actual_departure = Column(String(40), nullable=True)
    estimated_arrival = Column(String(40), nullable=True)
    actual_arrival = Column(String(40), nullable=True)

    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
