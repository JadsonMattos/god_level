"""
Stores and Channels endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.store import Store
from app.models.channel import Channel
from app.db.session import get_db

router = APIRouter()


@router.get("/stores")
async def get_stores(
    db: Session = Depends(get_db)
) -> dict:
    """
    Get list of all stores.

    Args:
        db: Database session

    Returns:
        List of stores with id and name
    """
    try:
        # Query only fields that exist in database
        stores = db.query(
            Store.id,
            Store.name,
            Store.city,
            Store.state
        ).filter(
            Store.is_active.is_(True)
        ).order_by(Store.name).all()

        return {
            "data": [
                {
                    "id": store.id,
                    "name": store.name,
                    "city": store.city,
                    "state": store.state,
                }
                for store in stores
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/channels")
async def get_channels(
    db: Session = Depends(get_db)
) -> dict:
    """
    Get list of all channels.

    Args:
        db: Database session

    Returns:
        List of channels with id and name
    """
    try:
        # Query only fields that exist in database
        channels = db.query(
            Channel.id,
            Channel.name,
            Channel.description,
            Channel.type
        ).order_by(Channel.name).all()

        return {
            "data": [
                {
                    "id": channel.id,
                    "name": channel.name,
                    "description": channel.description,
                    "type": channel.type,
                }
                for channel in channels
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
