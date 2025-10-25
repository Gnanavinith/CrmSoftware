import nodemailer from 'nodemailer'

// Create transporter (using Gmail for demo - in production use proper SMTP)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  })
}

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Verify Your Email - CRM Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Verification</h2>
          <p>Thank you for registering with our CRM system!</p>
          <p>Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ OTP email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error sending OTP email:', error)
    return { success: false, error: error.message }
  }
}

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to CRM System!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to CRM System!</h2>
          <p>Hello ${name},</p>
          <p>Your account has been successfully created and verified!</p>
          <p>You can now access all the features of our CRM system.</p>
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Next Steps:</strong><br>
              • Complete your profile setup<br>
              • Explore the dashboard<br>
              • Start managing your tasks and clients
            </p>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Welcome email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}
