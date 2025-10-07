import { api } from './api'

export const attendanceService = {
  async getMyAttendance(startDate, endDate) {
    const res = await api.get('/api/attendance/my-attendance', { params: { startDate, endDate } })
    return res.data
  },
  async checkIn({ note, location } = {}) {
    const res = await api.post('/api/attendance/check-in', { note, location })
    return res.data
  },
  async checkOut() {
    const res = await api.post('/api/attendance/check-out')
    return res.data
  }
}



