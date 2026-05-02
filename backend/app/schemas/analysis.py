from pydantic import BaseModel
from typing import Optional, Dict, Any

class Fundamentals(BaseModel):
    market_cap: Optional[float] = None
    trailing_pe: Optional[float] = None
    dividend_yield: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    company_industry: Optional[str] = None
    company_sector: Optional[str] = None

class AnalysisResponse(BaseModel):
    ticker: str
    current_price: float
    rsi: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    macd: Optional[float] = None
    signal: str
    fundamentals: Optional[Fundamentals] = None

class AISummaryResponse(BaseModel):
    summary: str
    sentiment: str # 'Bullish', 'Bearish', 'Neutral'

    class Config:
        from_attributes = True