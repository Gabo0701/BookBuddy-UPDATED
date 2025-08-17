# Authentication Guide

BookBuddy uses a secure JWT-based authentication system with refresh tokens and comprehensive security measures.

## Overview

The authentication system includes:
- JWT access tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 7 days, stored as HTTP-only cookies)
- Password hashing with bcrypt
- Email verification
- Password reset functionality
- Email reminder for forgotten usernames

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
5. JWT tokens are generated
6. Refresh token is stored as HTTP-only cookie
7. Access token is returned to client

### 2. User Login

```javascript
// Frontend
const response = await login({
  emailOrUsername: 'john@example.com',
  password: 'SecurePass123!'
});
```

**Process:**
1. User submits login credentials
2. Server finds user by email or username
3. Password is verified against stored hash
4. Old refresh tokens are revoked (logout everywhere)
5. New JWT tokens are generated
6. Refresh token is stored as HTTP-only cookie
7. Access token is returned to client

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

## Password Requirements

Passwords must meet these criteria:
- At least 8 characters
- One uppercase letter (A–Z)
- One lowercase letter (a–z)
- One number (0–9)
- One special character (!@#$%^&*)

## Email Verification

### Request Verification
```javascript
await requestEmailVerification(accessToken);
```

### Verify Email
```javascript
await verifyEmail(token);
```

**Process:**
1. User requests email verification
2. Unique token is generated and stored (24-hour expiration)
3. Email is sent with verification link
4. User clicks link, token is validated
5. User's `isEmailVerified` flag is set to true

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

### Request Security
- **CSRF protection**: Validates CSRF tokens on state-changing operations
- **Rate limiting**: Different limits for different endpoints
- **Input validation**: Comprehensive validation and sanitization
- **Security headers**: Helmet.js for security headers

### Database Security
- **Mongoose sanitization**: Prevents NoSQL injection
- **Audit logging**: All authentication events are logged
- **Token cleanup**: Expired tokens are cleaned up automatically

## Frontend Implementation

### AuthContext
```javascript
const { user, accessToken, setAccessToken, logout } = useContext(AuthContext);
```

### PrivateRoute Component
```javascript
<PrivateRoute>
  <ProtectedComponent />
</PrivateRoute>
```

### Automatic Token Refresh
The system automatically refreshes tokens when they expire, providing seamless user experience.

## Error Handling

### Common Authentication Errors
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Valid token but insufficient permissions
- `409 Conflict`: Username or email already exists
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded

### Frontend Error Handling
```javascript
try {
  const response = await login(credentials);
} catch (error) {
  if (error.message.includes('verify')) {
    // Show email verification prompt
  } else {
    // Show error message
  }
}
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

## Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your_strong_secret_key
JWT_REFRESH_SECRET=your_strong_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password

# Token Lifetimes
EMAIL_VERIFY_TTL_HOURS=24
PASSWORD_RESET_TTL_MINUTES=30
```