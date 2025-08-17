# Deployment Guide

This guide covers deploying BookBuddy to production environments.

## Prerequisites

- Node.js 16+ installed on server
- MongoDB Atlas account or MongoDB server
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- Email service (Mailtrap for production or SMTP server)

## Environment Setup

### Production Environment Variables

Create a `.env` file in the server directory:

```env
# Environment
NODE_ENV=production

# Server Configuration
PORT=5000
CLIENT_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookbuddy?retryWrites=true&w=majority

# JWT Secrets (Generate strong secrets!)
JWT_ACCESS_SECRET=your_super_secure_access_secret_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here

# Email Configuration (Production SMTP)
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=api
SMTP_PASS=your_mailtrap_api_token
MAIL_FROM="BookBuddy <no-reply@yourdomain.com>"

# Security
LOG_LEVEL=warn

# Token Lifetimes
EMAIL_VERIFY_TTL_HOURS=24
PASSWORD_RESET_TTL_MINUTES=30
```

## Deployment Options

### Option 1: Traditional VPS/Server

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### 2. Application Deployment
```bash
# Clone repository
git clone <your-repo-url>
cd BookBuddy

# Install dependencies
npm install

# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/bookbuddy
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Frontend (React build)
    location / {
        root /path/to/BookBuddy/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. PM2 Ecosystem Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'bookbuddy-api',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Option 2: Docker Deployment

#### 1. Dockerfile
```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
COPY --from=frontend-build /app/dist ./public

EXPOSE 5000
CMD ["node", "server.js"]
```

#### 2. Docker Compose
```yaml
version: '3.8'
services:
  bookbuddy:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - bookbuddy
    restart: unless-stopped
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create bookbuddy-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_ACCESS_SECRET=your_secret
# ... set all other env vars

# Deploy
git push heroku main
```

#### Vercel (Frontend) + Railway/Render (Backend)
1. Deploy frontend to Vercel
2. Deploy backend to Railway or Render
3. Update CORS and CLIENT_URL settings

## Database Setup

### MongoDB Atlas
1. Create MongoDB Atlas account
2. Create cluster and database
3. Set up database user
4. Configure IP whitelist
5. Get connection string

### Indexes for Performance
```javascript
// Create these indexes in MongoDB
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.books.createIndex({ user: 1 });
db.refreshtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## SSL Certificate Setup

### Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart bookbuddy-api
```

### Log Management
```bash
# Rotate logs
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure CORS properly
- [ ] Enable security headers (Helmet.js)
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor authentication logs

## Performance Optimization

### Frontend
- Enable gzip compression in Nginx
- Set proper cache headers
- Optimize images and assets
- Use CDN for static assets

### Backend
- Enable clustering with PM2
- Implement database connection pooling
- Add Redis for session storage (optional)
- Monitor and optimize database queries

## Backup Strategy

### Database Backup
```bash
# MongoDB Atlas: Use built-in backup
# Self-hosted MongoDB:
mongodump --uri="mongodb://localhost:27017/bookbuddy" --out=/backup/$(date +%Y%m%d)
```

### Application Backup
```bash
# Backup application files
tar -czf bookbuddy-backup-$(date +%Y%m%d).tar.gz /path/to/BookBuddy
```

## Troubleshooting

### Common Issues
1. **CORS errors**: Check CLIENT_URL and CORS configuration
2. **Database connection**: Verify MONGO_URI and network access
3. **Email not sending**: Check SMTP credentials and configuration
4. **JWT errors**: Verify JWT secrets are set correctly
5. **File permissions**: Ensure proper permissions for log files

### Health Check Endpoint
```javascript
// Add to your routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Maintenance

### Regular Tasks
- Monitor server resources
- Check application logs
- Update dependencies
- Backup database
- Renew SSL certificates
- Monitor security alerts

### Updates
```bash
# Update application
git pull origin main
npm install
npm run build
pm2 restart bookbuddy-api
```