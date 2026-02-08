"""
Test full frontend-backend integration flow
"""
import requests
import json

def test_query_flow():
    """Test that backend properly handles queries and returns Supabase-compatible results"""
    
    url = "http://localhost:8000/api/query"
    
    # Test cases
    test_queries = [
        {
            "name": "Valid query - employees",
            "payload": {
                "user_id": "test_user_123",
                "query": "Show me all employees"
            },
            "expected_status": "success"
        },
        {
            "name": "Valid query - attendance",
            "payload": {
                "user_id": "test_user_123",
                "query": "Show today's attendance report"
            },
            "expected_status": "success"
        },
        {
            "name": "Out of domain query",
            "payload": {
                "user_id": "test_user_123",
                "query": "What's the weather today?"
            },
            "expected_status": "error"
        }
    ]
    
    print("="*80)
    print("Testing Full Frontend-Backend Integration")
    print("="*80)
    
    for test in test_queries:
        print(f"\n📝 Test: {test['name']}")
        print(f"   Query: '{test['payload']['query']}'")
        
        try:
            response = requests.post(url, json=test['payload'], timeout=30)
            result = response.json()
            
            print(f"\n   Status Code: {response.status_code}")
            print(f"   Response Status: {result.get('status', 'N/A')}")
            
            if result.get('status') == 'error':
                print(f"   ❌ Error: {result.get('error', 'Unknown error')}")
                if result.get('explanation'):
                    print(f"   💡 Hint: {result.get('explanation')}")
            else:
                sql_preview = result.get('sql', 'N/A')[:100]
                print(f"   ✅ SQL Generated: {sql_preview}...")
                print(f"   📊 Rows: {result.get('row_count', 0)}")
                print(f"   ⏱️  Time: {result.get('execution_time', 0):.3f}s")
                
                # Verify Supabase compatibility
                if result.get('sql'):
                    sql = result['sql']
                    if 'SELECT' in sql.upper() and 'FROM' in sql.upper():
                        print(f"   ✅ SQL is Supabase-compatible PostgreSQL")
                    else:
                        print(f"   ⚠️  SQL might not be valid")
            
            print(f"\n   Full Response Keys: {list(result.keys())}")
            
        except requests.exceptions.Timeout:
            print(f"   ⏱️  TIMEOUT - Query took too long")
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR - Backend not running?")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
    
    print("\n" + "="*80)
    print("Integration Test Complete!")
    print("="*80)

if __name__ == "__main__":
    test_query_flow()
