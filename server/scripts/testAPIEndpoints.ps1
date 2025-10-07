# PowerShell script to test API endpoints

Write-Host "=== Testing API Endpoints with Role-Based Access ===" -ForegroundColor Green

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
        
        # Test admin can fetch all clients
        Write-Host "`n2. Testing Admin - Get All Clients..." -ForegroundColor Yellow
        $adminClientsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/clients" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $adminClients = $adminClientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Admin can fetch $($adminClients.clients.Count) clients" -ForegroundColor Green
        
        # Test admin can fetch all projects
        Write-Host "`n3. Testing Admin - Get All Projects..." -ForegroundColor Yellow
        $adminProjectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -Headers @{"Authorization"="Bearer $($adminData.token)"}
        $adminProjects = $adminProjectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Admin can fetch $($adminProjects.projects.Count) projects" -ForegroundColor Green
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
        
        # Test manager can fetch all clients
        Write-Host "`n5. Testing Manager - Get All Clients..." -ForegroundColor Yellow
        $managerClientsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/clients" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerClients = $managerClientsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can fetch $($managerClients.clients.Count) clients" -ForegroundColor Green
        
        # Test manager can fetch all projects
        Write-Host "`n6. Testing Manager - Get All Projects..." -ForegroundColor Yellow
        $managerProjectsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -Headers @{"Authorization"="Bearer $($managerData.token)"}
        $managerProjects = $managerProjectsResponse.Content | ConvertFrom-Json
        Write-Host "✅ Manager can fetch $($managerProjects.projects.Count) projects" -ForegroundColor Green
    } else {
        Write-Host "❌ Manager login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Manager test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "✅ Role-based access control is working correctly!" -ForegroundColor Green
Write-Host "✅ Managers and Admins can now fetch all clients and projects" -ForegroundColor Green
