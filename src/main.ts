import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Collabute API')
    .setDescription(
      `
# Collabute API Documentation

A comprehensive GitHub collaboration platform API built with NestJS and Better Auth.

## Features
- 🔐 **Authentication**: Better Auth with Email/Password + GitHub OAuth
- 👥 **User Management**: Complete user profiles and GitHub integration
- 🚀 **Project Management**: Repository connection and collaboration
- 🐛 **Issue Tracking**: Task management with collaboration features
- 💬 **Real-time Chat**: WebSocket-based messaging
- 🔧 **Background Jobs**: Email, sync, and notification processing
- 🌐 **GitHub Integration**: Comprehensive GitHub API integration
- 🔒 **Role-based Access Control**: Admin, Moderator, and User roles
- 🛡️ **Enhanced Security**: Built-in CSRF protection and secure sessions

## Authentication System
This API uses **Better Auth** for authentication management:

### Traditional Endpoints (Legacy - Deprecated)
- \`POST /auth/login\` - Login with email/password
- \`POST /auth/register\` - Register new user
- \`GET /auth/profile\` - Get user profile
- \`POST /auth/logout\` - Logout user

### Better Auth Endpoints (Recommended)
- \`POST /api/auth/sign-in/email\` - Email/password login
- \`POST /api/auth/sign-up/email\` - Email registration  
- \`GET /api/auth/session\` - Get current session
- \`POST /api/auth/sign-out\` - Sign out
- \`GET /api/auth/github\` - GitHub OAuth login
- \`GET /api/auth/github/callback\` - GitHub OAuth callback

## Getting Started
1. **Authentication**: Use Better Auth endpoints for session management
2. **Session**: Sessions are managed via secure cookies
3. **Authorization**: Add \`Authorization: Bearer <session-token>\` header for API access
4. **WebSocket**: Connect to \`/chat\` namespace for real-time features

## Base URL
- Development: \`http://localhost:3001\`
- Production: \`https://api.collabute.com\`

## Role-based Access Control
- **Admin**: Full system access, user management, system configuration
- **Moderator**: Content moderation, project management
- **User**: Basic access to projects and issues
- **Guest**: Limited read-only access

## Support
- Documentation: [docs.collabute.com](https://docs.collabute.com)
- GitHub: [github.com/collabute/api](https://github.com/collabute/api)
- Support: support@collabute.com
    `,
    )
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Better Auth Session Token',
        description: 'Enter Better Auth session token',
        in: 'header',
      },
      'BetterAuth',
    )
    .addServer('http://localhost:3001', 'Development')
    .addServer('https://api.collabute.com', 'Production')
    .addTag('auth', 'Authentication endpoints (Better Auth)')
    .addTag('users', 'User management')
    .addTag('projects', 'Project management')
    .addTag('issues', 'Issue tracking')
    .addTag('chat', 'Real-time messaging')
    .addTag('github', 'GitHub integration')
    .addTag('jobs', 'Background job management')
    .addTag('upload', 'File upload and management')
    .addTag('roles', 'Role and permission management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Collabute API Docs',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  // CORS - Enhanced for frontend-backend communication
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://collabute.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count'],
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false,
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
