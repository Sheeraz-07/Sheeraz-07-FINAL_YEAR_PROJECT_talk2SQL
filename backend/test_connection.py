"""Quick test to verify Supabase connection with Session Mode Pooler."""
import asyncio
import asyncpg
from app.core.config import get_settings

async def test_connection():
    settings = get_settings()
    db_url = settings.SUPABASE_DB_URL
    
    print(f"Testing connection...")
    print(f"URL (masked): {db_url[:50]}...{db_url[-20:]}")
    
    # Parse connection string
    # Format: postgresql+asyncpg://user:pass@host:port/db
    url_parts = db_url.replace("postgresql+asyncpg://", "").split("@")
    user_pass = url_parts[0].split(":")
    host_port_db = url_parts[1].split("/")
    host_port = host_port_db[0].split(":")
    
    user = user_pass[0]
    password = user_pass[1]
    host = host_port[0]
    port = int(host_port[1])
    database = host_port_db[1]
    
    print(f"\nConnection details:")
    print(f"  User: {user}")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print(f"  Database: {database}")
    
    try:
        # Test connection
        conn = await asyncpg.connect(
            user=user,
            password=password,
            database=database,
            host=host,
            port=port,
            timeout=10
        )
        
        # Run simple query
        version = await conn.fetchval('SELECT version()')
        print(f"\n✅ CONNECTION SUCCESSFUL!")
        print(f"PostgreSQL version: {version[:50]}...")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    exit(0 if success else 1)
