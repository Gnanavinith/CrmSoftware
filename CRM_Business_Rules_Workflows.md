# CRM Business Rules & Workflow Specifications
## Domain Logic and Process Automation

---

## 1. Business Rules Framework

### 1.1 Rule Categories
```javascript
const BUSINESS_RULE_CATEGORIES = {
  VALIDATION: 'validation',           // Data validation rules
  AUTHORIZATION: 'authorization',     // Access control rules
  WORKFLOW: 'workflow',              // Process workflow rules
  CALCULATION: 'calculation',        // Business calculations
  NOTIFICATION: 'notification',      // Notification triggers
  ESCALATION: 'escalation',          // Escalation procedures
  INTEGRATION: 'integration',         // External system rules
  COMPLIANCE: 'compliance'           // Regulatory compliance rules
};
```

### 1.2 Rule Engine Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Business Rules Engine                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Rule          │ │   Rule          │ │   Rule         │ │
│  │   Evaluator     │ │   Executor      │ │   Scheduler    │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Rule Storage Layer                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Database      │ │   Configuration │ │   Version       │ │
│  │   Rules         │ │   Files         │ │   Control       │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Task Management Business Rules

### 2.1 Task Assignment Rules

#### 2.1.1 Assignment Eligibility
```javascript
const TASK_ASSIGNMENT_RULES = {
  // Employee assignment rules
  employeeAssignment: {
    maxConcurrentTasks: 10,
    maxTasksPerDay: 5,
    skillMatchRequired: true,
    workloadThreshold: 0.8, // 80% capacity
    assignmentWindow: '9:00-17:00', // Business hours only
    weekendAssignment: false
  },
  
  // Manager assignment rules
  managerAssignment: {
    canAssignToTeam: true,
    canAssignToOtherTeams: false,
    requiresApproval: false,
    maxTeamTasks: 50,
    priorityOverride: true
  },
  
  // Admin assignment rules
  adminAssignment: {
    canAssignToAnyone: true,
    canOverrideLimits: true,
    requiresApproval: false,
    emergencyAssignment: true
  },
  
  // Assignment validation
  validateAssignment: async (task, assignee, assigner) => {
    const errors = [];
    
    // Check assignee capacity
    const currentTasks = await Task.countDocuments({
      assignee: assignee._id,
      status: { $in: ['pending', 'in-progress'] }
    });
    
    if (currentTasks >= getMaxTasks(assignee.role)) {
      errors.push('Assignee has reached maximum task capacity');
    }
    
    // Check skill requirements
    if (task.requiredSkills && !hasRequiredSkills(assignee, task.requiredSkills)) {
      errors.push('Assignee does not have required skills');
    }
    
    // Check workload
    const workload = await calculateWorkload(assignee._id);
    if (workload > getWorkloadThreshold(assignee.role)) {
      errors.push('Assignee workload is too high');
    }
    
    // Check assignment permissions
    if (!canAssignTask(assigner, assignee)) {
      errors.push('Insufficient permissions to assign task');
    }
    
    return errors;
  }
};
```

#### 2.1.2 Task Priority Rules
```javascript
const TASK_PRIORITY_RULES = {
  // Priority calculation algorithm
  calculatePriority: (task) => {
    let priorityScore = 0;
    
    // Due date urgency (40% weight)
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) priorityScore += 40;
      else if (daysUntilDue <= 3) priorityScore += 30;
      else if (daysUntilDue <= 7) priorityScore += 20;
      else if (daysUntilDue <= 14) priorityScore += 10;
    }
    
    // Project priority (30% weight)
    if (task.project && task.project.priority === 'high') priorityScore += 30;
    else if (task.project && task.project.priority === 'medium') priorityScore += 20;
    else if (task.project && task.project.priority === 'low') priorityScore += 10;
    
    // Client importance (20% weight)
    if (task.client && task.client.tier === 'enterprise') priorityScore += 20;
    else if (task.client && task.client.tier === 'business') priorityScore += 15;
    else if (task.client && task.client.tier === 'standard') priorityScore += 10;
    
    // Task complexity (10% weight)
    if (task.estimatedHours > 40) priorityScore += 10;
    else if (task.estimatedHours > 20) priorityScore += 7;
    else if (task.estimatedHours > 8) priorityScore += 5;
    else priorityScore += 2;
    
    // Convert score to priority level
    if (priorityScore >= 80) return 'high';
    else if (priorityScore >= 50) return 'medium';
    else return 'low';
  },
  
  // Priority escalation rules
  escalatePriority: async (taskId) => {
    const task = await Task.findById(taskId);
    const daysOverdue = Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue >= 3 && task.priority !== 'high') {
      await Task.findByIdAndUpdate(taskId, { priority: 'high' });
      await createNotification({
        userId: task.assignee,
        type: 'priority_escalation',
        title: 'Task Priority Escalated',
        message: `Task "${task.title}" has been escalated to high priority due to overdue status`
      });
    }
  }
};
```

### 2.2 Task Status Transition Rules

#### 2.2.1 Status Workflow
```javascript
const TASK_STATUS_WORKFLOW = {
  // Valid status transitions
  transitions: {
    'pending': ['in-progress', 'blocked'],
    'in-progress': ['completed', 'blocked', 'pending'],
    'blocked': ['pending', 'in-progress'],
    'completed': [] // Terminal state
  },
  
  // Status change validation
  validateStatusChange: async (taskId, newStatus, userId) => {
    const task = await Task.findById(taskId);
    const user = await User.findById(userId);
    const errors = [];
    
    // Check if transition is valid
    if (!TASK_STATUS_WORKFLOW.transitions[task.status].includes(newStatus)) {
      errors.push(`Invalid status transition from ${task.status} to ${newStatus}`);
    }
    
    // Check permissions
    if (newStatus === 'completed' && task.assignee.toString() !== userId && user.role !== 'admin') {
      errors.push('Only the assigned user or admin can mark task as completed');
    }
    
    // Check prerequisites
    if (newStatus === 'completed') {
      const incompleteDependencies = await Task.find({
        _id: { $in: task.dependencies },
        status: { $ne: 'completed' }
      });
      
      if (incompleteDependencies.length > 0) {
        errors.push('Cannot complete task with incomplete dependencies');
      }
    }
    
    return errors;
  },
  
  // Status change actions
  onStatusChange: async (taskId, oldStatus, newStatus, userId) => {
    const actions = [];
    
    // Update timestamps
    if (newStatus === 'in-progress') {
      actions.push(updateTask(taskId, { startedAt: new Date() }));
    }
    
    if (newStatus === 'completed') {
      actions.push(updateTask(taskId, { 
        completedAt: new Date(),
        actualHours: calculateActualHours(taskId)
      }));
    }
    
    // Create notifications
    if (newStatus === 'completed') {
      actions.push(createNotification({
        userId: task.project.user,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${task.title}" has been completed`
      }));
    }
    
    // Update project progress
    if (newStatus === 'completed') {
      actions.push(updateProjectProgress(task.project));
    }
    
    return Promise.all(actions);
  }
};
```

---

## 3. Project Management Business Rules

### 3.1 Project Lifecycle Rules

#### 3.1.1 Project Status Transitions
```javascript
const PROJECT_LIFECYCLE_RULES = {
  // Project status workflow
  statusWorkflow: {
    'planning': ['active', 'cancelled'],
    'active': ['on-hold', 'completed', 'cancelled'],
    'on-hold': ['active', 'cancelled'],
    'completed': [], // Terminal state
    'cancelled': []  // Terminal state
  },
  
  // Project creation rules
  projectCreation: {
    requiredFields: ['name', 'client', 'startDate'],
    maxConcurrentProjects: {
      employee: 5,
      manager: 20,
      admin: 100
    },
    budgetValidation: {
      minBudget: 1000,
      maxBudget: 1000000,
      requiresApproval: 50000
    }
  },
  
  // Project completion rules
  projectCompletion: {
    allTasksCompleted: true,
    clientApproval: true,
    documentationComplete: true,
    budgetWithinTolerance: 0.1 // 10% tolerance
  },
  
  // Project cancellation rules
  projectCancellation: {
    requiresApproval: true,
    notifyStakeholders: true,
    handleIncompleteTasks: 'reassign',
    refundPolicy: 'prorated'
  }
};
```

#### 3.1.2 Project Progress Calculation
```javascript
const PROJECT_PROGRESS_RULES = {
  // Progress calculation methods
  calculateProgress: async (projectId) => {
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ project: projectId });
    
    if (tasks.length === 0) return 0;
    
    // Method 1: Task count based
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const taskCountProgress = (completedTasks / tasks.length) * 100;
    
    // Method 2: Estimated hours based
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const completedHours = tasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (task.actualHours || task.estimatedHours || 0), 0);
    const hoursProgress = totalEstimatedHours > 0 ? (completedHours / totalEstimatedHours) * 100 : 0;
    
    // Method 3: Milestone based
    const milestones = project.milestones || [];
    const completedMilestones = milestones.filter(milestone => milestone.completed).length;
    const milestoneProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;
    
    // Weighted average
    const weightedProgress = (
      taskCountProgress * 0.4 +
      hoursProgress * 0.4 +
      milestoneProgress * 0.2
    );
    
    return Math.round(weightedProgress);
  },
  
  // Progress update triggers
  updateProgressTriggers: [
    'task_status_change',
    'task_completion',
    'milestone_completion',
    'manual_update'
  ],
  
  // Progress thresholds
  progressThresholds: {
    atRisk: 0.7,      // 70% progress but behind schedule
    delayed: 0.5,     // 50% progress but past due date
    onTrack: 0.8      // 80% progress and on schedule
  }
};
```

### 3.2 Team Management Rules

#### 3.2.1 Team Assignment Rules
```javascript
const TEAM_MANAGEMENT_RULES = {
  // Team size limits
  teamSizeLimits: {
    minTeamSize: 1,
    maxTeamSize: 20,
    recommendedTeamSize: 8
  },
  
  // Role distribution rules
  roleDistribution: {
    maxManagersPerTeam: 2,
    minDevelopersPerTeam: 1,
    maxAdminsPerTeam: 1
  },
  
  // Team assignment validation
  validateTeamAssignment: async (projectId, userId, role) => {
    const project = await Project.findById(projectId);
    const user = await User.findById(userId);
    const errors = [];
    
    // Check if user is already assigned
    const existingAssignment = project.teamMembers.find(
      member => member.user.toString() === userId
    );
    if (existingAssignment) {
      errors.push('User is already assigned to this project');
    }
    
    // Check team size limits
    if (project.teamMembers.length >= TEAM_MANAGEMENT_RULES.teamSizeLimits.maxTeamSize) {
      errors.push('Project team has reached maximum size');
    }
    
    // Check role distribution
    const managerCount = project.teamMembers.filter(member => member.role === 'manager').length;
    if (role === 'manager' && managerCount >= TEAM_MANAGEMENT_RULES.roleDistribution.maxManagersPerTeam) {
      errors.push('Project already has maximum number of managers');
    }
    
    // Check user availability
    const userWorkload = await calculateUserWorkload(userId);
    if (userWorkload > 1.0) {
      errors.push('User workload is too high for additional assignments');
    }
    
    return errors;
  }
};
```

---

## 4. Client Management Business Rules

### 4.1 Client Onboarding Rules

#### 4.1.1 Client Registration Process
```javascript
const CLIENT_ONBOARDING_RULES = {
  // Client registration workflow
  registrationWorkflow: {
    steps: [
      'initial_contact',
      'requirements_gathering',
      'proposal_submission',
      'contract_negotiation',
      'contract_signing',
      'project_kickoff'
    ],
    requiredDocuments: [
      'company_profile',
      'project_requirements',
      'signed_contract',
      'payment_terms'
    ]
  },
  
  // Client validation rules
  validationRules: {
    companyName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      unique: true
    },
    email: {
      required: true,
      format: 'email',
      unique: true
    },
    industry: {
      required: true,
      allowedValues: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Retail',
        'Manufacturing',
        'Other'
      ]
    },
    budget: {
      required: false,
      min: 1000,
      max: 10000000
    }
  },
  
  // Client tier assignment
  assignClientTier: (client) => {
    const budget = client.budget || 0;
    const projectCount = client.projects?.length || 0;
    
    if (budget >= 100000 || projectCount >= 5) return 'enterprise';
    if (budget >= 25000 || projectCount >= 2) return 'business';
    return 'standard';
  }
};
```

#### 4.1.2 Client Status Management
```javascript
const CLIENT_STATUS_RULES = {
  // Client status workflow
  statusWorkflow: {
    'prospect': ['active', 'inactive'],
    'active': ['inactive', 'suspended'],
    'inactive': ['active', 'suspended'],
    'suspended': ['active', 'terminated'],
    'terminated': [] // Terminal state
  },
  
  // Status change rules
  statusChangeRules: {
    toActive: {
      requiresContract: true,
      requiresPayment: true,
      requiresApproval: false
    },
    toSuspended: {
      requiresApproval: true,
      notifyClient: true,
      suspendProjects: true
    },
    toTerminated: {
      requiresApproval: true,
      notifyClient: true,
      cancelProjects: true,
      dataRetention: '7_years'
    }
  },
  
  // Client health scoring
  calculateClientHealth: async (clientId) => {
    const client = await Client.findById(clientId);
    let healthScore = 100;
    
    // Payment history (30% weight)
    const paymentHistory = await getPaymentHistory(clientId);
    const onTimePayments = paymentHistory.filter(payment => payment.onTime).length;
    const paymentScore = (onTimePayments / paymentHistory.length) * 30;
    healthScore -= (30 - paymentScore);
    
    // Project success rate (25% weight)
    const projects = await Project.find({ client: clientId });
    const successfulProjects = projects.filter(project => project.status === 'completed').length;
    const successScore = (successfulProjects / projects.length) * 25;
    healthScore -= (25 - successScore);
    
    // Communication frequency (20% weight)
    const recentCommunications = await getRecentCommunications(clientId, 30); // Last 30 days
    const communicationScore = Math.min(recentCommunications.length * 2, 20);
    healthScore -= (20 - communicationScore);
    
    // Contract compliance (25% weight)
    const contractCompliance = await getContractCompliance(clientId);
    healthScore -= (25 - contractCompliance);
    
    return Math.max(0, Math.min(100, healthScore));
  }
};
```

---

## 5. Attendance Management Business Rules

### 5.1 Attendance Policy Rules

#### 5.1.1 Check-in/Check-out Rules
```javascript
const ATTENDANCE_POLICY_RULES = {
  // Working hours policy
  workingHours: {
    standardHours: '9:00-17:00',
    flexibleHours: '8:00-18:00',
    lunchBreak: '12:00-13:00',
    maxOvertime: 4, // hours
    weekendWork: 'approval_required'
  },
  
  // Check-in rules
  checkInRules: {
    earliestCheckIn: '7:00',
    latestCheckIn: '10:00',
    lateCheckInThreshold: '9:15',
    gracePeriod: 15, // minutes
    maxCheckInsPerDay: 1
  },
  
  // Check-out rules
  checkOutRules: {
    earliestCheckOut: '16:00',
    latestCheckOut: '20:00',
    minWorkingHours: 6,
    maxWorkingHours: 12
  },
  
  // Attendance validation
  validateAttendance: async (userId, checkInTime, checkOutTime) => {
    const errors = [];
    
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingRecord = await Attendance.findOne({
      user: userId,
      date: today
    });
    
    if (existingRecord && existingRecord.checkIn) {
      errors.push('Already checked in today');
    }
    
    // Check working hours
    const checkInHour = checkInTime.getHours();
    if (checkInHour < 7 || checkInHour > 10) {
      errors.push('Check-in time is outside allowed hours');
    }
    
    // Check minimum working hours
    if (checkOutTime) {
      const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      if (workingHours < ATTENDANCE_POLICY_RULES.checkOutRules.minWorkingHours) {
        errors.push('Working hours below minimum requirement');
      }
    }
    
    return errors;
  }
};
```

#### 5.1.2 Attendance Calculation Rules
```javascript
const ATTENDANCE_CALCULATION_RULES = {
  // Working hours calculation
  calculateWorkingHours: (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    
    const startTime = new Date(checkIn);
    const endTime = new Date(checkOut);
    const diffMs = endTime - startTime;
    
    // Subtract lunch break if working more than 6 hours
    const workingHours = diffMs / (1000 * 60 * 60);
    const lunchBreakHours = workingHours > 6 ? 1 : 0;
    
    return Math.max(0, workingHours - lunchBreakHours);
  },
  
  // Overtime calculation
  calculateOvertime: (workingHours) => {
    const standardHours = 8;
    return Math.max(0, workingHours - standardHours);
  },
  
  // Attendance rate calculation
  calculateAttendanceRate: async (userId, startDate, endDate) => {
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const workingDays = await Attendance.countDocuments({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      checkIn: { $exists: true }
    });
    
    return (workingDays / totalDays) * 100;
  },
  
  // Late arrival tracking
  trackLateArrivals: async (userId, month) => {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const lateArrivals = await Attendance.countDocuments({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      checkIn: { $gte: new Date().setHours(9, 15, 0, 0) }
    });
    
    return lateArrivals;
  }
};
```

---

## 6. Notification and Escalation Rules

### 6.1 Notification Trigger Rules

#### 6.1.1 Notification Triggers
```javascript
const NOTIFICATION_TRIGGER_RULES = {
  // Task-related notifications
  taskNotifications: {
    taskAssigned: {
      trigger: 'task.created',
      recipients: ['assignee'],
      priority: 'medium',
      channels: ['in_app', 'email']
    },
    taskOverdue: {
      trigger: 'task.overdue',
      recipients: ['assignee', 'project_manager'],
      priority: 'high',
      channels: ['in_app', 'email', 'sms']
    },
    taskCompleted: {
      trigger: 'task.completed',
      recipients: ['project_manager', 'client'],
      priority: 'low',
      channels: ['in_app', 'email']
    }
  },
  
  // Project-related notifications
  projectNotifications: {
    projectDelayed: {
      trigger: 'project.delayed',
      recipients: ['project_manager', 'client', 'admin'],
      priority: 'high',
      channels: ['in_app', 'email']
    },
    projectCompleted: {
      trigger: 'project.completed',
      recipients: ['client', 'team_members'],
      priority: 'medium',
      channels: ['in_app', 'email']
    }
  },
  
  // Attendance notifications
  attendanceNotifications: {
    lateCheckIn: {
      trigger: 'attendance.late_checkin',
      recipients: ['employee', 'manager'],
      priority: 'low',
      channels: ['in_app']
    },
    missedCheckIn: {
      trigger: 'attendance.missed_checkin',
      recipients: ['employee', 'manager'],
      priority: 'medium',
      channels: ['in_app', 'email']
    }
  }
};
```

#### 6.1.2 Escalation Rules
```javascript
const ESCALATION_RULES = {
  // Task escalation
  taskEscalation: {
    overdueTasks: {
      threshold: '3_days',
      escalationPath: ['assignee', 'manager', 'admin'],
      actions: ['priority_increase', 'reassignment', 'client_notification']
    },
    blockedTasks: {
      threshold: '2_days',
      escalationPath: ['assignee', 'manager'],
      actions: ['unblock_assistance', 'resource_allocation']
    }
  },
  
  // Project escalation
  projectEscalation: {
    budgetOverrun: {
      threshold: '10_percent',
      escalationPath: ['project_manager', 'admin', 'client'],
      actions: ['budget_review', 'scope_adjustment', 'client_notification']
    },
    timelineDelay: {
      threshold: '1_week',
      escalationPath: ['project_manager', 'admin'],
      actions: ['timeline_review', 'resource_adjustment']
    }
  },
  
  // Client escalation
  clientEscalation: {
    paymentDelay: {
      threshold: '15_days',
      escalationPath: ['account_manager', 'admin'],
      actions: ['payment_reminder', 'service_suspension']
    },
    complaintReceived: {
      threshold: 'immediate',
      escalationPath: ['account_manager', 'admin'],
      actions: ['immediate_response', 'resolution_plan']
    }
  }
};
```

---

## 7. Business Calculation Rules

### 7.1 Financial Calculations

#### 7.1.1 Project Cost Calculations
```javascript
const FINANCIAL_CALCULATION_RULES = {
  // Project cost calculation
  calculateProjectCost: async (projectId) => {
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ project: projectId });
    
    let totalCost = 0;
    
    // Calculate labor costs
    for (const task of tasks) {
      const assignee = await User.findById(task.assignee);
      const hourlyRate = assignee.hourlyRate || 50; // Default rate
      const hours = task.actualHours || task.estimatedHours || 0;
      totalCost += hours * hourlyRate;
    }
    
    // Add project overhead
    const overheadRate = 0.15; // 15% overhead
    totalCost += totalCost * overheadRate;
    
    // Add project-specific costs
    if (project.additionalCosts) {
      totalCost += project.additionalCosts;
    }
    
    return totalCost;
  },
  
  // Budget variance calculation
  calculateBudgetVariance: (actualCost, budgetedCost) => {
    const variance = actualCost - budgetedCost;
    const variancePercentage = (variance / budgetedCost) * 100;
    
    return {
      variance,
      variancePercentage,
      status: variancePercentage > 10 ? 'over_budget' : 
              variancePercentage < -10 ? 'under_budget' : 'on_budget'
    };
  },
  
  // Profit margin calculation
  calculateProfitMargin: (revenue, cost) => {
    const profit = revenue - cost;
    const margin = (profit / revenue) * 100;
    
    return {
      profit,
      margin,
      status: margin > 20 ? 'healthy' : margin > 10 ? 'acceptable' : 'low'
    };
  }
};
```

### 7.2 Performance Metrics

#### 7.2.1 Team Performance Metrics
```javascript
const PERFORMANCE_METRICS_RULES = {
  // Individual performance calculation
  calculateIndividualPerformance: async (userId, period) => {
    const tasks = await Task.find({
      assignee: userId,
      createdAt: { $gte: period.start, $lte: period.end }
    });
    
    const metrics = {
      tasksCompleted: tasks.filter(task => task.status === 'completed').length,
      totalTasks: tasks.length,
      onTimeCompletion: 0,
      averageQuality: 0,
      productivity: 0
    };
    
    // Calculate on-time completion rate
    const onTimeTasks = tasks.filter(task => {
      if (!task.dueDate || task.status !== 'completed') return false;
      return new Date(task.completedAt) <= new Date(task.dueDate);
    }).length;
    
    metrics.onTimeCompletion = metrics.totalTasks > 0 ? 
      (onTimeTasks / metrics.totalTasks) * 100 : 0;
    
    // Calculate productivity (tasks per hour)
    const totalHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    metrics.productivity = totalHours > 0 ? metrics.tasksCompleted / totalHours : 0;
    
    return metrics;
  },
  
  // Team performance calculation
  calculateTeamPerformance: async (teamMembers, period) => {
    const teamMetrics = {
      totalTasks: 0,
      completedTasks: 0,
      averageCompletionTime: 0,
      teamProductivity: 0
    };
    
    for (const memberId of teamMembers) {
      const memberMetrics = await PERFORMANCE_METRICS_RULES.calculateIndividualPerformance(memberId, period);
      teamMetrics.totalTasks += memberMetrics.totalTasks;
      teamMetrics.completedTasks += memberMetrics.tasksCompleted;
    }
    
    teamMetrics.teamProductivity = teamMetrics.totalTasks > 0 ? 
      teamMetrics.completedTasks / teamMetrics.totalTasks : 0;
    
    return teamMetrics;
  }
};
```

---

## 8. Workflow Automation Rules

### 8.1 Automated Workflows

#### 8.1.1 Task Automation
```javascript
const TASK_AUTOMATION_RULES = {
  // Auto-assignment rules
  autoAssignment: {
    skillBased: true,
    workloadBased: true,
    availabilityBased: true,
    priorityBased: true
  },
  
  // Auto-escalation rules
  autoEscalation: {
    overdueTasks: {
      enabled: true,
      threshold: '3_days',
      action: 'notify_manager'
    },
    blockedTasks: {
      enabled: true,
      threshold: '2_days',
      action: 'escalate_priority'
    }
  },
  
  // Auto-completion rules
  autoCompletion: {
    allSubtasksCompleted: true,
    clientApproval: false,
    qualityCheck: true
  }
};
```

#### 8.1.2 Project Automation
```javascript
const PROJECT_AUTOMATION_RULES = {
  // Auto-progress updates
  autoProgressUpdate: {
    enabled: true,
    trigger: 'task_status_change',
    calculationMethod: 'weighted_average'
  },
  
  // Auto-milestone creation
  autoMilestoneCreation: {
    enabled: true,
    trigger: 'project_creation',
    milestoneTemplate: 'default'
  },
  
  // Auto-reporting
  autoReporting: {
    enabled: true,
    frequency: 'weekly',
    recipients: ['project_manager', 'client'],
    includeMetrics: ['progress', 'budget', 'timeline']
  }
};
```

---

## 9. Compliance and Audit Rules

### 9.1 Audit Trail Requirements

#### 9.1.1 Audit Logging Rules
```javascript
const AUDIT_RULES = {
  // Events to audit
  auditableEvents: [
    'user.login',
    'user.logout',
    'user.role_change',
    'task.create',
    'task.update',
    'task.delete',
    'project.create',
    'project.update',
    'client.create',
    'client.update',
    'attendance.checkin',
    'attendance.checkout',
    'data.export',
    'data.delete'
  ],
  
  // Audit log format
  auditLogFormat: {
    timestamp: 'ISO 8601',
    userId: 'User ID',
    action: 'Action performed',
    resource: 'Resource affected',
    resourceId: 'Resource ID',
    oldValues: 'Previous values',
    newValues: 'New values',
    ipAddress: 'Client IP',
    userAgent: 'Client user agent',
    sessionId: 'Session ID'
  },
  
  // Retention policy
  retentionPolicy: {
    auditLogs: '7_years',
    accessLogs: '1_year',
    errorLogs: '6_months'
  }
};
```

---

## 10. Rule Configuration and Management

### 10.1 Rule Configuration System
```javascript
const RULE_CONFIGURATION = {
  // Rule storage
  ruleStorage: {
    database: 'MongoDB',
    versioning: true,
    environmentSpecific: true
  },
  
  // Rule deployment
  ruleDeployment: {
    staging: 'test_rules',
    production: 'validated_rules',
    rollback: 'previous_version'
  },
  
  // Rule monitoring
  ruleMonitoring: {
    performance: true,
    accuracy: true,
    compliance: true
  }
};
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Active  
**Next Review**: March 2025
