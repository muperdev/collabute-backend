# Collabute API

A comprehensive GitHub collaboration platform API built with NestJS, featuring real-time chat, issue tracking, and seamless GitHub integration.

## 🚀 Features

- 🔐 **Authentication** - JWT + GitHub OAuth
- 👥 **User Management** - Complete profiles with GitHub integration
- 🚀 **Project Management** - Repository connection and collaboration
- 🐛 **Issue Tracking** - Task management with collaboration features
- 💬 **Real-time Chat** - WebSocket-based messaging system
- 🔧 **Background Jobs** - Email, sync, and notification processing
- 🌐 **GitHub Integration** - Comprehensive GitHub API integration
- 📚 **API Documentation** - Interactive Swagger/OpenAPI docs

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Bun** (Package manager) - [Install](https://bun.sh/)
- **PostgreSQL** (v12 or higher) - [Download](https://postgresql.org/)
- **Redis** (v6 or higher) - [Download](https://redis.io/)
- **Git** - [Download](https://git-scm.com/)

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | v18.0.0 | v20.0.0+ |
| RAM | 2GB | 4GB+ |
| Storage | 1GB | 5GB+ |
| CPU | 1 core | 2+ cores |

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/collabute-backend.git
cd collabute-backend
```

### 2. Install Dependencies

```bash
# Install using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Configure Required Services

#### PostgreSQL Setup

```bash
# Create database (if not using Docker)
createdb collabute

# Or using PostgreSQL shell
psql -U postgres
CREATE DATABASE collabute;
CREATE USER collabute WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE collabute TO collabute;
\q
```

#### Redis Setup

```bash
# Start Redis (if not using Docker)
redis-server

# Or using systemd
sudo systemctl start redis
sudo systemctl enable redis
```

### 5. Set Up Database

```bash
# Generate Prisma client
bun run prisma:generate

# Run database migrations
bun run prisma:migrate

# (Optional) Seed the database
bun run prisma:seed
```

### 6. Start the Application

```bash
# Development mode (with hot reload)
bun run start:dev

# Production mode
bun run start:prod

# Debug mode
bun run start:debug
```

The API will be available at `http://localhost:3000`

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/collabute

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# GitHub OAuth (Required for GitHub integration)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Redis (Required for background jobs)
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### GitHub OAuth Setup

1. **Create GitHub OAuth App:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: `Collabute Local`
     - **Homepage URL**: `http://localhost:3000`
     - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
   - Click "Register application"

2. **Get Client Credentials:**
   - Copy the `Client ID` and `Client Secret`
   - Add them to your `.env` file

### Optional Environment Variables

```env
# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Security
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Monitoring
SENTRY_DSN=your-sentry-dsn-url
LOG_LEVEL=info
```

## 🐳 Docker Setup (Alternative)

For a quick setup with Docker:

```bash
# Clone and navigate to project
git clone https://github.com/your-username/collabute-backend.git
cd collabute-backend

# Copy environment file
cp .env.example .env

# Edit .env with your GitHub OAuth credentials
nano .env

# Start all services with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec app bun run prisma:migrate

# View logs
docker-compose logs -f app
```

## 📚 API Documentation

### Interactive Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: [http://localhost:3000/api](http://localhost:3000/api)
- **API JSON**: [http://localhost:3000/api-json](http://localhost:3000/api-json)

### Key Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/auth/login` | POST | Login with email/password | ❌ |
| `/auth/register` | POST | Register new user | ❌ |
| `/auth/github` | GET | GitHub OAuth login | ❌ |
| `/users/profile` | GET | Get user profile | ✅ |
| `/projects` | GET/POST | List/Create projects | ✅ |
| `/issues` | GET/POST | List/Create issues | ✅ |
| `/chat/conversations` | GET/POST | List/Create conversations | ✅ |
| `/github/repositories` | GET | List GitHub repositories | ✅ |

### Authentication

1. **Register or Login** to get JWT token:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password"}'
   ```

2. **Use token in requests**:
   ```bash
   curl -X GET http://localhost:3000/users/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 🔌 WebSocket Integration

Connect to real-time features:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Join a conversation
socket.emit('join-conversation', { conversationId: 'conversation-id' });

// Send a message
socket.emit('send-message', {
  conversationId: 'conversation-id',
  content: 'Hello, World!'
});

// Listen for new messages
socket.on('new-message', (data) => {
  console.log('New message:', data.message);
});
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:cov

# Run e2e tests
bun run test:e2e
```

### Manual API Testing

```bash
# Test registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User", "type": "DEVELOPER"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test authenticated endpoint (replace TOKEN with actual token)
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer TOKEN"
```

## 🔧 Database Management

### Useful Commands

```bash
# View database in browser
bun run prisma:studio

# Create a new migration
bun run prisma:migrate

# Reset database (careful!)
bun run prisma:migrate:reset

# Deploy migrations (production)
bun run prisma:migrate:deploy

# Generate Prisma client
bun run prisma:generate
```

### Database Schema

Key models in the database:

- **User** - User profiles and authentication
- **Project** - Project information and settings
- **Issue** - Issue tracking and management
- **Conversation** - Chat conversations
- **Message** - Chat messages
- **GitHubRepository** - GitHub repository data

## 🚀 Frontend Integration

### React Example

```bash
# Install dependencies
npm install axios socket.io-client

# Basic setup
import axios from 'axios';
import { io } from 'socket.io-client';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const socket = io('http://localhost:3000/chat', {
  auth: { token: localStorage.getItem('token') }
});
```

### Next.js Example

```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';

export default NextAuth({
  providers: [
    {
      id: 'collabute',
      name: 'Collabute',
      type: 'oauth',
      authorization: 'http://localhost:3000/auth/github',
      token: 'http://localhost:3000/auth/github/callback',
      userinfo: 'http://localhost:3000/users/profile',
    }
  ],
});
```

### Vue.js Example

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 📊 Monitoring & Health Checks

### Health Endpoints

```bash
# Check API health
curl http://localhost:3000/health

# Check database health
curl http://localhost:3000/health/database

# Check Redis health
curl http://localhost:3000/health/redis
```

### Monitoring Queue Jobs

```bash
# Check queue statistics
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/jobs/stats

# Trigger test email
curl -X POST -H "Authorization: Bearer TOKEN" http://localhost:3000/jobs/email/test
```

## 🔧 Development

### Code Quality

```bash
# Lint code
bun run lint

# Format code
bun run format

# Type checking
bun run build
```

### Project Structure

```
src/
├── common/           # Shared utilities and guards
├── database/         # Database connection and migrations
├── modules/          # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── projects/     # Project management
│   ├── issues/       # Issue tracking
│   ├── chat/         # Real-time messaging
│   ├── github/       # GitHub integration
│   └── jobs/         # Background jobs
├── main.ts          # Application entry point
└── app.module.ts    # Root module
```

### Adding New Features

1. **Create Module**:
   ```bash
   nest g module feature-name
   nest g service feature-name
   nest g controller feature-name
   ```

2. **Add Database Model**:
   ```bash
   # Edit prisma/schema.prisma
   # Run migration
   bun run prisma:migrate
   ```

3. **Create DTOs**:
   ```typescript
   // src/modules/feature-name/dto/create-feature.dto.ts
   export class CreateFeatureDto {
     @IsString()
     name: string;
   }
   ```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://...
   REDIS_HOST=your-redis-host
   ```

2. **Build Application**:
   ```bash
   bun run build
   bun run start:prod
   ```

3. **Process Management**:
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start dist/main.js --name collabute-api
   pm2 startup
   pm2 save
   ```

### Docker Deployment

```bash
# Build image
docker build -t collabute-api .

# Run container
docker run -d -p 3000:3000 --env-file .env collabute-api

# Or use docker-compose
docker-compose up -d
```

### Cloud Deployment

#### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`

#### Heroku
1. Install Heroku CLI
2. Create app: `heroku create collabute-api`
3. Set config: `heroku config:set NODE_ENV=production`
4. Deploy: `git push heroku main`

## 🔒 Security

### Production Security Checklist

- [ ] Environment variables secured
- [ ] JWT secret is strong and random
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] HTTPS configured
- [ ] Database not exposed to public
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured properly
- [ ] Regular security updates applied

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   ```bash
   # Check PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Check connection string
   psql $DATABASE_URL
   ```

2. **Redis Connection Error**:
   ```bash
   # Check Redis is running
   redis-cli ping
   
   # Check Redis connection
   redis-cli -h localhost -p 6379
   ```

3. **JWT Token Issues**:
   ```bash
   # Check JWT secret is set
   echo $JWT_SECRET
   
   # Verify token format
   node -e "console.log(require('jsonwebtoken').verify('TOKEN', 'SECRET'))"
   ```

4. **GitHub OAuth Issues**:
   - Verify client ID and secret
   - Check callback URL matches GitHub app settings
   - Ensure GitHub app is not suspended

5. **Port Already in Use**:
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 PID
   
   # Or use different port
   PORT=3001 bun run start:dev
   ```

### Debugging

```bash
# Enable debug logging
DEBUG=* bun run start:dev

# Check application logs
tail -f logs/app.log

# Monitor database queries
bun run prisma:studio
```

## 📞 Support

### Getting Help

- **📖 Documentation**: [/docs](./docs)
- **🐛 Issues**: [GitHub Issues](https://github.com/your-username/collabute-backend/issues)
- **💬 Community**: [Discord](https://discord.gg/collabute)
- **📧 Email**: support@collabute.com

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Quick Start Summary

```bash
# 1. Clone and install
git clone https://github.com/your-username/collabute-backend.git
cd collabute-backend
bun install

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Setup database
bun run prisma:migrate
bun run prisma:generate

# 4. Start development server
bun run start:dev

# 5. Visit API documentation
open http://localhost:3000/api
```

**🚀 You're ready to build amazing collaboration features!**

For detailed guides, check the [documentation](./docs) folder.