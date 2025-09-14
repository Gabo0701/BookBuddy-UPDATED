# Authentication Guide

BookBuddy uses a secure JWT-based authentication system with refresh tokens, email verification codes, and comprehensive security measures.

## Overview

The authentication system includes:
- JWT access tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 7 days, stored as HTTP-only cookies)
- Password hashing with bcrypt
- **6-digit email verification codes** (NEW)
- Password reset functionality
- Email reminder for forgotten usernames
- **Account deletion with audit trail** (NEW)

## Authentication Flow

### 1. User Registration

```javascript
// Frontend
const response = await register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'SecurePass123!'
});
```

**Process:**
1. User submits registration form
2. Server validates input (username uniqueness, email format, password strength)
3. Password is hashed with bcrypt (12 rounds)
4. User record is created in database
5. **User is redirected to email verification page** (NEW)
6. **6-digit verification code is sent via Mailtrap** (NEW)
7. **User enters code to complete login** (NEW)

### 2. User Login with Email Verification

```javascript
// Frontend - Step 1: Navigate to verification
navigate('/login-verification', { 
  state: { emailOrUsername: 'john@example.com' } 
});

// Step 2: Send verification code
const response = await sendLoginVerification('john@example.com');

// Step 3: Verify code
const authData = await verifyLoginCode('john@example.com', '123456');
```

**Process:**
1. User enters email/username on login page
2. **User is redirected to verification page** (NEW)
3. **6-digit code is generated and sent via email** (NEW)
4. **User enters verification code** (NEW)
5. Server validates code (unused, not expired)
6. Old refresh tokens are revoked (logout everywhere)
7. New JWT tokens are generated
8. Refresh token is stored as HTTP-only cookie
9. Access token is returned to client
10. **User is redirected to home page** (NEW)

### 3. Token Refresh

```javascript
// Frontend (automatic)
const response = await refresh();
```

**Process:**
1. Client detects expired access token
2. Refresh token is sent via HTTP-only cookie
3. Server validates refresh token
4. Old refresh token is revoked
5. New tokens are generated
6. New refresh token is stored as cookie
7. New access token is returned

### 4. Protected Route Access

```javascript
// Frontend
const user = await whoAmI(accessToken);
```

**Process:**
1. Client includes access token in Authorization header
2. Server validates JWT signature and expiration
3. User ID is extracted from token payload
4. User data is returned or endpoint is accessed

## Email Verification System

### Send Login Verification Code (NEW)
```javascript
await sendLoginVerification('user@example.com');
```

### Verify Login Code (NEW)
```javascript
const authData = await verifyLoginCode('user@example.com', '123456');
```

**6-Digit Code Process:**
1. User requests verification code
2. **6-digit random code is generated**
3. **Code is stored in MongoDB with 10-minute expiration**
4. **Professional HTML email is sent via Mailtrap**
5. User enters code on verification page
6. Server validates code (exists, unused, not expired)
7. **Code is marked as used to prevent reuse**
8. User's `isEmailVerified` flag is set to true
9. **JWT tokens are generated and user is logged in**

### Legacy Email Verification (Still Available)
```javascript
await requestEmailVerification(accessToken);
await verifyEmail(token);
```

## Password Reset

### Request Reset
```javascript
await requestPasswordReset('user@example.com');
```

### Reset Password
```javascript
await resetPassword(token, 'NewSecurePass123!');
```

**Process:**
1. User requests password reset with email
2. Unique token is generated and stored (30-minute expiration)
3. Email is sent with reset link
4. User clicks link, enters new password
5. Password is validated and hashed
6. All refresh tokens are revoked (logout everywhere)

## Email Reminder

### Request Email Reminder
```javascript
await requestEmailReminder('username');
```

**Process:**
1. User requests email reminder with username
2. Server finds user by username
3. Email is sent with user's email address
4. Security: Always returns success message regardless of username existence

## Account Deletion System (NEW)

```javascript
// Request account deletion with reason
const response = await api.post('/v1/auth/delete-request', { 
  reason: 'No longer using the app' 
});
```

**Account Deletion Process:**
1. **Two-step confirmation modal** with reason selection
2. **Predefined reasons** + custom input option
3. **Final warning** showing what will be deleted
4. **Complete data cleanup**: User, books, tokens, auth events
5. **Audit trail**: Deletion request stored in MongoDB
6. **Automatic logout**: Session cleared after deletion
7. **Redirect to home page**

## Security Features

### Token Security
- **Access tokens**: Short-lived (15 minutes), stored in memory
- **Refresh tokens**: HTTP-only cookies, secure flag in production
- **Token rotation**: New refresh token on each refresh
- **Automatic revocation**: Old tokens invalidated on login

### Password Security
- **Bcrypt hashing**: 12 rounds for strong protection
- **Password validation**: Enforced complexity requirements
- **Rate limiting**: Prevents brute force attacks

### Email Verification Security (NEW)
- **6-digit random codes**: Cryptographically secure generation
- **Time-based expiration**: Codes expire after 10 minutes
- **Single-use codes**: Marked as used after successful verification
- **MongoDB TTL indexes**: Automatic cleanup of expired codes
- **Rate limiting**: Applied to verification endpoints

### Request Security
- **CSRF protection**: Validates CSRF tokens on state-changing operations
- **Rate limiting**: Different limits for different endpoints
- **Input validation**: Comprehensive validation and sanitization
- **Security headers**: Helmet.js for security headers

### Database Security
- **Mongoose sanitization**: Prevents NoSQL injection
- **Audit logging**: All authentication events are logged
- **Token cleanup**: Expired tokens are cleaned up automatically
- **Account deletion audit**: Deletion requests stored before processing

## Modern Verification UI (NEW)
- **Gradient background** with professional design
- **Card-based layout** with rounded corners and shadows
- **Large code input** with monospace font and letter spacing
- **Real-time validation** and button state changes
- **Smooth transitions** and hover effects
- **Mobile responsive** design

## API Endpoints

### New Endpoints Added:
```
POST /api/v1/auth/send-login-verification
POST /api/v1/auth/verify-login-code
POST /api/v1/auth/delete-request
```

### Updated User Flow:
1. **Registration** → Email Verification → Home Page
2. **Login** → Email Verification → Home Page
3. **Account Deletion** → Confirmation → Logout → Home Page

## Database Collections

### New Collections Added:
- **VerificationCode**: Stores 6-digit codes with expiration
- **AccountDeletionRequest**: Audit trail for account deletions

### Updated Collections:
- **User**: Enhanced with email verification status
- **AuthEvent**: Logs verification and deletion events

## Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your_strong_secret_key
JWT_REFRESH_SECRET=your_strong_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
MAIL_FROM="BookBuddy <no-reply@bookbuddy.local>"

# Token Lifetimes
EMAIL_VERIFY_TTL_HOURS=24
PASSWORD_RESET_TTL_MINUTES=30
```

## Best Practices

1. **Store access tokens in memory only** (not localStorage)
2. **Use HTTP-only cookies for refresh tokens**
3. **Implement automatic token refresh**
4. **Handle authentication errors gracefully**
5. **Validate user input on both client and server**
6. **Use HTTPS in production**
7. **Implement proper logout (clear tokens)**
8. **Monitor authentication events**
9. **Use 6-digit codes for better UX** (NEW)
10. **Implement proper session cleanup on account deletion** (NEW)

## Development Features

- **Development bypass code**: `123456` for testing
- **Mailtrap integration**: All emails visible in sandbox
- **Comprehensive error handling**: User-friendly messages
- **Audit logging**: All auth events tracked in MongoDB

## Error Handling

### Common Authentication Errors
- `401 Unauthorized`: Invalid or expired token/code
- `403 Forbidden`: Valid token but insufficient permissions
- `409 Conflict`: Username or email already exists
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded

### Frontend Error Handling
```javascript
try {
  const response = await verifyLoginCode(email, code);
} catch (error) {
  if (error.message.includes('expired')) {
    // Show resend code option
  } else {
    // Show error message
  }
}
```