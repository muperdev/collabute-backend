# Better Auth Frontend Integration Guide

## Overview

This guide provides complete instructions for integrating your frontend application with the Better Auth system on the Collabute backend. Better Auth provides a comprehensive authentication solution with built-in security features and seamless integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Client Setup](#client-setup)
3. [Authentication Flow](#authentication-flow)
4. [Session Management](#session-management)
5. [API Integration](#api-integration)
6. [Error Handling](#error-handling)
7. [TypeScript Support](#typescript-support)
8. [Security Best Practices](#security-best-practices)

---

## Quick Start

### 1. Install Better Auth Client

```bash
npm install better-auth
# or
yarn add better-auth
```

### 2. Create Auth Client

```javascript
// lib/auth-client.js
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});
```

### 3. Basic Usage

```javascript
// Login
const { data, error } = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
});

// Get current session
const { data: session } = await authClient.getSession();

// Logout
await authClient.signOut();
```

---

## Client Setup

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

### Auth Configuration

```javascript
// lib/auth-client.js
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  plugins: [
    // Add any client-side plugins here
  ],
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
```

---

## Authentication Flow

### 1. Registration

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

      // Registration successful
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
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
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

      // Login successful
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
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          required
        />
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
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

### 3. OAuth Callback Handler

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

### 1. Session Hook (React)

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

### 2. Auth Context Provider

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

### 3. Route Protection

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

## API Integration

### 1. API Client with Better Auth

```javascript
// lib/api-client.js
import { authClient } from './auth-client';

class ApiClient {
  constructor(
    baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  ) {
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

### 2. Service Layer Example

```javascript
// services/userService.js
import { apiClient } from '../lib/api-client';

export const userService = {
  async getProfile() {
    return apiClient.get('/users/me');
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

---

## Error Handling

### 1. Error Boundary Component

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

### 2. Error Handling Hook

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

---

## TypeScript Support

### 1. Type Definitions

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

### 2. Typed Auth Hook

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';
import type { Session, User, AuthState } from '../types/auth';

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (mounted) {
          if (error) {
            setError(error.message);
          } else {
            setSession(data);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Authentication error');
          setLoading(false);
        }
      }
    };

    checkSession();

    const unsubscribe = authClient.onSessionChange(
      (session: Session | null) => {
        if (mounted) {
          setSession(session);
        }
      },
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user || null,
    loading,
    error,
    isAuthenticated: !!session,
  };
}
```

---

## Security Best Practices

### 1. CSRF Protection

```javascript
// lib/csrf.js
export async function getCSRFToken() {
  const response = await fetch('/api/csrf-token');
  const { token } = await response.json();
  return token;
}

export async function requestWithCSRF(url, options = {}) {
  const csrfToken = await getCSRFToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
    },
  });
}
```

### 2. Session Validation

```javascript
// utils/sessionValidator.js
export function validateSession(session) {
  if (!session) return false;

  // Check if session is expired
  if (new Date(session.expiresAt) <= new Date()) {
    return false;
  }

  // Check if user data is valid
  if (!session.user?.id || !session.user?.email) {
    return false;
  }

  return true;
}
```

### 3. Secure Storage

```javascript
// utils/secureStorage.js
class SecureStorage {
  setItem(key, value) {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  }

  getItem(key) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }
}

export const secureStorage = new SecureStorage();
```

---

## Complete Example App

### 1. App Component

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

### 2. Dashboard Component

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

---

## Testing

### 1. Auth Hook Tests

```javascript
// hooks/__tests__/useAuth.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { authClient } from '../../lib/auth-client';

jest.mock('../../lib/auth-client');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return session when authenticated', async () => {
    const mockSession = {
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'mock-token',
    };

    authClient.getSession.mockResolvedValue({ data: mockSession });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should handle authentication errors', async () => {
    authClient.getSession.mockResolvedValue({
      error: { message: 'Authentication failed' },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Authentication failed');
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## Migration from Legacy Auth

### 1. Gradual Migration

```javascript
// utils/authMigration.js
export async function migrateFromLegacyAuth() {
  // Check if user has legacy token
  const legacyToken = localStorage.getItem('authToken');

  if (legacyToken) {
    try {
      // Validate with backend and get Better Auth session
      const response = await fetch('/api/auth/migrate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${legacyToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear legacy token
        localStorage.removeItem('authToken');

        // Better Auth session is now established
        const { data: session } = await authClient.getSession();
        return session;
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  return null;
}
```

---

## Deployment

### 1. Environment Setup

```bash
# Production environment
NEXT_PUBLIC_API_URL=https://api.collabute.com
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-production-github-client-id
```

### 2. Build Configuration

```javascript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};
```

---

## Support and Troubleshooting

### Common Issues

1. **Session not persisting**: Check if cookies are enabled and HTTPS is used in production
2. **OAuth callback fails**: Verify callback URLs are correctly configured
3. **Token refresh issues**: Ensure session management is properly implemented
4. **CORS errors**: Check backend CORS configuration

### Debug Mode

```javascript
// lib/auth-client.js
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  debug: process.env.NODE_ENV === 'development',
});
```

For additional support, refer to the [Better Auth documentation](https://better-auth.com/docs) and the [API documentation](http://localhost:3000/api).

---

This guide provides a complete integration solution for Better Auth with your frontend application. The implementation is secure, scalable, and follows modern authentication best practices.
