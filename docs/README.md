# Collabute API Documentation

A comprehensive GitHub collaboration platform API built with NestJS, featuring real-time chat, issue tracking, and seamless GitHub integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- GitHub OAuth App

### Installation

```bash
# Clone the repository
git clone https://github.com/collabute/api.git
cd collabute-backend

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations
bun run prisma:migrate

# Start the development server
bun run start:dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/collabute"

# JWT
JWT_SECRET="your-jwt-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Redis (for Bull Queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

## 📚 API Documentation

### Interactive API Docs
Visit `http://localhost:3000/api` for interactive Swagger documentation.

### Authentication
All protected endpoints require JWT authentication:

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in subsequent requests
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### WebSocket Connection
Connect to real-time chat:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

## 🏗️ Architecture

### Core Modules

1. **Authentication Module** (`/auth`)
   - JWT-based authentication
   - GitHub OAuth integration
   - Password reset functionality

2. **Users Module** (`/users`)
   - User profile management
   - GitHub integration
   - Skills and experience tracking

3. **Projects Module** (`/projects`)
   - Project CRUD operations
   - GitHub repository connection
   - Collaboration management

4. **Issues Module** (`/issues`)
   - Issue tracking and management
   - Assignment and prioritization
   - Project integration

5. **Chat Module** (`/chat`)
   - Real-time messaging
   - WebSocket gateway
   - Conversation management

6. **GitHub Module** (`/github`)
   - GitHub API integration
   - Repository synchronization
   - Webhook management

7. **Jobs Module** (`/jobs`)
   - Background job processing
   - Email notifications
   - GitHub sync jobs

### Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- `User` - User profiles and authentication
- `Project` - Project information and settings
- `Issue` - Issue tracking and management
- `Conversation` - Chat conversations
- `Message` - Chat messages
- `GitHubRepository` - GitHub repository data

### Real-time Features

WebSocket events for real-time functionality:

```javascript
// Join a conversation
socket.emit('join-conversation', { conversationId: 'conv-id' });

// Send a message
socket.emit('send-message', {
  conversationId: 'conv-id',
  content: 'Hello world!'
});

// Listen for new messages
socket.on('new-message', (data) => {
  console.log('New message:', data.message);
});
```

## 🔧 Development

### Project Structure

```
src/
├── common/           # Shared utilities and guards
├── database/         # Database connection and migrations
├── modules/          # Feature modules
│   ├── auth/         # Authentication
│   ├── users/        # User management
│   ├── projects/     # Project management
│   ├── issues/       # Issue tracking
│   ├── chat/         # Real-time messaging
│   ├── github/       # GitHub integration
│   └── jobs/         # Background jobs
├── main.ts          # Application entry point
└── app.module.ts    # Root module
```

### Running Tests

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Test coverage
bun run test:cov
```

### Database Operations

```bash
# Generate Prisma client
bun run prisma:generate

# Run migrations
bun run prisma:migrate

# Reset database
bun run prisma:reset

# View database
bun run prisma:studio
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Production Environment

1. Set production environment variables
2. Run database migrations
3. Start the application with PM2 or similar process manager
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates

### Health Checks

- API Health: `GET /health`
- Database Health: `GET /health/database`
- Redis Health: `GET /health/redis`

## 📊 Monitoring

### Logging
Application uses structured logging with Winston:

```javascript
// Log levels: error, warn, info, debug
logger.info('User created', { userId: 'user-123' });
```

### Metrics
Monitor application performance with:

- Response times
- Error rates
- Database query performance
- WebSocket connection counts
- Background job processing

## 🔐 Security

### Authentication
- JWT tokens with expiration
- Secure password hashing with bcrypt
- GitHub OAuth integration

### Authorization
- Role-based access control
- Project-level permissions
- API rate limiting

### Data Protection
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
- Use TypeScript
- Follow ESLint configuration
- Use Prettier for formatting
- Add JSDoc comments for public APIs

## 📄 API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/register` | Register new user |
| POST | `/auth/github` | GitHub OAuth login |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/logout` | Logout user |

### Users Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PATCH | `/users/profile` | Update user profile |
| GET | `/users/:id` | Get user by ID |
| POST | `/users/:id/github` | Connect GitHub account |

### Projects Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create new project |
| GET | `/projects` | Get all projects |
| GET | `/projects/:id` | Get project by ID |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| POST | `/projects/:id/connect-repository` | Connect GitHub repo |

### Issues Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/issues` | Create new issue |
| GET | `/issues` | Get all issues |
| GET | `/issues/:id` | Get issue by ID |
| PATCH | `/issues/:id` | Update issue |
| DELETE | `/issues/:id` | Delete issue |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/conversations` | Create conversation |
| GET | `/chat/conversations` | Get user conversations |
| GET | `/chat/conversations/:id` | Get conversation by ID |
| POST | `/chat/messages` | Send message |
| GET | `/chat/conversations/:id/messages` | Get messages |

### GitHub Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/github/user` | Get GitHub user info |
| GET | `/github/repositories` | Get user repositories |
| GET | `/github/repositories/:owner/:repo` | Get repository details |
| POST | `/github/repositories/:owner/:repo/issues` | Create GitHub issue |

### Jobs Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/stats` | Get queue statistics |
| POST | `/jobs/email/test` | Send test email |
| POST | `/jobs/github-sync/:repositoryId` | Trigger GitHub sync |
| POST | `/jobs/queues/:queueName/pause` | Pause queue |
| POST | `/jobs/queues/:queueName/resume` | Resume queue |

## 📞 Support

- **Documentation**: [docs.collabute.com](https://docs.collabute.com)
- **GitHub Issues**: [github.com/collabute/api/issues](https://github.com/collabute/api/issues)
- **Email Support**: support@collabute.com
- **Community**: [discord.gg/collabute](https://discord.gg/collabute)

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.