# BookBuddy

A modern book tracking and library management application built with React, Node.js, and MongoDB.

## Features

- **User Authentication**: Secure registration, login, and password reset
- **Book Library**: Search, save, and manage your personal book collection
- **Reading Tracking**: Track reading progress and maintain reading logs
- **Email Integration**: Password reset and email reminder functionality
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Nodemailer** - Email functionality
- **Bcrypt** - Password hashing

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **Input Validation** - Data sanitization
- **CSRF Protection** - Cross-site request forgery protection

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Mailtrap account for email testing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BookBuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the `server` directory:
   ```env
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # JWT Secrets
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   API_URL=http://localhost:5000
   
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

4. **Start the application**
   ```bash
   # Development mode (runs both client and server)
   npm run dev
   
   # Or run separately
   npm run dev:client  # Frontend on http://localhost:5173
   npm run dev:server  # Backend on http://localhost:5000
   ```

## Project Structure

```
BookBuddy/
├── public/                 # Static assets
├── server/                 # Backend application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── .env              # Environment variables
├── src/                   # Frontend application
│   ├── api/              # API service functions
│   ├── components/       # Reusable components
│   ├── context/          # React context providers
│   ├── Pages/            # Page components
│   ├── services/         # Business logic services
│   └── types/            # Type definitions
├── docs/                 # Documentation
└── package.json          # Dependencies and scripts
```

## API Documentation

See [API Documentation](./docs/API.md) for detailed endpoint information.

## Authentication Flow

See [Authentication Guide](./docs/AUTHENTICATION.md) for detailed authentication implementation.

## Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for production deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@bookbuddy.com or create an issue in the repository.