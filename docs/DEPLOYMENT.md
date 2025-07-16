# Deployment Guide

This guide covers various deployment strategies for the Collabute API.

## 🚀 Quick Deployment Options

### Option 1: Docker (Recommended)
- **Best for**: Development and production
- **Time**: 5-10 minutes
- **Complexity**: Low

### Option 2: Traditional VPS
- **Best for**: Custom server setups
- **Time**: 15-30 minutes
- **Complexity**: Medium

### Option 3: Cloud Platform (Vercel, Railway, etc.)
- **Best for**: Rapid deployment
- **Time**: 5-10 minutes
- **Complexity**: Low

---

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm install -g bun
RUN bun install

# Copy source code
COPY . .

# Generate Prisma client
RUN bun run prisma:generate

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start:prod"]
```

### 2. Create docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Main application
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/collabute
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your-super-secret-jwt-key
      - GITHUB_CLIENT_ID=your-github-client-id
      - GITHUB_CLIENT_SECRET=your-github-client-secret
      - FRONTEND_URL=https://your-frontend-domain.com
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  # PostgreSQL database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=collabute
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis for Bull Queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Create nginx.conf

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    server {
        listen 80;
        server_name your-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL configuration
        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # API routes
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth routes (stricter rate limiting)
        location /auth {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://app;
            access_log off;
        }
    }
}
```

### 4. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app bun run prisma:migrate

# Stop services
docker-compose down
```

---

## 🌐 VPS Deployment

### 1. Server Setup (Ubuntu 20.04+)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
npm install -g pm2

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Database Setup

```bash
# Create database user
sudo -u postgres psql
CREATE USER collabute WITH ENCRYPTED PASSWORD 'your-password';
CREATE DATABASE collabute OWNER collabute;
GRANT ALL PRIVILEGES ON DATABASE collabute TO collabute;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Add: local collabute collabute md5

sudo systemctl restart postgresql
```

### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/your-username/collabute-backend.git
cd collabute-backend

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
nano .env

# Generate Prisma client
bun run prisma:generate

# Run migrations
bun run prisma:migrate

# Build application
bun run build

# Create PM2 ecosystem file
nano ecosystem.config.js
```

### 4. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'collabute-api',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: '/var/log/collabute/app.log',
      error_file: '/var/log/collabute/error.log',
      out_file: '/var/log/collabute/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
```

### 5. Start Application

```bash
# Create log directory
sudo mkdir -p /var/log/collabute
sudo chown $USER:$USER /var/log/collabute

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor application
pm2 monit
pm2 logs
```

### 6. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/collabute
```

```nginx
# /etc/nginx/sites-available/collabute
server {
    listen 80;
    server_name your-domain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    location / {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /auth {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/collabute /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## ☁️ Cloud Platform Deployment

### Railway

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the collabute-backend repository

2. **Add Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   REDIS_HOST=...
   JWT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   FRONTEND_URL=...
   ```

3. **Add Services**
   - PostgreSQL: Click "Add Service" → "PostgreSQL"
   - Redis: Click "Add Service" → "Redis"

4. **Deploy**
   - Railway will automatically detect the Node.js application
   - It will run the build command and start the application

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/main.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/main.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Heroku

1. **Create Heroku App**
   ```bash
   heroku create collabute-api
   heroku addons:create heroku-postgresql:hobby-dev
   heroku addons:create heroku-redis:hobby-dev
   ```

2. **Create Procfile**
   ```
   web: bun run start:prod
   release: bun run prisma:migrate
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set GITHUB_CLIENT_ID=your-id
   heroku config:set GITHUB_CLIENT_SECRET=your-secret
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 🔧 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/collabute

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Redis (for Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional-password

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
```

### Optional Variables

```env
# Email (if using real email service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## 🔒 Security Checklist

### Application Security

- [ ] **Environment Variables**: All secrets in environment variables
- [ ] **JWT Secret**: Strong, randomly generated JWT secret
- [ ] **CORS**: Configured for your frontend domain only
- [ ] **Rate Limiting**: Implemented for all endpoints
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **SQL Injection**: Using Prisma ORM prevents SQL injection
- [ ] **XSS Protection**: Headers configured in Nginx
- [ ] **HTTPS**: SSL certificate configured
- [ ] **Security Headers**: All security headers set

### Infrastructure Security

- [ ] **Firewall**: Only necessary ports open (80, 443, 22)
- [ ] **SSH Keys**: Password authentication disabled
- [ ] **Database**: Not exposed to public internet
- [ ] **Redis**: Password protected if exposed
- [ ] **Backups**: Regular database backups configured
- [ ] **Updates**: Regular security updates applied
- [ ] **Monitoring**: Error monitoring and alerting set up

---

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Checks**
   ```bash
   # Add to crontab
   */5 * * * * curl -f http://localhost:3000/health || echo "API down" | mail -s "API Alert" admin@example.com
   ```

2. **Log Rotation**
   ```bash
   # /etc/logrotate.d/collabute
   /var/log/collabute/*.log {
     daily
     rotate 7
     compress
     delaycompress
     missingok
     notifempty
     create 0644 www-data www-data
     postrotate
       pm2 reload collabute-api
     endscript
   }
   ```

3. **Monitoring Dashboard**
   ```bash
   # Install monitoring tools
   npm install -g pm2-web
   pm2-web --port 8080
   ```

### Error Tracking

1. **Sentry Integration**
   ```bash
   bun add @sentry/node
   ```

   ```javascript
   // src/main.ts
   import * as Sentry from '@sentry/node';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

2. **Custom Logging**
   ```typescript
   // src/common/logger.ts
   import { Logger } from '@nestjs/common';
   
   export class CustomLogger extends Logger {
     error(message: string, trace?: string, context?: string) {
       super.error(message, trace, context);
       // Send to external service
     }
   }
   ```

---

## 🚀 Performance Optimization

### Database Optimization

1. **Connection Pooling**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/collabute?connection_limit=20&pool_timeout=20
   ```

2. **Database Indexes**
   ```sql
   -- Add indexes for frequently queried fields
   CREATE INDEX idx_user_email ON users(email);
   CREATE INDEX idx_project_owner ON projects(owner_id);
   CREATE INDEX idx_issue_project ON issues(project_id);
   CREATE INDEX idx_message_conversation ON messages(conversation_id);
   ```

3. **Query Optimization**
   ```typescript
   // Use select to limit fields
   const users = await this.prisma.user.findMany({
     select: {
       id: true,
       name: true,
       email: true,
     },
   });
   ```

### Caching Strategy

1. **Redis Caching**
   ```typescript
   // src/common/cache.service.ts
   @Injectable()
   export class CacheService {
     async get(key: string) {
       return await this.redis.get(key);
     }
     
     async set(key: string, value: any, ttl = 3600) {
       return await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
     }
   }
   ```

2. **HTTP Caching**
   ```typescript
   // Add caching headers
   @Get('users/:id')
   @Header('Cache-Control', 'public, max-age=300')
   async getUser(@Param('id') id: string) {
     return this.userService.findById(id);
   }
   ```

### Load Balancing

1. **PM2 Cluster Mode**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'collabute-api',
       script: 'dist/main.js',
       instances: 'max', // Use all CPU cores
       exec_mode: 'cluster',
     }],
   };
   ```

2. **Nginx Load Balancing**
   ```nginx
   upstream backend {
     server localhost:3000;
     server localhost:3001;
     server localhost:3002;
   }
   
   server {
     location / {
       proxy_pass http://backend;
     }
   }
   ```

---

## 📱 Database Management

### Backups

1. **Automated Backups**
   ```bash
   #!/bin/bash
   # backup.sh
   
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/var/backups/collabute"
   
   mkdir -p $BACKUP_DIR
   
   # Database backup
   pg_dump -h localhost -U collabute -d collabute | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"
   
   # Keep only last 7 days
   find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
   
   # Upload to S3 (optional)
   aws s3 cp "$BACKUP_DIR/db_backup_$DATE.sql.gz" s3://your-backup-bucket/
   ```

   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup.sh
   ```

2. **Restore from Backup**
   ```bash
   # Stop application
   pm2 stop collabute-api
   
   # Restore database
   gunzip < db_backup_20240101_020000.sql.gz | psql -h localhost -U collabute -d collabute
   
   # Start application
   pm2 start collabute-api
   ```

### Migrations

1. **Production Migrations**
   ```bash
   # Test migration on staging first
   bun run prisma:migrate dev
   
   # Apply to production
   bun run prisma:migrate deploy
   ```

2. **Rollback Strategy**
   ```bash
   # Create rollback migration
   bun run prisma migrate dev --name rollback_feature_x
   ```

---

## 🔧 Troubleshooting

### Common Issues

1. **Application Won't Start**
   ```bash
   # Check logs
   pm2 logs collabute-api
   
   # Check environment variables
   printenv | grep -E "(DATABASE_URL|JWT_SECRET|REDIS_HOST)"
   
   # Check database connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check database exists
   psql -U postgres -c "\l"
   
   # Test connection
   psql -h localhost -U collabute -d collabute -c "SELECT NOW()"
   ```

3. **Redis Connection Issues**
   ```bash
   # Check Redis status
   sudo systemctl status redis
   
   # Test connection
   redis-cli ping
   ```

4. **High Memory Usage**
   ```bash
   # Check memory usage
   pm2 monit
   
   # Restart application
   pm2 restart collabute-api
   
   # Check for memory leaks
   node --inspect dist/main.js
   ```

5. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   
   # Test SSL
   curl -I https://your-domain.com
   ```

### Performance Issues

1. **Slow Database Queries**
   ```sql
   -- Enable query logging
   ALTER SYSTEM SET log_statement = 'all';
   ALTER SYSTEM SET log_min_duration_statement = 1000;
   SELECT pg_reload_conf();
   
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

2. **High CPU Usage**
   ```bash
   # Check process usage
   top -p $(pgrep -f "collabute-api")
   
   # Check Node.js profiling
   node --prof dist/main.js
   ```

3. **Memory Leaks**
   ```bash
   # Monitor memory
   watch -n 1 'ps aux | grep collabute-api'
   
   # Use heap dump
   kill -USR2 $(pgrep -f "collabute-api")
   ```

---

## 📞 Support

### Deployment Support

If you encounter issues during deployment:

1. **Check the logs** first using the appropriate command for your deployment method
2. **Verify environment variables** are set correctly
3. **Test database connectivity** independently
4. **Check firewall and security group** settings
5. **Consult the troubleshooting section** above

### Getting Help

- **GitHub Issues**: [Create an issue](https://github.com/collabute/api/issues)
- **Email Support**: deployment@collabute.com
- **Community**: [Join our Discord](https://discord.gg/collabute)

---

## 🎯 Next Steps

After successful deployment:

1. **Set up monitoring** and alerting
2. **Configure automated backups**
3. **Set up CI/CD pipeline** for automatic deployments
4. **Performance testing** with load testing tools
5. **Security audit** with automated scanning tools
6. **Documentation** of your specific deployment setup

Happy deploying! 🚀