from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text
)

from sqlalchemy.orm import Session

from app.database import Base


# ======================================================
# SEARCH HISTORY TABLE
# ======================================================

class SearchHistory(Base):

    __tablename__ = "search_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # User who performed the search
    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    # Route information
    origin = Column(
        String(100),
        nullable=False
    )

    destination = Column(
        String(100),
        nullable=False
    )

    cargo_type = Column(
        String(100),
        nullable=False
    )

    containers = Column(
        Integer,
        nullable=False
    )

    # Recommended route
    recommended_route = Column(
        String(100),
        nullable=True
    )

    transit_time_days = Column(
        Integer,
        nullable=True
    )

    distance_nm = Column(
        Integer,
        nullable=True
    )

    base_freight_usd = Column(
        String(50),
        nullable=True
    )

    reason = Column(
        Text,
        nullable=True
    )

    # Search timestamp
    searched_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )


# ======================================================
# CREATE SEARCH HISTORY
# ======================================================

def save_search(
    db: Session,
    user_id: int,
    route_result: dict
):

    recommended_route = (
        route_result.get(
            "recommended_route"
        )
    )

    # --------------------------------------------------
    # Handle new recommended-route structure
    # --------------------------------------------------

    if isinstance(
        recommended_route,
        dict
    ):

        route_id = (
            recommended_route.get(
                "route_id"
            )
        )

        transit_time = (
            recommended_route.get(
                "transit_time_days"
            )
        )

        distance = (
            recommended_route.get(
                "distance_nm"
            )
        )

        freight = (
            recommended_route.get(
                "base_freight_usd"
            )
        )

    else:

        # --------------------------------------------------
        # Handle old route structure
        # --------------------------------------------------

        route_id = recommended_route

        transit_time = (
            route_result.get(
                "transit_time_days"
            )
        )

        distance = (
            route_result.get(
                "distance_nm"
            )
        )

        freight = (
            route_result.get(
                "base_freight_usd"
            )
        )


    history = SearchHistory(

        user_id=user_id,

        origin=route_result.get(
            "origin",
            ""
        ),

        destination=route_result.get(
            "destination",
            ""
        ),

        cargo_type=route_result.get(
            "cargo_type",
            ""
        ),

        containers=int(
            route_result.get(
                "containers",
                0
            )
        ),

        recommended_route=route_id,

        transit_time_days=(
            int(transit_time)
            if transit_time is not None
            else None
        ),

        distance_nm=(
            int(distance)
            if distance is not None
            else None
        ),

        base_freight_usd=(
            str(freight)
            if freight is not None
            else None
        ),

        reason=route_result.get(
            "reason"
        )
    )


    try:

        db.add(history)

        db.commit()

        db.refresh(history)

        return history

    except Exception:

        db.rollback()

        raise


# ======================================================
# GET USER SEARCH HISTORY
# ======================================================

def get_user_history(
    db: Session,
    user_id: int,
    limit: int = 20
):

    return (
        db.query(SearchHistory)
        .filter(
            SearchHistory.user_id ==
            user_id
        )
        .order_by(
            SearchHistory.searched_at.desc()
        )
        .limit(limit)
        .all()
    )


# ======================================================
# GET SINGLE HISTORY RECORD
# ======================================================

def get_history_item(
    db: Session,
    user_id: int,
    history_id: int
):

    return (
        db.query(SearchHistory)
        .filter(
            SearchHistory.id ==
            history_id,

            SearchHistory.user_id ==
            user_id
        )
        .first()
    )


# ======================================================
# DELETE HISTORY ITEM
# ======================================================

def delete_history_item(
    db: Session,
    user_id: int,
    history_id: int
):

    history = get_history_item(
        db=db,
        user_id=user_id,
        history_id=history_id
    )

    if not history:

        return False


    try:

        db.delete(history)

        db.commit()

        return True

    except Exception:

        db.rollback()

        raise