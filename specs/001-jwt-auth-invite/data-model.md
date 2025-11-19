# Data Model: JWT Auth Invite

## Entities

### User

- username (string, unique, required)
- password_hash (string, required)
- registration_status (enum: Invited, Registered, Disabled)
- created_at (datetime)
- updated_at (datetime)

#### Validation Rules

- Username must be unique
- Password must meet security requirements (see contracts)

### InviteLink

- token (string, unique, required)
- expires_at (datetime, required)
- used (boolean, default: false)
- invited_email (string, optional)
- created_by (User reference)
- created_at (datetime)

#### InviteLink Validation Rules

- Token must be unique
- Expires_at must be in the future
- Can only be used once

### AccessToken

- jwt (string, required)
- user_id (User reference)
- expires_at (datetime, required)

### RefreshToken

- jwt (string, required)
- user_id (User reference)
- expires_at (datetime, required)

## Relationships

- User can have multiple AccessTokens and RefreshTokens
- InviteLink is created by a System Admin and used by an Invited User

## State Transitions

- InviteLink: Invited → Used/Expired
- User: Invited → Registered → Disabled
