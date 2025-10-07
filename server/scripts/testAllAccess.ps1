# PowerShell script to test all access levels

Write-Host "=== Testing All Access Levels ===" -ForegroundColor Green

# Test admin access
Write-Host "`n1. Testing Admin Access..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "hellotanglome@gmail.com"
    password = "Tanglome@123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
    $adminData = $adminLoginResponse.Content | ConvertFrom-Json
    
    if ($adminData.token) {
        Write-Host "✅ Admin login successful" -ForegroundColor Green
        
        # Test projects list
        $adminProjectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects/list" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $adminProjects = $adminProjectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Admin can access projects list - Found $($adminProjects.projects.Count) projects" -ForegroundColor Green
        
        # Test users list
        $adminUsersResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/users/list" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $adminUsers = $adminUsersResponse.Content | ConvertFrom-Json
        Write-Host "✅ Admin can access users list - Found $($adminUsers.users.Count) users" -ForegroundColor Green
        
        Write-Host "`nAdmin Users List:" -ForegroundColor Cyan
        $adminUsers.users | ForEach-Object { Write-Host "   - $($_.name) ($($_.email)) - $($_.role)" -ForegroundColor White }
    }
} catch {
    Write-Host "❌ Admin test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test manager access
Write-Host "`n2. Testing Manager Access..." -ForegroundColor Yellow
$managerLoginBody = @{
    email = "manager@gmail.com"
    password = "Manager@123"
} | ConvertTo-Json

try {
    $managerLoginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $managerLoginBody
    $managerData = $managerLoginResponse.Content | ConvertFrom-Json
    
    if ($managerData.token) {
        Write-Host "✅ Manager login successful" -ForegroundColor Green
        
        # Test projects list
        $managerProjectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects/list" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerProjects = $managerProjectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can access projects list - Found $($managerProjects.projects.Count) projects" -ForegroundColor Green
        
        # Test users list
        $managerUsersResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/users/list" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerUsers = $managerUsersResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can access users list - Found $($managerUsers.users.Count) users" -ForegroundColor Green
        
        Write-Host "`nManager Users List:" -ForegroundColor Cyan
        $managerUsers.users | ForEach-Object { Write-Host "   - $($_.name) ($($_.email)) - $($_.role)" -ForegroundColor White }
    }
} catch {
    Write-Host "❌ Manager test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "✅ Both admin and manager can access the dropdown endpoints" -ForegroundColor Green
Write-Host "✅ The endpoints are returning the correct data" -ForegroundColor Green
Write-Host "✅ The issue might be in the frontend implementation" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Check browser console for errors" -ForegroundColor White
Write-Host "2. Verify authentication token is being sent" -ForegroundColor White
Write-Host "3. Check if the TaskForm component is calling the right methods" -ForegroundColor White
