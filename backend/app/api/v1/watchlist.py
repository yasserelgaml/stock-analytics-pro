from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.session import get_db
from app.models import Watchlist
from app.api.v1.auth import get_current_user
from app.models import User
from pydantic import BaseModel

router = APIRouter()

class WatchlistItem(BaseModel):
    ticker: str

@router.get("/")
async def get_watchlist(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all tickers in the authenticated user's watchlist.
    """
    result = await db.execute(
        select(Watchlist).where(Watchlist.user_id == current_user.id)
    )
    items = result.scalars().all()
    return [{"id": item.id, "ticker": item.ticker, "added_at": item.added_at} for item in items]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    item: WatchlistItem, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """
    Adds a ticker to the authenticated user's watchlist.
    """
    ticker_upper = item.ticker.upper()
    
    # Check if already exists for this specific user
    result = await db.execute(
        select(Watchlist).where(
            Watchlist.ticker == ticker_upper, 
            Watchlist.user_id == current_user.id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ticker already in your watchlist")
    
    new_item = Watchlist(ticker=ticker_upper, user_id=current_user.id)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return {"id": new_item.id, "ticker": new_item.ticker, "added_at": new_item.added_at}

@router.delete("/{ticker}")
async def remove_from_watchlist(
    ticker: str, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """
    Removes a ticker from the authenticated user's watchlist.
    """
    ticker_upper = ticker.upper()
    result = await db.execute(
        select(Watchlist).where(
            Watchlist.ticker == ticker_upper, 
            Watchlist.user_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Ticker not found in your watchlist")
    
    await db.delete(item)
    await db.commit()
    return {"detail": f"Ticker {ticker_upper} removed from your watchlist"}