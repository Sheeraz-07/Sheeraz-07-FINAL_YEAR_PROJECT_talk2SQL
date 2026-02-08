$body = @{
    user_id = "test_user_123"
    query = "Show me all users"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/query" -Method Post -Body $body -ContentType "application/json"

Write-Host "=== API Response ===" -ForegroundColor Green
$response | ConvertTo-Json -Depth 10
