import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Price, Stock
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class TechnicalAnalyzer:
    """
    Service responsible for calculating technical indicators from historical price data.
    Implemented using pure Pandas to avoid Python 3.14 compatibility issues with pandas-ta/numba.
    """

    def _calculate_rsi(self, series, period=14):
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    def _calculate_macd(self, series):
        exp1 = series.ewm(span=12, adjust=False).mean()
        exp2 = series.ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        return macd, signal

    async def calculate_indicators(self, stock_id: int, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """
        Calculates RSI, SMA 20, SMA 50, and MACD for a given stock.
        Returns a dictionary with the latest indicator values and a signal.
        """
        try:
            # 1. Fetch historical prices
            result = await db.execute(
                select(Price).where(Price.stock_id == stock_id).order_by(Price.timestamp)
            )
            prices = result.scalars().all()

            if len(prices) < 50:
                logger.warning(f"Not enough data for stock_id {stock_id} to calculate all indicators (min 50 required).")
                # Return basics but mark signal as Insufficient Data
                df = pd.DataFrame([
                    {
                        "timestamp": p.timestamp,
                        "open": p.open,
                        "high": p.high,
                        "low": p.low,
                        "close": p.close,
                        "volume": p.volume
                    } for p in prices
                ])
                df.set_index("timestamp", inplace=True)

                last_row = df.iloc[-1] if not df.empty else None
                if last_row is None: return None

                return {
                    "current_price": float(last_row['close']),
                    "rsi": None,
                    "sma_20": None,
                    "sma_50": None,
                    "macd": None,
                    "signal": "Insufficient Data"
                }
            
            # 2. Convert to Pandas DataFrame
            df = pd.DataFrame([
                {
                    "timestamp": p.timestamp,
                    "open": p.open,
                    "high": p.high,
                    "low": p.low,
                    "close": p.close,
                    "volume": p.volume
                } for p in prices
            ])
            df.set_index("timestamp", inplace=True)

            # 3. Calculate Indicators using pure Pandas
            # RSI (14)
            df['RSI'] = self._calculate_rsi(df['close'])
            
            # Moving Averages
            df['SMA_20'] = df['close'].rolling(window=20).mean()
            df['SMA_50'] = df['close'].rolling(window=50).mean()
            
            # MACD
            macd_line, signal_line = self._calculate_macd(df['close'])
            df['MACD'] = macd_line

            # Get the last row of data
            last_row = df.iloc[-1]
            current_price = float(last_row['close'])
            rsi = float(last_row['RSI']) if not pd.isna(last_row['RSI']) else None
            sma_20 = float(last_row['SMA_20']) if not pd.isna(last_row['SMA_20']) else None
            sma_50 = float(last_row['SMA_50']) if not pd.isna(last_row['SMA_50']) else None
            macd_val = float(last_row['MACD']) if not pd.isna(last_row['MACD']) else None

            # 4. Recommendation Logic (Weighted Scoring System)
            score = 0

            # SMA Crossover (Highest Weight)
            if sma_20 and sma_50:
                if sma_20 > sma_50: score += 2
                elif sma_20 < sma_50: score -= 2

            # RSI (Overbought/Oversold)
            if rsi:
                if rsi < 30: score += 1 # Oversold - potential Buy
                elif rsi > 70: score -= 1 # Overbought - potential Sell

            # MACD (Momentum)
            if macd_val:
                if macd_val > 0: score += 1
                else: score -= 1

            if score >= 2: signal = "Buy"
            elif score <= -2: signal = "Sell"
            else: signal = "Hold"

            return {
                "current_price": current_price,
                "rsi": rsi,
                "sma_20": sma_20,
                "sma_50": sma_50,
                "macd": macd_val,
                "signal": signal
            }

        except Exception as e:
            logger.error(f"Error calculating indicators for stock_id {stock_id}: {str(e)}")
            return None