import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'appSettings'

export default function Settings() {
  const [theme, setTheme] = useState('system')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [timezone, setTimezone] = useState('UTC')
  const [language, setLanguage] = useState('en')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.theme) setTheme(parsed.theme)
        if (typeof parsed.emailNotifications === 'boolean') setEmailNotifications(parsed.emailNotifications)
        if (typeof parsed.pushNotifications === 'boolean') setPushNotifications(parsed.pushNotifications)
        if (parsed.timezone) setTimezone(parsed.timezone)
        if (parsed.language) setLanguage(parsed.language)
        if (parsed.savedAt) setSavedAt(parsed.savedAt)
      }
    } catch {}
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const now = new Date().toISOString()
    const payload = { theme, emailNotifications, pushNotifications, timezone, language, savedAt: now }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setSavedAt(now)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
      <p className="text-gray-600 mt-2">Customize your preferences. These are saved on this device.</p>
      {savedAt && (
        <p className="text-xs text-gray-400 mt-1">Last saved: {new Date(savedAt).toLocaleString()}</p>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Appearance</h2>
          <p className="text-sm text-gray-600 mt-1">Choose your theme preference.</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['light','dark','system'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTheme(opt)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  theme === opt
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">Manage how you receive updates.</p>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email notifications</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Push notifications</span>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </label>
          </div>
        </div>

        {/* Localization */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Localization</h2>
          <p className="text-sm text-gray-600 mt-1">Language and timezone.</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Data & Privacy</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your stored settings.</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem(STORAGE_KEY) } catch {}
                setSavedAt('')
              }}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear saved preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


