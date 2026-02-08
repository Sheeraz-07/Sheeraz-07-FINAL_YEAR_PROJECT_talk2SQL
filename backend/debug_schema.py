"""
Debug script to test schema retrieval with detailed error reporting.
"""
import asyncio
import sys
import logging
import traceback

# Setup detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

sys.path.insert(0, '.')

from app.schema.schema_retriever import retrieve_relevant_schema
from app.db.supabase import get_engine

async def test_schema_retrieval():
    """Test schema retrieval with detailed error reporting."""
    
    print("=" * 80)
    print("DEBUG: Testing Schema Retrieval")
    print("=" * 80)
    
    try:
        print("\n1. Getting database engine...")
        engine = get_engine()
        print(f"   ✅ Engine created: {engine}")
        print(f"   URL: {engine.url}")
        
        print("\n2. Testing database connection...")
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"   ✅ Connection successful!")
            print(f"   PostgreSQL version: {version}")
        
        print("\n3. Retrieving schema...")
        schema = await retrieve_relevant_schema("Show me all employees")
        
        print(f"\n   ✅ SUCCESS! Retrieved {len(schema)} tables")
        
        if schema:
            print("\n4. Schema details:")
            for i, table_info in enumerate(schema[:3], 1):
                print(f"\n   Table {i}: {table_info['table']}")
                print(f"   Columns ({len(table_info['columns'])}): {', '.join(table_info['columns'][:5])}")
                if len(table_info['columns']) > 5:
                    print(f"   ... and {len(table_info['columns']) - 5} more")
        else:
            print("\n   ⚠️  No tables retrieved!")
            
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        print("\nFull traceback:")
        traceback.print_exc()
        
        # Additional debugging
        print("\n\nDEBUG INFO:")
        print(f"Error type: {type(e)}")
        print(f"Error args: {e.args}")
        
    finally:
        print("\n" + "=" * 80)
        print("Test complete")
        print("=" * 80)

if __name__ == "__main__":
    # Import text here to avoid issues
    from sqlalchemy import text
    asyncio.run(test_schema_retrieval())
