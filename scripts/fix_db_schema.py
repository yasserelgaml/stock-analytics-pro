import asyncio
import sys
import os
import sqlite3

# Add root directory to sys.path to allow imports from 'app'
sys.path.append(os.getcwd())

from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def fix_schema():
    # Get database path from settings or default to trading.db
    # DATABASE_URL=sqlite+aiosqlite:///./trading.db
    db_path = "trading.db" 
    
    logger.info(f"Connecting to database at {db_path} to fix schema...")
    
    try:
        # Use standard sqlite3 for schema modifications as it's simpler for ALTER TABLE
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if is_admin column exists in users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "is_admin" not in columns:
            logger.info("Column 'is_admin' not found in 'users' table. Adding it...")
            cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
            conn.commit()
            logger.info("Column 'is_admin' added successfully.")
        else:
            logger.info("Column 'is_admin' already exists in 'users' table.")
            
        conn.close()
    except Exception as e:
        logger.error(f"Error fixing schema: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(fix_schema())