import asyncio
import sys
import os

# Add root directory to sys.path to allow imports from 'app'
sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def create_admin():
    # Credentials provided by user
    username = "ADMIN"
    password = "@Telecom@2026@"
    
    # Use the username as the email for the admin account
    email = username.lower() + "@admin.com" if "@" not in username else username
    
    async with AsyncSessionLocal() as db:
        logger.info(f"Creating admin user with email: {email}...")
        
        # Check if user already exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == email))
        existing_user = result.scalars().first()
        
        if existing_user:
            logger.info(f"User {email} already exists. Updating password.")
            existing_user.hashed_password = get_password_hash(password)
            existing_user.is_admin = True
        else:
            new_user = User(
                email=email,
                hashed_password=get_password_hash(password),
                is_admin=True
            )
            db.add(new_user)
            logger.info(f"Adding new admin user: {email}")
        
        try:
            await db.commit()
            logger.info("Admin user created/updated successfully.")
            print(f"\nAdmin Account Created:\nEmail: {email}\nPassword: {password}\n")
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating admin user: {str(e)}")

if __name__ == "__main__":
    try:
        asyncio.run(create_admin())
    except KeyboardInterrupt:
        pass