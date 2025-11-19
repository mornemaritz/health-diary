# API Contracts: JWT Auth Invite

## Endpoints

### POST /auth/register

- Description: Register a new user via invite link
- Request Body:
  - invite_token (string, required)
  - username (string, required, unique)
  - password (string, required)
- Responses:
  - 201 Created: User registered
  - 400 Bad Request: Invalid/expired invite link, username taken, password invalid

### POST /auth/login

- Description: Authenticate user and issue tokens
- Request Body:
  - username (string, required)
  - password (string, required)
- Responses:
  - 200 OK: { access_token, refresh_token }
  - 401 Unauthorized: Invalid credentials
  - 429 Too Many Requests: Rate limit exceeded

### POST /auth/refresh

- Description: Refresh access token using refresh token
- Request Body:
  - refresh_token (string, required)
- Responses:
  - 200 OK: { access_token }
  - 401 Unauthorized: Invalid/expired refresh token

### GET /user/me

- Description: Get current authenticated user info
- Headers:
  - Authorization: Bearer access_token
- Responses:
  - 200 OK: { user info }
  - 401 Unauthorized: Invalid/expired access token

### POST /admin/invite

- Description: Admin generates invite link for new user
- Request Body:
  - invited_email (string, optional)
- Responses:
  - 201 Created: { invite_token, expires_at }
  - 403 Forbidden: Not authorized

## Validation Rules

- Username must be unique
- Password must meet security requirements (min length, complexity)
- Invite link must be valid, unused, and not expired
- Rate limiting: 5 attempts/min/IP for registration and login

## Error Responses

- Standardized error format:

  ```json
  {
    "error": {
      "code": "string",
      "message": "string"
    }
  }
  ```
