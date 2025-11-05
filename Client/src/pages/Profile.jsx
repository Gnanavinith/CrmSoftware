
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const roleColor = (role) => {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return 'bg-red-50 text-red-700'
      case 'manager':
        return 'bg-amber-50 text-amber-700'
      default:
        return 'bg-indigo-50 text-indigo-700'
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      <p className="text-gray-600 mt-2">Your account information</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl font-bold text-indigo-700">
                {getInitials(user?.name)}
              </div>
              <div className="ml-4">
                <div className="text-lg font-semibold text-gray-900">{user?.name || 'Unknown User'}</div>
                <div className="text-sm text-gray-600">{user?.email || 'unknown@example.com'}</div>
                {user?.role && (
                  <div className={`inline-flex mt-2 rounded-full px-3 py-1 text-xs font-medium ${roleColor(user.role)}`}>
                    {user.role}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-6 w-full justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Account details</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600">Full name</label>
                <div className="mt-1 rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 bg-gray-50">
                  {user?.name || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <div className="mt-1 rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 bg-gray-50 break-all">
                  {user?.email || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Role</label>
                <div className="mt-1 rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 bg-gray-50">
                  {user?.role || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">User ID</label>
                <div className="mt-1 rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 bg-gray-50 break-all">
                  {user?._id || user?.id || '—'}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900">Security</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-left"
                >
                  Change password
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-left"
                >
                  Manage sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



