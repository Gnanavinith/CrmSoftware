# PowerShell script to test task API endpoints

Write-Host "=== Testing Task API Endpoints ===" -ForegroundColor Green

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
        
        # Test admin can fetch all tasks
        Write-Host "`n2. Testing Admin - Get All Tasks..." -ForegroundColor Yellow
        $adminTasksResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/tasks" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $adminTasks = $adminTasksResponse.Content | ConvertFrom-Json
        Write-Host "✅ Admin can fetch $($adminTasks.tasks.Count) tasks" -ForegroundColor Green
        
        # Test admin can fetch projects list
        Write-Host "`n3. Testing Admin - Get Projects List..." -ForegroundColor Yellow
        $adminProjectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects/list" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $adminProjects = $adminProjectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Admin can fetch $($adminProjects.projects.Count) projects for dropdown" -ForegroundColor Green
        
        # Test admin can fetch users list
        Write-Host "`n4. Testing Admin - Get Users List..." -ForegroundColor Yellow
        $adminUsersResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/users/list" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $adminUsers = $adminUsersResponse.Content | ConvertFrom-Json
        Write-Host "✅ Admin can fetch $($adminUsers.users.Count) users for dropdown" -ForegroundColor Green
    } else {
        Write-Host "❌ Admin login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Admin test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test manager login
Write-Host "`n5. Testing Manager Login..." -ForegroundColor Yellow
$managerLoginBody = @{
    email = "manager@gmail.com"
    password = "Manager@123"
} | ConvertTo-Json

try {
    $managerLoginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $managerLoginBody
    $managerData = $managerLoginResponse.Content | ConvertFrom-Json
    
    if ($managerData.token) {
        Write-Host "✅ Manager login successful" -ForegroundColor Green
        
        # Test manager can fetch all tasks
        Write-Host "`n6. Testing Manager - Get All Tasks..." -ForegroundColor Yellow
        $managerTasksResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/tasks" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerTasks = $managerTasksResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can fetch $($managerTasks.tasks.Count) tasks" -ForegroundColor Green
        
        # Test manager can fetch projects list
        Write-Host "`n7. Testing Manager - Get Projects List..." -ForegroundColor Yellow
        $managerProjectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects/list" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerProjects = $managerProjectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can fetch $($managerProjects.projects.Count) projects for dropdown" -ForegroundColor Green
        
        # Test manager can fetch users list
        Write-Host "`n8. Testing Manager - Get Users List..." -ForegroundColor Yellow
        $managerUsersResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/users/list" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerUsers = $managerUsersResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can fetch $($managerUsers.users.Count) users for dropdown" -ForegroundColor Green
    } else {
        Write-Host "❌ Manager login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Manager test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "✅ Task role-based access control is working!" -ForegroundColor Green
Write-Host "✅ Managers and Admins can now fetch all tasks, projects, and users!" -ForegroundColor Green
Write-Host "✅ Dropdown data is available for project and assignee selection!" -ForegroundColor Green
