# Development Guide

This guide covers the development setup, architecture, and best practices for BookBuddy.

## Development Setup

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd BookBuddy

# Install dependencies
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Start development servers
npm run dev
```

## Project Architecture

### Frontend Architecture (React)
```
src/
├── api/              # API service functions
├── components/       # Reusable UI components
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── Pages/            # Page components (routes)
├── services/         # Business logic services
├── types/            # Type definitions
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

### Backend Architecture (Node.js/Express)
```
server/
├── config/           # Configuration files
├── controllers/      # Route handlers
├── middleware/       # Custom middleware
├── models/           # Database models (Mongoose)
├── routes/           # API route definitions
├── utils/            # Utility functions
├── app.js            # Express app setup
└── server.js         # Server entry point
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test changes
# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Code Style
- Use ESLint configuration
- Follow React best practices
- Use meaningful variable names
- Write self-documenting code
- Add comments for complex logic

### 3. Testing Strategy
```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

## Database Models

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  isEmailVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model
```javascript
{
  user: ObjectId (ref: User),
  title: String (required),
  author: String (required),
  isbn: String,
  description: String,
  coverImage: String,
  status: String (enum: reading, completed, want-to-read),
  rating: Number (1-5),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Token Models
```javascript
// RefreshToken
{
  user: ObjectId (ref: User),
  jti: String (unique),
  expiresAt: Date,
  revokedAt: Date
}

// EmailVerificationToken
{
  user: ObjectId (ref: User),
  tokenHash: String,
  expiresAt: Date,
  usedAt: Date
}

// PasswordResetToken
{
  user: ObjectId (ref: User),
  tokenHash: String,
  expiresAt: Date,
  usedAt: Date
}
```

## API Design Patterns

### RESTful Endpoints
```javascript
// Users
GET    /api/v1/auth/me           # Get current user
POST   /api/v1/auth/register     # Register user
POST   /api/v1/auth/login        # Login user
POST   /api/v1/auth/logout       # Logout user

// Books
GET    /api/v1/books             # Get user's books
POST   /api/v1/books             # Add book
PUT    /api/v1/books/:id         # Update book
DELETE /api/v1/books/:id         # Delete book
```

### Response Format
```javascript
// Success Response
{
  "data": { ... },
  "message": "Success message"
}

// Error Response
{
  "error": "Error message",
  "errors": [
    {
      "msg": "Validation error",
      "path": "field_name"
    }
  ]
}
```

## Frontend Patterns

### Component Structure
```javascript
// Functional component with hooks
import { useState, useEffect } from 'react';
import './Component.css';

export default function Component({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleEvent = () => {
    // Event handler
  };
  
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
}
```

### State Management
```javascript
// Context for global state
export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState(initialState);
  
  const value = {
    state,
    actions: {
      updateState: (newState) => setState(newState)
    }
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
```

### API Service Pattern
```javascript
// api/books.js
const API_BASE = '/api/v1';

export const booksAPI = {
  getAll: () => fetch(`${API_BASE}/books`).then(res => res.json()),
  create: (book) => fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book)
  }).then(res => res.json()),
  // ... other methods
};
```

## Backend Patterns

### Controller Pattern
```javascript
// controllers/bookController.js
export async function getBooks(req, res, next) {
  try {
    const books = await Book.find({ user: req.user.id });
    res.json({ data: books });
  } catch (error) {
    next(error);
  }
}
```

### Middleware Pattern
```javascript
// middleware/auth.js
export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.sub };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Error Handling
```javascript
// middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      errors: Object.values(err.errors).map(e => ({
        msg: e.message,
        path: e.path
      }))
    });
  }
  
  res.status(500).json({ error: 'Internal server error' });
}
```

## Security Best Practices

### Input Validation
```javascript
// Use express-validator
import { body, validationResult } from 'express-validator';

const validateBook = [
  body('title').trim().isLength({ min: 1 }).escape(),
  body('author').trim().isLength({ min: 1 }).escape(),
  body('isbn').optional().isISBN(),
];

export function createBook(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... create book
}
```

### Authentication Security
```javascript
// Hash passwords
const hashedPassword = await bcrypt.hash(password, 12);

// Verify passwords
const isValid = await bcrypt.compare(password, hashedPassword);

// Generate secure tokens
const token = crypto.randomBytes(32).toString('hex');
```

## Performance Optimization

### Database Optimization
```javascript
// Use indexes
userSchema.index({ email: 1 });
bookSchema.index({ user: 1, createdAt: -1 });

// Populate efficiently
const books = await Book.find({ user: userId })
  .populate('user', 'username email')
  .select('title author rating')
  .limit(20);
```

### Frontend Optimization
```javascript
// Lazy loading
const LazyComponent = lazy(() => import('./Component'));

// Memoization
const MemoizedComponent = memo(Component);

// Debounced search
const debouncedSearch = useCallback(
  debounce((query) => searchBooks(query), 300),
  []
);
```

## Testing Guidelines

### Unit Tests
```javascript
// Example test
describe('Book Controller', () => {
  test('should create book', async () => {
    const bookData = { title: 'Test Book', author: 'Test Author' };
    const result = await createBook(bookData);
    expect(result.title).toBe('Test Book');
  });
});
```

### Integration Tests
```javascript
// API endpoint test
describe('POST /api/v1/books', () => {
  test('should create book with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Book', author: 'Test Author' })
      .expect(201);
    
    expect(response.body.data.title).toBe('Test Book');
  });
});
```

## Debugging

### Backend Debugging
```javascript
// Use debug logging
import debug from 'debug';
const log = debug('bookbuddy:auth');

log('User attempting login: %s', email);
```

### Frontend Debugging
```javascript
// React Developer Tools
// Console logging
console.log('Component rendered with props:', props);

// Error boundaries
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Environment Configuration

### Development Environment
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/bookbuddy-dev
LOG_LEVEL=debug
```

### Testing Environment
```env
NODE_ENV=test
PORT=5001
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/bookbuddy-test
LOG_LEVEL=error
```

## Git Workflow

### Commit Messages
```
feat: add user authentication
fix: resolve book deletion bug
docs: update API documentation
style: format code with prettier
refactor: restructure auth middleware
test: add book controller tests
chore: update dependencies
```

### Branch Naming
```
feature/user-authentication
bugfix/book-deletion-error
hotfix/security-vulnerability
release/v1.0.0
```

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Proper error messages
- [ ] Accessibility considerations