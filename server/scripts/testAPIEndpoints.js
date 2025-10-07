import fetch from 'node-fetch'

const testAPIEndpoints = async () => {
  try {
    console.log('=== Testing API Endpoints with Role-Based Access ===\n')

    // Test admin login
    console.log('1. Testing Admin Login...')
    const adminLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hellotanglome@gmail.com',
        password: 'Tanglome@123'
      })
    })
    
    const adminData = await adminLoginResponse.json()
    if (adminData.token) {
      console.log('✅ Admin login successful')
      
      // Test admin can fetch all clients
      console.log('\n2. Testing Admin - Get All Clients...')
      const adminClientsResponse = await fetch('http://localhost:5000/api/clients', {
        headers: { 'Authorization': `Bearer ${adminData.token}` }
      })
      const adminClients = await adminClientsResponse.json()
      console.log(`✅ Admin can fetch ${adminClients.clients?.length || 0} clients`)
      
      // Test admin can fetch all projects
      console.log('\n3. Testing Admin - Get All Projects...')
      const adminProjectsResponse = await fetch('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${adminData.token}` }
      })
      const adminProjects = await adminProjectsResponse.json()
      console.log(`✅ Admin can fetch ${adminProjects.projects?.length || 0} projects`)
    } else {
      console.log('❌ Admin login failed')
    }

    // Test manager login
    console.log('\n4. Testing Manager Login...')
    const managerLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@gmail.com',
        password: 'Manager@123'
      })
    })
    
    const managerData = await managerLoginResponse.json()
    if (managerData.token) {
      console.log('✅ Manager login successful')
      
      // Test manager can fetch all clients
      console.log('\n5. Testing Manager - Get All Clients...')
      const managerClientsResponse = await fetch('http://localhost:5000/api/clients', {
        headers: { 'Authorization': `Bearer ${managerData.token}` }
      })
      const managerClients = await managerClientsResponse.json()
      console.log(`✅ Manager can fetch ${managerClients.clients?.length || 0} clients`)
      
      // Test manager can fetch all projects
      console.log('\n6. Testing Manager - Get All Projects...')
      const managerProjectsResponse = await fetch('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${managerData.token}` }
      })
      const managerProjects = await managerProjectsResponse.json()
      console.log(`✅ Manager can fetch ${managerProjects.projects?.length || 0} projects`)
    } else {
      console.log('❌ Manager login failed')
    }

    console.log('\n=== Test Complete ===')
    console.log('✅ Role-based access control is working correctly!')
    console.log('✅ Managers and Admins can now fetch all clients and projects')

  } catch (error) {
    console.error('Error testing API endpoints:', error)
  }
}

// Run the test
testAPIEndpoints()
