"""
Check what tables exist in the database and optionally create sample tables.
"""
import asyncio
from app.db.supabase import get_engine
from sqlalchemy import text

async def check_tables():
    engine = get_engine()
    async with engine.connect() as conn:
        # Get all tables in public schema
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """))
        
        tables = [row[0] for row in result]
        print(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table}")
        
        if not tables:
            print("\nNo tables found. Would you like to create sample tables?")
        
        return tables

if __name__ == "__main__":
    asyncio.run(check_tables())
