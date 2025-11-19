# Feature Specification: Authentication with JWTs, Access & Refresh Tokens (Invite-Only Registration)

## Overview

Implement user authentication using JWTs with access and refresh tokens. Users authenticate with username and password. Registration is restricted to invited users via unique registration links. Emailing registration links is out of scope.

## Clarifications

### Session 2025-11-18
- Q: Should usernames be unique across all users? → A: Yes, username must be unique across all users.
- Q: What scalability and performance targets should be supported? → A: Support up to 10,000 registered users and 100 requests/sec.
- Q: How should the system handle invite link delivery failures and invalid/expired links? → A: System must handle invalid/expired invite links gracefully, with clear error messaging; delivery failures are out of scope.
- Q: Should rate limiting be applied to registration and login attempts? → A: Apply rate limiting to registration and login attempts to prevent abuse (e.g., 5 attempts per minute per IP).
- Q: Are there any technical constraints on implementation? → A: Must use .NET. No constraints on hosting.

## Actors

- Invited User: Receives a unique registration link and can register.
- Authenticated User: Can log in and access protected resources.
- System Admin: Can generate invite links for new users.

## User Scenarios & Testing

1. **Registration via Invite Link**
   - System Admin creates a user in the system with an email address and the system generates a unique registration link 
   - Invited user receives a unique registration link (delivery mechanism out of scope).
   - User opens the link, sets username and password, and completes registration.
   - System validates the link and creates the account.
   - If the link is invalid or expired, the system provides a clear error message and denies registration.

2. **Login**
   - Registered user enters username and password.
   - System authenticates and issues access and refresh tokens.

3. **Token Refresh**
   - User presents refresh token to obtain a new access token when the old one expires.

4. **Access Control**
   - Authenticated users access protected resources using a valid access token.

5. **Invalid/Expired Invite Link**
   - User attempts to register with an invalid or expired link; system denies registration and provides a clear error message.
6. **Passowrd reset
   - System Admin generates a unique, expiring reset password link for a user.
   - User uses unique reset password link to specify a new password.

## Functional Requirements

1. The system must allow registration only via valid, unique invite links.
2. Each invite link must be single-use and expire after a configurable period.
3. Registration requires setting a username and password.
4. The system must enforce that usernames are unique across all users.
5. The system must authenticate users using username and password, issuing JWT access and refresh tokens upon successful login.
6. Access tokens must be short-lived; refresh tokens must be longer-lived and allow obtaining new access tokens.
7. The system must validate access tokens for protected resource requests.
8. The system must validate refresh tokens and issue new access tokens when requested.
9. The system must prevent registration with invalid or expired invite links and provide clear error messaging.
10. The system must allow admins to generate invite links for new users.
11. Emailing invite links and handling delivery failures is explicitly out of scope.
12. The system must support up to 10,000 registered users and 100 requests/sec.
13. The system must apply rate limiting to registration and login attempts (e.g., 5 attempts per minute per IP) to prevent abuse.
14. The system must be implemented using .NET.

## Success Criteria

- 100% of registrations occur only via valid invite links.
- 100% of invite links are single-use and expire as configured.
- 95% of login attempts with correct credentials result in successful authentication and token issuance.
- 100% of protected resource requests with valid access tokens are granted; invalid/expired tokens are denied.
- 100% of refresh token requests with valid tokens result in new access tokens.
- 100% of registration attempts with invalid/expired links are denied with clear error messaging.
- Admins can generate invite links for new users without error.
- System supports up to 10,000 registered users and 100 requests/sec.
- System applies rate limiting to registration and login attempts to prevent abuse.
- System is implemented using .NET.

## Key Entities

- User: username (unique), password (hashed), registration status
- Invite Link: unique token, expiration, usage status
- Access Token: JWT, expiry
- Refresh Token: JWT, expiry

## Assumptions

- Invite links are delivered to users outside the system (e.g., manually or via external email service).
- Passwords are stored securely using industry-standard hashing.
- Token expiry durations are configurable.
- No email delivery functionality is included in this feature.
- No constraints on hosting environment.