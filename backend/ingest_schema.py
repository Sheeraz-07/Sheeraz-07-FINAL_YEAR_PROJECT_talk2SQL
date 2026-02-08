"""
Manually trigger schema ingestion to populate vector embeddings.
"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.schema.schema_ingest import ingest_schema

async def main():
    print("Starting schema ingestion...")
    print("This will:")
    print("  1. Introspect all tables in your database")  
    print("  2. Generate embeddings for each table using LongCat")
    print("  3. Store embeddings in vector_embeddings table")
    print("\nThis may take a minute...\n")
    
    result = await ingest_schema(force=True)
    
    if result["status"] == "success":
        print(f"\n✅ SUCCESS!")
        print(f"   Tables embedded: {result['tables_embedded']}")
        print(f"   Total tables: {result['total_tables']}")
        for msg in result.get("messages", []):
            print(f"   {msg}")
    else:
        print(f"\n❌ FAILED: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    asyncio.run(main())
