# Frontend Authentication Migration Guide

## Overview

This guide provides a complete reference for migrating your frontend to the **Better Auth** authentication system. The backend now uses Better Auth, which provides a comprehensive authentication solution with built-in security features, automatic session management, and seamless OAuth integration.

## Table of Contents

1. [Better Auth Overview](#better-auth-overview)
2. [Migration Steps](#migration-steps)
3. [Environment Setup](#environment-setup)
4. [Client Setup](#client-setup)
5. [Authentication Flow](#authentication-flow)
6. [Session Management](#session-management)
7. [API Integration](#api-integration)
8. [Error Handling](#error-handling)
9. [Example Implementation](#example-implementation)
10. [Migration Checklist](#migration-checklist)

---

## Better Auth Overview

### Key Changes from Legacy System

1. **Session Management**: Automatic cookie-based sessions (no manual JWT handling)
2. **Authentication**: Built-in email/password and OAuth providers
3. **Security**: Built-in CSRF protection and session validation
4. **Integration**: Single auth client for all authentication needs

### Benefits
- **Simplified Integration**: No manual token management
- **Enhanced Security**: Built-in security features
- **Automatic OAuth**: GitHub OAuth handled automatically
- **Session Persistence**: Automatic session management across requests

---

## Migration Steps

### Step 1: Remove Legacy Code

```javascript
// Remove these legacy patterns:
// ❌ Manual JWT token storage
localStorage.removeItem('accessToken');
localStorage.removeItem('user');

// ❌ Manual Authorization headers
// headers: { 'Authorization': `Bearer ${token}` }

// ❌ Manual API key headers
// headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY }
```

### Step 2: Install Better Auth Client

```bash
npm install better-auth
# or
yarn add better-auth
# or
bun add better-auth
```

### Step 3: Update Environment Variables

```env
# Replace legacy variables with Better Auth configuration
# Remove these:
# NEXT_PUBLIC_API_KEY=...
# NEXT_PUBLIC_JWT_SECRET=...

# Add these:
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

---

## Environment Setup

### Backend Environment Variables (Already Configured)
```env
# Better Auth Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
BACKEND_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=your-production-database-url
```

### Frontend Environment Variables
```env
# Better Auth Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

---

## Client Setup

### Create Auth Client

```javascript
// lib/auth-client.js
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
```

---

## Authentication Flow

### 1. Registration

#### Better Auth Registration
```javascript
// components/auth/RegisterForm.js
import { useState } from 'react';
import { authClient } from '../../lib/auth-client';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Registration successful - session is automatically managed
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### 2. Login

#### Better Auth Login
```javascript
// components/auth/LoginForm.js
import { useState } from 'react';
import { authClient } from '../../lib/auth-client';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Login successful - session is automatically managed
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: `${window.location.origin}/auth/callback`,
      });
    } catch (err) {
      setError('GitHub login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      <button type="button" onClick={handleGitHubLogin}>
        Sign In with GitHub
      </button>
    </form>
  );
}
```

### 3. GitHub OAuth Flow

#### OAuth Integration (Automatic)
```javascript
// GitHub OAuth is handled automatically by Better Auth
// Just call the social sign-in method

const handleGitHubLogin = async () => {
  try {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/auth/callback`,
    });
  } catch (err) {
    console.error('GitHub login failed:', err);
  }
};
```

#### OAuth Callback Handler
```javascript
// pages/auth/callback.js (Next.js)
import { useEffect } from 'react';
import { authClient } from '../../lib/auth-client';

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Better Auth automatically handles the OAuth callback
        const { data: session } = await authClient.getSession();

        if (session) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login?error=callback_failed';
        }
      } catch (error) {
        window.location.href = '/login?error=callback_failed';
      }
    };

    handleCallback();
  }, []);

  return <div>Processing authentication...</div>;
}
```

---

## Session Management

### Session Hook (React)
```javascript
// hooks/useAuth.js
import { useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (mounted) {
          if (error) {
            setError(error);
          } else {
            setSession(data);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    checkSession();

    // Listen for session changes
    const unsubscribe = authClient.onSessionChange((session) => {
      if (mounted) {
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await authClient.signOut();
      setSession(null);
    } catch (err) {
      setError(err);
    }
  };

  return {
    session,
    user: session?.user,
    loading,
    error,
    signOut,
    isAuthenticated: !!session,
  };
}
```

### Auth Context Provider
```javascript
// contexts/AuthContext.js
import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

---

## API Integration

### API Client with Better Auth
```javascript
// lib/api-client.js
import { authClient } from './auth-client';

class ApiClient {
  constructor(baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get session for authentication
    const { data: session } = await authClient.getSession();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for Better Auth cookies
      ...options,
    };

    // Add session token if available
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Session expired, redirect to login
      await authClient.signOut();
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### Service Layer Example
```javascript
// services/userService.js
import { apiClient } from '../lib/api-client';

export const userService = {
  async getProfile() {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(userData) {
    return apiClient.patch('/users/me', userData);
  },

  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/users?${query}`);
  },

  async deleteUser(userId) {
    return apiClient.delete(`/users/${userId}`);
  },
};
```

### Route Protection
```javascript
// components/auth/ProtectedRoute.js
import { useAuthContext } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
```

---

## Error Handling

### Error Handling Hook
```javascript
// hooks/useErrorHandler.js
import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    console.error('Error:', error);

    if (error.message?.includes('unauthorized')) {
      // Handle auth errors
      setError('Authentication failed. Please sign in again.');
    } else if (error.message?.includes('network')) {
      // Handle network errors
      setError('Network error. Please check your connection.');
    } else {
      // Handle other errors
      setError(error.message || 'An unexpected error occurred.');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
```

### Error Boundary Component
```javascript
// components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Better Auth Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Authentication Error</h2>
          <p>Something went wrong with authentication.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## Example Implementation

### Complete App Setup
```javascript
// pages/_app.js (Next.js)
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### Dashboard Component
```javascript
// pages/dashboard.js
import { useAuthContext } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function Dashboard() {
  const { user, signOut } = useAuthContext();

  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    </ProtectedRoute>
  );
}
```

### TypeScript Support
```typescript
// types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  githubId?: string;
  githubUsername?: string;
  githubConnected?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

---

## Migration Checklist

### ✅ Environment Setup
- [ ] Remove legacy environment variables (`NEXT_PUBLIC_API_KEY`, `NEXT_PUBLIC_JWT_SECRET`)
- [ ] Add `NEXT_PUBLIC_API_URL` to frontend environment
- [ ] Add `NEXT_PUBLIC_GITHUB_CLIENT_ID` to frontend environment
- [ ] Verify backend Better Auth configuration is complete

### ✅ Dependency Management
- [ ] Install Better Auth client: `npm install better-auth`
- [ ] Remove legacy auth libraries if any
- [ ] Update package.json dependencies

### ✅ Code Migration
- [ ] Remove all `localStorage` token management code
- [ ] Remove manual `X-API-Key` header implementations
- [ ] Remove manual `Authorization: Bearer` header implementations
- [ ] Replace with Better Auth client calls

### ✅ Authentication Flow
- [ ] Update registration component to use Better Auth
- [ ] Update login component to use Better Auth
- [ ] Implement Better Auth OAuth callback handler
- [ ] Replace manual session management with Better Auth hooks

### ✅ API Integration
- [ ] Update API client to use Better Auth sessions
- [ ] Add `credentials: 'include'` to fetch requests
- [ ] Remove manual token handling from API calls
- [ ] Update error handling for Better Auth responses

### ✅ Route Protection
- [ ] Implement Better Auth route guards
- [ ] Update authentication state management
- [ ] Replace manual session checks with Better Auth hooks
- [ ] Add Better Auth context provider

### ✅ Testing
- [ ] Test registration flow with Better Auth
- [ ] Test login flow with Better Auth
- [ ] Test GitHub OAuth flow with Better Auth
- [ ] Test protected route access
- [ ] Test session persistence across page refreshes
- [ ] Test logout functionality

---

## Key Differences from Legacy System

### What's Changed
1. **No Manual Token Management**: Better Auth handles all tokens automatically
2. **Cookie-Based Sessions**: Sessions are managed via secure cookies
3. **No API Keys**: No need for `X-API-Key` headers
4. **Automatic CSRF Protection**: Built-in security features
5. **Simplified OAuth**: GitHub OAuth is handled automatically

### What's Removed
- `localStorage.setItem('accessToken', ...)` ❌
- `localStorage.setItem('user', ...)` ❌
- `headers: { 'X-API-Key': ... }` ❌
- `headers: { 'Authorization': 'Bearer ...' }` ❌
- Manual OAuth callback handling ❌

### What's Added
- `authClient.signIn.email()` ✅
- `authClient.signUp.email()` ✅
- `authClient.getSession()` ✅
- `authClient.signOut()` ✅
- `credentials: 'include'` in fetch requests ✅

---

## Migration Support

### Troubleshooting Common Issues

1. **Sessions not persisting**: Ensure `credentials: 'include'` is set in all fetch requests
2. **OAuth callback fails**: Verify callback URLs are correctly configured in GitHub app settings
3. **CORS errors**: Check that `trustedOrigins` includes your frontend URL in Better Auth config
4. **404 on auth endpoints**: Better Auth endpoints are at `/api/auth/*`, not `/auth/*`

### Debug Mode
```javascript
// lib/auth-client.js
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  debug: process.env.NODE_ENV === 'development',
});
```

### Support Resources
- [Better Auth Documentation](https://better-auth.com/docs)
- [API Documentation](http://localhost:3001/api) (Swagger UI)
- [GitHub Repository Issues](https://github.com/better-auth/better-auth/issues)

---

## Complete Migration Example

### Before (Legacy)
```javascript
// ❌ Legacy implementation
const login = async (credentials) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
    },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};
```

### After (Better Auth)
```javascript
// ✅ Better Auth implementation
const login = async (credentials) => {
  const { data, error } = await authClient.signIn.email({
    email: credentials.email,
    password: credentials.password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Session is automatically managed - no manual storage needed
  return data;
};
```

This migration guide provides a complete transition path from the legacy authentication system to Better Auth. The new system is more secure, easier to maintain, and provides a better developer experience.

---

**🚀 Ready to migrate? Start with the [Migration Checklist](#migration-checklist) and follow the examples in this guide!**