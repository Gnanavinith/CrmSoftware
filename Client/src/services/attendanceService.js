import { api } from './api'

export const attendanceService = {
  async getMyAttendance(startDate, endDate) {
    const res = await api.get('/api/attendance/my-attendance', { params: { startDate, endDate } })
    return res.data
  },
  async getAllAttendance(startDate, endDate) {
    const res = await api.get('/api/attendance/all', { params: { startDate, endDate } })
    return res.data
  },
  async checkIn({ note, location } = {}) {
    console.log('🌐 AttendanceService: Making check-in request to /api/attendance/checkin')
    console.log('🌐 Request data:', { note, location })
    console.log('🌐 Authorization header:', api.defaults.headers.common.Authorization)
    
    const res = await api.post('/api/attendance/checkin', { note, location })
    console.log('🌐 Check-in response status:', res.status)
    console.log('🌐 Check-in response data:', res.data)
    return res.data
  },
  async checkOut() {
    console.log('🌐 AttendanceService: Making check-out request to /api/attendance/checkout')
    console.log('🌐 Authorization header:', api.defaults.headers.common.Authorization)
    
    const res = await api.post('/api/attendance/checkout')
    console.log('🌐 Check-out response status:', res.status)
    console.log('🌐 Check-out response data:', res.data)
    return res.data
  }
}



