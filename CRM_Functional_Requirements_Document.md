# Functional Requirements Document (FRD)
## CRM Application - Final Project

---

## 1. Executive Summary

### 1.1 Project Overview
This document outlines the functional requirements for a comprehensive Customer Relationship Management (CRM) application designed for software development companies. The system provides project management, client management, task tracking, attendance monitoring, and team collaboration features.

### 1.2 Technology Stack
- **Frontend**: React 19.1.1 with Vite, TailwindCSS 4.1.14
- **Backend**: Node.js with Express 5.1.0
- **Database**: MongoDB with Mongoose 8.19.0
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary integration
- **UI Framework**: TailwindCSS with custom components

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express API    │◄──►│   MongoDB       │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Key Components
- **Client Application**: React-based SPA with responsive design
- **API Server**: RESTful API with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **File Management**: Cloudinary integration for file uploads

---

## 3. User Roles and Permissions

### 3.1 User Roles
1. **Employee** (Default Role)
   - Can manage own tasks, projects, and clients
   - Can check in/out for attendance
   - Can view own data only

2. **Manager**
   - All Employee permissions
   - Can view and manage team members
   - Can assign tasks to team members
   - Can view team attendance and statistics
   - Can manage all projects and clients

3. **Admin**
   - All Manager permissions
   - Can manage user accounts
   - Can view system-wide statistics
   - Can access all data across the organization

### 3.2 Role-Based Access Control (RBAC)
- **Authentication Middleware**: JWT token validation
- **Authorization Middleware**: Role-based access control
- **Data Filtering**: Role-based data visibility
- **API Protection**: Endpoint-level permission checks

---

## 4. Core Functional Requirements

### 4.1 Authentication & User Management

#### 4.1.1 User Registration
- **FR-001**: Users can register with name, email, and password
- **FR-002**: Email must be unique across the system
- **FR-003**: Password is automatically hashed using bcrypt
- **FR-004**: Default role is assigned as 'employee'
- **FR-005**: JWT token is generated upon successful registration

#### 4.1.2 User Login
- **FR-006**: Users can login with email and password
- **FR-007**: System validates credentials against database
- **FR-008**: JWT token is generated with 7-day expiration
- **FR-009**: User session is maintained in localStorage
- **FR-010**: Automatic token refresh mechanism

#### 4.1.3 User Profile Management
- **FR-011**: Users can view their profile information
- **FR-012**: Users can update their profile details
- **FR-013**: Password change functionality
- **FR-014**: Profile picture upload capability

### 4.2 Dashboard & Analytics

#### 4.2.1 Main Dashboard
- **FR-015**: Role-based dashboard content display
- **FR-016**: Real-time statistics and metrics
- **FR-017**: Quick action buttons for common tasks
- **FR-018**: Recent activity feed
- **FR-019**: Overdue task alerts and notifications

#### 4.2.2 Statistics Display
- **FR-020**: Task statistics (total, completed, pending, overdue)
- **FR-021**: Project statistics (active, completed, on-hold)
- **FR-022**: Client statistics (total, active, prospects)
- **FR-023**: Attendance statistics (today's hours, weekly summary)
- **FR-024**: Team overview (for managers and admins)

### 4.3 Task Management

#### 4.3.1 Task Creation
- **FR-025**: Users can create new tasks with title and description
- **FR-026**: Task assignment to specific users
- **FR-027**: Priority levels (low, medium, high)
- **FR-028**: Due date setting
- **FR-029**: Project association
- **FR-030**: Label and tag system
- **FR-031**: Estimated hours tracking

#### 4.3.2 Task Management
- **FR-032**: Task status updates (pending, in-progress, completed, blocked)
- **FR-033**: Task editing and deletion
- **FR-034**: Task search and filtering
- **FR-035**: Task grouping by status, priority, or project
- **FR-036**: Task comments and collaboration
- **FR-037**: Task dependencies management
- **FR-038**: Time logging for tasks

#### 4.3.3 Task Views
- **FR-039**: Grid and list view options
- **FR-040**: Task card display with key information
- **FR-041**: Task detail modal with full information
- **FR-042**: Bulk task operations

### 4.4 Project Management

#### 4.4.1 Project Creation
- **FR-043**: Project creation with name and description
- **FR-044**: Client association
- **FR-045**: Project status management (active, on-hold, completed, cancelled)
- **FR-046**: Priority levels (low, medium, high)
- **FR-047**: Budget tracking
- **FR-048**: Technology stack specification
- **FR-049**: Start and end date setting

#### 4.4.2 Project Management
- **FR-050**: Project editing and updates
- **FR-051**: Team member assignment
- **FR-052**: Project progress tracking
- **FR-053**: Task integration within projects
- **FR-054**: Project search and filtering
- **FR-055**: Project notes and documentation

#### 4.4.3 Project Analytics
- **FR-056**: Progress calculation based on completed tasks
- **FR-057**: Budget vs actual cost tracking
- **FR-058**: Timeline visualization
- **FR-059**: Team performance metrics

### 4.5 Client Management

#### 4.5.1 Client Creation
- **FR-060**: Client registration with company information
- **FR-061**: Contact person details
- **FR-062**: Address information
- **FR-063**: Industry classification
- **FR-064**: Service requirements specification
- **FR-065**: Client status (active, inactive, prospect)

#### 4.5.2 Client Management
- **FR-066**: Client information editing
- **FR-067**: Client search and filtering
- **FR-068**: Client status updates
- **FR-069**: Project association
- **FR-070**: Communication history tracking

#### 4.5.3 Client Analytics
- **FR-071**: Client status distribution
- **FR-072**: Industry analysis
- **FR-073**: Client value tracking
- **FR-074**: Project history per client

### 4.6 Attendance Management

#### 4.6.1 Check-in/Check-out
- **FR-075**: Daily check-in functionality
- **FR-076**: Daily check-out functionality
- **FR-077**: Location tracking (office, remote)
- **FR-078**: Check-in notes and comments
- **FR-079**: Automatic duration calculation
- **FR-080**: Duplicate check-in prevention

#### 4.6.2 Attendance Tracking
- **FR-081**: Daily attendance records
- **FR-082**: Monthly attendance statistics
- **FR-083**: Attendance rate calculation
- **FR-084**: Working hours tracking
- **FR-085**: Attendance history viewing

#### 4.6.3 Team Attendance (Manager/Admin)
- **FR-086**: Team attendance overview
- **FR-087**: Individual employee attendance
- **FR-088**: Attendance reports generation
- **FR-089**: Attendance modification (admin only)

### 4.7 Notification System

#### 4.7.1 Notification Types
- **FR-090**: Task assignment notifications
- **FR-091**: Project deadline alerts
- **FR-092**: Attendance reminders
- **FR-093**: System announcements
- **FR-094**: Task completion notifications

#### 4.7.2 Notification Management
- **FR-095**: Real-time notification display
- **FR-096**: Notification read/unread status
- **FR-097**: Notification history
- **FR-098**: Notification preferences
- **FR-099**: Bulk notification operations

### 4.8 User Interface Requirements

#### 4.8.1 Responsive Design
- **FR-100**: Mobile-responsive layout
- **FR-101**: Tablet-optimized interface
- **FR-102**: Desktop-optimized experience
- **FR-103**: Cross-browser compatibility

#### 4.8.2 Navigation
- **FR-104**: Sidebar navigation menu
- **FR-105**: Header with user information
- **FR-106**: Breadcrumb navigation
- **FR-107**: Quick action buttons

#### 4.8.3 User Experience
- **FR-108**: Loading states and spinners
- **FR-109**: Error handling and messages
- **FR-110**: Success confirmations
- **FR-111**: Form validation
- **FR-112**: Search functionality across modules

---

## 5. Data Models

### 5.1 User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['employee', 'manager', 'admin']),
  position: String,
  manager: ObjectId (ref: 'User'),
  team: [ObjectId] (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.2 Client Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  name: String (required),
  email: String (required),
  phone: String,
  company: String (required),
  industry: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactPerson: {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  services: [String] (enum: predefined services),
  status: String (enum: ['active', 'inactive', 'prospect']),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.3 Project Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  name: String (required),
  description: String,
  client: ObjectId (ref: 'Client'),
  status: String (enum: ['active', 'on-hold', 'completed', 'cancelled']),
  priority: String (enum: ['low', 'medium', 'high']),
  startDate: Date,
  endDate: Date,
  budget: Number,
  technologies: [String],
  tasks: [TaskSchema],
  teamMembers: [{
    user: ObjectId (ref: 'User'),
    role: String,
    permissions: [String]
  }],
  notes: String,
  progress: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.4 Task Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  title: String (required),
  description: String,
  status: String (enum: ['pending', 'in-progress', 'completed', 'blocked']),
  priority: String (enum: ['low', 'medium', 'high']),
  project: ObjectId (ref: 'Project'),
  assignee: ObjectId (ref: 'User'),
  dueDate: Date,
  completedAt: Date,
  labels: [String],
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  comments: [{
    user: ObjectId (ref: 'User'),
    text: String,
    createdAt: Date
  }],
  dependencies: [ObjectId] (ref: 'Task'),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.5 Attendance Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  name: String (required),
  email: String (required),
  date: Date (required),
  checkIn: Date,
  checkOut: Date,
  durationMinutes: Number,
  note: String,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.6 Notification Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  title: String (required),
  message: String (required),
  type: String (enum: ['task', 'project', 'client', 'attendance', 'system', 'reminder', 'deadline']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  read: Boolean (default: false),
  readAt: Date,
  data: Object,
  actionUrl: String,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6. API Endpoints

### 6.1 Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### 6.2 Task Endpoints
- `GET /api/tasks` - Get all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/my` - Get user's assigned tasks
- `POST /api/tasks/:id/comment` - Add task comment
- `PUT /api/tasks/:id/status` - Update task status

### 6.3 Project Endpoints
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/my` - Get user's projects
- `POST /api/projects/:id/assign` - Assign team member
- `GET /api/projects/list` - Get projects for dropdowns

### 6.4 Client Endpoints
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get specific client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### 6.5 Attendance Endpoints
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my` - Get user's attendance
- `GET /api/attendance/all` - Get all attendance (manager/admin)
- `GET /api/attendance/user/:id` - Get specific user's attendance
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record

### 6.6 Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/count` - Get notification count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

---

## 7. Security Requirements

### 7.1 Authentication Security
- **SR-001**: Password hashing using bcrypt with salt rounds
- **SR-002**: JWT token expiration and refresh mechanism
- **SR-003**: Secure token storage in localStorage
- **SR-004**: Session timeout handling

### 7.2 Authorization Security
- **SR-005**: Role-based access control implementation
- **SR-006**: API endpoint protection with middleware
- **SR-007**: Data filtering based on user roles
- **SR-008**: Input validation and sanitization

### 7.3 Data Security
- **SR-009**: MongoDB injection prevention
- **SR-010**: CORS configuration
- **SR-011**: Environment variable protection
- **SR-012**: File upload security

---

## 8. Performance Requirements

### 8.1 Response Time
- **PR-001**: API response time < 500ms for standard operations
- **PR-002**: Page load time < 3 seconds
- **PR-003**: Search results < 1 second
- **PR-004**: Real-time updates < 2 seconds

### 8.2 Scalability
- **PR-005**: Support for 100+ concurrent users
- **PR-006**: Database indexing for optimal queries
- **PR-007**: Pagination for large datasets
- **PR-008**: Caching for frequently accessed data

---

## 9. Integration Requirements

### 9.1 External Services
- **IR-001**: Cloudinary integration for file uploads
- **IR-002**: Email service integration (future)
- **IR-003**: Calendar integration (future)
- **IR-004**: Third-party authentication (future)

### 9.2 Data Export/Import
- **IR-005**: CSV export functionality
- **IR-006**: PDF report generation
- **IR-007**: Data backup and restore
- **IR-008**: API for third-party integrations

---

## 10. Future Enhancements

### 10.1 Planned Features
- **FE-001**: Advanced reporting and analytics
- **FE-002**: Mobile application
- **FE-003**: Real-time chat system
- **FE-004**: Advanced project templates
- **FE-005**: Integration with external tools (Slack, GitHub, etc.)
- **FE-006**: Advanced notification system with email/SMS
- **FE-007**: Time tracking and billing integration
- **FE-008**: Advanced user management and permissions

### 10.2 Scalability Improvements
- **FE-009**: Microservices architecture
- **FE-010**: Redis caching layer
- **FE-011**: CDN integration
- **FE-012**: Database sharding
- **FE-013**: Load balancing
- **FE-014**: Container orchestration

---

## 11. Testing Requirements

### 11.1 Unit Testing
- **TR-001**: API endpoint testing
- **TR-002**: Database model testing
- **TR-003**: Authentication flow testing
- **TR-004**: Business logic testing

### 11.2 Integration Testing
- **TR-005**: End-to-end user flow testing
- **TR-006**: API integration testing
- **TR-007**: Database integration testing
- **TR-008**: Third-party service testing

### 11.3 User Acceptance Testing
- **TR-009**: Role-based functionality testing
- **TR-010**: UI/UX testing
- **TR-011**: Performance testing
- **TR-012**: Security testing

---

## 12. Deployment Requirements

### 12.1 Environment Setup
- **DR-001**: Development environment configuration
- **DR-002**: Staging environment setup
- **DR-003**: Production environment configuration
- **DR-004**: Database migration scripts

### 12.2 Monitoring and Logging
- **DR-005**: Application logging
- **DR-006**: Error tracking and monitoring
- **DR-007**: Performance monitoring
- **DR-008**: Security monitoring

---

## 13. Conclusion

This Functional Requirements Document provides a comprehensive overview of the CRM application's capabilities, features, and technical specifications. The system is designed to be scalable, secure, and user-friendly, providing a complete solution for project management, client relationship management, and team collaboration.

The modular architecture allows for future enhancements and integrations, while the role-based access control ensures data security and appropriate user permissions. The responsive design ensures accessibility across different devices and platforms.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Prepared By**: AI Assistant  
**Status**: Final

