# REST API Endpoints - Phase II

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://your-api.railway.app` or `https://your-api.render.com`

## Authentication
All endpoints (except auth endpoints) require JWT token in header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "data": { /* response data */ },
  "error": null
}
```

### Error Response
```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional context */ }
  }
}
```

## Status Codes
- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## Authentication Endpoints

### POST /api/auth/signup
Register a new user account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response 201**:
```json
{
  "user": {
    "id": "user_abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2025-12-30T10:00:00Z"
  }
}
```

**Errors**:
- **400**: Validation error (weak password, invalid email)
- **409**: Email already exists

**Validation**:
- Name: 1-255 characters, required
- Email: Valid email format, max 255 characters, unique, required
- Password: 8-128 characters, required

---

### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response 200**:
```json
{
  "user": {
    "id": "user_abc123",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- **401**: Invalid credentials (generic message for security)

---

### POST /api/auth/logout
Log out the current user.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response 200**:
```json
{
  "message": "Logged out successfully"
}
```

---

## Dashboard Endpoints

### GET /api/{user_id}/dashboard/stats
Get dashboard statistics for the user.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (string, required): User ID (must match token)

**Response 200**:
```json
{
  "total_tasks": 25,
  "pending_tasks": 10,
  "completed_tasks": 15,
  "completion_rate": 60.0,
  "recent_activity": [
    {
      "task_id": 123,
      "task_title": "Buy groceries",
      "action": "completed",
      "timestamp": "2025-12-30T14:30:00Z"
    },
    {
      "task_id": 124,
      "task_title": "Finish Phase 2",
      "action": "created",
      "timestamp": "2025-12-30T12:15:00Z"
    }
  ]
}
```

**Errors**:
- **401**: Unauthorized (no/invalid token)
- **403**: Forbidden (user_id mismatch)

---

## Task Management Endpoints

### GET /api/{user_id}/tasks
List all tasks for the user with optional filtering.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (string, required): User ID (must match token)

**Query Parameters**:
- `status` (string, optional): Filter by status
  - `all` (default): Show all tasks
  - `pending`: Show only incomplete tasks
  - `completed`: Show only completed tasks

**Response 200**:
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": "user_abc123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2025-12-30T10:00:00Z",
      "updated_at": "2025-12-30T10:00:00Z"
    },
    {
      "id": 2,
      "user_id": "user_abc123",
      "title": "Call dentist",
      "description": null,
      "completed": true,
      "created_at": "2025-12-29T15:30:00Z",
      "updated_at": "2025-12-30T09:00:00Z"
    }
  ],
  "total": 2
}
```

**Errors**:
- **401**: Unauthorized (no/invalid token)
- **403**: Forbidden (user_id mismatch)

**Sorting**: Tasks sorted by `created_at` DESC (newest first)

---

### POST /api/{user_id}/tasks
Create a new task.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (string, required): User ID (must match token)

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"  // optional
}
```

**Response 201**:
```json
{
  "id": 1,
  "user_id": "user_abc123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-30T10:00:00Z",
  "updated_at": "2025-12-30T10:00:00Z"
}
```

**Errors**:
- **400**: Validation error (missing title, too long, etc.)
- **401**: Unauthorized
- **403**: Forbidden

**Validation**:
- Title: 1-200 characters, required, trimmed
- Description: 0-1000 characters, optional, trimmed

---

### GET /api/{user_id}/tasks/{id}
Get details of a specific task.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (string, required): User ID (must match token)
- `id` (integer, required): Task ID

**Response 200**:
```json
{
  "id": 1,
  "user_id": "user_abc123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-30T10:00:00Z",
  "updated_at": "2025-12-30T10:00:00Z"
}
```

**Errors**:
- **401**: Unauthorized
- **403**: Forbidden (user doesn't own task)
- **404**: Task not found

---

### PUT /api/{user_id}/tasks/{id}
Update a task (full update).

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (string, required): User ID (must match token)
- `id` (integer, required): Task ID

**Request Body**:
```json
{
  "title": "Buy groceries and fruits",  // optional
  "description": "Updated description",  // optional
  "completed": true                      // optional
}
```

**Response 200**:
```json
{
  "id": 1,
  "user_id": "user_abc123",
  "title": "Buy groceries and fruits",
  "description": "Updated description",
  "completed": true,
  "created_at": "2025-12-30T10:00:00Z",
  "updated_at": "2025-12-30T11:30:00Z"
}
```

**Errors**:
- **400**: Validation error
- **401**: Unauthorized
- **403**: Forbidden (user doesn't own task)
- **404**: Task not found

**Behavior**:
- Only provided fields are updated
- `updated_at` timestamp is automatically updated

---

### DELETE /api/{user_id}/tasks/{id}
Delete a task.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (string, required): User ID (must match token)
- `id` (integer, required): Task ID

**Response 204**: No Content (success)

**Errors**:
- **401**: Unauthorized
- **403**: Forbidden (user doesn't own task)
- **404**: Task not found

**Behavior**:
- Task permanently deleted from database
- Cannot be undone

---

### PATCH /api/{user_id}/tasks/{id}/complete
Toggle task completion status.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (string, required): User ID (must match token)
- `id` (integer, required): Task ID

**Response 200**:
```json
{
  "id": 1,
  "user_id": "user_abc123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2025-12-30T10:00:00Z",
  "updated_at": "2025-12-30T12:00:00Z"
}
```

**Errors**:
- **401**: Unauthorized
- **403**: Forbidden (user doesn't own task)
- **404**: Task not found

**Behavior**:
- Toggles `completed` field (true → false or false → true)
- `updated_at` timestamp is automatically updated

---

## Error Codes

### Authentication Errors
- `AUTH_REQUIRED`: No authorization token provided
- `TOKEN_INVALID`: JWT token is malformed or has invalid signature
- `TOKEN_EXPIRED`: JWT token has expired
- `INVALID_CREDENTIALS`: Email or password is incorrect
- `EMAIL_EXISTS`: Email already registered

### Authorization Errors
- `FORBIDDEN`: User doesn't have permission to access resource
- `USER_MISMATCH`: user_id in URL doesn't match authenticated user

### Validation Errors
- `VALIDATION_ERROR`: Request data failed validation
- `TITLE_REQUIRED`: Task title is required
- `TITLE_TOO_LONG`: Task title exceeds 200 characters
- `DESCRIPTION_TOO_LONG`: Task description exceeds 1000 characters

### Resource Errors
- `TASK_NOT_FOUND`: Task with given ID doesn't exist
- `USER_NOT_FOUND`: User with given ID doesn't exist

### Server Errors
- `INTERNAL_ERROR`: Unexpected server error (logged for debugging)

---

## Rate Limiting (Production)
- **Limit**: 100 requests per minute per IP
- **Header**: `X-RateLimit-Remaining`
- **Status**: 429 Too Many Requests (when exceeded)

---

## CORS Configuration

### Allowed Origins
- Development: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

### Allowed Methods
- GET, POST, PUT, PATCH, DELETE, OPTIONS

### Allowed Headers
- Content-Type, Authorization

### Credentials
- Allowed: Yes

---

## API Documentation

### Interactive Documentation
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`

### OpenAPI Specification
- **JSON**: `/openapi.json`

---

## Testing

### Example using cURL

**Create Task**:
```bash
curl -X POST http://localhost:8000/api/user_abc123/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

**List Tasks**:
```bash
curl -X GET "http://localhost:8000/api/user_abc123/tasks?status=pending" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Toggle Complete**:
```bash
curl -X PATCH http://localhost:8000/api/user_abc123/tasks/1/complete \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

**API Version**: 1.0.0
**Last Updated**: 2025-12-30
**Status**: ✅ Complete for Phase II
