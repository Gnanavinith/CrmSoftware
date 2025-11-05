import React from 'react'

export default function Reports() {
  const summary = [
    { label: 'Total Clients', value: 42 },
    { label: 'Active Projects', value: 18 },
    { label: 'Open Tasks', value: 127 },
    { label: 'Attendance Today', value: '92%' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <div className="space-x-3">
          <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Export CSV</button>
          <button className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">Export PDF</button>
        </div>
      </div>

      <p className="text-gray-600 mt-2">Overview of key metrics and downloadable reports.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-600">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Projects by Status</h2>
          <div className="mt-4 h-64 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-500">
            Chart placeholder
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Tasks Completion Trend</h2>
          <div className="mt-4 h-64 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600">
            Chart placeholder
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <div className="text-sm text-gray-500">Last 7 days</div>
        </div>
        <div className="mt-4 divide-y divide-gray-100">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <span className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 mr-3">{i}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">Sample report event {i}</div>
                  <div className="text-xs text-gray-500">Details and metadata for event {i}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">2h ago</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


