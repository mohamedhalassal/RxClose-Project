$loginData = @{
    email = "superadmin@rxclose.com"
    password = "SuperAdmin@123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/Auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "New Token: $($responseData.token)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
} 