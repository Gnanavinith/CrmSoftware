
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import { clientService } from '../services/clientService'
import { attendanceService } from '../services/attendanceService'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    tasks: { total: 0, completed: 0, pending: 0, overdue: 0 },
    projects: { total: 0, active: 0, completed: 0 },
    clients: { total: 0, active: 0 },
    attendance: { todayHours: 0, thisWeekHours: 0, status: 'Not checked in' },
    recentTasks: [],
    recentProjects: [],
    teamMembers: 0,
    teamData: [], // Team members details
    teamAttendance: [], // All team attendance
    teamStats: { totalEmployees: 0, presentToday: 0, absentToday: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh dashboard data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async () => {
    try {
      console.log('🔍 Dashboard: Attempting check-in')
      console.log('🔍 Dashboard: User role:', user?.role)
      console.log('🔍 Dashboard: User data:', user)
      const result = await attendanceService.checkIn({ note: 'Checked in from dashboard', location: 'Office' })
      console.log('✅ Dashboard: Check-in successful:', result)
      
      // Refresh dashboard data immediately to show updated status
      await fetchDashboardData()
      
      // Show success message
      toast.success('Successfully checked in!')
    } catch (error) {
      console.error('❌ Dashboard: Check-in failed:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      toast.error('Check-in failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleCheckOut = async () => {
    try {
      console.log('🔍 Dashboard: Attempting check-out')
      const result = await attendanceService.checkOut()
      console.log('✅ Dashboard: Check-out successful:', result)
      
      // Refresh dashboard data immediately to show updated status
      await fetchDashboardData()
      
      // Show success message
      toast.success('Successfully checked out!')
    } catch (error) {
      console.error('❌ Dashboard: Check-out failed:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      toast.error('Check-out failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]

      // Fetch data based on user role
      const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'
      
      const [
        tasksRes,
        projectsRes,
        clientsRes,
        attendanceRes,
        teamRes,
        teamAttendanceRes
      ] = await Promise.allSettled([
        taskService.getTasks(),
        projectService.getProjects(),
        clientService.getClients(),
        attendanceService.getMyAttendance(weekStartStr, today),
        userService.getTeamMembers(),
        isAdminOrManager ? attendanceService.getAllAttendance(weekStartStr, today) : Promise.resolve({ data: [] })
      ])

      // Handle individual API responses with error checking
      const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value.tasks || []) : []
      const projects = projectsRes.status === 'fulfilled' ? (projectsRes.value.projects || []) : []
      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value.clients || []) : []
      const attendance = attendanceRes.status === 'fulfilled' ? (attendanceRes.value.data || []) : []
      console.log('📊 Attendance data:', attendance)
      console.log('📊 Attendance response:', attendanceRes)
      const teamMembers = teamRes.status === 'fulfilled' ? (teamRes.value.users || teamRes.value || []) : []
      const teamAttendance = teamAttendanceRes.status === 'fulfilled' ? (teamAttendanceRes.value.data || []) : []

      // Log any failed requests for debugging
      if (tasksRes.status === 'rejected') console.warn('Failed to fetch tasks:', tasksRes.reason)
      if (projectsRes.status === 'rejected') console.warn('Failed to fetch projects:', projectsRes.reason)
      if (clientsRes.status === 'rejected') console.warn('Failed to fetch clients:', clientsRes.reason)
      if (attendanceRes.status === 'rejected') console.warn('Failed to fetch attendance:', attendanceRes.reason)
      if (teamRes.status === 'rejected') console.warn('Failed to fetch team members:', teamRes.reason)
      if (teamAttendanceRes.status === 'rejected') console.warn('Failed to fetch team attendance:', teamAttendanceRes.reason)

      // Calculate task metrics
      const completedTasks = tasks.filter(task => task.status === 'completed').length
      const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length
      const overdueTasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
      ).length

      // Calculate project metrics
      const activeProjects = projects.filter(project => project.status === 'active').length
      const completedProjects = projects.filter(project => project.status === 'completed').length

      // Calculate attendance metrics
      const todayAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0]
        return recordDate === today && record.checkOut
      })
      const todayHours = todayAttendance.reduce((total, record) => {
        if (record.checkIn && record.checkOut) {
          const checkIn = new Date(record.checkIn)
          const checkOut = new Date(record.checkOut)
          return total + (checkOut - checkIn) / (1000 * 60 * 60)
        }
        return total
      }, 0)

      const thisWeekHours = attendance.reduce((total, record) => {
        if (record.checkIn && record.checkOut) {
          const checkIn = new Date(record.checkIn)
          const checkOut = new Date(record.checkOut)
          return total + (checkOut - checkIn) / (1000 * 60 * 60)
        }
        return total
      }, 0)

      // Get current attendance status
      const todayRecord = attendance.find(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0]
        return recordDate === today
      })
      console.log('📊 Today record:', todayRecord)
      console.log('📊 Today date:', today)
      let attendanceStatus = 'Not checked in'
      if (todayRecord) {
        if (todayRecord.checkIn && !todayRecord.checkOut) {
          attendanceStatus = 'Checked in'
        } else if (todayRecord.checkIn && todayRecord.checkOut) {
          attendanceStatus = 'Checked out'
        }
      }
      console.log('📊 Calculated attendance status:', attendanceStatus)

      // Get recent tasks and projects
      const recentTasks = tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
      
      const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)

      // Calculate team statistics (for admin/manager)
      let teamStats = { totalEmployees: 0, presentToday: 0, absentToday: 0, completedToday: 0 }
      if (isAdminOrManager) {
        const todayAttendance = teamAttendance.filter(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0]
          const todayDate = new Date().toISOString().split('T')[0]
          return recordDate === todayDate
        })
        
        console.log('📊 Team attendance for today:', todayAttendance)
        console.log('📊 Team members:', teamMembers.map(m => ({ name: m.name, id: m._id })))
        
        const presentToday = todayAttendance.filter(record => record.checkIn && !record.checkOut).length
        const completedToday = todayAttendance.filter(record => record.checkIn && record.checkOut).length
        const totalEmployees = teamMembers.length
        const absentToday = totalEmployees - presentToday - completedToday
        
        console.log('📊 Team stats calculation:', { presentToday, completedToday, absentToday, totalEmployees })
        
        teamStats = { totalEmployees, presentToday, absentToday, completedToday }
      }

      setDashboardData({
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks
        },
        projects: {
          total: projects.length,
          active: activeProjects,
          completed: completedProjects
        },
        clients: {
          total: clients.length,
          active: clients.filter(client => client.status === 'active').length
        },
        attendance: {
          todayHours: Math.round(todayHours * 100) / 100,
          thisWeekHours: Math.round(thisWeekHours * 100) / 100,
          status: attendanceStatus
        },
        recentTasks,
        recentProjects,
        teamMembers: teamMembers.length,
        teamData: teamMembers,
        teamAttendance: teamAttendance,
        teamStats
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, action, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={dashboardData.tasks.total}
          subtitle={`${dashboardData.tasks.completed} completed, ${dashboardData.tasks.pending} pending`}
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={dashboardData.projects.active}
          subtitle={`${dashboardData.projects.total} total projects`}
          icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          color="green"
        />
        <StatCard
          title="Active Clients"
          value={dashboardData.clients.active}
          subtitle={`${dashboardData.clients.total} total clients`}
          icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          color="purple"
        />
        <StatCard
          title="Today's Hours"
          value={dashboardData.attendance.todayHours}
          subtitle={`Status: ${dashboardData.attendance.status}`}
          icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="orange"
        />
      </div>

      {/* Employee Check-in/Check-out Section */}
      {user?.role === 'employee' && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Today's Attendance</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    dashboardData.attendance.status === 'Checked in' ? 'bg-green-500' :
                    dashboardData.attendance.status === 'Checked out' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}></div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Status: {dashboardData.attendance.status}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dashboardData.attendance.todayHours > 0 
                        ? `Hours worked today: ${dashboardData.attendance.todayHours}h`
                        : 'No hours logged today'
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {(() => {
                  console.log('🔍 Dashboard: Rendering button section')
                  console.log('🔍 Dashboard: Current status:', dashboardData.attendance.status)
                  console.log('🔍 Dashboard: User role:', user?.role)
                  
                  if (dashboardData.attendance.status === 'Not checked in') {
                    console.log('🔍 Dashboard: Rendering Check In button')
                    return (
                      <button
                        onClick={handleCheckIn}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Check In</span>
                      </button>
                    )
                  } else if (dashboardData.attendance.status === 'Checked in') {
                    console.log('🔍 Dashboard: Rendering Check Out button')
                    return (
                      <button
                        onClick={handleCheckOut}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Check Out</span>
                      </button>
                    )
                  } else {
                    console.log('🔍 Dashboard: Rendering completed message')
                    return (
                      <div className="text-sm text-gray-500">
                        Work day completed
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {dashboardData.tasks.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Overdue Tasks Alert
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You have {dashboardData.tasks.overdue} overdue task{dashboardData.tasks.overdue !== 1 ? 's' : ''} that need attention.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
            </div>
            <div className="p-6">
              {dashboardData.recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent tasks found</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Projects */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <QuickActionCard
                title="Add New Task"
                description="Create a new task for your projects"
                icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                color="blue"
              />
              <QuickActionCard
                title="New Project"
                description="Start a new project"
                icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                color="green"
              />
              <QuickActionCard
                title="Add Client"
                description="Register a new client"
                icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                color="purple"
              />
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
            </div>
            <div className="p-6">
              {dashboardData.recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentProjects.map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent projects found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Overview - Admin/Manager Only */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Team Overview</h2>
            <button
              onClick={fetchDashboardData}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dashboardData.teamStats.totalEmployees}</div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dashboardData.teamStats.presentToday}</div>
                <div className="text-sm text-gray-600">Present Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{dashboardData.teamStats.completedToday || 0}</div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{dashboardData.teamStats.absentToday}</div>
                <div className="text-sm text-gray-600">Absent Today</div>
              </div>
            </div>
            
            {/* Team Members List */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.teamData.map((member) => {
                  const todayRecord = dashboardData.teamAttendance.find(record => {
                    const recordDate = new Date(record.date).toISOString().split('T')[0]
                    const todayDate = new Date().toISOString().split('T')[0]
                    const userMatch = record.user?._id === member._id || record.user === member._id
                    return userMatch && recordDate === todayDate
                  })
                  const isPresent = todayRecord && todayRecord.checkIn && !todayRecord.checkOut
                  const isCheckedOut = todayRecord && todayRecord.checkIn && todayRecord.checkOut
                  const checkInTime = todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : null
                  const checkOutTime = todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : null
                  
                  // Debug logging for gnanavinith specifically
                  if (member.name.toLowerCase().includes('gnanavinith') || member.email.includes('gnanavinith')) {
                    console.log('🔍 Gnanavinith status:', {
                      name: member.name,
                      email: member.email,
                      todayRecord,
                      isPresent,
                      isCheckedOut,
                      checkInTime,
                      checkOutTime
                    })
                  }
                  
                  return (
                    <div key={member._id} className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                      isPresent && !isCheckedOut 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : isCheckedOut 
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                        isPresent && !isCheckedOut 
                          ? 'bg-green-500' 
                          : isCheckedOut 
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                        <p className="text-xs text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500">{member.position}</p>
                        {isPresent && (
                          <div className="mt-1 text-xs">
                            {checkInTime && (
                              <span className="text-green-600">✓ Checked in: {checkInTime}</span>
                            )}
                            {checkOutTime && (
                              <span className="text-blue-600 ml-2">✓ Checked out: {checkOutTime}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-2 flex flex-col items-end">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isPresent && !isCheckedOut 
                            ? 'bg-green-100 text-green-800' 
                            : isCheckedOut 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isPresent && !isCheckedOut ? 'Present' : isCheckedOut ? 'Completed' : 'Absent'}
                        </span>
                        {isPresent && todayRecord?.durationMinutes && (
                          <span className="text-xs text-gray-500 mt-1">
                            {Math.floor(todayRecord.durationMinutes / 60)}h {todayRecord.durationMinutes % 60}m
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Weekly Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.attendance.thisWeekHours}h</div>
              <div className="text-sm text-gray-600">Hours This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardData.tasks.completed}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dashboardData.teamMembers}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



