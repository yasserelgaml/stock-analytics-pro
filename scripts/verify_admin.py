import asyncio
import sys
import os

# Add root directory to sys.path to allow imports from 'app'
sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy import select

async def verify_admin():
    username = "admin@admin.com"
    password = "@Telecom@2026@"
    
    async with AsyncSessionLocal() as db:
        print(f"Checking for user: {username}...")
        result = await db.execute(select(User).where(User.email == username))
        user = result.scalars().first()
        
        if not user:
            print(f"❌ Error: User {username} not found in database.")
            return
        
        print(f"✅ User {username} found.")
        print(f"Admin status: {user.is_admin}")
        
        if verify_password(password, user.hashed_password):
            print("✅ Password matches!")
        else:
            print("❌ Password does NOT match.")

if __name__ == "__main__":
    asyncio.run(verify_admin())