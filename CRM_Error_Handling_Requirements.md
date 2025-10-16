# CRM Error Handling & Validation Requirements
## Comprehensive Error Scenarios and Data Validation

---

## 1. Error Handling Strategy

### 1.1 Error Classification
```javascript
// Error Categories
const ERROR_CATEGORIES = {
  VALIDATION: 'validation',      // Input validation errors
  AUTHENTICATION: 'auth',        // Authentication failures
  AUTHORIZATION: 'authorization', // Permission errors
  BUSINESS_LOGIC: 'business',    // Business rule violations
  SYSTEM: 'system',             // System/infrastructure errors
  NETWORK: 'network',           // Network connectivity issues
  DATABASE: 'database',         // Database operation failures
  FILE_UPLOAD: 'file_upload',   // File handling errors
  RATE_LIMIT: 'rate_limit',     // Rate limiting violations
  CONCURRENT: 'concurrent'      // Concurrent modification errors
};
```

### 1.2 Error Severity Levels
```javascript
const ERROR_SEVERITY = {
  LOW: 'low',           // Minor issues, user can continue
  MEDIUM: 'medium',     // Issues requiring user attention
  HIGH: 'high',         // Critical issues, operation failed
  CRITICAL: 'critical'  // System-wide issues, immediate attention required
};
```

---

## 2. Validation Requirements

### 2.1 Input Validation Rules

#### 2.1.1 User Registration Validation
```javascript
const USER_REGISTRATION_RULES = {
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    trim: true,
    customValidation: (value) => {
      // Check for profanity
      if (containsProfanity(value)) {
        return { valid: false, message: 'Name contains inappropriate content' };
      }
      return { valid: true };
    }
  },
  email: {
    required: true,
    type: 'string',
    format: 'email',
    maxLength: 100,
    lowercase: true,
    trim: true,
    customValidation: async (value) => {
      // Check if email already exists
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        return { valid: false, message: 'Email already registered' };
      }
      return { valid: true };
    }
  },
  password: {
    required: true,
    type: 'string',
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    customValidation: (value) => {
      // Check against common passwords
      if (isCommonPassword(value)) {
        return { valid: false, message: 'Password is too common, please choose a stronger password' };
      }
      return { valid: true };
    }
  },
  position: {
    required: false,
    type: 'string',
    maxLength: 100,
    trim: true,
    allowedValues: ['Developer', 'Designer', 'Manager', 'Analyst', 'Other']
  }
};
```

#### 2.1.2 Task Creation Validation
```javascript
const TASK_CREATION_RULES = {
  title: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 200,
    trim: true,
    customValidation: (value) => {
      // Check for duplicate titles in same project
      if (isDuplicateTaskTitle(value, projectId)) {
        return { valid: false, message: 'Task title already exists in this project' };
      }
      return { valid: true };
    }
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 2000,
    trim: true,
    sanitize: true // Remove HTML tags
  },
  status: {
    required: false,
    type: 'string',
    enum: ['pending', 'in-progress', 'completed', 'blocked'],
    default: 'pending'
  },
  priority: {
    required: false,
    type: 'string',
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    required: false,
    type: 'date',
    minDate: 'today',
    maxDate: '+1 year',
    customValidation: (value) => {
      if (value && new Date(value) < new Date()) {
        return { valid: false, message: 'Due date cannot be in the past' };
      }
      return { valid: true };
    }
  },
  estimatedHours: {
    required: false,
    type: 'number',
    min: 0,
    max: 1000,
    precision: 2
  },
  labels: {
    required: false,
    type: 'array',
    maxItems: 10,
    itemValidation: {
      type: 'string',
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-_]+$/
    }
  }
};
```

#### 2.1.3 Project Validation
```javascript
const PROJECT_VALIDATION_RULES = {
  name: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 200,
    trim: true,
    customValidation: async (value, userId) => {
      // Check for duplicate project names for same user
      const existingProject = await Project.findOne({ 
        name: value, 
        user: userId 
      });
      if (existingProject) {
        return { valid: false, message: 'Project name already exists' };
      }
      return { valid: true };
    }
  },
  budget: {
    required: false,
    type: 'number',
    min: 0,
    max: 10000000,
    precision: 2
  },
  startDate: {
    required: false,
    type: 'date',
    customValidation: (value, endDate) => {
      if (value && endDate && new Date(value) > new Date(endDate)) {
        return { valid: false, message: 'Start date cannot be after end date' };
      }
      return { valid: true };
    }
  },
  endDate: {
    required: false,
    type: 'date',
    minDate: 'today',
    customValidation: (value, startDate) => {
      if (value && startDate && new Date(value) < new Date(startDate)) {
        return { valid: false, message: 'End date cannot be before start date' };
      }
      return { valid: true };
    }
  }
};
```

### 2.2 Business Logic Validation

#### 2.2.1 Task Assignment Rules
```javascript
const TASK_ASSIGNMENT_RULES = {
  validateAssignment: async (taskId, assigneeId, assignerId) => {
    const errors = [];
    
    // Check if assignee exists and is active
    const assignee = await User.findById(assigneeId);
    if (!assignee || assignee.status !== 'active') {
      errors.push('Assignee not found or inactive');
    }
    
    // Check if assigner has permission to assign tasks
    const assigner = await User.findById(assignerId);
    if (!['manager', 'admin'].includes(assigner.role)) {
      errors.push('Insufficient permissions to assign tasks');
    }
    
    // Check if assignee is in same team (for employees)
    if (assigner.role === 'employee') {
      const isInSameTeam = await checkTeamMembership(assignerId, assigneeId);
      if (!isInSameTeam) {
        errors.push('Cannot assign tasks to users outside your team');
      }
    }
    
    // Check task capacity
    const currentTasks = await Task.countDocuments({ 
      assignee: assigneeId, 
      status: { $in: ['pending', 'in-progress'] } 
    });
    if (currentTasks >= 10) {
      errors.push('Assignee has reached maximum task capacity');
    }
    
    return errors;
  }
};
```

#### 2.2.2 Project Access Rules
```javascript
const PROJECT_ACCESS_RULES = {
  validateAccess: async (projectId, userId, action) => {
    const project = await Project.findById(projectId);
    if (!project) {
      return { allowed: false, reason: 'Project not found' };
    }
    
    const user = await User.findById(userId);
    const permissions = {
      'read': ['employee', 'manager', 'admin'],
      'write': ['manager', 'admin'],
      'delete': ['admin'],
      'assign': ['manager', 'admin']
    };
    
    if (!permissions[action].includes(user.role)) {
      return { allowed: false, reason: 'Insufficient role permissions' };
    }
    
    // Check if user is project owner or team member
    const isOwner = project.user.toString() === userId;
    const isTeamMember = project.teamMembers.some(member => 
      member.user.toString() === userId
    );
    
    if (!isOwner && !isTeamMember && user.role !== 'admin') {
      return { allowed: false, reason: 'Not authorized for this project' };
    }
    
    return { allowed: true };
  }
};
```

---

## 3. Error Scenarios and Handling

### 3.1 Network Failure Handling

#### 3.1.1 Client-Side Network Errors
```javascript
const NETWORK_ERROR_HANDLING = {
  // Retry mechanism for failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (error.code === 'NETWORK_ERROR' && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
        throw error;
      }
    }
  },
  
  // Offline detection and handling
  handleOfflineMode: () => {
    if (!navigator.onLine) {
      return {
        showOfflineMessage: true,
        disableActions: ['create', 'update', 'delete'],
        enableActions: ['view', 'search']
      };
    }
    return { showOfflineMessage: false };
  },
  
  // Request timeout handling
  handleTimeout: (timeoutMs = 30000) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);
      
      // Clear timeout when request completes
      return { timeout };
    });
  }
};
```

#### 3.1.2 Server-Side Network Errors
```javascript
const SERVER_NETWORK_ERRORS = {
  // Database connection errors
  handleDatabaseError: (error) => {
    if (error.code === 'ECONNREFUSED') {
      return {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Database connection failed',
        severity: 'critical',
        retryable: true,
        userMessage: 'Service temporarily unavailable. Please try again later.'
      };
    }
    
    if (error.code === 'ETIMEDOUT') {
      return {
        code: 'DATABASE_TIMEOUT',
        message: 'Database operation timeout',
        severity: 'high',
        retryable: true,
        userMessage: 'Request timed out. Please try again.'
      };
    }
    
    return {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
      severity: 'high',
      retryable: false,
      userMessage: 'An error occurred. Please contact support.'
    };
  },
  
  // External service errors (Cloudinary, etc.)
  handleExternalServiceError: (service, error) => {
    const errorMap = {
      'cloudinary': {
        'UPLOAD_ERROR': 'File upload service unavailable',
        'QUOTA_EXCEEDED': 'File storage quota exceeded',
        'INVALID_FORMAT': 'Unsupported file format'
      }
    };
    
    return {
      code: `${service.toUpperCase()}_ERROR`,
      message: errorMap[service]?.[error.code] || 'External service error',
      severity: 'medium',
      retryable: true,
      userMessage: 'Service temporarily unavailable. Please try again.'
    };
  }
};
```

### 3.2 File Upload Error Handling

#### 3.2.1 File Validation
```javascript
const FILE_UPLOAD_VALIDATION = {
  // File type validation
  validateFileType: (file, allowedTypes) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    
    const isValidExtension = allowedTypes.extensions.includes(fileExtension);
    const isValidMimeType = allowedTypes.mimeTypes.includes(mimeType);
    
    if (!isValidExtension || !isValidMimeType) {
      return {
        valid: false,
        error: 'INVALID_FILE_TYPE',
        message: `File type not allowed. Allowed types: ${allowedTypes.extensions.join(', ')}`
      };
    }
    
    return { valid: true };
  },
  
  // File size validation
  validateFileSize: (file, maxSizeMB) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'FILE_TOO_LARGE',
        message: `File size exceeds ${maxSizeMB}MB limit`
      };
    }
    
    return { valid: true };
  },
  
  // File content validation
  validateFileContent: async (file) => {
    // Check for malicious content
    const isMalicious = await scanFileForMalware(file);
    if (isMalicious) {
      return {
        valid: false,
        error: 'MALICIOUS_FILE',
        message: 'File contains potentially malicious content'
      };
    }
    
    return { valid: true };
  }
};
```

#### 3.2.2 Upload Progress and Error Recovery
```javascript
const UPLOAD_PROGRESS_HANDLING = {
  // Progress tracking
  trackUploadProgress: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    });
  },
  
  // Resume failed uploads
  resumeUpload: async (fileId, chunkIndex) => {
    try {
      const response = await api.post(`/api/upload/resume/${fileId}`, {
        chunkIndex,
        totalChunks: file.totalChunks
      });
      return response.data;
    } catch (error) {
      if (error.code === 'UPLOAD_RESUME_FAILED') {
        // Start fresh upload
        return await startNewUpload(file);
      }
      throw error;
    }
  }
};
```

### 3.3 Concurrent Modification Handling

#### 3.3.1 Optimistic Locking
```javascript
const CONCURRENT_MODIFICATION_HANDLING = {
  // Task update with version control
  updateTaskWithLocking: async (taskId, updates, currentVersion) => {
    try {
      const task = await Task.findByIdAndUpdate(
        taskId,
        { 
          ...updates, 
          version: currentVersion + 1,
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true
        }
      );
      
      if (!task) {
        throw new Error('Task not found or version mismatch');
      }
      
      return task;
    } catch (error) {
      if (error.message.includes('version mismatch')) {
        return {
          error: 'CONCURRENT_MODIFICATION',
          message: 'Task was modified by another user. Please refresh and try again.',
          conflictData: await getLatestTaskVersion(taskId)
        };
      }
      throw error;
    }
  },
  
  // Project update with conflict resolution
  updateProjectWithConflictResolution: async (projectId, updates, lastModified) => {
    const project = await Project.findById(projectId);
    
    if (new Date(project.updatedAt) > new Date(lastModified)) {
      return {
        error: 'CONCURRENT_MODIFICATION',
        message: 'Project was modified by another user',
        conflictData: {
          current: project,
          conflictingFields: getConflictingFields(project, updates)
        }
      };
    }
    
    return await Project.findByIdAndUpdate(projectId, updates, { new: true });
  }
};
```

### 3.4 Data Integrity Validation

#### 3.4.1 Referential Integrity
```javascript
const REFERENTIAL_INTEGRITY_RULES = {
  // Validate task-project relationship
  validateTaskProjectRelationship: async (taskId, projectId) => {
    const project = await Project.findById(projectId);
    if (!project) {
      return { valid: false, error: 'PROJECT_NOT_FOUND' };
    }
    
    // Check if project is active
    if (project.status === 'cancelled') {
      return { valid: false, error: 'PROJECT_CANCELLED' };
    }
    
    return { valid: true };
  },
  
  // Validate user-team relationship
  validateUserTeamRelationship: async (userId, teamId) => {
    const user = await User.findById(userId);
    const team = await Team.findById(teamId);
    
    if (!user || !team) {
      return { valid: false, error: 'USER_OR_TEAM_NOT_FOUND' };
    }
    
    // Check if user is already in team
    if (team.members.includes(userId)) {
      return { valid: false, error: 'USER_ALREADY_IN_TEAM' };
    }
    
    return { valid: true };
  }
};
```

---

## 4. Error Response Standards

### 4.1 Standardized Error Format
```javascript
const STANDARD_ERROR_FORMAT = {
  // Client-side error format
  clientError: {
    success: false,
    error: {
      code: 'ERROR_CODE',
      message: 'Human readable message',
      details: [
        {
          field: 'fieldName',
          message: 'Field-specific error',
          code: 'FIELD_ERROR_CODE'
        }
      ],
      severity: 'low|medium|high|critical',
      retryable: true|false,
      timestamp: '2024-12-01T10:00:00.000Z',
      requestId: 'req_123456789'
    }
  },
  
  // Server-side error format
  serverError: {
    success: false,
    error: 'ERROR_CODE',
    message: 'User-friendly error message',
    details: [
      {
        field: 'fieldName',
        message: 'Specific field error',
        code: 'FIELD_ERROR_CODE'
      }
    ],
    requestId: 'req_123456789',
    timestamp: '2024-12-01T10:00:00.000Z',
    path: '/api/endpoint',
    method: 'POST'
  }
};
```

### 4.2 Error Logging Requirements
```javascript
const ERROR_LOGGING_REQUIREMENTS = {
  // Log levels and their usage
  logLevels: {
    ERROR: 'System errors, exceptions, failures',
    WARN: 'Potential issues, deprecated usage',
    INFO: 'General information, user actions',
    DEBUG: 'Detailed debugging information'
  },
  
  // Required log fields
  requiredFields: [
    'timestamp',
    'level',
    'message',
    'requestId',
    'userId',
    'endpoint',
    'method',
    'statusCode',
    'responseTime',
    'userAgent',
    'ipAddress'
  ],
  
  // Sensitive data that should not be logged
  sensitiveFields: [
    'password',
    'token',
    'creditCard',
    'ssn',
    'apiKey'
  ]
};
```

---

## 5. User Experience Error Handling

### 5.1 Error Message Guidelines
```javascript
const ERROR_MESSAGE_GUIDELINES = {
  // Message tone and style
  tone: 'Helpful, non-technical, actionable',
  
  // Message structure
  structure: {
    problem: 'What went wrong',
    cause: 'Why it happened (if helpful)',
    solution: 'What user can do',
    support: 'When to contact support'
  },
  
  // Examples of good error messages
  examples: {
    validation: 'Please enter a valid email address',
    network: 'Unable to connect. Please check your internet connection and try again',
    permission: 'You don\'t have permission to perform this action',
    notFound: 'The requested item could not be found',
    server: 'Something went wrong on our end. Please try again in a few minutes'
  }
};
```

### 5.2 Error Recovery Actions
```javascript
const ERROR_RECOVERY_ACTIONS = {
  // Automatic recovery actions
  automatic: [
    'Retry failed network requests',
    'Refresh expired authentication tokens',
    'Clear corrupted local storage',
    'Fallback to cached data'
  ],
  
  // User-initiated recovery actions
  userInitiated: [
    'Refresh the page',
    'Clear browser cache',
    'Check internet connection',
    'Contact support',
    'Try again later'
  ],
  
  // Progressive error handling
  progressive: {
    firstAttempt: 'Show inline error message',
    secondAttempt: 'Show modal with retry option',
    thirdAttempt: 'Show detailed error with support contact'
  }
};
```

---

## 6. Monitoring and Alerting

### 6.1 Error Monitoring Requirements
```javascript
const ERROR_MONITORING_REQUIREMENTS = {
  // Metrics to track
  metrics: [
    'Error rate by endpoint',
    'Error rate by user role',
    'Error rate by error type',
    'Response time for error responses',
    'User impact of errors'
  ],
  
  // Alert thresholds
  thresholds: {
    errorRate: '5% over 5 minutes',
    criticalErrors: 'Any occurrence',
    responseTime: '> 5 seconds',
    databaseErrors: '> 1% of requests'
  },
  
  // Notification channels
  channels: [
    'Email alerts for critical errors',
    'Slack notifications for high severity',
    'Dashboard alerts for monitoring team',
    'User notifications for service issues'
  ]
};
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Active  
**Next Review**: March 2025
