import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function signToken(user) {
  return jwt.sign(
    { sub: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  )
}

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



