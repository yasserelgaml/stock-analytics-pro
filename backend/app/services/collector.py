import yfinance as yf
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Stock, Price
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StockCollector:
    """
    Service responsible for collecting financial data from Yahoo Finance.
    """

    async def fetch_stock_info(self, ticker_symbol: str, db: AsyncSession) -> Optional[Stock]:
        """
        Fetches company information for a given ticker and saves it to the Stocks table.
        """
        try:
            ticker = yf.Ticker(ticker_symbol)
            info = ticker.info
            
            if not info or 'shortName' not in info:
                logger.error(f"Could not find info for ticker: {ticker_symbol}")
                return None

            # Check if stock already exists
            result = await db.execute(select(Stock).where(Stock.ticker == ticker_symbol))
            stock = result.scalar_one_or_none()

            if stock:
                # Update existing stock info
                stock.name = info.get('shortName', stock.name)
                stock.exchange = info.get('exchange', stock.exchange)
                stock.sector = info.get('sector', stock.sector)
                logger.info(f"Updated info for stock: {ticker_symbol}")
            else:
                # Create new stock record
                stock = Stock(
                    ticker=ticker_symbol,
                    name=info.get('shortName', 'Unknown'),
                    exchange=info.get('exchange', 'Unknown'),
                    sector=info.get('sector', 'Unknown')
                )
                db.add(stock)
                await db.flush() # Ensure we get the stock.id
                logger.info(f"Created new stock record for: {ticker_symbol}")

            return stock
        except Exception as e:
            logger.error(f"Error fetching info for {ticker_symbol}: {str(e)}")
            return None

    async def fetch_historical_prices(self, ticker_symbol: str, stock_id: int, db: AsyncSession):
        """
        Fetches historical prices for the last 30 days and saves them to the Prices table.
        """
        try:
            ticker = yf.Ticker(ticker_symbol)
            # Fetch 1 month of daily data
            df = ticker.history(period="1mo")

            if df.empty:
                logger.warning(f"No historical data found for ticker: {ticker_symbol}")
                return

            prices_to_add = []
            for timestamp, row in df.iterrows():
                # Convert pandas timestamp to python datetime
                price_record = Price(
                    stock_id=stock_id,
                    timestamp=timestamp.to_pydatetime(),
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=float(row['Volume'])
                )
                prices_to_add.append(price_record)

            db.add_all(prices_to_add)
            logger.info(f"Successfully fetched {len(prices_to_add)} price records for {ticker_symbol}")
            
        except Exception as e:
            logger.error(f"Error fetching prices for {ticker_symbol}: {str(e)}")