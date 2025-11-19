# Data Model: JWT Auth Invite

## Entities

### User

- id (GUID, unique, required)
- email (string, unique, required)
- username (string, unique, required)
- name (string, required)
- password_hash (string, required)
- is_active (boolean)
- created_at (datetime)
- updated_at (datetime)

#### Validation Rules

- Email and Username must be unique
- Password must meet security requirements (see contracts)

### InviteLink
### InviteLink

- id (GUID, unique, required)
- token (string, unique, required)
- email (string, required)
- expires_at (datetime, required)
- used (boolean, default: false)
- created_by (User reference)
- created_at (datetime)

#### InviteLink Validation Rules

- Token must be unique
- Expires_at must be in the future
- Can only be used once

### AccessToken
### AccessToken

- jwt (string, required)
- user_id (User reference)
- expires_at (datetime, required)

### RefreshToken
### RefreshToken

- id (GUID, unique, required)
- jwt (string, required)
- user_id (User reference)
- expires_at (datetime, required)
- created_at (datetime)
- revoked_at (datetime, optional)
### PasswordResetLink

- id (GUID, unique, required)
- token (string, unique, required)
- user_id (User reference, required)
- expires_at (datetime, required)
- used (boolean, default: false)
- created_at (datetime)

#### PasswordResetLink Validation Rules

- Token must be unique
- Expires_at must be in the future
- Can only be used once

## Relationships

User can have multiple AccessTokens, RefreshTokens, and PasswordResetLinks
InviteLink is created by a System Admin and used by an Invited User

## State Transitions


InviteLink: Created → Used/Expired
PasswordResetLink: Created → Used/Expired
RefreshToken: Created → Revoked/Expired
User: Invited → Registered → Disabled
