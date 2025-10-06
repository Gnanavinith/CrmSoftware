import React, { useMemo } from 'react'

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '-'
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export default function AttendanceList({ attendance }) {
  const rows = useMemo(() => attendance || [], [attendance])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Attendance Records</h2>
        <span className="text-sm text-gray-500">{rows.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500 text-sm" colSpan={5}>No attendance records found.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{new Date(r.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDuration(r.durationMinutes)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


