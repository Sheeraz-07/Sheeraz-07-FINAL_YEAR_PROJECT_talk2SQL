"""Direct test of the complete query flow."""
import asyncio
import sys
import traceback
sys.path.insert(0, '.')

from app.schema.schema_retriever import retrieve_relevant_schema
from app.agents.sql_agent import generate_sql

async def test_full_query():
    print("="*60)
    print("TESTING FULL QUERY FLOW")
    print("="*60)
    
    # Step 1: Test schema retrieval
    print("\n[1] Testing schema retrieval...")
    try:
        schema = await retrieve_relevant_schema("Show me all users")
        print(f"✅ Schema retrieved: {len(schema)} tables")
        if schema:
            print(f"   First table: {schema[0]['table']}")
            print(f"   Columns: {schema[0]['columns'][:5]}")
    except Exception as e:
        print(f"❌ Schema retrieval failed: {e}")
        traceback.print_exc()
        return
    
    # Step 2: Test SQL generation
    print("\n[2] Testing SQL generation...")
    try:
        sql = await generate_sql(
            user_query="Show me all users",
            schema_context=schema
        )
        print(f"✅ SQL generated:")
        print(f"   {sql}")
    except Exception as e:
        print(f"❌ SQL generation failed: {e}")
        traceback.print_exc()
        return
    
    print("\n" + "="*60)
    print("ALL TESTS PASSED!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_full_query())
