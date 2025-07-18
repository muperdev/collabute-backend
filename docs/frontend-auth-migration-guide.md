# Frontend Authentication Migration Guide

## Overview

This guide provides a complete reference for migrating your frontend to the new authentication system. The backend supports multiple authentication methods: API Key authentication for frontend identification and JWT authentication for user sessions.

## Table of Contents

1. [Authentication Types](#authentication-types)
2. [Environment Setup](#environment-setup)
3. [Registration Flow](#registration-flow)
4. [Login Flow](#login-flow)
5. [GitHub OAuth Flow](#github-oauth-flow)
6. [API Call Patterns](#api-call-patterns)
7. [Header Requirements](#header-requirements)
8. [Route Guards](#route-guards)
9. [Error Handling](#error-handling)
10. [Example Implementation](#example-implementation)

---

## Authentication Types

### 1. API Key Authentication
- **Purpose**: Identifies trusted frontend applications
- **Header**: `X-API-Key`
- **Usage**: For frontend-specific endpoints
- **Environment Variable**: `FRONTEND_API_KEY`

### 2. JWT Authentication
- **Purpose**: User session management
- **Header**: `Authorization: Bearer <token>`
- **Usage**: For user-protected endpoints
- **Validation**: Includes database user verification

---

## Environment Setup

### Backend Environment Variables
```env
# Frontend API Key for secure communication
FRONTEND_API_KEY=your-base64-encoded-api-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Database Connection
DATABASE_URI=your-production-database-url
```

### Frontend Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_API_KEY=your-base64-encoded-api-key-here
```

---

## Registration Flow

### Endpoint: `POST /auth/register`

#### Request Headers
```javascript
{
  "Content-Type": "application/json",
  "X-API-Key": process.env.NEXT_PUBLIC_API_KEY
}
```

#### Request Body
```javascript
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "profilePicture": "optional-profile-picture-url"
}
```

#### Response
```javascript
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "DEVELOPER",
    "role": null
  }
}
```

#### Frontend Implementation Example
```javascript
const register = async (userData) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const data = await response.json();
  
  // Store JWT token
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
};
```

---

## Login Flow

### Endpoint: `POST /auth/login`

#### Request Headers
```javascript
{
  "Content-Type": "application/json",
  "X-API-Key": process.env.NEXT_PUBLIC_API_KEY
}
```

#### Request Body
```javascript
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response
```javascript
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "DEVELOPER",
    "role": null
  }
}
```

#### Frontend Implementation Example
```javascript
const login = async (credentials) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  
  // Store JWT token
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
};
```

---

## GitHub OAuth Flow

### Step 1: Initiate GitHub OAuth
#### Endpoint: `GET /auth/github`

```javascript
const githubLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;
};
```

### Step 2: Handle Callback
#### Endpoint: `GET /auth/github/callback`

The backend automatically redirects to: `${FRONTEND_URL}/auth/callback?token=<jwt_token>`

#### Frontend Callback Handler
```javascript
// In your /auth/callback page
const handleGithubCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('accessToken', token);
    
    // Fetch user profile
    fetchUserProfile().then(user => {
      localStorage.setItem('user', JSON.stringify(user));
      // Redirect to dashboard
      window.location.href = '/dashboard';
    });
  }
};
```

---

## API Call Patterns

### 1. Public Endpoints (No Authentication Required)
```javascript
// Example: Get all users (public)
const getUsers = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
  return response.json();
};
```

### 2. Frontend-Only Endpoints (API Key Required)
```javascript
// Example: Frontend health check
const checkFrontendHealth = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/frontend/auth-test`, {
    headers: {
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
    }
  });
  return response.json();
};
```

### 3. User-Protected Endpoints (JWT Required)
```javascript
// Example: Get user profile
const getUserProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
    }
  });
  
  return response.json();
};
```

### 4. Mixed Authentication (API Key + JWT)
```javascript
// Example: Update user profile
const updateUserProfile = async (userId, userData) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
};
```

---

## Header Requirements

### Standard Headers for All Requests
```javascript
const getStandardHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
});
```

### Authenticated Headers
```javascript
const getAuthenticatedHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
  };
};
```

---

## Route Guards

### Backend Guards Applied to Routes

#### 1. Public Routes (No Guard)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user

#### 2. API Key Protected Routes
- `GET /frontend/health` - No authentication
- `GET /frontend/auth-test` - API Key required

#### 3. JWT Protected Routes
- `GET /auth/profile` - User authentication required
- `PATCH /users/:id` - User authentication required
- `DELETE /users/:id` - User authentication required
- `GET /upload/presigned-url` - User authentication required
- `POST /projects` - User authentication required
- `GET /projects/:id` - User authentication required
- `PATCH /projects/:id` - User authentication required
- `DELETE /projects/:id` - User authentication required
- `POST /issues` - User authentication required
- `GET /issues/:id` - User authentication required
- `PATCH /issues/:id` - User authentication required
- `POST /chat/conversations` - User authentication required
- `GET /github/repos` - User authentication required

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```javascript
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 401 Invalid API Key
```javascript
{
  "statusCode": 401,
  "message": "Invalid API Key",
  "error": "Unauthorized"
}
```

#### 401 Invalid JWT Token
```javascript
{
  "statusCode": 401,
  "message": "Invalid JWT token",
  "error": "Unauthorized"
}
```

### Frontend Error Handling Example
```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      // Handle authentication error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

---

## Example Implementation

### Complete Auth Service
```javascript
// services/authService.js
class AuthService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY;
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    this.setAuthData(data);
    return data;
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.setAuthData(data);
    return data;
  }

  async getProfile() {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': this.apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuthData();
      }
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  }

  setAuthData(data) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    this.clearAuthData();
    window.location.href = '/login';
  }
}

export default new AuthService();
```

### API Client with Auto-Authentication
```javascript
// services/apiClient.js
import authService from './authService';

class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers
      }
    };

    // Add JWT token if available
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, config);

    if (response.status === 401) {
      authService.logout();
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export default new ApiClient();
```

---

## Migration Checklist

### ✅ Environment Setup
- [ ] Add `NEXT_PUBLIC_API_KEY` to frontend environment
- [ ] Update `NEXT_PUBLIC_API_URL` to production endpoint
- [ ] Verify `FRONTEND_API_KEY` is set in backend environment

### ✅ Authentication Flow
- [ ] Update registration component to use new API structure
- [ ] Update login component to use new API structure
- [ ] Implement GitHub OAuth callback handler
- [ ] Add JWT token storage and management

### ✅ API Integration
- [ ] Add `X-API-Key` header to all API requests
- [ ] Update authenticated requests to use `Authorization: Bearer <token>`
- [ ] Implement automatic token refresh logic
- [ ] Add proper error handling for 401 responses

### ✅ Route Protection
- [ ] Implement frontend route guards
- [ ] Add authentication state management
- [ ] Handle automatic logout on token expiry
- [ ] Add loading states for authentication checks

### ✅ Testing
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test GitHub OAuth flow
- [ ] Test protected route access
- [ ] Test error handling
- [ ] Test logout functionality

---

## Security Considerations

1. **API Key Security**: Never expose the API key in client-side code logs
2. **JWT Token Storage**: Consider using httpOnly cookies for enhanced security
3. **Token Expiry**: Implement automatic token refresh before expiry
4. **HTTPS Only**: Always use HTTPS in production
5. **Error Handling**: Don't expose sensitive error information to users

---

## Support

For questions or issues with the authentication migration:
1. Check the API documentation at `/api` (Swagger UI)
2. Review the backend logs for detailed error messages
3. Test endpoints using the provided examples
4. Ensure environment variables are correctly configured

This guide covers all aspects of the authentication system migration. Follow the examples and patterns provided for a smooth transition to the new authentication flow.