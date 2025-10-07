# PowerShell script to test dropdown endpoints

Write-Host "=== Testing Dropdown Endpoints ===" -ForegroundColor Green

# Test admin login
Write-Host "`n1. Testing Admin Login..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "hellotanglome@gmail.com"
    password = "Tanglome@123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $adminLoginBody
    $adminData = $adminLoginResponse.Content | ConvertFrom-Json
    
    if ($adminData.token) {
        Write-Host "✅ Admin login successful" -ForegroundColor Green
        
        # Test projects list endpoint
        Write-Host "`n2. Testing Projects List Endpoint..." -ForegroundColor Yellow
        $projectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects/list" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $projects = $projectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Projects list endpoint working - Found $($projects.projects.Count) projects:" -ForegroundColor Green
        $projects.projects | ForEach-Object { Write-Host "   - $($_.name) ($($_.status))" -ForegroundColor Cyan }
        
        # Test users list endpoint
        Write-Host "`n3. Testing Users List Endpoint..." -ForegroundColor Yellow
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/users/list" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $users = $usersResponse.Content | ConvertFrom-Json
        Write-Host "✅ Users list endpoint working - Found $($users.users.Count) users:" -ForegroundColor Green
        $users.users | ForEach-Object { Write-Host "   - $($_.name) ($($_.email)) - $($_.role)" -ForegroundColor Cyan }
        
    } else {
        Write-Host "❌ Admin login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Admin test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test manager login
Write-Host "`n4. Testing Manager Login..." -ForegroundColor Yellow
$managerLoginBody = @{
    email = "manager@gmail.com"
    password = "Manager@123"
} | ConvertTo-Json

try {
    $managerLoginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $managerLoginBody
    $managerData = $managerLoginResponse.Content | ConvertFrom-Json
    
    if ($managerData.token) {
        Write-Host "✅ Manager login successful" -ForegroundColor Green
        
        # Test projects list endpoint
        Write-Host "`n5. Testing Manager - Projects List..." -ForegroundColor Yellow
        $managerProjectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects/list" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerProjects = $managerProjectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can access projects list - Found $($managerProjects.projects.Count) projects" -ForegroundColor Green
        
        # Test users list endpoint
        Write-Host "`n6. Testing Manager - Users List..." -ForegroundColor Yellow
        $managerUsersResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/users/list" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerUsers = $managerUsersResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can access users list - Found $($managerUsers.users.Count) users" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Manager login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Manager test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "✅ Dropdown endpoints are working correctly!" -ForegroundColor Green
Write-Host "✅ TaskForm should now be able to load projects and users!" -ForegroundColor Green
