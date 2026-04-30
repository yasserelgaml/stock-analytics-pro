import asyncio
import sys
import os

# Add root directory to sys.path to allow imports from 'app'
sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.services.collector import StockCollector
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def seed_data():
    # List of stocks to seed: Mix of Egyptian and International
    tickers = ["COMI.CA", "AAPL", "MSFT", "GOOGL", "AMZN"]
    
    collector = StockCollector()
    
    async with AsyncSessionLocal() as db:
        logger.info("Starting data seeding process...")
        
        for ticker in tickers:
            try:
                logger.info(f"Processing {ticker}...")
                
                # 1. Fetch and save stock info
                stock = await collector.fetch_stock_info(ticker, db)
                
                if stock:
                    # 2. Fetch and save historical prices
                    await collector.fetch_historical_prices(ticker, stock.id, db)
                    await db.commit()
                    logger.info(f"Successfully seeded data for {ticker}")
                else:
                    logger.error(f"Failed to retrieve info for {ticker}, skipping prices.")
            
            except Exception as e:
                await db.rollback()
                logger.error(f"Unexpected error seeding {ticker}: {str(e)}")
        
        logger.info("Data seeding process completed.")

if __name__ == "__main__":
    try:
        asyncio.run(seed_data())
    except KeyboardInterrupt:
        pass