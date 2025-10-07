# Role-Based Access Control (RBAC) System

This document outlines the comprehensive role-based access control system implemented in the CRM application.

## Role Hierarchy

The system implements three distinct roles with increasing levels of access:

1. **Employee** - Basic user access
2. **Manager** - Team management access  
3. **Admin** - Full system access

## Role Definitions

### Employee
- Basic user role with limited access
- Can manage own data and assigned work
- Cannot access other users' data unless specifically assigned
- Can view and update own profile, attendance, tasks, and projects

### Manager
- Team lead with management capabilities
- Can manage team members and their work
- Inherits all Employee permissions
- Can view and manage team members' data
- Can create and assign projects and tasks

### Admin
- Full system access
- Can manage all users and data
- Inherits all Manager and Employee permissions
- Can create, update, and delete any resource
- Has access to system-wide analytics and reports

## Access Control Implementation

### Middleware Functions

The system uses the following middleware functions in `server/middleware/roleAuth.js`:

- `requireEmployee` - Requires employee role or higher
- `requireManager` - Requires manager role or higher  
- `requireAdmin` - Requires admin role only
- `requireTeamAccess` - Requires manager or admin role for team data
- `requireUserAccess` - Allows access to own data, team member data (for managers), or any data (for admins)

### Route Protection

Each route is protected with appropriate middleware combinations:

```javascript
// Example: Employee access
router.get('/my-tasks', auth, requireEmployee, getMyTasks)

// Example: Manager access
router.get('/all', auth, requireManager, getAllAttendance)

// Example: Admin access
router.delete('/:id', auth, requireAdmin, deleteUser)
```

## Module-Specific Access Control

### Attendance Module (`/attendance`)

**Employee Access:**
- `POST /checkin` - Check in for the day
- `POST /checkout` - Check out for the day
- `GET /my-attendance` - View own attendance records

**Manager & Admin Access:**
- `GET /all` - View all employees' attendance
- `GET /user/:userId` - View specific user's attendance
- `PUT /:id` - Update attendance records

**Admin Only Access:**
- `DELETE /:id` - Delete attendance records

### Clients Module (`/clients`)

**Employee Access:**
- `GET /` - View clients list (filtered by assigned clients)
- `GET /:id` - View client details
- `POST /` - Create new clients (if allowed by company policy)

**Manager & Admin Access:**
- `GET /` - View all clients
- `PUT /:id` - Update any client
- `POST /:id/projects` - Add projects to clients

**Admin Only Access:**
- `DELETE /:id` - Delete clients

### Projects Module (`/projects`)

**Employee Access:**
- `GET /my-projects` - View own assigned projects
- `GET /:id` - View project details

**Team Member Access:**
- `POST /:id/tasks` - Create tasks in assigned projects
- `PUT /tasks/:taskId` - Update assigned tasks

**Manager & Admin Access:**
- `GET /` - View all projects
- `POST /` - Create new projects
- `PUT /:id` - Update any project
- `POST /:id/team` - Assign team members

**Admin Only Access:**
- `DELETE /:id` - Delete projects

### Tasks Module (`/tasks`)

**Employee Access:**
- `GET /my-tasks` - View assigned tasks
- `GET /:id` - View task details
- `PATCH /:id/status` - Update own task status
- `POST /:id/comments` - Add comments to assigned tasks
- `POST /:id/time` - Log time to assigned tasks

**Manager & Admin Access:**
- `GET /` - View all tasks
- `POST /` - Create tasks
- `PUT /:id` - Update any task
- `GET /project/:projectId` - View all tasks in a project

**Admin Only Access:**
- `DELETE /:id` - Delete tasks

### User Management Module (`/users`)

**Employee Access:**
- `GET /profile` - View own profile
- `PUT /profile` - Update own profile

**Manager Access:**
- `GET /` - View team members
- `GET /:id` - View team member details

**Admin Only Access:**
- `POST /` - Create new users
- `PUT /:id` - Update any user
- `DELETE /:id` - Delete users
- `GET /all` - View all users

## Database Schema Updates

The User model has been updated to support the role-based system:

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  position: String,
  manager: { type: ObjectId, ref: 'User' }, // Reference to manager
  team: [{ type: ObjectId, ref: 'User' }]   // Array of team members (for managers)
}
```

## Security Considerations

1. **Authentication Required**: All routes require valid JWT authentication
2. **Role Validation**: Each route validates the user's role before allowing access
3. **Data Isolation**: Users can only access data they're authorized to see
4. **Team Access**: Managers can only access their team members' data
5. **Admin Override**: Admins have access to all data and operations

## Error Handling

The system returns appropriate HTTP status codes:

- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions for the requested operation
- `404 Not Found` - Resource not found or not accessible to the user

## Usage Examples

### Checking User Role in Controllers

```javascript
// In a controller function
if (req.user.role === 'admin') {
  // Admin-specific logic
} else if (req.user.role === 'manager') {
  // Manager-specific logic
} else {
  // Employee-specific logic
}
```

### Filtering Data Based on Role

```javascript
// Example: Get clients based on user role
if (req.user.role === 'admin') {
  clients = await Client.find()
} else if (req.user.role === 'manager') {
  clients = await Client.find({ assignedTo: { $in: req.user.team } })
} else {
  clients = await Client.find({ assignedTo: req.user._id })
}
```

This role-based access control system ensures that users can only access and modify data appropriate to their role, maintaining security and data integrity throughout the application.
