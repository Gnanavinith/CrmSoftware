# CRM API Specifications
## Detailed Request/Response Schemas and Error Handling

---

## 1. API Overview

### 1.1 Base URL Structure
```
Production: https://api.crm-app.com/v1
Development: http://localhost:5000/api/v1
Staging: https://staging-api.crm-app.com/v1
```

### 1.2 Authentication
All API endpoints require JWT authentication except:
- `POST /auth/register`
- `POST /auth/login`
- `GET /health`

### 1.3 Common Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Request-ID: <unique_request_id>
```

---

## 2. Authentication Endpoints

### 2.1 User Registration
```http
POST /api/auth/register
```

**Request Schema:**
```json
{
  "name": {
    "type": "string",
    "required": true,
    "minLength": 2,
    "maxLength": 50,
    "pattern": "^[a-zA-Z\\s]+$"
  },
  "email": {
    "type": "string",
    "required": true,
    "format": "email",
    "maxLength": 100
  },
  "password": {
    "type": "string",
    "required": true,
    "minLength": 8,
    "maxLength": 128,
    "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
  },
  "position": {
    "type": "string",
    "required": false,
    "maxLength": 100
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "employee",
      "position": "Developer",
      "createdAt": "2024-12-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email already exists"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}

// 500 - Server Error
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Failed to create user account",
  "requestId": "req_123456789"
}
```

### 2.2 User Login
```http
POST /api/auth/login
```

**Request Schema:**
```json
{
  "email": {
    "type": "string",
    "required": true,
    "format": "email"
  },
  "password": {
    "type": "string",
    "required": true
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "employee",
      "position": "Developer",
      "team": [],
      "manager": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

---

## 3. Task Management Endpoints

### 3.1 Get All Tasks
```http
GET /api/tasks
```

**Query Parameters:**
```json
{
  "page": {
    "type": "integer",
    "default": 1,
    "minimum": 1,
    "maximum": 1000
  },
  "limit": {
    "type": "integer",
    "default": 20,
    "minimum": 1,
    "maximum": 100
  },
  "search": {
    "type": "string",
    "maxLength": 100
  },
  "status": {
    "type": "string",
    "enum": ["pending", "in-progress", "completed", "blocked", "all"]
  },
  "priority": {
    "type": "string",
    "enum": ["low", "medium", "high", "all"]
  },
  "project": {
    "type": "string",
    "pattern": "^[0-9a-fA-F]{24}$"
  },
  "assignee": {
    "type": "string",
    "pattern": "^[0-9a-fA-F]{24}$"
  },
  "dueDateFrom": {
    "type": "string",
    "format": "date"
  },
  "dueDateTo": {
    "type": "string",
    "format": "date"
  },
  "sortBy": {
    "type": "string",
    "enum": ["createdAt", "dueDate", "priority", "status", "title"],
    "default": "createdAt"
  },
  "sortOrder": {
    "type": "string",
    "enum": ["asc", "desc"],
    "default": "desc"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Implement user authentication",
        "description": "Create login and registration system",
        "status": "in-progress",
        "priority": "high",
        "project": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "CRM System"
        },
        "assignee": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "dueDate": "2024-12-15T23:59:59.000Z",
        "labels": ["frontend", "authentication"],
        "estimatedHours": 8,
        "actualHours": 4,
        "createdAt": "2024-12-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T15:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "applied": {
        "status": "in-progress",
        "priority": "high"
      },
      "available": {
        "statuses": ["pending", "in-progress", "completed", "blocked"],
        "priorities": ["low", "medium", "high"],
        "projects": [
          {
            "_id": "507f1f77bcf86cd799439012",
            "name": "CRM System"
          }
        ]
      }
    }
  }
}
```

### 3.2 Create Task
```http
POST /api/tasks
```

**Request Schema:**
```json
{
  "title": {
    "type": "string",
    "required": true,
    "minLength": 3,
    "maxLength": 200
  },
  "description": {
    "type": "string",
    "required": false,
    "maxLength": 2000
  },
  "status": {
    "type": "string",
    "enum": ["pending", "in-progress", "completed", "blocked"],
    "default": "pending"
  },
  "priority": {
    "type": "string",
    "enum": ["low", "medium", "high"],
    "default": "medium"
  },
  "project": {
    "type": "string",
    "pattern": "^[0-9a-fA-F]{24}$",
    "required": false
  },
  "assignee": {
    "type": "string",
    "pattern": "^[0-9a-fA-F]{24}$",
    "required": false
  },
  "dueDate": {
    "type": "string",
    "format": "date-time",
    "required": false
  },
  "labels": {
    "type": "array",
    "items": {
      "type": "string",
      "maxLength": 50
    },
    "maxItems": 10
  },
  "estimatedHours": {
    "type": "number",
    "minimum": 0,
    "maximum": 1000
  },
  "tags": {
    "type": "array",
    "items": {
      "type": "string",
      "maxLength": 30
    },
    "maxItems": 5
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Implement user authentication",
    "description": "Create login and registration system",
    "status": "pending",
    "priority": "high",
    "project": "507f1f77bcf86cd799439012",
    "assignee": "507f1f77bcf86cd799439013",
    "dueDate": "2024-12-15T23:59:59.000Z",
    "labels": ["frontend", "authentication"],
    "estimatedHours": 8,
    "actualHours": 0,
    "tags": ["urgent"],
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

### 3.3 Update Task Status
```http
PUT /api/tasks/:id/status
```

**Request Schema:**
```json
{
  "status": {
    "type": "string",
    "required": true,
    "enum": ["pending", "in-progress", "completed", "blocked"]
  },
  "comment": {
    "type": "string",
    "maxLength": 500
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "completed",
    "completedAt": "2024-12-01T16:00:00.000Z",
    "updatedAt": "2024-12-01T16:00:00.000Z"
  }
}
```

---

## 4. Project Management Endpoints

### 4.1 Get All Projects
```http
GET /api/projects
```

**Query Parameters:**
```json
{
  "page": {
    "type": "integer",
    "default": 1,
    "minimum": 1
  },
  "limit": {
    "type": "integer",
    "default": 20,
    "minimum": 1,
    "maximum": 100
  },
  "search": {
    "type": "string",
    "maxLength": 100
  },
  "status": {
    "type": "string",
    "enum": ["active", "on-hold", "completed", "cancelled", "all"]
  },
  "priority": {
    "type": "string",
    "enum": ["low", "medium", "high", "all"]
  },
  "client": {
    "type": "string",
    "pattern": "^[0-9a-fA-F]{24}$"
  },
  "sortBy": {
    "type": "string",
    "enum": ["createdAt", "startDate", "endDate", "name", "priority"],
    "default": "createdAt"
  },
  "sortOrder": {
    "type": "string",
    "enum": ["asc", "desc"],
    "default": "desc"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "CRM System Development",
        "description": "Complete CRM system for client",
        "status": "active",
        "priority": "high",
        "client": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "TechCorp Inc.",
          "company": "TechCorp Inc."
        },
        "startDate": "2024-11-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.000Z",
        "budget": 50000,
        "technologies": ["React", "Node.js", "MongoDB"],
        "progress": 65,
        "teamMembers": [
          {
            "user": {
              "_id": "507f1f77bcf86cd799439013",
              "name": "John Doe",
              "email": "john.doe@example.com"
            },
            "role": "Lead Developer",
            "permissions": ["read", "write", "assign"]
          }
        ],
        "taskCount": {
          "total": 25,
          "completed": 16,
          "pending": 7,
          "inProgress": 2
        },
        "createdAt": "2024-11-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T15:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 5. Client Management Endpoints

### 5.1 Get All Clients
```http
GET /api/clients
```

**Query Parameters:**
```json
{
  "page": {
    "type": "integer",
    "default": 1,
    "minimum": 1
  },
  "limit": {
    "type": "integer",
    "default": 20,
    "minimum": 1,
    "maximum": 100
  },
  "search": {
    "type": "string",
    "maxLength": 100
  },
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "prospect", "all"]
  },
  "industry": {
    "type": "string",
    "maxLength": 100
  },
  "sortBy": {
    "type": "string",
    "enum": ["createdAt", "name", "company", "status"],
    "default": "createdAt"
  },
  "sortOrder": {
    "type": "string",
    "enum": ["asc", "desc"],
    "default": "desc"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "name": "TechCorp Inc.",
        "email": "contact@techcorp.com",
        "phone": "+1-555-0123",
        "company": "TechCorp Inc.",
        "industry": "Technology",
        "status": "active",
        "address": {
          "street": "123 Tech Street",
          "city": "San Francisco",
          "state": "CA",
          "zipCode": "94105",
          "country": "USA"
        },
        "contactPerson": {
          "name": "Jane Smith",
          "position": "CTO",
          "email": "jane.smith@techcorp.com",
          "phone": "+1-555-0124"
        },
        "services": ["Web Development", "Mobile App", "Consulting"],
        "projectCount": 3,
        "totalValue": 150000,
        "createdAt": "2024-10-15T10:00:00.000Z",
        "updatedAt": "2024-12-01T15:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 25,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 6. Attendance Management Endpoints

### 6.1 Check In
```http
POST /api/attendance/checkin
```

**Request Schema:**
```json
{
  "note": {
    "type": "string",
    "maxLength": 500
  },
  "location": {
    "type": "string",
    "enum": ["office", "remote", "client-site", "other"],
    "default": "office"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "user": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "date": "2024-12-01T00:00:00.000Z",
    "checkIn": "2024-12-01T09:00:00.000Z",
    "checkOut": null,
    "durationMinutes": null,
    "note": "Starting work on CRM project",
    "location": "office",
    "createdAt": "2024-12-01T09:00:00.000Z",
    "updatedAt": "2024-12-01T09:00:00.000Z"
  }
}
```

### 6.2 Get My Attendance
```http
GET /api/attendance/my
```

**Query Parameters:**
```json
{
  "startDate": {
    "type": "string",
    "format": "date"
  },
  "endDate": {
    "type": "string",
    "format": "date"
  },
  "page": {
    "type": "integer",
    "default": 1,
    "minimum": 1
  },
  "limit": {
    "type": "integer",
    "default": 30,
    "minimum": 1,
    "maximum": 100
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "date": "2024-12-01T00:00:00.000Z",
        "checkIn": "2024-12-01T09:00:00.000Z",
        "checkOut": "2024-12-01T17:30:00.000Z",
        "durationMinutes": 510,
        "note": "Working on CRM project",
        "location": "office"
      }
    ],
    "stats": {
      "todayStatus": "Working",
      "presentThisMonth": 22,
      "attendanceRate": 95.7,
      "totalRecords": 22,
      "totalHoursThisMonth": 176,
      "averageHoursPerDay": 8.0
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 22,
      "itemsPerPage": 30
    }
  }
}
```

---

## 7. Notification Endpoints

### 7.1 Get Notifications
```http
GET /api/notifications
```

**Query Parameters:**
```json
{
  "page": {
    "type": "integer",
    "default": 1,
    "minimum": 1
  },
  "limit": {
    "type": "integer",
    "default": 20,
    "minimum": 1,
    "maximum": 100
  },
  "type": {
    "type": "string",
    "enum": ["task", "project", "client", "attendance", "system", "reminder", "deadline", "all"]
  },
  "priority": {
    "type": "string",
    "enum": ["low", "medium", "high", "urgent", "all"]
  },
  "read": {
    "type": "boolean"
  },
  "sortBy": {
    "type": "string",
    "enum": ["createdAt", "priority", "type"],
    "default": "createdAt"
  },
  "sortOrder": {
    "type": "string",
    "enum": ["asc", "desc"],
    "default": "desc"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "title": "Task Assigned",
        "message": "You have been assigned to 'Implement user authentication'",
        "type": "task",
        "priority": "medium",
        "read": false,
        "data": {
          "taskId": "507f1f77bcf86cd799439011",
          "taskTitle": "Implement user authentication",
          "assignerName": "Jane Manager"
        },
        "actionUrl": "/tasks/507f1f77bcf86cd799439011",
        "createdAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 25,
      "itemsPerPage": 20
    }
  }
}
```

---

## 8. Error Response Standards

### 8.1 Standard Error Format
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific field error message",
      "code": "FIELD_ERROR_CODE"
    }
  ],
  "requestId": "req_123456789",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "path": "/api/tasks",
  "method": "POST"
}
```

### 8.2 Error Codes
```json
{
  "VALIDATION_ERROR": "Request validation failed",
  "AUTHENTICATION_ERROR": "Authentication required",
  "AUTHORIZATION_ERROR": "Insufficient permissions",
  "NOT_FOUND": "Resource not found",
  "DUPLICATE_ERROR": "Resource already exists",
  "RATE_LIMIT_ERROR": "Too many requests",
  "INTERNAL_SERVER_ERROR": "Internal server error",
  "DATABASE_ERROR": "Database operation failed",
  "FILE_UPLOAD_ERROR": "File upload failed",
  "NETWORK_ERROR": "Network connection failed"
}
```

### 8.3 HTTP Status Codes
```json
{
  "200": "OK - Request successful",
  "201": "Created - Resource created successfully",
  "400": "Bad Request - Invalid request data",
  "401": "Unauthorized - Authentication required",
  "403": "Forbidden - Insufficient permissions",
  "404": "Not Found - Resource not found",
  "409": "Conflict - Resource already exists",
  "422": "Unprocessable Entity - Validation failed",
  "429": "Too Many Requests - Rate limit exceeded",
  "500": "Internal Server Error - Server error",
  "503": "Service Unavailable - Service temporarily unavailable"
}
```

---

## 9. Rate Limiting

### 9.1 Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### 9.2 Rate Limit Rules
```json
{
  "authentication": {
    "login": "5 requests per minute",
    "register": "3 requests per minute"
  },
  "general": {
    "default": "1000 requests per hour",
    "file_upload": "10 requests per minute"
  },
  "admin": {
    "user_management": "100 requests per hour",
    "system_settings": "50 requests per hour"
  }
}
```

---

## 10. API Versioning

### 10.1 Version Strategy
- **URL Versioning**: `/api/v1/`, `/api/v2/`
- **Header Versioning**: `API-Version: 1.0`
- **Backward Compatibility**: Maintained for 12 months
- **Deprecation Notice**: 6 months advance notice

### 10.2 Version Lifecycle
```json
{
  "v1": {
    "status": "current",
    "release_date": "2024-01-01",
    "deprecation_date": null,
    "end_of_life": null
  },
  "v2": {
    "status": "development",
    "release_date": "2025-06-01",
    "deprecation_date": null,
    "end_of_life": null
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**API Version**: v1  
**Status**: Active
