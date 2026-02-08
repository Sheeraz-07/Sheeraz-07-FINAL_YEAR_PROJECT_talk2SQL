"""
Test the schema retriever directly to debug issues.
"""
import asyncio
import sys
import logging

# Setup logging to see detailed errors
logging.basicConfig(level=logging.DEBUG)

sys.path.insert(0, '.')

from app.schema.schema_retriever import retrieve_relevant_schema

async def test():
    try:
        print("Testing direct schema retrieval...")
        print("Calling retrieve_relevant_schema...\n")
        
        schema = await retrieve_relevant_schema("Show me all users")
        
        print(f"\n✅ SUCCESS! Retrieved {len(schema)} tables:")
        for table_info in schema[:3]:  # Show first 3 tables
            print(f"\n  Table: {table_info['table']}")
            print(f"  Columns: {', '.join(table_info['columns'][:5])}")  # First 5 columns
            
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
