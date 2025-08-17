# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string (3-20 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "emailOrUsername": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token"
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

**Response:**
```json
{
  "accessToken": "new_jwt_token"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "isEmailVerified": "boolean"
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

### Logout All Devices
```http
POST /auth/logout-all
Authorization: Bearer {token}
```

## Email Verification

### Request Email Verification
```http
POST /auth/request-email-verification
Authorization: Bearer {token}
```

### Verify Email
```http
GET /auth/verify-email?token={verification_token}
```

## Password Reset

### Request Password Reset
```http
POST /auth/request-password-reset
```

**Request Body:**
```json
{
  "email": "string"
}
```

### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "string",
  "password": "string (min 8 chars)"
}
```

## Email Reminder

### Request Email Reminder
```http
POST /auth/request-email-reminder
```

**Request Body:**
```json
{
  "username": "string"
}
```

## Book Management

### Get User Books
```http
GET /books
Authorization: Bearer {token}
```

### Add Book to Library
```http
POST /books
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "string",
  "author": "string",
  "isbn": "string (optional)",
  "description": "string (optional)",
  "coverImage": "string (optional)"
}
```

### Update Book
```http
PUT /books/{bookId}
Authorization: Bearer {token}
```

### Delete Book
```http
DELETE /books/{bookId}
Authorization: Bearer {token}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "errors": [
    {
      "msg": "Validation error message",
      "path": "field_name"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "error": "Access forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "msg": "Field is required",
      "path": "field_name"
    }
  ]
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limits

- **Login**: 5 attempts per 15 minutes per IP
- **Register**: 3 attempts per hour per IP
- **Email Verification**: 3 attempts per hour per user
- **Password Reset**: 3 attempts per hour per IP
- **Email Reminder**: 3 attempts per hour per IP

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

Tokens expire after 15 minutes. Use the refresh token endpoint to get a new access token.