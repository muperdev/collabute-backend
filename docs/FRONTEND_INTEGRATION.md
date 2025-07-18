# Frontend Integration Guide

This guide provides comprehensive instructions for integrating your frontend application with the Collabute API.

## 🚀 Quick Start

### 1. API Client Setup

#### Using Axios (Recommended)

```bash
npm install axios
```

```javascript
// api/client.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

#### Using Fetch API

```javascript
// api/client.js
class ApiClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiClient();
```

### 2. Authentication

#### Login Component

```javascript
// components/Auth/Login.js
import React, { useState } from 'react';
import apiClient from '../../api/client';

const Login = ({ onLogin }) => {
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
      const response = await apiClient.post('/auth/login', credentials);
      const { access_token, user } = response.data;

      // Store token
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/github`;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({
              ...credentials,
              email: e.target.value,
            })
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
            setCredentials({
              ...credentials,
              password: e.target.value,
            })
          }
          required
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <button type="button" onClick={handleGitHubLogin}>
        Login with GitHub
      </button>
    </form>
  );
};

export default Login;
```

#### Auth Context

```javascript
// contexts/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (token && user) {
      dispatch({ type: 'LOGIN', payload: JSON.parse(user) });
    }
  }, []);

  const login = (user) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 3. API Service Layer

#### Users Service

```javascript
// services/userService.js
import apiClient from '../api/client';

export const userService = {
  async getProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await apiClient.patch('/users/profile', userData);
    return response.data;
  },

  async getUser(userId) {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  async connectGitHub(code) {
    const response = await apiClient.post('/users/github', { code });
    return response.data;
  },
};
```

#### Projects Service

```javascript
// services/projectService.js
import apiClient from '../api/client';

export const projectService = {
  async getProjects(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/projects?${query}`);
    return response.data;
  },

  async getProject(projectId) {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  async createProject(projectData) {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  async updateProject(projectId, projectData) {
    const response = await apiClient.patch(
      `/projects/${projectId}`,
      projectData,
    );
    return response.data;
  },

  async deleteProject(projectId) {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
  },

  async connectRepository(projectId, repoData) {
    const response = await apiClient.post(
      `/projects/${projectId}/connect-repository`,
      repoData,
    );
    return response.data;
  },
};
```

#### Issues Service

```javascript
// services/issueService.js
import apiClient from '../api/client';

export const issueService = {
  async getIssues(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/issues?${query}`);
    return response.data;
  },

  async getIssue(issueId) {
    const response = await apiClient.get(`/issues/${issueId}`);
    return response.data;
  },

  async createIssue(issueData) {
    const response = await apiClient.post('/issues', issueData);
    return response.data;
  },

  async updateIssue(issueId, issueData) {
    const response = await apiClient.patch(`/issues/${issueId}`, issueData);
    return response.data;
  },

  async deleteIssue(issueId) {
    const response = await apiClient.delete(`/issues/${issueId}`);
    return response.data;
  },
};
```

### 4. Real-time Chat Integration

#### Chat Service

```javascript
// services/chatService.js
import apiClient from '../api/client';

export const chatService = {
  async getConversations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/chat/conversations?${query}`);
    return response.data;
  },

  async getConversation(conversationId) {
    const response = await apiClient.get(
      `/chat/conversations/${conversationId}`,
    );
    return response.data;
  },

  async createConversation(conversationData) {
    const response = await apiClient.post(
      '/chat/conversations',
      conversationData,
    );
    return response.data;
  },

  async sendMessage(messageData) {
    const response = await apiClient.post('/chat/messages', messageData);
    return response.data;
  },

  async getMessages(conversationId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `/chat/conversations/${conversationId}/messages?${query}`,
    );
    return response.data;
  },

  async markAsRead(conversationId) {
    const response = await apiClient.post(
      `/chat/conversations/${conversationId}/read`,
    );
    return response.data;
  },
};
```

#### WebSocket Hook

```javascript
// hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (namespace = '/chat') => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const socket = io(`${process.env.REACT_APP_API_URL}${namespace}`, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('error', (err) => {
      setError(err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [namespace]);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
  };
};
```

#### Chat Component

```javascript
// components/Chat/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../services/chatService';

const Chat = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isConnected, emit, on, off } = useSocket();

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      joinConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    if (isConnected) {
      on('new-message', handleNewMessage);
      on('user-typing', handleUserTyping);
    }

    return () => {
      off('new-message', handleNewMessage);
      off('user-typing', handleUserTyping);
    };
  }, [isConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = () => {
    if (isConnected) {
      emit('join-conversation', { conversationId });
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === conversationId) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const handleUserTyping = (data) => {
    // Handle typing indicators
    console.log('User typing:', data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage,
      conversationId,
    };

    try {
      // Send via WebSocket for real-time delivery
      emit('send-message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <strong>{message.sender.name}:</strong> {message.content}
            <span className="timestamp">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected || !newMessage.trim()}>
          Send
        </button>
      </form>

      {!isConnected && (
        <div className="connection-status">Disconnected from chat</div>
      )}
    </div>
  );
};

export default Chat;
```

### 5. GitHub Integration

#### GitHub Service

```javascript
// services/githubService.js
import apiClient from '../api/client';

export const githubService = {
  async getUser() {
    const response = await apiClient.get('/github/user');
    return response.data;
  },

  async getRepositories(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/github/repositories?${query}`);
    return response.data;
  },

  async getRepository(owner, repo) {
    const response = await apiClient.get(
      `/github/repositories/${owner}/${repo}`,
    );
    return response.data;
  },

  async getRepositoryIssues(owner, repo, state = 'open') {
    const response = await apiClient.get(
      `/github/repositories/${owner}/${repo}/issues?state=${state}`,
    );
    return response.data;
  },

  async getRepositoryCommits(owner, repo, branch) {
    const url = `/github/repositories/${owner}/${repo}/commits${branch ? `?branch=${branch}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async createIssue(owner, repo, issueData) {
    const response = await apiClient.post(
      `/github/repositories/${owner}/${repo}/issues`,
      issueData,
    );
    return response.data;
  },

  async syncRepository(owner, repo) {
    const response = await apiClient.get(
      `/github/repositories/${owner}/${repo}/sync`,
    );
    return response.data;
  },
};
```

### 6. Error Handling

#### Error Boundary

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
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### Global Error Handler

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return `Bad Request: ${data.message || 'Invalid request'}`;
      case 401:
        return 'Unauthorized: Please log in again';
      case 403:
        return "Forbidden: You don't have permission to perform this action";
      case 404:
        return 'Not Found: The requested resource was not found';
      case 500:
        return 'Server Error: Please try again later';
      default:
        return `Error: ${data.message || 'Something went wrong'}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network Error: Please check your connection';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};
```

### 7. State Management (Redux Toolkit)

#### Store Setup

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import projectsSlice from './slices/projectsSlice';
import issuesSlice from './slices/issuesSlice';
import chatSlice from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    issues: issuesSlice,
    chat: chatSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Auth Slice

```javascript
// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

export const loginUser = createAsyncThunk('auth/login', async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
});

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async () => {
    const response = await userService.getProfile();
    return response;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('authToken'),
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        localStorage.setItem('authToken', action.payload.access_token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### 8. Testing

#### API Service Tests

```javascript
// services/__tests__/userService.test.js
import { userService } from '../userService';
import apiClient from '../../api/client';

jest.mock('../../api/client');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get user profile', async () => {
    const mockUser = { id: '1', name: 'John Doe' };
    apiClient.get.mockResolvedValue({ data: mockUser });

    const result = await userService.getProfile();

    expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
    expect(result).toEqual(mockUser);
  });

  test('should update user profile', async () => {
    const userData = { name: 'Jane Doe' };
    const mockResponse = { id: '1', ...userData };
    apiClient.patch.mockResolvedValue({ data: mockResponse });

    const result = await userService.updateProfile(userData);

    expect(apiClient.patch).toHaveBeenCalledWith('/users/profile', userData);
    expect(result).toEqual(mockResponse);
  });
});
```

#### Component Tests

```javascript
// components/__tests__/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Auth/Login';
import apiClient from '../../api/client';

jest.mock('../../api/client');

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render login form', () => {
    render(<Login onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should handle successful login', async () => {
    const mockResponse = {
      data: {
        access_token: 'mock-token',
        user: { id: '1', name: 'John Doe' },
      },
    };
    apiClient.post.mockResolvedValue(mockResponse);

    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockResponse.data.user);
    });
  });
});
```

## 📱 Mobile Integration

### React Native Setup

```bash
npm install @react-native-async-storage/async-storage
npm install react-native-websocket
```

```javascript
// services/mobileApiClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileApiClient {
  constructor(baseURL = 'https://api.collabute.com') {
    this.baseURL = baseURL;
  }

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async setToken(token) {
    await AsyncStorage.setItem('authToken', token);
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export default new MobileApiClient();
```

## 🔧 Environment Configuration

### Development

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id
```

### Production

```env
REACT_APP_API_URL=https://api.collabute.com
REACT_APP_WS_URL=wss://api.collabute.com
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id
```

## 📊 Performance Optimization

### Caching Strategy

```javascript
// utils/cache.js
const cache = new Map();

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) {
    // 5 minutes
    return cached.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
```

### Request Debouncing

```javascript
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

## 🔒 Security Best Practices

### Token Management

```javascript
// utils/tokenManager.js
export const tokenManager = {
  getToken() {
    return localStorage.getItem('authToken');
  },

  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  removeToken() {
    localStorage.removeItem('authToken');
  },

  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },

  refreshToken() {
    // Implement token refresh logic
  },
};
```

### Input Sanitization

```javascript
// utils/sanitizer.js
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

export const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
```

## 🚀 Next Steps

1. **Set up your frontend project** with the provided API client
2. **Implement authentication** using the auth context
3. **Add real-time features** with WebSocket integration
4. **Create service layers** for each API module
5. **Add comprehensive error handling**
6. **Implement caching** for better performance
7. **Add tests** for critical functionality
8. **Deploy and configure** environment variables

For more detailed examples and advanced patterns, refer to the [API Documentation](http://localhost:3000/api) and the complete codebase examples in the `/examples` directory.

## 📞 Support

If you need help with frontend integration:

- Check the [API Documentation](http://localhost:3000/api)
- Review the [GitHub Issues](https://github.com/collabute/api/issues)
- Contact support at support@collabute.com
