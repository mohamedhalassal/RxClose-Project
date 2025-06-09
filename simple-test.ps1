$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJzdXBlcmFkbWluQHJ4Y2xvc2UuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoic3VwZXJhZG1pbiIsImV4cCI6MTc0OTQ4ODU1NCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0MjAwIn0.WavG-4NmV1lGLvUrn3dRfgB8sVBFe40_LWK23lNC_Us"
}

$body = @{
    name = "Al-Nahda Modern Pharmacy"
    ownerName = "Dr. Mohamed Ahmed"
    email = "mohamed.ahmed@gmail.com"
    phoneNumber = "01234567890"
    address = "Faisal Street, Mokattam"
    city = "Cairo"
} | ConvertTo-Json

Write-Host "Testing improved email format..." -ForegroundColor Green
Write-Host "Pharmacy email: mohamed.ahmed@gmail.com" -ForegroundColor Yellow
Write-Host "Expected user email: mohamed.ahmed.pharmacy.admin@gmail.com" -ForegroundColor Cyan

try {
    Start-Sleep 3
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/pharmacy" -Method POST -Body $body -Headers $headers
    
    Write-Host "SUCCESS: Pharmacy created!" -ForegroundColor Green
    Write-Host "ID: $($response.id)" -ForegroundColor White
    Write-Host "Name: $($response.name)" -ForegroundColor White
    Write-Host "Pharmacy Email: $($response.email)" -ForegroundColor White
    Write-Host "User ID: $($response.userId)" -ForegroundColor White
    
    $userResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Headers @{"Authorization" = $headers.Authorization}
    $newUser = $userResponse | Where-Object { $_.id -eq $response.userId }
    
    Write-Host "Created User Details:" -ForegroundColor Cyan
    Write-Host "User Email: $($newUser.email)" -ForegroundColor Yellow
    Write-Host "Username: $($newUser.userName)" -ForegroundColor Yellow
    Write-Host "Role: $($newUser.role)" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} 