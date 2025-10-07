// Role-Based Access Control Test Examples
// This file demonstrates how to test the RBAC system

import request from 'supertest'
import app from '../server.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

// Test data setup
const testUsers = {
  employee: {
    name: 'John Employee',
    email: 'john@company.com',
    password: 'password123',
    role: 'employee'
  },
  manager: {
    name: 'Jane Manager',
    email: 'jane@company.com',
    password: 'password123',
    role: 'manager'
  },
  admin: {
    name: 'Bob Admin',
    email: 'bob@company.com',
    password: 'password123',
    role: 'admin'
  }
}

// Helper function to create JWT token
const createToken = (user) => {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET || 'dev_secret')
}

// Helper function to create authenticated request
const authenticatedRequest = (user, method, endpoint) => {
  const token = createToken(user)
  return request(app)
    [method](endpoint)
    .set('Authorization', `Bearer ${token}`)
}

describe('Role-Based Access Control Tests', () => {
  
  describe('Employee Access Tests', () => {
    test('Employee can access own profile', async () => {
      const employee = await User.create(testUsers.employee)
      const response = await authenticatedRequest(employee, 'get', '/api/users/profile')
      expect(response.status).toBe(200)
    })

    test('Employee can check in', async () => {
      const employee = await User.create(testUsers.employee)
      const response = await authenticatedRequest(employee, 'post', '/api/attendance/checkin')
      expect(response.status).toBe(200)
    })

    test('Employee cannot access all users', async () => {
      const employee = await User.create(testUsers.employee)
      const response = await authenticatedRequest(employee, 'get', '/api/users/all')
      expect(response.status).toBe(403)
    })
  })

  describe('Manager Access Tests', () => {
    test('Manager can access team members', async () => {
      const manager = await User.create(testUsers.manager)
      const response = await authenticatedRequest(manager, 'get', '/api/users/')
      expect(response.status).toBe(200)
    })

    test('Manager can view all attendance', async () => {
      const manager = await User.create(testUsers.manager)
      const response = await authenticatedRequest(manager, 'get', '/api/attendance/all')
      expect(response.status).toBe(200)
    })

    test('Manager cannot delete users', async () => {
      const manager = await User.create(testUsers.manager)
      const response = await authenticatedRequest(manager, 'delete', '/api/users/123')
      expect(response.status).toBe(403)
    })
  })

  describe('Admin Access Tests', () => {
    test('Admin can access all users', async () => {
      const admin = await User.create(testUsers.admin)
      const response = await authenticatedRequest(admin, 'get', '/api/users/all')
      expect(response.status).toBe(200)
    })

    test('Admin can delete users', async () => {
      const admin = await User.create(testUsers.admin)
      const response = await authenticatedRequest(admin, 'delete', '/api/users/123')
      expect(response.status).toBe(404) // User not found, but access allowed
    })

    test('Admin can access all routes', async () => {
      const admin = await User.create(testUsers.admin)
      
      // Test various admin-only endpoints
      const endpoints = [
        { method: 'get', path: '/api/users/all' },
        { method: 'get', path: '/api/attendance/all' },
        { method: 'get', path: '/api/projects/' },
        { method: 'get', path: '/api/tasks/' }
      ]

      for (const endpoint of endpoints) {
        const response = await authenticatedRequest(admin, endpoint.method, endpoint.path)
        expect(response.status).not.toBe(403) // Should not be forbidden
      }
    })
  })

  describe('Unauthorized Access Tests', () => {
    test('Unauthenticated request should fail', async () => {
      const response = await request(app).get('/api/users/profile')
      expect(response.status).toBe(401)
    })

    test('Invalid token should fail', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
      expect(response.status).toBe(401)
    })
  })

  describe('Team Access Tests', () => {
    test('Manager can access team member data', async () => {
      const manager = await User.create(testUsers.manager)
      const employee = await User.create({
        ...testUsers.employee,
        manager: manager._id
      })
      
      // Add employee to manager's team
      manager.team.push(employee._id)
      await manager.save()

      const response = await authenticatedRequest(manager, 'get', `/api/users/${employee._id}`)
      expect(response.status).toBe(200)
    })

    test('Manager cannot access non-team member data', async () => {
      const manager = await User.create(testUsers.manager)
      const otherEmployee = await User.create(testUsers.employee)

      const response = await authenticatedRequest(manager, 'get', `/api/users/${otherEmployee._id}`)
      expect(response.status).toBe(403)
    })
  })
})

// Example of how to run these tests:
// npm test -- --grep "Role-Based Access Control"
