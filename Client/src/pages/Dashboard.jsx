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
    teamData: [],
    teamAttendance: [],
    teamStats: { totalEmployees: 0, presentToday: 0, absentToday: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async () => {
    try {
      console.log('🔍 Dashboard: Attempting check-in')
      const result = await attendanceService.checkIn({ note: 'Checked in from dashboard', location: 'Office' })
      console.log('✅ Dashboard: Check-in successful:', result)
      
      await fetchDashboardData()
      toast.success('Successfully checked in!')
    } catch (error) {
      console.error('❌ Dashboard: Check-in failed:', error)
      toast.error('Check-in failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleCheckOut = async () => {
    try {
      console.log('🔍 Dashboard: Attempting check-out')
      const result = await attendanceService.checkOut()
      console.log('✅ Dashboard: Check-out successful:', result)
      
      await fetchDashboardData()
      toast.success('Successfully checked out!')
    } catch (error) {
      console.error('❌ Dashboard: Check-out failed:', error)
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

      const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value.tasks || []) : []
      const projects = projectsRes.status === 'fulfilled' ? (projectsRes.value.projects || []) : []
      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value.clients || []) : []
      const attendance = attendanceRes.status === 'fulfilled' ? (attendanceRes.value.data || []) : []
      const teamMembers = teamRes.status === 'fulfilled' ? (teamRes.value.users || teamRes.value || []) : []
      const teamAttendance = teamAttendanceRes.status === 'fulfilled' ? (teamAttendanceRes.value.data || []) : []

      // Calculate metrics (same as before)
      const completedTasks = tasks.filter(task => task.status === 'completed').length
      const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length
      const overdueTasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
      ).length

      const activeProjects = projects.filter(project => project.status === 'active').length
      const completedProjects = projects.filter(project => project.status === 'completed').length

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

      const todayRecord = attendance.find(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0]
        return recordDate === today
      })
      
      let attendanceStatus = 'Not checked in'
      if (todayRecord) {
        if (todayRecord.checkIn && !todayRecord.checkOut) {
          attendanceStatus = 'Checked in'
        } else if (todayRecord.checkIn && todayRecord.checkOut) {
          attendanceStatus = 'Checked out'
        }
      }

      const recentTasks = tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
      
      const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)

      let teamStats = { totalEmployees: 0, presentToday: 0, absentToday: 0, completedToday: 0 }
      if (isAdminOrManager) {
        const todayAttendance = teamAttendance.filter(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0]
          const todayDate = new Date().toISOString().split('T')[0]
          return recordDate === todayDate
        })
        
        const presentToday = todayAttendance.filter(record => record.checkIn && !record.checkOut).length
        const completedToday = todayAttendance.filter(record => record.checkIn && record.checkOut).length
        const totalEmployees = teamMembers.length
        const absentToday = totalEmployees - presentToday - completedToday
        
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

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', trend }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
              trend.value > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, action, icon, color = 'blue' }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 cursor-pointer group hover:border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        <div className={`p-2 rounded-lg bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Checked in': return 'from-green-500 to-emerald-600';
      case 'Checked out': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-slate-600';
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Checked in':
        return (
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'Checked out':
        return (
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/30 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-blue-500 rounded-full animate-ping"></div>
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading your dashboard...</p>
            <p className="text-gray-400 text-sm mt-1">Getting everything ready for you</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>! Here's what's happening today.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-white/50 mt-4 lg:mt-0">
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={dashboardData.tasks.total}
            subtitle={`${dashboardData.tasks.completed} completed`}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            color="from-blue-500 to-cyan-600"
          />
          <StatCard
            title="Active Projects"
            value={dashboardData.projects.active}
            subtitle={`${dashboardData.projects.total} total`}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Active Clients"
            value={dashboardData.clients.active}
            subtitle={`${dashboardData.clients.total} total`}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            color="from-purple-500 to-violet-600"
          />
          <StatCard
            title="Today's Hours"
            value={dashboardData.attendance.todayHours}
            subtitle={`${dashboardData.attendance.thisWeekHours}h this week`}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="from-orange-500 to-amber-600"
          />
        </div>

        {/* Employee Check-in/Check-out Section */}
        {user?.role === 'employee' && (
          <div className={`bg-gradient-to-br ${getStatusColor(dashboardData.attendance.status)} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(dashboardData.attendance.status)}
                <div>
                  <h2 className="text-xl font-semibold">Today's Attendance</h2>
                  <p className="text-blue-100 mt-1">
                    Status: <span className="font-medium">{dashboardData.attendance.status}</span>
                  </p>
                  <p className="text-blue-100 text-sm mt-1">
                    {dashboardData.attendance.todayHours > 0 
                      ? `Hours worked today: ${dashboardData.attendance.todayHours}h`
                      : 'No hours logged today'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {(() => {
                  if (dashboardData.attendance.status === 'Not checked in') {
                    return (
                      <button
                        onClick={handleCheckIn}
                        className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm border border-white/20 hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Check In</span>
                      </button>
                    )
                  } else if (dashboardData.attendance.status === 'Checked in') {
                    return (
                      <button
                        onClick={handleCheckOut}
                        className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm border border-white/20 hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Check Out</span>
                      </button>
                    )
                  } else {
                    return (
                      <div className="text-blue-100 text-sm bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                        Work day completed ✅
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {dashboardData.tasks.overdue > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Overdue Tasks Alert</h3>
                <p className="text-red-100 mt-1">
                  You have {dashboardData.tasks.overdue} overdue task{dashboardData.tasks.overdue !== 1 ? 's' : ''} that need attention.
                </p>
              </div>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                View Tasks
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Tasks & Projects */}
          <div className="xl:col-span-2 space-y-6">
            {/* Recent Tasks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
                <p className="text-gray-600 text-sm mt-1">Your most recent tasks and activities</p>
              </div>
              <div className="p-6">
                {dashboardData.recentTasks.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentTasks.map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {task.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                          <div className="flex items-center mt-3 space-x-4">
                            {task.dueDate && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No recent tasks found</p>
                    <p className="text-gray-400 text-sm mt-1">Tasks you create will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                <p className="text-gray-600 text-sm mt-1">Your active and recent projects</p>
              </div>
              <div className="p-6">
                {dashboardData.recentProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.recentProjects.map((project) => (
                      <div key={project._id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{project.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No recent projects found</p>
                    <p className="text-gray-400 text-sm mt-1">Projects you create will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Team Overview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-gray-600 text-sm mt-1">Frequently used actions</p>
              </div>
              <div className="p-6 space-y-4">
                <QuickActionCard
                  title="Add New Task"
                  description="Create a new task for your projects"
                  icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                  color="blue"
                />
                <QuickActionCard
                  title="New Project"
                  description="Start a new project"
                  icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                  color="green"
                />
                <QuickActionCard
                  title="Add Client"
                  description="Register a new client"
                  icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                  color="purple"
                />
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Hours This Week</span>
                  <span className="font-semibold">{dashboardData.attendance.thisWeekHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Tasks Completed</span>
                  <span className="font-semibold">{dashboardData.tasks.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Team Members</span>
                  <span className="font-semibold">{dashboardData.teamMembers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Overview - Admin/Manager Only */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Team Overview</h2>
                <p className="text-gray-600 text-sm mt-1">Real-time team attendance and status</p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="p-6">
              {/* Team Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{dashboardData.teamStats.totalEmployees}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Employees</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{dashboardData.teamStats.presentToday}</div>
                  <div className="text-sm text-gray-600 mt-1">Present Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{dashboardData.teamStats.completedToday || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{dashboardData.teamStats.absentToday}</div>
                  <div className="text-sm text-gray-600 mt-1">Absent Today</div>
                </div>
              </div>
              
              {/* Team Members Grid */}
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
                  
                  return (
                    <div key={member._id} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isPresent && !isCheckedOut 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : isCheckedOut 
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          isPresent && !isCheckedOut 
                            ? 'bg-green-500' 
                            : isCheckedOut 
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{member.name}</h4>
                          <p className="text-xs text-gray-600 truncate">{member.position}</p>
                          <div className="mt-1 text-xs">
                            {isPresent && checkInTime && (
                              <span className="text-green-600">✓ In: {checkInTime}</span>
                            )}
                            {isCheckedOut && checkOutTime && (
                              <span className="text-blue-600 ml-2">✓ Out: {checkOutTime}</span>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isPresent && !isCheckedOut 
                            ? 'bg-green-100 text-green-800' 
                            : isCheckedOut 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isPresent && !isCheckedOut ? 'Present' : isCheckedOut ? 'Completed' : 'Absent'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}