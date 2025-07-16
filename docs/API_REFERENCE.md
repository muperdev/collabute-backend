# API Reference

Complete API reference for the Collabute backend API.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.collabute.com`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Content Types

- **Request**: `application/json`
- **Response**: `application/json`

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Responses

Error responses include:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "DEVELOPER"
  }
}
```

### POST /auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "type": "DEVELOPER"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "DEVELOPER"
  }
}
```

### GET /auth/github

Initiate GitHub OAuth flow.

**Response:**
Redirects to GitHub OAuth page.

### GET /auth/github/callback

Handle GitHub OAuth callback.

**Query Parameters:**
- `code` - GitHub OAuth code

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "githubUsername": "johndoe"
  }
}
```

### POST /auth/refresh

Refresh JWT token.

**Headers:**
```
Authorization: Bearer <refresh-token>
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Endpoints

### GET /users/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "type": "DEVELOPER",
  "bio": "Full-stack developer",
  "skills": ["JavaScript", "React", "Node.js"],
  "githubUsername": "johndoe",
  "githubConnected": true
}
```

### PATCH /users/profile

Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "John Smith",
  "bio": "Senior developer",
  "skills": ["JavaScript", "React", "Node.js", "Python"]
}
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Smith",
  "bio": "Senior developer",
  "skills": ["JavaScript", "React", "Node.js", "Python"]
}
```

### GET /users/:id

Get user by ID.

**Parameters:**
- `id` - User ID

**Response:**
```json
{
  "id": "user-id",
  "name": "John Doe",
  "type": "DEVELOPER",
  "bio": "Full-stack developer",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

### POST /users/:id/github

Connect GitHub account.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - User ID

**Request:**
```json
{
  "code": "github-oauth-code"
}
```

**Response:**
```json
{
  "githubUsername": "johndoe",
  "githubConnected": true
}
```

---

## Project Endpoints

### GET /projects

Get all projects.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Project type filter
- `status` - Project status filter
- `ownerId` - Owner ID filter

**Response:**
```json
[
  {
    "id": "project-id",
    "title": "My Project",
    "description": "Project description",
    "type": "OPEN_SOURCE",
    "status": "ACTIVE",
    "owner": {
      "id": "user-id",
      "name": "John Doe"
    },
    "repository": {
      "name": "my-repo",
      "fullName": "johndoe/my-repo",
      "url": "https://github.com/johndoe/my-repo"
    },
    "collaborators": 5,
    "issues": 3
  }
]
```

### GET /projects/:id

Get project by ID.

**Parameters:**
- `id` - Project ID

**Response:**
```json
{
  "id": "project-id",
  "title": "My Project",
  "description": "Project description",
  "type": "OPEN_SOURCE",
  "status": "ACTIVE",
  "owner": {
    "id": "user-id",
    "name": "John Doe"
  },
  "repository": {
    "name": "my-repo",
    "fullName": "johndoe/my-repo",
    "url": "https://github.com/johndoe/my-repo"
  },
  "collaborators": [
    {
      "user": {
        "id": "user-id",
        "name": "Jane Doe"
      },
      "status": "ACTIVE"
    }
  ],
  "issues": [
    {
      "id": "issue-id",
      "title": "Fix bug",
      "status": "OPEN",
      "priority": "HIGH"
    }
  ]
}
```

### POST /projects

Create a new project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "My New Project",
  "description": "Project description",
  "type": "OPEN_SOURCE",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "id": "project-id",
  "title": "My New Project",
  "description": "Project description",
  "type": "OPEN_SOURCE",
  "status": "ACTIVE",
  "slug": "my-new-project",
  "owner": {
    "id": "user-id",
    "name": "John Doe"
  }
}
```

### PATCH /projects/:id

Update project.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Project ID

**Request:**
```json
{
  "title": "Updated Project",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

**Response:**
```json
{
  "id": "project-id",
  "title": "Updated Project",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

### DELETE /projects/:id

Delete project.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Project ID

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

### POST /projects/:id/connect-repository

Connect GitHub repository to project.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Project ID

**Request:**
```json
{
  "repoFullName": "johndoe/my-repo"
}
```

**Response:**
```json
{
  "repository": {
    "name": "my-repo",
    "fullName": "johndoe/my-repo",
    "url": "https://github.com/johndoe/my-repo",
    "isPrivate": false,
    "language": "JavaScript"
  }
}
```

---

## Issue Endpoints

### GET /issues

Get all issues.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `projectId` - Project ID filter
- `status` - Issue status filter
- `type` - Issue type filter
- `priority` - Issue priority filter
- `assigneeId` - Assignee ID filter
- `reporterId` - Reporter ID filter

**Response:**
```json
[
  {
    "id": "issue-id",
    "title": "Fix login bug",
    "description": "Users cannot login",
    "type": "BUG",
    "priority": "HIGH",
    "status": "OPEN",
    "reporter": {
      "id": "user-id",
      "name": "John Doe"
    },
    "assignees": [
      {
        "id": "user-id",
        "name": "Jane Doe"
      }
    ],
    "project": {
      "id": "project-id",
      "title": "My Project"
    }
  }
]
```

### GET /issues/:id

Get issue by ID.

**Parameters:**
- `id` - Issue ID

**Response:**
```json
{
  "id": "issue-id",
  "title": "Fix login bug",
  "description": "Users cannot login",
  "longDescription": "Detailed description...",
  "type": "BUG",
  "category": ["BACKEND", "SECURITY"],
  "priority": "HIGH",
  "status": "OPEN",
  "budget": 1000,
  "labels": ["bug", "security"],
  "reporter": {
    "id": "user-id",
    "name": "John Doe"
  },
  "assignees": [
    {
      "id": "user-id",
      "name": "Jane Doe"
    }
  ],
  "project": {
    "id": "project-id",
    "title": "My Project",
    "owner": {
      "id": "user-id",
      "name": "John Doe"
    }
  }
}
```

### POST /issues

Create a new issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Fix login bug",
  "description": "Users cannot login",
  "longDescription": "Detailed description...",
  "type": "BUG",
  "category": ["BACKEND", "SECURITY"],
  "priority": "HIGH",
  "status": "OPEN",
  "projectId": "project-id",
  "assigneeIds": ["user-id"],
  "budget": 1000,
  "labels": ["bug", "security"]
}
```

**Response:**
```json
{
  "id": "issue-id",
  "title": "Fix login bug",
  "slug": "fix-login-bug",
  "description": "Users cannot login",
  "type": "BUG",
  "priority": "HIGH",
  "status": "OPEN",
  "reporter": {
    "id": "user-id",
    "name": "John Doe"
  },
  "assignees": [
    {
      "id": "user-id",
      "name": "Jane Doe"
    }
  ]
}
```

### PATCH /issues/:id

Update issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Issue ID

**Request:**
```json
{
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "assigneeIds": ["user-id-1", "user-id-2"]
}
```

**Response:**
```json
{
  "id": "issue-id",
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "assignees": [
    {
      "id": "user-id-1",
      "name": "Jane Doe"
    },
    {
      "id": "user-id-2",
      "name": "Bob Smith"
    }
  ]
}
```

### DELETE /issues/:id

Delete issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Issue ID

**Response:**
```json
{
  "message": "Issue deleted successfully"
}
```

---

## Chat Endpoints

### GET /chat/conversations

Get user conversations.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `type` - Conversation type filter
- `projectId` - Project ID filter

**Response:**
```json
[
  {
    "id": "conversation-id",
    "title": "Project Discussion",
    "type": "PROJECT",
    "participants": [
      {
        "user": {
          "id": "user-id",
          "name": "John Doe"
        },
        "role": "ADMIN"
      }
    ],
    "project": {
      "id": "project-id",
      "title": "My Project"
    },
    "messages": [
      {
        "id": "message-id",
        "content": "Hello team!",
        "sender": {
          "id": "user-id",
          "name": "John Doe"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "messageCount": 5
  }
]
```

### GET /chat/conversations/:id

Get conversation by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Conversation ID

**Response:**
```json
{
  "id": "conversation-id",
  "title": "Project Discussion",
  "type": "PROJECT",
  "participants": [
    {
      "user": {
        "id": "user-id",
        "name": "John Doe"
      },
      "role": "ADMIN"
    }
  ],
  "project": {
    "id": "project-id",
    "title": "My Project"
  },
  "createdBy": {
    "id": "user-id",
    "name": "John Doe"
  }
}
```

### POST /chat/conversations

Create a new conversation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "New Discussion",
  "type": "PROJECT",
  "projectId": "project-id",
  "participantIds": ["user-id-1", "user-id-2"]
}
```

**Response:**
```json
{
  "id": "conversation-id",
  "title": "New Discussion",
  "type": "PROJECT",
  "participants": [
    {
      "user": {
        "id": "user-id",
        "name": "John Doe"
      },
      "role": "ADMIN"
    }
  ],
  "project": {
    "id": "project-id",
    "title": "My Project"
  }
}
```

### POST /chat/messages

Send a message.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "content": "Hello everyone!",
  "conversationId": "conversation-id",
  "replyToId": "message-id"
}
```

**Response:**
```json
{
  "id": "message-id",
  "content": "Hello everyone!",
  "sender": {
    "id": "user-id",
    "name": "John Doe"
  },
  "replyTo": {
    "id": "message-id",
    "content": "Previous message",
    "sender": {
      "id": "user-id",
      "name": "Jane Doe"
    }
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /chat/conversations/:id/messages

Get conversation messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Conversation ID

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
[
  {
    "id": "message-id",
    "content": "Hello everyone!",
    "sender": {
      "id": "user-id",
      "name": "John Doe"
    },
    "replyTo": {
      "id": "message-id",
      "content": "Previous message",
      "sender": {
        "id": "user-id",
        "name": "Jane Doe"
      }
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### DELETE /chat/messages/:id

Delete a message.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Message ID

**Response:**
```json
{
  "message": "Message deleted successfully"
}
```

### POST /chat/conversations/:id/participants

Add participant to conversation.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Conversation ID

**Request:**
```json
{
  "participantId": "user-id"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "John Doe"
  },
  "role": "MEMBER"
}
```

### DELETE /chat/conversations/:id/participants/:participantId

Remove participant from conversation.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Conversation ID
- `participantId` - Participant ID

**Response:**
```json
{
  "message": "Participant removed successfully"
}
```

### POST /chat/conversations/:id/read

Mark conversation as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Conversation ID

**Response:**
```json
{
  "message": "Conversation marked as read"
}
```

---

## GitHub Integration Endpoints

### GET /github/user

Get GitHub user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 12345,
  "login": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar_url": "https://github.com/avatars/johndoe.png",
  "bio": "Developer",
  "company": "My Company",
  "location": "San Francisco",
  "public_repos": 25,
  "followers": 100,
  "following": 50
}
```

### GET /github/repositories

Get user GitHub repositories.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 30)

**Response:**
```json
[
  {
    "id": 12345,
    "name": "my-repo",
    "full_name": "johndoe/my-repo",
    "description": "My repository",
    "private": false,
    "html_url": "https://github.com/johndoe/my-repo",
    "clone_url": "https://github.com/johndoe/my-repo.git",
    "language": "JavaScript",
    "default_branch": "main",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "stargazers_count": 10,
    "forks_count": 5,
    "open_issues_count": 2
  }
]
```

### GET /github/repositories/:owner/:repo

Get repository details.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Response:**
```json
{
  "id": 12345,
  "name": "my-repo",
  "full_name": "johndoe/my-repo",
  "description": "My repository",
  "private": false,
  "html_url": "https://github.com/johndoe/my-repo",
  "clone_url": "https://github.com/johndoe/my-repo.git",
  "language": "JavaScript",
  "default_branch": "main",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "stargazers_count": 10,
  "forks_count": 5,
  "open_issues_count": 2
}
```

### GET /github/repositories/:owner/:repo/issues

Get repository issues.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Query Parameters:**
- `state` - Issue state (open, closed, all)

**Response:**
```json
[
  {
    "id": 12345,
    "number": 1,
    "title": "Fix bug",
    "body": "Issue description",
    "state": "open",
    "user": {
      "login": "johndoe",
      "avatar_url": "https://github.com/avatars/johndoe.png"
    },
    "assignees": [
      {
        "login": "janedoe",
        "avatar_url": "https://github.com/avatars/janedoe.png"
      }
    ],
    "labels": [
      {
        "name": "bug",
        "color": "d73a4a"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "html_url": "https://github.com/johndoe/my-repo/issues/1"
  }
]
```

### GET /github/repositories/:owner/:repo/commits

Get repository commits.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Query Parameters:**
- `branch` - Branch name

**Response:**
```json
[
  {
    "sha": "abc123",
    "commit": {
      "message": "Fix bug",
      "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "date": "2024-01-01T00:00:00Z"
      }
    },
    "author": {
      "login": "johndoe",
      "avatar_url": "https://github.com/avatars/johndoe.png"
    },
    "html_url": "https://github.com/johndoe/my-repo/commit/abc123"
  }
]
```

### GET /github/repositories/:owner/:repo/branches

Get repository branches.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Response:**
```json
[
  {
    "name": "main",
    "commit": {
      "sha": "abc123"
    }
  },
  {
    "name": "develop",
    "commit": {
      "sha": "def456"
    }
  }
]
```

### POST /github/repositories/:owner/:repo/issues

Create GitHub issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Request:**
```json
{
  "title": "Bug report",
  "body": "Issue description",
  "assignees": ["johndoe"],
  "labels": ["bug", "priority:high"]
}
```

**Response:**
```json
{
  "id": 12345,
  "number": 1,
  "title": "Bug report",
  "body": "Issue description",
  "state": "open",
  "user": {
    "login": "johndoe",
    "avatar_url": "https://github.com/avatars/johndoe.png"
  },
  "html_url": "https://github.com/johndoe/my-repo/issues/1"
}
```

### GET /github/repositories/:owner/:repo/sync

Sync repository data.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Response:**
```json
{
  "repository": {
    "id": 12345,
    "name": "my-repo",
    "full_name": "johndoe/my-repo"
  },
  "issues": [
    {
      "id": 12345,
      "number": 1,
      "title": "Fix bug"
    }
  ],
  "commits": [
    {
      "sha": "abc123",
      "commit": {
        "message": "Fix bug"
      }
    }
  ],
  "branches": [
    {
      "name": "main",
      "commit": {
        "sha": "abc123"
      }
    }
  ]
}
```

### GET /github/repositories/:owner/:repo/webhooks

Get repository webhooks.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Response:**
```json
[
  {
    "id": 12345,
    "name": "web",
    "active": true,
    "events": ["push", "issues", "pull_request"],
    "config": {
      "url": "https://api.collabute.com/webhooks/github",
      "content_type": "json"
    }
  }
]
```

### POST /github/repositories/:owner/:repo/webhooks

Create repository webhook.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name

**Request:**
```json
{
  "url": "https://api.collabute.com/webhooks/github",
  "events": ["push", "issues", "pull_request"]
}
```

**Response:**
```json
{
  "id": 12345,
  "name": "web",
  "active": true,
  "events": ["push", "issues", "pull_request"],
  "config": {
    "url": "https://api.collabute.com/webhooks/github",
    "content_type": "json"
  }
}
```

### DELETE /github/repositories/:owner/:repo/webhooks/:hookId

Delete repository webhook.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `owner` - Repository owner
- `repo` - Repository name
- `hookId` - Webhook ID

**Response:**
```json
{
  "message": "Webhook deleted successfully"
}
```

---

## Background Jobs Endpoints

### GET /jobs/stats

Get queue statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "email": {
    "waiting": 5,
    "active": 2,
    "completed": 100,
    "failed": 3,
    "delayed": 1
  },
  "githubSync": {
    "waiting": 0,
    "active": 1,
    "completed": 50,
    "failed": 1,
    "delayed": 0
  },
  "notifications": {
    "waiting": 10,
    "active": 3,
    "completed": 200,
    "failed": 5,
    "delayed": 2
  }
}
```

### POST /jobs/email/test

Send test email.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "jobId": "job-id",
  "message": "Test email queued successfully"
}
```

### POST /jobs/github-sync/:repositoryId

Trigger GitHub repository sync.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `repositoryId` - Repository ID

**Response:**
```json
{
  "jobId": "job-id",
  "message": "GitHub sync job queued successfully"
}
```

### POST /jobs/notifications/test

Send test notification.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "jobId": "job-id",
  "message": "Test notification queued successfully"
}
```

### POST /jobs/queues/:queueName/pause

Pause a queue.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `queueName` - Queue name (email, github-sync, notifications)

**Response:**
```json
{
  "message": "Queue email paused successfully"
}
```

### POST /jobs/queues/:queueName/resume

Resume a queue.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `queueName` - Queue name (email, github-sync, notifications)

**Response:**
```json
{
  "message": "Queue email resumed successfully"
}
```

### POST /jobs/queues/:queueName/clear

Clear a queue.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `queueName` - Queue name (email, github-sync, notifications)

**Response:**
```json
{
  "message": "Queue email cleared successfully"
}
```

---

## WebSocket Events

### Connection

Connect to the chat namespace:

```javascript
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client → Server

| Event | Description | Data |
|-------|-------------|------|
| `join-conversation` | Join a conversation | `{ conversationId: string }` |
| `leave-conversation` | Leave a conversation | `{ conversationId: string }` |
| `send-message` | Send a message | `{ conversationId: string, content: string, replyToId?: string }` |
| `typing-start` | Start typing | `{ conversationId: string }` |
| `typing-stop` | Stop typing | `{ conversationId: string }` |
| `mark-as-read` | Mark conversation as read | `{ conversationId: string }` |

#### Server → Client

| Event | Description | Data |
|-------|-------------|------|
| `connected` | Connection established | `{ userId: string, message: string }` |
| `new-message` | New message received | `{ message: Object, conversationId: string }` |
| `user-joined` | User joined conversation | `{ userId: string, conversationId: string }` |
| `user-left` | User left conversation | `{ userId: string, conversationId: string }` |
| `user-typing` | User typing status | `{ userId: string, conversationId: string, isTyping: boolean }` |
| `user-online` | User came online | `{ userId: string }` |
| `user-offline` | User went offline | `{ userId: string }` |
| `conversation-read` | Conversation marked as read | `{ userId: string, conversationId: string, readAt: Date }` |
| `message-sent` | Message sent confirmation | `{ messageId: string }` |
| `error` | Error occurred | `{ message: string }` |

---

## Data Types

### User Types

```typescript
enum UserType {
  DEVELOPER = 'DEVELOPER',
  STARTUP = 'STARTUP',
  DESIGNER = 'DESIGNER',
  LEAD = 'LEAD',
  PROJECT_MANAGER = 'PROJECT_MANAGER'
}
```

### Project Types

```typescript
enum ProjectType {
  OPEN_SOURCE = 'OPEN_SOURCE',
  PRIVATE = 'PRIVATE',
  STARTUP = 'STARTUP',
  ENTERPRISE = 'ENTERPRISE'
}

enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}
```

### Issue Types

```typescript
enum IssueType {
  BUG = 'BUG',
  FEATURE = 'FEATURE'
}

enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

enum IssueCategory {
  BACKEND = 'BACKEND',
  FRONTEND = 'FRONTEND',
  APPLICATION = 'APPLICATION',
  AI = 'AI',
  DATA = 'DATA',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  DEVOPS = 'DEVOPS',
  SECURITY = 'SECURITY',
  DATABASE = 'DATABASE',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  DOCUMENTATION = 'DOCUMENTATION',
  SEO = 'SEO'
}
```

### Chat Types

```typescript
enum ConversationType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
  PROJECT = 'PROJECT'
}

enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

enum ParticipantRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **WebSocket connections**: 10 connections per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Headers:**
```
X-Total-Count: 250
X-Page-Count: 25
X-Current-Page: 1
X-Per-Page: 10
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_001` | Invalid credentials | Email or password is incorrect |
| `AUTH_002` | Token expired | JWT token has expired |
| `AUTH_003` | Invalid token | JWT token is malformed |
| `USER_001` | User not found | User does not exist |
| `USER_002` | Email already exists | Email is already registered |
| `PROJECT_001` | Project not found | Project does not exist |
| `PROJECT_002` | Access denied | User is not authorized to access project |
| `ISSUE_001` | Issue not found | Issue does not exist |
| `ISSUE_002` | Cannot assign user | User cannot be assigned to issue |
| `CHAT_001` | Conversation not found | Conversation does not exist |
| `CHAT_002` | Not a participant | User is not a participant in conversation |
| `GITHUB_001` | GitHub not connected | User has not connected GitHub account |
| `GITHUB_002` | Repository not found | GitHub repository does not exist |

---

## Support

For API support and questions:

- **Documentation**: [http://localhost:3000/api](http://localhost:3000/api)
- **GitHub Issues**: [https://github.com/collabute/api/issues](https://github.com/collabute/api/issues)
- **Email**: support@collabute.com