# CRM Database Optimization & Indexing Strategy
## Performance Optimization and Query Efficiency

---

## 1. Database Architecture Overview

### 1.1 MongoDB Schema Design
```
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Collections                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │     Users       │ │     Tasks      │ │    Projects     │ │
│  │                 │ │                 │ │                 │ │
│  │ - _id           │ │ - _id           │ │ - _id           │ │
│  │ - name          │ │ - title         │ │ - name          │ │
│  │ - email         │ │ - status        │ │ - status        │ │
│  │ - role          │ │ - priority      │ │ - client        │ │
│  │ - team          │ │ - assignee      │ │ - teamMembers   │ │
│  │ - createdAt     │ │ - project       │ │ - progress      │ │
│  │ - updatedAt     │ │ - dueDate       │ │ - createdAt     │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │     Clients      │ │   Attendance    │ │ Notifications   │ │
│  │                 │ │                 │ │                 │ │
│  │ - _id           │ │ - _id           │ │ - _id           │ │
│  │ - name          │ │ - user          │ │ - user          │ │
│  │ - company       │ │ - date          │ │ - title         │ │
│  │ - status        │ │ - checkIn       │ │ - message       │ │
│  │ - industry      │ │ - checkOut       │ │ - type          │ │
│  │ - createdAt     │ │ - duration      │ │ - read          │ │
│  │ - updatedAt     │ │ - createdAt     │ │ - createdAt     │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Collection Relationships
```javascript
const COLLECTION_RELATIONSHIPS = {
  // Primary relationships
  relationships: {
    'User': {
      'Task': 'one-to-many (assignee)',
      'Project': 'one-to-many (owner)',
      'Attendance': 'one-to-many',
      'Notification': 'one-to-many'
    },
    'Project': {
      'Task': 'one-to-many',
      'Client': 'many-to-one',
      'User': 'many-to-many (teamMembers)'
    },
    'Client': {
      'Project': 'one-to-many'
    }
  },
  
  // Embedded vs Referenced documents
  embeddingStrategy: {
    embedded: [
      'Project.teamMembers',      // Small, frequently accessed
      'Task.comments',            // Small, always needed
      'User.preferences'          // Small, user-specific
    ],
    referenced: [
      'Task.assignee',           // Large user documents
      'Task.project',            // Large project documents
      'Project.client'           // Large client documents
    ]
  }
};
```

---

## 2. Indexing Strategy

### 2.1 Primary Indexes

#### 2.1.1 User Collection Indexes
```javascript
const USER_INDEXES = {
  // Primary key (automatically created)
  primary: { _id: 1 },
  
  // Unique indexes
  unique: [
    { email: 1 },                    // Unique email constraint
    { username: 1 }                  // Unique username constraint
  ],
  
  // Single field indexes
  single: [
    { role: 1 },                     // Role-based queries
    { status: 1 },                   // Active/inactive users
    { createdAt: 1 },               // User creation date
    { lastLoginAt: 1 },              // Recent login tracking
    { manager: 1 }                   // Manager-subordinate relationship
  ],
  
  // Compound indexes
  compound: [
    { role: 1, status: 1 },         // Active users by role
    { team: 1, role: 1 },            // Team members by role
    { createdAt: -1, role: 1 },      // Recent users by role
    { manager: 1, status: 1 },       // Active subordinates
    { email: 1, status: 1 }          // Active user lookup
  ],
  
  // Text indexes
  text: [
    { name: 'text', email: 'text' }  // User search
  ],
  
  // Partial indexes
  partial: [
    {
      key: { lastLoginAt: 1 },
      partialFilterExpression: { status: 'active' }
    }
  ]
};
```

#### 2.1.2 Task Collection Indexes
```javascript
const TASK_INDEXES = {
  // Single field indexes
  single: [
    { status: 1 },                   // Task status queries
    { priority: 1 },                  // Priority-based queries
    { assignee: 1 },                 // User's assigned tasks
    { project: 1 },                  // Project tasks
    { dueDate: 1 },                  // Due date queries
    { createdAt: 1 },                // Creation date
    { updatedAt: 1 },                // Last update
    { completedAt: 1 }                // Completion tracking
  ],
  
  // Compound indexes
  compound: [
    { assignee: 1, status: 1 },      // User's tasks by status
    { project: 1, status: 1 },       // Project tasks by status
    { assignee: 1, dueDate: 1 },     // User's upcoming tasks
    { project: 1, priority: 1 },      // Project tasks by priority
    { status: 1, dueDate: 1 },       // Overdue tasks
    { assignee: 1, createdAt: -1 },  // User's recent tasks
    { project: 1, assignee: 1 },      // Project-user relationship
    { priority: 1, dueDate: 1 },      // High priority overdue
    { status: 1, priority: 1 },      // Status-priority matrix
    { assignee: 1, status: 1, dueDate: 1 } // User task dashboard
  ],
  
  // Text indexes
  text: [
    { title: 'text', description: 'text', labels: 'text' }
  ],
  
  // Sparse indexes
  sparse: [
    { completedAt: 1 },               // Only for completed tasks
    { estimatedHours: 1 }             // Only for tasks with estimates
  ],
  
  // TTL indexes
  ttl: [
    {
      key: { createdAt: 1 },
      expireAfterSeconds: 31536000    // 1 year for completed tasks
    }
  ]
};
```

#### 2.1.3 Project Collection Indexes
```javascript
const PROJECT_INDEXES = {
  // Single field indexes
  single: [
    { status: 1 },                   // Project status
    { priority: 1 },                  // Project priority
    { client: 1 },                   // Client projects
    { user: 1 },                     // User's projects
    { startDate: 1 },                // Project timeline
    { endDate: 1 },                  // Project timeline
    { createdAt: 1 },                // Creation date
    { updatedAt: 1 }                 // Last update
  ],
  
  // Compound indexes
  compound: [
    { user: 1, status: 1 },           // User's projects by status
    { client: 1, status: 1 },        // Client projects by status
    { status: 1, priority: 1 },       // Project matrix
    { startDate: 1, endDate: 1 },     // Timeline queries
    { user: 1, createdAt: -1 },       // User's recent projects
    { client: 1, createdAt: -1 },      // Client's recent projects
    { status: 1, endDate: 1 },        // Projects ending soon
    { teamMembers: 1, status: 1 }     // Team member projects
  ],
  
  // Text indexes
  text: [
    { name: 'text', description: 'text' }
  ],
  
  // Partial indexes
  partial: [
    {
      key: { endDate: 1 },
      partialFilterExpression: { status: { $in: ['active', 'on-hold'] } }
    }
  ]
};
```

#### 2.1.4 Client Collection Indexes
```javascript
const CLIENT_INDEXES = {
  // Single field indexes
  single: [
    { status: 1 },                   // Client status
    { industry: 1 },                 // Industry grouping
    { tier: 1 },                     // Client tier
    { createdAt: 1 },                // Creation date
    { updatedAt: 1 }                 // Last update
  ],
  
  // Compound indexes
  compound: [
    { status: 1, industry: 1 },       // Clients by status and industry
    { tier: 1, status: 1 },           // Client tier matrix
    { industry: 1, createdAt: -1 },   // Recent clients by industry
    { status: 1, createdAt: -1 }      // Recent clients by status
  ],
  
  // Text indexes
  text: [
    { name: 'text', company: 'text', industry: 'text' }
  ]
};
```

#### 2.1.5 Attendance Collection Indexes
```javascript
const ATTENDANCE_INDEXES = {
  // Single field indexes
  single: [
    { user: 1 },                     // User's attendance
    { date: 1 },                     // Date-based queries
    { checkIn: 1 },                  // Check-in time
    { checkOut: 1 },                 // Check-out time
    { createdAt: 1 }                 // Record creation
  ],
  
  // Compound indexes
  compound: [
    { user: 1, date: 1 },            // User's daily attendance
    { user: 1, date: -1 },           // User's attendance history
    { date: 1, user: 1 },            // Daily attendance by user
    { user: 1, createdAt: -1 },       // User's recent attendance
    { date: -1, user: 1 }             // Recent attendance by user
  ],
  
  // Partial indexes
  partial: [
    {
      key: { checkIn: 1 },
      partialFilterExpression: { checkIn: { $exists: true } }
    },
    {
      key: { checkOut: 1 },
      partialFilterExpression: { checkOut: { $exists: true } }
    }
  ]
};
```

#### 2.1.6 Notification Collection Indexes
```javascript
const NOTIFICATION_INDEXES = {
  // Single field indexes
  single: [
    { user: 1 },                     // User's notifications
    { type: 1 },                     // Notification type
    { priority: 1 },                 // Notification priority
    { read: 1 },                     // Read status
    { createdAt: 1 }                 // Creation date
  ],
  
  // Compound indexes
  compound: [
    { user: 1, read: 1 },            // User's unread notifications
    { user: 1, createdAt: -1 },       // User's recent notifications
    { user: 1, type: 1 },            // User notifications by type
    { user: 1, priority: 1 },        // User notifications by priority
    { read: 1, createdAt: -1 },      // Recent unread notifications
    { type: 1, priority: 1 },        // Notification matrix
    { user: 1, read: 1, createdAt: -1 } // User's unread recent
  ],
  
  // TTL indexes
  ttl: [
    {
      key: { createdAt: 1 },
      expireAfterSeconds: 2592000     // 30 days for read notifications
    }
  ]
};
```

---

## 3. Query Optimization

### 3.1 Common Query Patterns

#### 3.1.1 User Dashboard Queries
```javascript
const DASHBOARD_QUERIES = {
  // User's assigned tasks
  getUserTasks: async (userId, filters = {}) => {
    const query = { assignee: userId };
    
    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.project) query.project = filters.project;
    
    // Use compound index: { assignee: 1, status: 1, dueDate: 1 }
    return await Task.find(query)
      .populate('project', 'name status')
      .sort({ dueDate: 1, priority: -1 })
      .limit(20);
  },
  
  // User's projects
  getUserProjects: async (userId) => {
    // Use compound index: { user: 1, status: 1 }
    return await Project.find({
      $or: [
        { user: userId },
        { teamMembers: { $elemMatch: { user: userId } } }
      ],
      status: { $in: ['active', 'on-hold'] }
    })
    .populate('client', 'name company')
    .sort({ updatedAt: -1 });
  },
  
  // User's attendance summary
  getUserAttendanceSummary: async (userId, startDate, endDate) => {
    // Use compound index: { user: 1, date: 1 }
    return await Attendance.aggregate([
      {
        $match: {
          user: ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$checkIn', null] }, { $ne: ['$checkOut', null] }] },
                1,
                0
              ]
            }
          },
          totalHours: { $sum: '$durationMinutes' }
        }
      }
    ]);
  }
};
```

#### 3.1.2 Manager Dashboard Queries
```javascript
const MANAGER_QUERIES = {
  // Team performance overview
  getTeamPerformance: async (managerId, period) => {
    // Get team members
    const teamMembers = await User.find({ manager: managerId }).select('_id');
    const teamIds = teamMembers.map(member => member._id);
    
    // Use compound index: { assignee: 1, createdAt: -1 }
    return await Task.aggregate([
      {
        $match: {
          assignee: { $in: teamIds },
          createdAt: { $gte: period.start, $lte: period.end }
        }
      },
      {
        $group: {
          _id: '$assignee',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          totalTasks: 1,
          completedTasks: 1,
          overdueTasks: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedTasks', '$totalTasks'] },
              100
            ]
          }
        }
      }
    ]);
  },
  
  // Team attendance overview
  getTeamAttendance: async (managerId, startDate, endDate) => {
    const teamMembers = await User.find({ manager: managerId }).select('_id');
    const teamIds = teamMembers.map(member => member._id);
    
    // Use compound index: { user: 1, date: 1 }
    return await Attendance.aggregate([
      {
        $match: {
          user: { $in: teamIds },
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$user',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$checkIn', null] }, { $ne: ['$checkOut', null] }] },
                1,
                0
              ]
            }
          },
          totalHours: { $sum: '$durationMinutes' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          totalDays: 1,
          presentDays: 1,
          attendanceRate: {
            $multiply: [
              { $divide: ['$presentDays', '$totalDays'] },
              100
            ]
          },
          averageHours: { $divide: ['$totalHours', '$totalDays'] }
        }
      }
    ]);
  }
};
```

### 3.2 Aggregation Pipeline Optimization

#### 3.2.1 Project Analytics Pipeline
```javascript
const PROJECT_ANALYTICS_PIPELINE = {
  // Project progress calculation
  calculateProjectProgress: [
    // Stage 1: Match project tasks
    {
      $match: {
        project: ObjectId(projectId),
        status: { $in: ['pending', 'in-progress', 'completed'] }
      }
    },
    
    // Stage 2: Group by status
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalHours: { $sum: '$estimatedHours' },
        completedHours: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              '$actualHours',
              0
            ]
          }
        }
      }
    },
    
    // Stage 3: Calculate progress
    {
      $group: {
        _id: null,
        totalTasks: { $sum: '$count' },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ['$_id', 'completed'] }, '$count', 0]
          }
        },
        totalEstimatedHours: { $sum: '$totalHours' },
        totalActualHours: { $sum: '$completedHours' }
      }
    },
    
    // Stage 4: Calculate percentages
    {
      $project: {
        _id: 0,
        totalTasks: 1,
        completedTasks: 1,
        taskProgress: {
          $multiply: [
            { $divide: ['$completedTasks', '$totalTasks'] },
            100
          ]
        },
        hoursProgress: {
          $multiply: [
            { $divide: ['$totalActualHours', '$totalEstimatedHours'] },
            100
          ]
        }
      }
    }
  ],
  
  // Project timeline analysis
  analyzeProjectTimeline: [
    {
      $match: { project: ObjectId(projectId) }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        tasksCreated: { $sum: 1 },
        tasksCompleted: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]
};
```

---

## 4. Performance Monitoring

### 4.1 Query Performance Metrics

#### 4.1.1 Performance Monitoring Setup
```javascript
const PERFORMANCE_MONITORING = {
  // Slow query threshold
  slowQueryThreshold: 100, // milliseconds
  
  // Performance metrics to track
  metrics: [
    'query_execution_time',
    'index_usage',
    'collection_scan_ratio',
    'memory_usage',
    'disk_io',
    'connection_pool_usage'
  ],
  
  // Monitoring queries
  monitoringQueries: {
    // Find slow operations
    slowOperations: {
      collection: 'system.profile',
      query: {
        'command.find': { $exists: true },
        'millis': { $gt: 100 }
      }
    },
    
    // Index usage statistics
    indexUsage: {
      collection: 'system.profile',
      aggregation: [
        {
          $group: {
            _id: '$command.find',
            count: { $sum: 1 },
            avgTime: { $avg: '$millis' }
          }
        }
      ]
    }
  }
};
```

#### 4.1.2 Performance Optimization Rules
```javascript
const OPTIMIZATION_RULES = {
  // Query optimization guidelines
  queryOptimization: {
    // Use projection to limit fields
    useProjection: true,
    
    // Use limit for pagination
    useLimit: true,
    
    // Use sort with index
    sortWithIndex: true,
    
    // Avoid regex at start of string
    avoidRegexStart: true,
    
    // Use compound indexes
    useCompoundIndexes: true
  },
  
  // Index optimization guidelines
  indexOptimization: {
    // Monitor index usage
    monitorUsage: true,
    
    // Remove unused indexes
    removeUnused: true,
    
    // Optimize index order
    optimizeOrder: true,
    
    // Use partial indexes
    usePartialIndexes: true
  }
};
```

---

## 5. Data Archiving and Cleanup

### 5.1 Data Lifecycle Management

#### 5.1.1 Archiving Strategy
```javascript
const DATA_ARCHIVING = {
  // Archiving rules
  archivingRules: {
    // Completed tasks older than 1 year
    completedTasks: {
      condition: { status: 'completed', completedAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
      action: 'archive',
      destination: 'tasks_archive'
    },
    
    // Read notifications older than 30 days
    readNotifications: {
      condition: { read: true, readAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      action: 'delete'
    },
    
    // Inactive users older than 2 years
    inactiveUsers: {
      condition: { status: 'inactive', lastLoginAt: { $lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) } },
      action: 'archive',
      destination: 'users_archive'
    }
  },
  
  // Archiving process
  archivingProcess: {
    frequency: 'monthly',
    batchSize: 1000,
    backupBeforeArchive: true,
    verifyAfterArchive: true
  }
};
```

#### 5.1.2 Cleanup Procedures
```javascript
const CLEANUP_PROCEDURES = {
  // Cleanup tasks
  cleanupTasks: [
    'remove_orphaned_tasks',
    'cleanup_duplicate_notifications',
    'remove_expired_sessions',
    'cleanup_temp_files'
  ],
  
  // Cleanup schedule
  schedule: {
    daily: ['remove_expired_sessions', 'cleanup_temp_files'],
    weekly: ['remove_orphaned_tasks'],
    monthly: ['cleanup_duplicate_notifications', 'archive_old_data']
  }
};
```

---

## 6. Database Maintenance

### 6.1 Maintenance Procedures

#### 6.1.1 Index Maintenance
```javascript
const INDEX_MAINTENANCE = {
  // Index rebuilding
  rebuildIndexes: {
    frequency: 'monthly',
    collections: ['tasks', 'projects', 'users', 'attendance'],
    method: 'background'
  },
  
  // Index analysis
  analyzeIndexes: {
    frequency: 'weekly',
    metrics: ['usage_count', 'hit_ratio', 'size']
  },
  
  // Index optimization
  optimizeIndexes: {
    removeUnused: true,
    consolidateSimilar: true,
    updateStatistics: true
  }
};
```

#### 6.1.2 Database Health Checks
```javascript
const HEALTH_CHECKS = {
  // Daily health checks
  daily: [
    'check_index_usage',
    'monitor_slow_queries',
    'check_disk_space',
    'verify_replica_set_status'
  ],
  
  // Weekly health checks
  weekly: [
    'analyze_query_performance',
    'check_index_fragmentation',
    'monitor_memory_usage',
    'verify_backup_integrity'
  ],
  
  // Monthly health checks
  monthly: [
    'comprehensive_performance_analysis',
    'index_optimization',
    'data_archiving',
    'security_audit'
  ]
};
```

---

## 7. Backup and Recovery

### 7.1 Backup Strategy

#### 7.1.1 Backup Configuration
```javascript
const BACKUP_STRATEGY = {
  // Backup types
  backupTypes: {
    full: {
      frequency: 'daily',
      retention: '30_days',
      compression: true,
      encryption: true
    },
    incremental: {
      frequency: 'hourly',
      retention: '7_days',
      compression: true,
      encryption: true
    },
    differential: {
      frequency: 'every_6_hours',
      retention: '14_days',
      compression: true,
      encryption: true
    }
  },
  
  // Backup destinations
  destinations: [
    'local_storage',
    'cloud_storage_primary',
    'cloud_storage_secondary'
  ],
  
  // Backup verification
  verification: {
    checksum: true,
    restore_test: 'weekly',
    integrity_check: 'daily'
  }
};
```

---

## 8. Scaling Considerations

### 8.1 Horizontal Scaling

#### 8.1.1 Sharding Strategy
```javascript
const SHARDING_STRATEGY = {
  // Shard key selection
  shardKeys: {
    users: 'email',           // Even distribution
    tasks: 'assignee',        // User-based distribution
    projects: 'user',         // User-based distribution
    attendance: 'user',       // User-based distribution
    notifications: 'user'     // User-based distribution
  },
  
  // Sharding rules
  shardingRules: {
    minChunkSize: '64MB',
    maxChunkSize: '256MB',
    balancerEnabled: true,
    autoSplitEnabled: true
  }
};
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Active  
**Next Review**: March 2025
