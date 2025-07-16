import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

A comprehensive GitHub collaboration platform API built with NestJS.

## Features
- 🔐 **Authentication**: JWT + GitHub OAuth
- 👥 **User Management**: Complete user profiles and GitHub integration
- 🚀 **Project Management**: Repository connection and collaboration
- 🐛 **Issue Tracking**: Task management with collaboration features
- 💬 **Real-time Chat**: WebSocket-based messaging
- 🔧 **Background Jobs**: Email, sync, and notification processing
- 🌐 **GitHub Integration**: Comprehensive GitHub API integration

## Getting Started
1. **Authentication**: Use \`POST /auth/login\` to get JWT token
2. **Authorization**: Add \`Authorization: Bearer <token>\` header
3. **WebSocket**: Connect to \`/chat\` namespace for real-time features

## Base URL
- Development: \`http://localhost:3000\`
- Production: \`https://api.collabute.com\`

## Support
- Documentation: [docs.collabute.com](https://docs.collabute.com)
- GitHub: [github.com/collabute/api](https://github.com/collabute/api)
- Support: support@collabute.com
    `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.collabute.com', 'Production')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('projects', 'Project management')
    .addTag('issues', 'Issue tracking')
    .addTag('chat', 'Real-time messaging')
    .addTag('github', 'GitHub integration')
    .addTag('jobs', 'Background job management')
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

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
