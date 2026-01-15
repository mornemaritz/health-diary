# UI-Backend Integration: Invite-Only Registration Flow

**Date**: January 15, 2026  
**Feature Branch**: `002-ui-backend-integration`  
**Purpose**: Clarify the invite-only registration model and implementation requirements

## Registration Flow Overview

The Health Diary application uses an **invite-only registration model**. Users cannot self-register; instead, admins generate invite links that users receive and use to create their accounts.

### Flow Diagram

```
Admin User
    ↓
[POST /api/auth/admin/invite]
    ↓ (requires admin auth)
Gets: { inviteLink, token, email, expiresAt }
    ↓ (sends to user)
New User receives link
    ↓
Clicks link → navigates to UI with invite token in URL
    ↓
Registration page appears with form
    ↓
[GET /api/auth/invite/validate?token=...]
    ↓ (validate token on page load)
    ↓
User fills form: username, email, password, name
    ↓
[POST /api/auth/register]
    ↓ (includes inviteToken in body)
Account created
    ↓
Redirects to login page
```

## API Endpoints for Registration

### 1. Admin Generates Invite Link

**Endpoint**: `POST /api/auth/admin/invite`

**Who can call**: Admin users only (requires Bearer token with admin privileges)

**Request**:
```json
{
  "email": "newuser@example.com"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "token": "invite_token_here",
  "email": "newuser@example.com",
  "expiresAt": "2026-01-22T10:00:00Z",
  "message": "Invite link generated successfully"
}
```

**What happens next**:
- Admin sends the invite link to the user (out of band - email, chat, etc.)
- The link should be: `https://health-diary.app/register?invite={token}`

### 2. User Validates Invite Token

**Endpoint**: `GET /api/auth/invite/validate?token={invite_token}`

**Who can call**: Anyone (no auth required)

**Purpose**: Validate that the invite token is still valid and has not been used

**Response** (200 OK):
```json
{
  "message": "Invite link is valid"
}
```

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Invalid or expired invite link"
}
```

**When to call**: 
- When the registration page loads (to show/hide registration form)
- Before attempting to register

### 3. User Registers with Valid Invite

**Endpoint**: `POST /api/auth/register`

**Who can call**: Anyone (no auth required)

**Request**:
```json
{
  "inviteToken": "the_token_from_url",
  "email": "newuser@example.com",
  "username": "newuser",
  "name": "New User",
  "password": "SecurePassword123!"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "message": "User registered successfully"
}
```

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Invalid invite token or invite link has expired"
}
```

## UI Implementation Requirements

### Registration Page Location

**URL**: `https://health-diary.app/register?invite={token}`

The UI should:
1. Extract the `invite` query parameter from the URL
2. Immediately validate it with the backend
3. Show the registration form only if the token is valid
4. Show an appropriate error message if the token is invalid/expired

### Registration Form

The form should collect:
- **Email** (required, must match invite email)
- **Username** (required, 3-50 characters, alphanumeric + hyphens/underscores)
- **Full Name** (required)
- **Password** (required, minimum 8 characters)

Validation:
- Email should be pre-populated from the invite if available
- Email must not be editable if it matches the invite email
- Password strength indicator is recommended (8+ chars, mixed case, etc.)
- Username uniqueness should be validated on blur/submit

### Error Handling

**Invalid/Expired Token**:
- Show error message: "This invite link is invalid or has expired. Please ask an admin to send you a new invite."
- Hide the registration form
- Optionally show a link to the login page

**Registration Fails**:
- Show field-level errors if the backend returns validation issues
- Show a general error if the registration fails for other reasons
- Keep the form visible so user can try again with different values

**Network Errors**:
- Show a user-friendly error message
- Offer a "Try Again" button to retry the validation/registration

### Success Flow

After successful registration:
1. Show success message: "Your account has been created successfully"
2. Redirect to login page after 2-3 seconds
3. Pre-fill email field on login page with registered email

## Key Points for Frontend Implementation

### ✅ DO:

- ✅ Require an invite token to show the registration form
- ✅ Validate the invite token before allowing registration
- ✅ Include the invite token in the registration request
- ✅ Show the invite email in the registration form (preferably pre-filled)
- ✅ Handle token expiration gracefully
- ✅ Clear instructions: "Please check your email for an invite link from an admin"

### ❌ DON'T:

- ❌ Allow users to register without an invite token
- ❌ Provide a sign-up link on the login page
- ❌ Allow editing the email address if it matches the invite
- ❌ Show registration form for invalid/expired tokens
- ❌ Submit registration without validating the invite token first

## Testing the Registration Flow

### As an Admin:

1. Authenticate with admin credentials
2. Call `POST /api/auth/admin/invite` with a new user's email
3. Receive the invite token and link
4. Share the link with the user

### As a New User:

1. Receive the invite link: `https://health-diary.app/register?invite=abc123...`
2. Click the link
3. UI validates the token (GET request)
4. Registration form appears
5. Fill in details and submit
6. Account is created
7. Redirected to login page
8. Can now log in with credentials

### Edge Cases to Handle:

- **Already used token**: `POST /api/auth/register` should reject (token already used)
- **Expired token**: Both validate and register endpoints should reject
- **Wrong email**: If user tries to register with different email than invite was for
- **Duplicate username**: Registration should fail with error message
- **Network timeout during registration**: User should be able to retry

## Related Documentation

- [OpenAPI Specification](./openapi.yaml) - Full API contract
- [Feature Specification](./spec.md) - Complete feature requirements
- [Backend Implementation](../health-diary-be/src/Services/AuthService.cs) - Service logic

## Questions for Implementation

If anything is unclear, refer to:
1. The OpenAPI specification for exact request/response formats
2. The feature specification for user story acceptance criteria
3. The backend AuthService implementation for business logic details
