import React, { useState, useEffect } from 'react';
import AttendanceForm from '../components/attendance/AttendanceForm';
import AttendanceList from '../components/attendance/AttendanceList';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../contexts/AuthContext';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getMyAttendance(
        dateRange.startDate,
        dateRange.endDate
      );
      setAttendance(response.data || []);
      
      const today = new Date().toDateString();
      const todayRecord = response.data?.find(record => 
        new Date(record.date).toDateString() === today
      );
      setTodayAttendance(todayRecord || null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateRange]);

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    const present = monthAttendance.filter(record => record.checkIn && record.checkOut).length;
    const workingDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    return {
      present,
      workingDays,
      attendanceRate: ((present / workingDays) * 100).toFixed(1)
    };
  };

  const monthlyStats = getMonthlyStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'from-green-500 to-emerald-600';
      case 'Working': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return (
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'Working':
        return (
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const currentStatus = todayAttendance ? 
    (todayAttendance.checkOut ? 'Present' : 'Working') : 
    'Not Checked In';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Attendance
                </h1>
                <p className="text-gray-600 text-lg mt-1">Track and manage your daily attendance</p>
              </div>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Today's Status Card */}
          <div className={`bg-gradient-to-br ${getStatusColor(currentStatus)} rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today's Status</p>
                <p className="text-2xl font-bold mt-2">{currentStatus}</p>
                <p className="text-blue-100/80 text-sm mt-1">
                  {todayAttendance ? 
                    (todayAttendance.checkOut ? 'Completed for today' : 'Currently working') : 
                    'Ready to check in'
                  }
                </p>
              </div>
              {getStatusIcon(currentStatus)}
            </div>
          </div>

          {/* Present Days Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Present This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {monthlyStats.present}<span className="text-gray-400 text-lg">/{monthlyStats.workingDays}</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(monthlyStats.present / monthlyStats.workingDays) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Attendance Rate Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {monthlyStats.attendanceRate}%
                </p>
                <p className="text-gray-500 text-sm mt-1">Monthly performance</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Records Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Records</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {attendance.length}
                </p>
                <p className="text-gray-500 text-sm mt-1">In selected period</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Attendance Form Section */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <AttendanceForm 
                onAttendanceUpdate={fetchAttendance}
                todayAttendance={todayAttendance}
              />
            </div>
          </div>

          {/* Attendance List Section */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
                <p className="text-gray-600 mt-1">Your attendance records for the selected period</p>
              </div>
              
              {loading ? (
                <div className="p-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-blue-500 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading attendance records...</p>
                    <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
                  </div>
                </div>
              ) : (
                <AttendanceList attendance={attendance} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;