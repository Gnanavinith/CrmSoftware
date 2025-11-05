import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function RoleSelect() {
  const navigate = useNavigate()

  const roles = [
    { key: 'employee', title: 'Employee', description: 'Access tasks and attendance' },
    { key: 'manager', title: 'Manager', description: 'Manage teams and projects' },
    { key: 'admin', title: 'Admin', description: 'Full system access and settings' },
  ]

  const handleChoose = (roleKey) => {
    try {
      sessionStorage.setItem('selectedRole', roleKey)
    } catch {}
    navigate(`/signin?role=${encodeURIComponent(roleKey)}`, { replace: true, state: { role: roleKey } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Choose how you want to sign in</h1>
          <p className="mt-2 text-gray-600">Select a role to continue to the sign-in page</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => handleChoose(r.key)}
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{r.title}</h3>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 group-hover:bg-indigo-100">
                  Select
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{r.description}</p>
              <div className="mt-6 h-40 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422A12.083 12.083 0 0112 20.5 12.083 12.083 0 015.84 10.578L12 14z" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">You can change your selection on the next screen.</p>
      </div>
    </div>
  )
}


