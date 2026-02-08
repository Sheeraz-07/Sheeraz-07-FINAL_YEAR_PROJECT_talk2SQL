"""
Quick test script to verify the API endpoint works with LongCat.
"""
import requests
import json

url = "http://localhost:8000/api/query"
payload = {
    "user_id": "test_user_123",
    "query": "Show me all users"
}

print("Testing Talk2SQL API...")
print(f"Request: {json.dumps(payload, indent=2)}")
print("\n" + "="*60 + "\n")

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:\n{json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
