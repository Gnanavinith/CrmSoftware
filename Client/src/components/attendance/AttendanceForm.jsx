import React, { useMemo, useState } from 'react'
import { attendanceService } from '../../services/attendanceService'

export default function AttendanceForm({ onAttendanceUpdate, todayAttendance }) {
  const [note, setNote] = useState('')
  const isCheckedIn = useMemo(() => !!todayAttendance?.checkIn && !todayAttendance?.checkOut, [todayAttendance])

  const handleCheckIn = async () => {
    try {
      console.log('🔍 Attempting check-in with note:', note)
      const result = await attendanceService.checkIn({ note })
      console.log('✅ Check-in successful:', result)
      try {
        localStorage.setItem('onboardingComplete', 'true')
      } catch {}
      setNote('')
      onAttendanceUpdate?.()
    } catch (error) {
      console.error('❌ Check-in failed:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      alert('Check-in failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleCheckOut = async () => {
    try {
      console.log('🔍 Attempting check-out')
      const result = await attendanceService.checkOut()
      console.log('✅ Check-out successful:', result)
      onAttendanceUpdate?.()
    } catch (error) {
      console.error('❌ Check-out failed:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      alert('Check-out failed: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900">Today</h2>
      <p className="text-gray-600 mt-1">Check in when you start, and check out when you finish.</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What are you working on?"
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end space-x-3">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Check In
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              className="w-full md:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              Check Out
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <div>Check-in: {todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString() : '-'}</div>
        <div>Check-out: {todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString() : '-'}</div>
      </div>
    </div>
  )
}


