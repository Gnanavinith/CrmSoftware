# User Credentials Reference

This document contains the login credentials for the CRM system users.

## Admin User
- **Email:** `hellotanglome@gmail.com`
- **Password:** `Tanglome@123`
- **Role:** `admin`
- **Position:** System Administrator
- **Access:** Full system access - can manage all users, clients, projects, tasks, and attendance records

## Manager User
- **Email:** `manager@gmail.com`
- **Password:** `Manager@123`
- **Role:** `manager`
- **Position:** Team Manager
- **Access:** Team management access - can manage team members and their work

## Additional Users
The system also contains other users that were created during development:
- **aravind** (vinithvini775@gmail.com) - employee role

## Usage Instructions

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```

2. **Login via API:**
   ```bash
   # Admin login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"hellotanglome@gmail.com","password":"Tanglome@123"}'

   # Manager login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"manager@gmail.com","password":"Manager@123"}'
   ```

3. **Use the JWT token** returned from login for authenticated requests:
   ```bash
   curl -X GET http://localhost:5000/api/users/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Security Notes

- These are development/testing credentials
- Change passwords in production environment
- Ensure proper environment variable configuration
- Use HTTPS in production

## Role-Based Access

- **Admin:** Can access all endpoints and manage all data
- **Manager:** Can manage team members and their work
- **Employee:** Can only access own data and assigned work

For detailed access control information, see `docs/ROLE_BASED_ACCESS_CONTROL.md`.
