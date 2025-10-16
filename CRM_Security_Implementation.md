# CRM Security Implementation & Compliance
## Comprehensive Security Requirements and Data Privacy

---

## 1. Security Architecture Overview

### 1.1 Security Layers
```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Input         │ │   Business      │ │   Output        │ │
│  │   Validation    │ │   Logic         │ │   Sanitization  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Authentication Layer                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   JWT Tokens    │ │   Session       │ │   Multi-Factor  │ │
│  │   Management    │ │   Management    │ │   Authentication│ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Authorization Layer                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Role-Based    │ │   Resource      │ │   Permission    │ │
│  │   Access        │ │   Access        │ │   Matrix        │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Data Protection Layer                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Encryption    │ │   Data          │ │   Backup        │ │
│  │   at Rest        │ │   Masking       │ │   Security       │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Security

### 2.1 JWT Token Security

#### 2.1.1 Token Configuration
```javascript
const JWT_CONFIG = {
  // Token expiration times
  accessToken: {
    expiresIn: '15m',        // Short-lived access token
    algorithm: 'HS256',
    issuer: 'crm-app.com',
    audience: 'crm-users'
  },
  refreshToken: {
    expiresIn: '7d',         // Longer-lived refresh token
    algorithm: 'HS256',
    issuer: 'crm-app.com',
    audience: 'crm-users'
  },
  
  // Secret key management
  secretKey: {
    algorithm: 'HS256',
    rotationPeriod: '90d',  // Rotate secret every 90 days
    backupKeys: 2,           // Keep 2 backup keys
    keyLength: 256           // 256-bit key
  }
};
```

#### 2.1.2 Token Validation Middleware
```javascript
const tokenValidationMiddleware = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Access token is required'
      });
    }
    
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted
    const isBlacklisted = await checkTokenBlacklist(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_BLACKLISTED',
        message: 'Token has been revoked'
      });
    }
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'USER_INACTIVE',
        message: 'User account is inactive'
      });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Access token has expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid access token'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: 'Authentication failed'
    });
  }
};
```

### 2.2 Password Security

#### 2.2.1 Password Hashing
```javascript
const PASSWORD_SECURITY = {
  // Bcrypt configuration
  bcrypt: {
    saltRounds: 12,         // High security salt rounds
    algorithm: 'bcrypt'
  },
  
  // Password requirements
  requirements: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenPatterns: [
      /password/i,
      /123456/,
      /qwerty/i,
      /admin/i
    ]
  },
  
  // Password history (prevent reuse)
  history: {
    rememberLast: 5,        // Remember last 5 passwords
    checkHistory: true
  }
};
```

#### 2.2.2 Password Validation
```javascript
const passwordValidation = {
  validatePassword: (password) => {
    const errors = [];
    
    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Character requirements
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check against common passwords
    if (isCommonPassword(password)) {
      errors.push('Password is too common, please choose a stronger password');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 12);
  },
  
  verifyPassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  }
};
```

---

## 3. Authorization Security

### 3.1 Role-Based Access Control (RBAC)

#### 3.1.1 Permission Matrix
```javascript
const PERMISSION_MATRIX = {
  // Resource permissions
  resources: {
    users: ['create', 'read', 'update', 'delete', 'assign_role'],
    tasks: ['create', 'read', 'update', 'delete', 'assign', 'complete'],
    projects: ['create', 'read', 'update', 'delete', 'assign_team'],
    clients: ['create', 'read', 'update', 'delete', 'view_all'],
    attendance: ['read_own', 'read_all', 'update_own', 'update_all'],
    reports: ['generate', 'view_all', 'export'],
    settings: ['read', 'update']
  },
  
  // Role permissions
  roles: {
    employee: {
      users: ['read_own'],
      tasks: ['create', 'read_own', 'update_own', 'complete'],
      projects: ['read_assigned'],
      clients: ['read_assigned'],
      attendance: ['read_own', 'update_own'],
      reports: [],
      settings: ['read_own']
    },
    manager: {
      users: ['read_team', 'update_team'],
      tasks: ['create', 'read_team', 'update_team', 'assign', 'delete'],
      projects: ['create', 'read_team', 'update_team', 'assign_team'],
      clients: ['create', 'read_team', 'update_team'],
      attendance: ['read_team', 'update_team'],
      reports: ['generate_team', 'view_team'],
      settings: ['read_team']
    },
    admin: {
      users: ['create', 'read', 'update', 'delete', 'assign_role'],
      tasks: ['create', 'read', 'update', 'delete', 'assign'],
      projects: ['create', 'read', 'update', 'delete', 'assign_team'],
      clients: ['create', 'read', 'update', 'delete', 'view_all'],
      attendance: ['read_all', 'update_all'],
      reports: ['generate', 'view_all', 'export'],
      settings: ['read', 'update']
    }
  }
};
```

#### 3.1.2 Authorization Middleware
```javascript
const authorizationMiddleware = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const userRole = user.role;
      
      // Check if user has permission for the action
      const hasPermission = checkPermission(userRole, resource, action);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: `You don't have permission to ${action} ${resource}`,
          requiredRole: getRequiredRole(resource, action)
        });
      }
      
      // Additional context-based authorization
      if (action === 'read' || action === 'update') {
        const resourceId = req.params.id;
        const isOwner = await checkResourceOwnership(user._id, resource, resourceId);
        const isTeamMember = await checkTeamMembership(user._id, resource, resourceId);
        
        if (!isOwner && !isTeamMember && userRole !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'RESOURCE_ACCESS_DENIED',
            message: 'You can only access your own resources'
          });
        }
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'AUTHORIZATION_ERROR',
        message: 'Authorization check failed'
      });
    }
  };
};
```

### 3.2 Resource-Level Security

#### 3.2.1 Data Filtering by Role
```javascript
const DATA_FILTERING = {
  // Filter tasks based on user role
  filterTasksByRole: async (userId, userRole, query = {}) => {
    const baseQuery = { ...query };
    
    switch (userRole) {
      case 'employee':
        // Employees can only see their own tasks
        baseQuery.assignee = userId;
        break;
        
      case 'manager':
        // Managers can see team tasks
        const teamMembers = await getTeamMembers(userId);
        baseQuery.assignee = { $in: teamMembers };
        break;
        
      case 'admin':
        // Admins can see all tasks
        break;
        
      default:
        throw new Error('Invalid user role');
    }
    
    return baseQuery;
  },
  
  // Filter projects based on user role
  filterProjectsByRole: async (userId, userRole, query = {}) => {
    const baseQuery = { ...query };
    
    switch (userRole) {
      case 'employee':
        // Employees can only see assigned projects
        baseQuery.teamMembers = { $elemMatch: { user: userId } };
        break;
        
      case 'manager':
        // Managers can see team projects
        const teamMembers = await getTeamMembers(userId);
        baseQuery.$or = [
          { user: userId },
          { teamMembers: { $elemMatch: { user: { $in: teamMembers } } } }
        ];
        break;
        
      case 'admin':
        // Admins can see all projects
        break;
    }
    
    return baseQuery;
  }
};
```

---

## 4. Data Protection & Encryption

### 4.1 Data Encryption Standards

#### 4.1.1 Encryption at Rest
```javascript
const ENCRYPTION_CONFIG = {
  // Database encryption
  database: {
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2',
    iterations: 100000,
    saltLength: 32,
    ivLength: 16,
    tagLength: 16
  },
  
  // File encryption
  files: {
    algorithm: 'AES-256-CBC',
    keyDerivation: 'scrypt',
    iterations: 16384,
    keyLength: 32,
    saltLength: 32
  },
  
  // Sensitive field encryption
  fields: {
    encryptFields: [
      'client.contactPerson.email',
      'client.contactPerson.phone',
      'user.ssn',
      'project.budget'
    ],
    algorithm: 'AES-256-GCM',
    keyRotation: '90d'
  }
};
```

#### 4.1.2 Encryption Implementation
```javascript
const encryptionService = {
  // Encrypt sensitive data
  encrypt: (data, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  },
  
  // Decrypt sensitive data
  decrypt: (encryptedData, key) => {
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },
  
  // Encrypt database fields
  encryptField: (value) => {
    if (!value) return value;
    
    const encrypted = encryptionService.encrypt(value, process.env.ENCRYPTION_KEY);
    return JSON.stringify(encrypted);
  },
  
  // Decrypt database fields
  decryptField: (encryptedValue) => {
    if (!encryptedValue) return encryptedValue;
    
    try {
      const encrypted = JSON.parse(encryptedValue);
      return encryptionService.decrypt(encrypted, process.env.ENCRYPTION_KEY);
    } catch (error) {
      return encryptedValue; // Return original if decryption fails
    }
  }
};
```

### 4.2 Data Masking and Anonymization

#### 4.2.1 Data Masking Rules
```javascript
const DATA_MASKING = {
  // Email masking
  maskEmail: (email) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  },
  
  // Phone number masking
  maskPhone: (phone) => {
    return phone.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
  },
  
  // Credit card masking
  maskCreditCard: (cardNumber) => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  },
  
  // SSN masking
  maskSSN: (ssn) => {
    return ssn.replace(/\d(?=\d{4})/g, '*');
  }
};
```

---

## 5. GDPR Compliance & Privacy

### 5.1 Data Privacy Requirements

#### 5.1.1 Data Collection Principles
```javascript
const GDPR_COMPLIANCE = {
  // Lawful basis for processing
  lawfulBasis: {
    consent: 'User has given clear consent',
    contract: 'Processing is necessary for contract performance',
    legal: 'Processing is required by law',
    legitimate: 'Processing is necessary for legitimate interests'
  },
  
  // Data minimization
  dataMinimization: {
    principle: 'Collect only necessary data',
    implementation: [
      'Collect only required fields',
      'Regular data audits',
      'Automatic data purging',
      'Purpose limitation'
    ]
  },
  
  // Data subject rights
  dataSubjectRights: {
    access: 'Right to access personal data',
    rectification: 'Right to correct inaccurate data',
    erasure: 'Right to be forgotten',
    portability: 'Right to data portability',
    restriction: 'Right to restrict processing',
    objection: 'Right to object to processing'
  }
};
```

#### 5.1.2 Right to be Forgotten Implementation
```javascript
const RIGHT_TO_BE_FORGOTTEN = {
  // Data deletion process
  deleteUserData: async (userId) => {
    const deletionSteps = [
      // 1. Anonymize user profile
      await User.findByIdAndUpdate(userId, {
        name: 'Deleted User',
        email: `deleted_${Date.now()}@deleted.com`,
        status: 'deleted',
        deletedAt: new Date()
      }),
      
      // 2. Anonymize tasks
      await Task.updateMany(
        { assignee: userId },
        { assignee: null, assigneeName: 'Deleted User' }
      ),
      
      // 3. Anonymize projects
      await Project.updateMany(
        { user: userId },
        { user: null, userName: 'Deleted User' }
      ),
      
      // 4. Anonymize attendance records
      await Attendance.updateMany(
        { user: userId },
        { 
          user: null, 
          name: 'Deleted User',
          email: `deleted_${Date.now()}@deleted.com`
        }
      ),
      
      // 5. Delete notifications
      await Notification.deleteMany({ user: userId }),
      
      // 6. Log deletion
      await AuditLog.create({
        action: 'DATA_DELETION',
        userId: userId,
        details: 'User data deleted per GDPR request',
        timestamp: new Date()
      })
    ];
    
    return Promise.all(deletionSteps);
  },
  
  // Data export for portability
  exportUserData: async (userId) => {
    const userData = {
      profile: await User.findById(userId).select('-password'),
      tasks: await Task.find({ assignee: userId }),
      projects: await Project.find({ user: userId }),
      attendance: await Attendance.find({ user: userId }),
      notifications: await Notification.find({ user: userId })
    };
    
    return userData;
  }
};
```

### 5.2 Consent Management

#### 5.2.1 Consent Tracking
```javascript
const CONSENT_MANAGEMENT = {
  // Consent types
  consentTypes: {
    marketing: 'Marketing communications',
    analytics: 'Analytics and tracking',
    cookies: 'Cookie usage',
    dataProcessing: 'Data processing for service',
    thirdParty: 'Third-party data sharing'
  },
  
  // Consent storage
  storeConsent: async (userId, consentType, granted, timestamp) => {
    await Consent.create({
      userId,
      consentType,
      granted,
      timestamp,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  },
  
  // Consent validation
  validateConsent: async (userId, consentType) => {
    const consent = await Consent.findOne({
      userId,
      consentType,
      granted: true
    }).sort({ timestamp: -1 });
    
    return consent ? true : false;
  }
};
```

---

## 6. Security Headers and HTTPS

### 6.1 Security Headers Configuration
```javascript
const SECURITY_HEADERS = {
  // Content Security Policy
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "https://res.cloudinary.com"],
    'connect-src': ["'self'", "https://api.crm-app.com"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },
  
  // Other security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
};
```

### 6.2 HTTPS Configuration
```javascript
const HTTPS_CONFIG = {
  // SSL/TLS configuration
  ssl: {
    protocol: 'TLSv1.2',
    ciphers: [
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-SHA384',
      'ECDHE-RSA-AES128-SHA256'
    ],
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
  },
  
  // Certificate management
  certificates: {
    rotationPeriod: '90d',
    backupCertificates: 2,
    autoRenewal: true
  }
};
```

---

## 7. Rate Limiting and DDoS Protection

### 7.1 Rate Limiting Implementation
```javascript
const RATE_LIMITING = {
  // Rate limit configurations
  limits: {
    // Authentication endpoints
    auth: {
      login: { requests: 5, window: '1m' },
      register: { requests: 3, window: '1m' },
      passwordReset: { requests: 3, window: '1h' }
    },
    
    // General API endpoints
    api: {
      default: { requests: 1000, window: '1h' },
      fileUpload: { requests: 10, window: '1m' },
      search: { requests: 100, window: '1m' }
    },
    
    // Admin endpoints
    admin: {
      userManagement: { requests: 100, window: '1h' },
      systemSettings: { requests: 50, window: '1h' }
    }
  },
  
  // Rate limiting middleware
  rateLimitMiddleware: (limitConfig) => {
    return rateLimit({
      windowMs: limitConfig.window,
      max: limitConfig.requests,
      message: {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(limitConfig.window / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later'
        });
      }
    });
  }
};
```

---

## 8. Security Monitoring and Logging

### 8.1 Security Event Logging
```javascript
const SECURITY_LOGGING = {
  // Security events to log
  events: {
    authentication: [
      'login_success',
      'login_failed',
      'logout',
      'password_change',
      'password_reset'
    ],
    authorization: [
      'permission_denied',
      'role_change',
      'access_granted',
      'access_denied'
    ],
    data: [
      'data_access',
      'data_modification',
      'data_export',
      'data_deletion'
    ],
    system: [
      'configuration_change',
      'security_update',
      'backup_created',
      'backup_restored'
    ]
  },
  
  // Log format
  logFormat: {
    timestamp: 'ISO 8601 format',
    eventType: 'Security event type',
    userId: 'User ID (if applicable)',
    ipAddress: 'Client IP address',
    userAgent: 'Client user agent',
    resource: 'Accessed resource',
    action: 'Performed action',
    result: 'Success/failure',
    details: 'Additional context'
  }
};
```

### 8.2 Security Alerts
```javascript
const SECURITY_ALERTS = {
  // Alert conditions
  conditions: {
    multipleFailedLogins: {
      threshold: 5,
      window: '15m',
      action: 'temporary_account_lockout'
    },
    suspiciousActivity: {
      threshold: 10,
      window: '1h',
      action: 'security_review'
    },
    privilegeEscalation: {
      threshold: 1,
      window: '1h',
      action: 'immediate_investigation'
    }
  },
  
  // Alert notifications
  notifications: {
    email: {
      securityTeam: 'security@crm-app.com',
      adminTeam: 'admin@crm-app.com'
    },
    slack: {
      securityChannel: '#security-alerts',
      adminChannel: '#admin-alerts'
    }
  }
};
```

---

## 9. Backup and Recovery Security

### 9.1 Secure Backup Procedures
```javascript
const BACKUP_SECURITY = {
  // Backup encryption
  encryption: {
    algorithm: 'AES-256-GCM',
    keyManagement: 'AWS KMS',
    keyRotation: '30d'
  },
  
  // Backup storage
  storage: {
    primary: 'AWS S3 (encrypted)',
    secondary: 'Google Cloud Storage (encrypted)',
    retention: '7 years',
    versioning: true
  },
  
  // Backup access control
  accessControl: {
    encryption: 'At rest and in transit',
    authentication: 'Multi-factor required',
    authorization: 'Admin role only',
    audit: 'All access logged'
  }
};
```

---

## 10. Security Testing Requirements

### 10.1 Security Testing Checklist
```javascript
const SECURITY_TESTING = {
  // Authentication testing
  authentication: [
    'Password strength validation',
    'Account lockout after failed attempts',
    'Session timeout handling',
    'Token expiration and refresh',
    'Multi-factor authentication'
  ],
  
  // Authorization testing
  authorization: [
    'Role-based access control',
    'Resource-level permissions',
    'Privilege escalation prevention',
    'Cross-user data access prevention'
  ],
  
  // Input validation testing
  inputValidation: [
    'SQL injection prevention',
    'XSS prevention',
    'CSRF protection',
    'File upload security',
    'Input sanitization'
  ],
  
  // Data protection testing
  dataProtection: [
    'Encryption at rest',
    'Encryption in transit',
    'Data masking',
    'Secure data deletion',
    'Backup encryption'
  ]
};
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Active  
**Compliance**: GDPR, SOC 2, ISO 27001  
**Next Review**: March 2025
