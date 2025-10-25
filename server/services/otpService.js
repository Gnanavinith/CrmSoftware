import crypto from 'crypto'
import OTP from '../models/OTP.js'
import { sendOTPEmail } from './emailService.js'

// Generate a 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString()
}

// Create and send OTP
export const createAndSendOTP = async (email) => {
  try {
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email })
    
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    
    // Save OTP to database
    const otpRecord = await OTP.create({
      email,
      otp,
      expiresAt
    })
    
    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp)
    
    if (!emailResult.success) {
      // If email fails, delete the OTP record
      await OTP.findByIdAndDelete(otpRecord._id)
      throw new Error('Failed to send OTP email')
    }
    
    return {
      success: true,
      message: 'OTP sent successfully',
      expiresAt: expiresAt.toISOString()
    }
  } catch (error) {
    console.error('❌ Error creating/sending OTP:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })
    
    if (!otpRecord) {
      // Increment attempts for security
      await OTP.updateOne(
        { email, isUsed: false },
        { $inc: { attempts: 1 } }
      )
      return {
        success: false,
        error: 'Invalid or expired OTP'
      }
    }
    
    // Mark OTP as used
    await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true })
    
    return {
      success: true,
      message: 'OTP verified successfully'
    }
  } catch (error) {
    console.error('❌ Error verifying OTP:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Resend OTP
export const resendOTP = async (email) => {
  try {
    // Check if there's a recent OTP request (prevent spam)
    const recentOTP = await OTP.findOne({
      email,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // 1 minute ago
    })
    
    if (recentOTP) {
      return {
        success: false,
        error: 'Please wait before requesting another OTP'
      }
    }
    
    return await createAndSendOTP(email)
  } catch (error) {
    console.error('❌ Error resending OTP:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
