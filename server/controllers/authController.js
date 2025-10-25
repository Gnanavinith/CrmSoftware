import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { createAndSendOTP, verifyOTP, resendOTP } from '../services/otpService.js'
import { sendWelcomeEmail } from '../services/emailService.js'

function signToken(user) {
  return jwt.sign(
    { sub: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  )
}

// Step 1: Send OTP for registration
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    
    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })
    
    // Send OTP
    const otpResult = await createAndSendOTP(email)
    
    if (!otpResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP', error: otpResult.error })
    }
    
    return res.status(200).json({ 
      message: 'OTP sent successfully', 
      expiresAt: otpResult.expiresAt 
    })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message })
  }
}

// Step 2: Verify OTP and complete registration
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body
    if (!name || !email || !password || !otp) return res.status(400).json({ message: 'Missing fields' })
    
    // Verify OTP
    const otpResult = await verifyOTP(email, otp)
    if (!otpResult.success) {
      return res.status(400).json({ message: otpResult.error })
    }
    
    // Create user
    const user = await User.create({ name, email, password })
    const token = signToken(user)
    
    // Send welcome email
    await sendWelcomeEmail(email, name)
    
    return res.status(201).json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        position: user.position 
      } 
    })
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message })
  }
}

// Resend OTP
export const resendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })
    
    const result = await resendOTP(email)
    
    if (!result.success) {
      return res.status(400).json({ message: result.error })
    }
    
    return res.status(200).json({ 
      message: 'OTP resent successfully',
      expiresAt: result.expiresAt 
    })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to resend OTP', error: err.message })
  }
}

// Legacy register endpoint (for backward compatibility)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })
    const user = await User.create({ name, email, password })
    const token = signToken(user)
    return res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, position: user.position } })
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = signToken(user)
    return res.status(200).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, position: user.position } })
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message })
  }
}



