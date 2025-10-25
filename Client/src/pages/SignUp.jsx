import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import OTPVerification from '../components/OTPVerification'

export default function SignUp() {
  const { sendRegistrationOTP, verifyRegistrationOTP } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOTP, setShowOTP] = useState(false)
  const [registrationData, setRegistrationData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendRegistrationOTP({ name, email, password })
      setRegistrationData({ name, email, password })
      setShowOTP(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (otpData) => {
    try {
      await verifyRegistrationOTP({ ...registrationData, otp: otpData.otp })
      navigate('/dashboard')
    } catch (err) {
      console.error('OTP verification failed:', err)
    }
  }

  const handleBackToRegistration = () => {
    setShowOTP(false)
    setRegistrationData(null)
    setError('')
  }

  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        onVerificationSuccess={handleOTPVerification}
        onBack={handleBackToRegistration}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-gray-600 mb-6">Start managing your CRM today.</p>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send verification code'}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account? <Link to="/signin" className="text-blue-600 hover:text-blue-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}


