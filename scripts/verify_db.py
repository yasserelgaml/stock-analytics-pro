import asyncio
import sys
import os

# Add root directory to sys.path to allow imports from 'app'
sys.path.append(os.getcwd())

from app.db.session import engine
from app.db.base_class import Base
import app.models # Ensure all models are registered
from app.core.config import settings

async def verify_db():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    try:
        async with engine.begin() as conn:
            # Create tables
            print("Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("Tables created successfully.")

            # Test connection with a simple query
            print("Testing connection...")
            from sqlalchemy import text
            result = await conn.execute(text("SELECT 1"))
            if result.scalar() == 1:
                print("Database connection verified successfully!")
            else:
                print("Database connection failed.")
                
    except Exception as e:
        print(f"An error occurred during database verification: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(verify_db())