"""Persistent general and shipment-specific customer reviews."""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from app.database import Base

class UserReview(Base):
    __tablename__ = "user_reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "shipment_id", name="uq_user_review_per_shipment"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # NULL means this is an existing/general platform review.
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True, index=True)
    rating = Column(Integer, nullable=False)
    title = Column(String(120), nullable=True)
    review = Column(Text, nullable=False)
    service_area = Column(String(80), nullable=False, default="Overall Experience")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    admin_reply = Column(Text, nullable=True)
    admin_reply_at = Column(DateTime, nullable=True)
    admin_replied_by = Column(Integer, ForeignKey("users.id"), nullable=True)
