# OTP Verification Implementation Guide

## Overview
The CRM system now includes OTP (One-Time Password) verification during the sign-up process. Users must verify their email address with a 6-digit code before their account is created.

## Features Implemented

### Backend Features
1. **OTP Model** (`server/models/OTP.js`)
   - Stores OTP codes with expiration times
   - Automatic cleanup of expired OTPs
   - Tracks usage attempts for security

2. **Email Service** (`server/services/emailService.js`)
   - Sends OTP codes via email
   - Sends welcome emails after successful verification
   - Professional HTML email templates

3. **OTP Service** (`server/services/otpService.js`)
   - Generates secure 6-digit OTPs
   - Handles OTP verification
   - Prevents spam with rate limiting

4. **New API Endpoints**
   - `POST /api/auth/send-otp` - Send OTP to user's email
   - `POST /api/auth/verify-otp` - Verify OTP and complete registration
   - `POST /api/auth/resend-otp` - Resend OTP if needed

### Frontend Features
1. **OTP Verification Component** (`Client/src/components/OTPVerification.jsx`)
   - Clean, user-friendly interface
   - Real-time countdown timer
   - Resend functionality with rate limiting
   - Input validation and error handling

2. **Updated SignUp Flow**
   - Two-step registration process
   - Seamless transition between forms
   - Preserved user data during verification

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the `server` directory with the following variables:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Required for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
```

### 2. Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the app password in `EMAIL_PASS

### 3. Install Dependencies
The required `nodemailer` package has been installed. No additional setup needed.

## How It Works

### Registration Flow
1. **User fills out registration form** with name, email, and password
2. **System sends OTP** to the provided email address
3. **User enters OTP** in the verification screen
4. **System verifies OTP** and creates the user account
5. **Welcome email** is sent to the user

### Security Features
- **OTP Expiration**: OTPs expire after 10 minutes
- **Rate Limiting**: Prevents spam by limiting OTP requests
- **One-time Use**: Each OTP can only be used once
- **Attempt Tracking**: Monitors failed verification attempts

### User Experience
- **Intuitive Interface**: Clean, modern design
- **Real-time Feedback**: Loading states and error messages
- **Timer Display**: Shows remaining time for OTP validity
- **Resend Option**: Users can request new OTPs if needed
- **Back Navigation**: Users can return to registration form

## API Usage Examples

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","otp":"123456"}'
```

### Resend OTP
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

## Testing the Implementation

1. **Start the server**: `cd server && npm start`
2. **Start the client**: `cd Client && npm run dev`
3. **Navigate to sign-up page**
4. **Fill out the registration form**
5. **Check your email for the OTP**
6. **Enter the OTP to complete registration**

## Troubleshooting

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASS in .env file
- Check Gmail app password is correct
- Ensure 2-factor authentication is enabled

### OTP Not Working
- Check if OTP has expired (10-minute limit)
- Verify the OTP was entered correctly
- Check server logs for error messages

### Database Issues
- Ensure MongoDB connection is working
- Check if OTP collection is being created
- Verify database permissions

## Security Considerations

1. **Email Security**: Use secure email credentials
2. **Rate Limiting**: Implement additional rate limiting if needed
3. **OTP Storage**: OTPs are automatically cleaned up after expiration
4. **HTTPS**: Use HTTPS in production for secure communication

## Future Enhancements

- SMS OTP as alternative to email
- Voice call OTP for accessibility
- Multi-language email templates
- Advanced rate limiting and security features
- OTP analytics and monitoring

## Support

For issues or questions about the OTP implementation, check:
1. Server logs for backend errors
2. Browser console for frontend errors
3. Email delivery status in email service logs
4. Database connection and OTP collection status
