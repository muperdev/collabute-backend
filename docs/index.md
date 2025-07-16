# Collabute API Documentation

Welcome to the comprehensive documentation for the Collabute API - a powerful GitHub collaboration platform built with NestJS.

## 📚 Documentation Index

### 🚀 Getting Started
- **[Main README](README.md)** - Quick start guide, installation, and architecture overview
- **[API Reference](API_REFERENCE.md)** - Complete API endpoint documentation
- **[Frontend Integration](FRONTEND_INTEGRATION.md)** - Guide for integrating with frontend applications
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions

### 📖 Quick Navigation

| Topic | Description | Link |
|-------|-------------|------|
| **🏗️ Architecture** | System architecture and module overview | [README.md#architecture](README.md#architecture) |
| **🔐 Authentication** | JWT & GitHub OAuth setup | [API_REFERENCE.md#authentication-endpoints](API_REFERENCE.md#authentication-endpoints) |
| **👥 User Management** | User profiles and GitHub integration | [API_REFERENCE.md#user-endpoints](API_REFERENCE.md#user-endpoints) |
| **🚀 Projects** | Project management and collaboration | [API_REFERENCE.md#project-endpoints](API_REFERENCE.md#project-endpoints) |
| **🐛 Issues** | Issue tracking and assignment | [API_REFERENCE.md#issue-endpoints](API_REFERENCE.md#issue-endpoints) |
| **💬 Real-time Chat** | WebSocket messaging system | [API_REFERENCE.md#chat-endpoints](API_REFERENCE.md#chat-endpoints) |
| **🔧 GitHub Integration** | GitHub API integration | [API_REFERENCE.md#github-integration-endpoints](API_REFERENCE.md#github-integration-endpoints) |
| **⚙️ Background Jobs** | Email, sync, and notification processing | [API_REFERENCE.md#background-jobs-endpoints](API_REFERENCE.md#background-jobs-endpoints) |
| **🌐 Frontend Setup** | React/Vue/Angular integration | [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) |
| **🐳 Docker Deployment** | Container-based deployment | [DEPLOYMENT.md#docker-deployment](DEPLOYMENT.md#docker-deployment) |
| **☁️ Cloud Deployment** | Railway, Vercel, Heroku deployment | [DEPLOYMENT.md#cloud-platform-deployment](DEPLOYMENT.md#cloud-platform-deployment) |

## 🔧 Interactive API Documentation

### Swagger UI
Access the interactive API documentation at:
- **Development**: [http://localhost:3000/api](http://localhost:3000/api)
- **Production**: [https://api.collabute.com/api](https://api.collabute.com/api)

### Features
- 🧪 **Interactive Testing** - Test endpoints directly in the browser
- 📝 **Request/Response Examples** - See real data structures
- 🔐 **Authentication** - Built-in JWT token management
- 📊 **Schema Documentation** - Complete data model reference

## 🚀 Quick Start

### 1. Installation
```bash
# Clone and install
git clone https://github.com/collabute/api.git
cd collabute-backend
bun install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Database setup
bun run prisma:migrate
bun run prisma:generate

# Start development server
bun run start:dev
```

### 2. First API Call
```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Frontend Integration
```javascript
// Install dependencies
npm install axios socket.io-client

// Basic setup
import axios from 'axios';
import { io } from 'socket.io-client';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Authorization': `Bearer ${token}` }
});

const socket = io('http://localhost:3000/chat', {
  auth: { token }
});
```

## 📋 API Overview

### Core Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | Login with email/password | ❌ |
| `/auth/register` | POST | Register new user | ❌ |
| `/auth/github` | GET | GitHub OAuth login | ❌ |
| `/users/profile` | GET | Get user profile | ✅ |
| `/projects` | GET | List projects | ❌ |
| `/projects` | POST | Create project | ✅ |
| `/issues` | GET | List issues | ❌ |
| `/issues` | POST | Create issue | ✅ |
| `/chat/conversations` | GET | List conversations | ✅ |
| `/chat/messages` | POST | Send message | ✅ |
| `/github/repositories` | GET | List GitHub repos | ✅ |
| `/jobs/stats` | GET | Queue statistics | ✅ |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-conversation` | Client → Server | Join a conversation |
| `send-message` | Client → Server | Send a message |
| `new-message` | Server → Client | New message received |
| `user-typing` | Server → Client | User typing indicator |
| `user-online` | Server → Client | User came online |

## 🏗️ Architecture

### Tech Stack
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + Bull Queue
- **Real-time**: Socket.io WebSockets
- **Authentication**: JWT + GitHub OAuth
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker, Nginx

### Module Structure
```
src/
├── common/           # Shared utilities and guards
├── database/         # Database connection
├── modules/
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── projects/     # Project management
│   ├── issues/       # Issue tracking
│   ├── chat/         # Real-time messaging
│   ├── github/       # GitHub integration
│   └── jobs/         # Background jobs
└── main.ts          # Application entry point
```

## 🔐 Authentication Flow

### JWT Authentication
1. **Register/Login** → Get JWT token
2. **Add Header** → `Authorization: Bearer <token>`
3. **Access Protected Routes** → Token validated automatically

### GitHub OAuth
1. **Redirect to GitHub** → `/auth/github`
2. **User Authorizes** → GitHub redirects back
3. **Get JWT Token** → Login completed
4. **Access GitHub Features** → Repository sync, issue creation

## 💻 Development Tools

### Database Management
```bash
# View database in browser
bun run prisma:studio

# Create new migration
bun run prisma:migrate dev --name feature_name

# Reset database
bun run prisma:migrate reset
```

### Code Quality
```bash
# Run linter
bun run lint

# Run tests
bun run test

# Type checking
bun run build
```

### Debugging
```bash
# Development with hot reload
bun run start:dev

# Debug mode
bun run start:debug

# Production mode
bun run start:prod
```

## 📊 Monitoring

### Health Checks
- **API Health**: `GET /health`
- **Database**: `GET /health/database`
- **Redis**: `GET /health/redis`

### Metrics
- Response times
- Error rates
- WebSocket connections
- Queue processing
- Database performance

## 🚀 Deployment Options

### Quick Deploy
| Platform | Time | Complexity | Best For |
|----------|------|------------|----------|
| **Docker** | 5-10 min | Low | Development & Production |
| **Railway** | 5 min | Low | Rapid prototyping |
| **Vercel** | 5 min | Low | Serverless deployment |
| **VPS** | 15-30 min | Medium | Full control |

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security headers enabled

## 📞 Support & Community

### Getting Help
- **📖 Documentation**: You're here!
- **🐛 Issues**: [GitHub Issues](https://github.com/collabute/api/issues)
- **💬 Discord**: [Join Community](https://discord.gg/collabute)
- **📧 Email**: support@collabute.com

### Contributing
- **🔧 Development**: [Contributing Guide](CONTRIBUTING.md)
- **🐛 Bug Reports**: [Issue Template](https://github.com/collabute/api/issues/new?template=bug_report.md)
- **💡 Feature Requests**: [Feature Template](https://github.com/collabute/api/issues/new?template=feature_request.md)

### Resources
- **📚 NestJS Docs**: [nestjs.com](https://nestjs.com)
- **🔗 Prisma Docs**: [prisma.io](https://prisma.io)
- **⚡ Socket.io Docs**: [socket.io](https://socket.io)
- **🐳 Docker Docs**: [docker.com](https://docker.com)

## 🎯 Next Steps

### For Frontend Developers
1. **Read** [Frontend Integration Guide](FRONTEND_INTEGRATION.md)
2. **Explore** [Interactive API Docs](http://localhost:3000/api)
3. **Test** endpoints with your preferred HTTP client
4. **Set up** WebSocket connection for real-time features

### For Backend Developers
1. **Study** the [Architecture Overview](README.md#architecture)
2. **Review** [API Reference](API_REFERENCE.md)
3. **Understand** the database schema with Prisma Studio
4. **Explore** the codebase structure

### For DevOps Engineers
1. **Follow** [Deployment Guide](DEPLOYMENT.md)
2. **Set up** monitoring and alerting
3. **Configure** automated backups
4. **Implement** CI/CD pipeline

---

**Ready to build something amazing?** 🚀

Start with the [Quick Start Guide](README.md#quick-start) and let's collaborate!