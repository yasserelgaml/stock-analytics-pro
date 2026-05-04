from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models import Stock, Price
from app.services.analyzer import TechnicalAnalyzer
from app.schemas.analysis import AnalysisResponse, AISummaryResponse, Fundamentals
from app.core.cache import cache
from typing import List, Dict, Any
import yfinance as yf
import logging

# Setup structured logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
analyzer = TechnicalAnalyzer()

@router.get("/{ticker}", response_model=AnalysisResponse)
async def get_stock_analysis(ticker: str, db: AsyncSession = Depends(get_db)):
    """
    Get technical analysis and fundamental data for a specific stock ticker.
    Implements caching to reduce API latency.
    """
    ticker_upper = ticker.upper()
    cache_key = f"analysis_{ticker_upper}"
    
    # 1. Check Cache
    cached_data = cache.get(cache_key)
    if cached_data:
        logger.info(f"Cache hit for analysis: {ticker_upper}")
        return cached_data

    # 2. Find the stock by ticker
    result = await db.execute(select(Stock).where(Stock.ticker == ticker_upper))
    stock = result.scalar_one_or_none()
    
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock with ticker {ticker_upper} not found in database.")
    
    # 3. Calculate technical indicators
    analysis_data = await analyzer.calculate_indicators(stock.id, db)
    
    if not analysis_data:
        logger.error(f"Failed to calculate indicators for {ticker_upper}")
        raise HTTPException(status_code=500, detail="Could not calculate technical indicators.")
    
    # 4. Fetch Fundamental Data using yfinance
    try:
        yf_ticker = yf.Ticker(ticker_upper)
        info = yf_ticker.info
        fundamentals = Fundamentals(
            market_cap=info.get('marketCap'),
            trailing_pe=info.get('trailingPE'),
            dividend_yield=info.get('dividendYield'),
            fifty_two_week_high=info.get('fiftyTwoWeekHigh'),
            fifty_two_week_low=info.get('fiftyTwoWeekLow'),
            company_industry=info.get('industry'),
            company_sector=info.get('sector')
        )
    except Exception as e:
        logger.warning(f"Fundamental data fetch failed for {ticker_upper}: {str(e)}")
        fundamentals = None

    # 5. Combine and Cache
    response_data = {
        "ticker": stock.ticker,
        **analysis_data,
        "fundamentals": fundamentals
    }
    
    cache.set(cache_key, response_data)
    logger.info(f"Cache set for analysis: {ticker_upper}")
    
    return response_data

@router.post("/{ticker}/ai-summary", response_model=AISummaryResponse)
async def get_ai_summary(ticker: str, db: AsyncSession = Depends(get_db)):
    """
    Generates a smart summary of the stock's technical position.
    """
    ticker_upper = ticker.upper()
    cache_key = f"ai_summary_{ticker_upper}"
    
    cached_summary = cache.get(cache_key)
    if cached_summary:
        return cached_summary

    result = await db.execute(select(Stock).where(Stock.ticker == ticker_upper))
    stock = result.scalar_one_or_none()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    techs = await analyzer.calculate_indicators(stock.id, db)
    if not techs:
        raise HTTPException(status_code=500, detail="Could not fetch technicals for summary")

    rsi = techs['rsi'] or 50
    signal = techs['signal']
    
    sentiment = "Neutral"
    if signal == "Buy": sentiment = "Bullish"
    elif signal == "Sell": sentiment = "Bearish"
    
    summary_parts = []
    if signal == "Buy":
        summary_parts.append(f"The stock is showing a strong bullish trend with a Golden Cross (SMA20 > SMA50).")
    elif signal == "Sell":
        summary_parts.append(f"The stock is currently in a bearish phase, indicated by a Death Cross (SMA20 < SMA50).")
    else:
        summary_parts.append(f"The stock is currently consolidating with no clear trend direction.")
        
    if rsi > 70:
        summary_parts.append("RSI indicates the asset is overbought, suggesting a potential pullback.")
    elif rsi < 30:
        summary_parts.append("RSI indicates the asset is oversold, which may present a buying opportunity.")
    else:
        summary_parts.append("RSI is in a neutral zone, showing stable momentum.")
        
    summary_parts.append(f"Overall, the current technical setup suggests a {sentiment.lower()} outlook for {ticker_upper}.")
    
    response = AISummaryResponse(
        summary=" ".join(summary_parts),
        sentiment=sentiment
    )
    
    cache.set(cache_key, response)
    return response

@router.get("/{ticker}/news")
async def get_stock_news(ticker: str):
    """
    Fetches the latest news stories for the ticker using yfinance.
    Implements caching to reduce API latency.
    """
    ticker_upper = ticker.upper()
    cache_key = f"news_{ticker_upper}"
    
    cached_news = cache.get(cache_key)
    if cached_news:
        logger.info(f"Cache hit for news: {ticker_upper}")
        return cached_news

    try:
        yf_ticker = yf.Ticker(ticker_upper)
        news = yf_ticker.news
        result = news[:5]
        
        cache.set(cache_key, result)
        logger.info(f"Cache set for news: {ticker_upper}")
        return result
    except Exception as e:
        logger.error(f"News fetch failed for {ticker_upper}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

@router.get("/{ticker}/history", response_model=List[Dict[str, Any]])
async def get_stock_history(ticker: str, db: AsyncSession = Depends(get_db)):
    """
    Get historical price data including SMA overlays for the chart.
    """
    ticker_upper = ticker.upper()
    cache_key = f"history_{ticker_upper}"
    
    cached_history = cache.get(cache_key)
    if cached_history:
        return cached_history

    result = await db.execute(select(Stock).where(Stock.ticker == ticker_upper))
    stock = result.scalar_one_or_none()
    
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock with ticker {ticker_upper} not found.")
    
    price_result = await db.execute(
        select(Price).where(Price.stock_id == stock.id).order_by(Price.timestamp.asc())
    )
    prices = price_result.scalars().all()
    
    import pandas as pd
    df = pd.DataFrame([
        {"date": p.timestamp.strftime("%Y-%m-%d"), "price": p.close} 
        for p in prices
    ])
    
    if not df.empty:
        df['sma_20'] = df['price'].rolling(window=20).mean()
        df['sma_50'] = df['price'].rolling(window=50).mean()
    
    response_data = df.to_dict(orient="records")
    cache.set(cache_key, response_data)
    return response_data