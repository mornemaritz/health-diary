# Frontend Implementation Checklist: Invite-Only Registration

**Status**: Ready for Implementation  
**Target**: health-diary-ui  
**Related Specification**: [spec.md](./spec.md)  
**Integration Guide**: [registration-flow.md](./registration-flow.md)

## Core Requirement

> **Users cannot register themselves.** Only admins can generate invite links via the API. Users must have an invite link to register.

## Pre-Implementation Checklist

### Understanding the Flow

- [ ] Read [registration-flow.md](./registration-flow.md) for detailed flow documentation
- [ ] Review OpenAPI specification sections on auth endpoints
- [ ] Understand that invite tokens have expiration times
- [ ] Know that invite tokens can only be used once
- [ ] Understand email must match the invite email

### API Integration

- [ ] Generated API client includes `POST /api/auth/admin/invite` endpoint
- [ ] Generated API client includes `GET /api/auth/invite/validate` endpoint  
- [ ] Generated API client includes `POST /api/auth/register` endpoint
- [ ] API client types include `GenerateInviteRequest`, `RegisterRequest`, `LoginRequest`
- [ ] All endpoints support Bearer token authentication as needed

## Implementation Checklist

### Registration Page Setup

- [ ] Route exists: `/register?invite={token}`
- [ ] Query parameter `invite` is extracted from URL on page load
- [ ] Page shows loading state while validating token
- [ ] Component handles missing `invite` parameter (show error)

### Token Validation

- [ ] On page load, call `GET /api/auth/invite/validate?token={token}`
- [ ] If valid → show registration form
- [ ] If invalid/expired → show error message and clear form
- [ ] Display: "Invite link is invalid or has expired. Please ask an admin for a new invite link."
- [ ] If token expires during form editing → re-validate before submit
- [ ] Network errors show: "Unable to validate invite link. Please try again."

### Registration Form

**Form Fields**:
- [ ] Email field (pre-filled if available, read-only if matches invite email)
- [ ] Username field (3-50 chars, alphanumeric + hyphens/underscores)
- [ ] Full Name field
- [ ] Password field (with strength indicator)
- [ ] Confirm Password field (optional but recommended)

**Form Behavior**:
- [ ] Form only displays if token is valid
- [ ] Email field shows invite email if it matches
- [ ] Email cannot be edited if it matches the invite email
- [ ] Password has minimum 8 character requirement
- [ ] Real-time validation on blur for username/email
- [ ] Show validation errors below each field
- [ ] Submit button disabled while validating fields

### Registration Submission

- [ ] Include `inviteToken` from URL parameter in request body
- [ ] Send: `POST /api/auth/register` with all fields filled
- [ ] Show loading state during submission
- [ ] Handle success (201 Created):
  - [ ] Display: "Account created successfully! Redirecting to login..."
  - [ ] Wait 2-3 seconds
  - [ ] Redirect to `/login` page
  - [ ] Pre-fill email on login page
- [ ] Handle errors (400 Bad Request):
  - [ ] Show error message from API response
  - [ ] Do not clear form (let user retry)
  - [ ] If token validation error: show "Invite link is invalid"
  - [ ] If username taken: show "Username already exists. Please try another."
  - [ ] If email mismatch: show "Email does not match invite email"

### Error Handling

**Token Validation Errors**:
- [ ] Token missing/invalid → "Invite link is missing or invalid"
- [ ] Token expired → "Invite link has expired"
- [ ] Token already used → "This invite link has already been used"
- [ ] Network failure → "Unable to validate invite link. Please try again."

**Registration Errors**:
- [ ] Username taken → "Username is already taken"
- [ ] Email mismatch → "Email does not match the invite email"
- [ ] Invalid password → Show password requirements
- [ ] Invalid token → "Invite link is invalid or has expired"
- [ ] Network failure → "Unable to create account. Please try again."

**User Communication**:
- [ ] All error messages are user-friendly (not technical)
- [ ] Errors explain what went wrong and how to fix it
- [ ] Show "Try Again" button for network failures
- [ ] Show link to ask admin for new invite if token expired

### Security Considerations

- [ ] Never expose invite token in logs
- [ ] Never send invite token in URL after page load (only in request body)
- [ ] Don't cache validation result forever (re-validate if user navigates away)
- [ ] Clear sensitive form fields on errors if needed
- [ ] Don't show password in UI (even after successful registration)

### Login Integration

**After Successful Registration**:
- [ ] Redirect to `/login` page (not directly to dashboard)
- [ ] User must log in with the credentials they just created
- [ ] Pre-fill email field on login page with registered email

**Login Page Should NOT Have**:
- [ ] ❌ "Create Account" or "Sign Up" link
- [ ] ❌ "Don't have an account?" text with link to registration
- [ ] ❌ Self-registration form
- [ ] ❌ Suggestion to "click here to register"

## Testing Checklist

### Happy Path Tests

- [ ] User receives valid invite link
- [ ] User clicks link → registration page loads
- [ ] Token is validated successfully
- [ ] Registration form appears with all fields
- [ ] User fills form with valid data
- [ ] Submit succeeds
- [ ] Success message appears
- [ ] User is redirected to login page
- [ ] User can log in with registered credentials

### Error Path Tests

- [ ] Invalid token → show error, form hidden
- [ ] Expired token → show error, form hidden
- [ ] Already-used token → show error (if caught by backend)
- [ ] Missing email → form validation error
- [ ] Missing username → form validation error
- [ ] Short password (< 8 chars) → form validation error
- [ ] Username taken → show backend error
- [ ] Email mismatch → show backend error
- [ ] Network timeout on token validation → show error + retry button
- [ ] Network timeout on registration → show error + retry button

### Edge Cases

- [ ] User manually navigates to `/register` without token → show error
- [ ] User navigates to `/register?invite=` (empty token) → show error
- [ ] User navigates to `/register?invite=invalid` → show error
- [ ] Token expires while user is filling form → handle gracefully
- [ ] User tries to use same token twice → second attempt fails
- [ ] User closes form and reopens link → token still valid (if not expired)

## Code Quality Checklist

- [ ] No hardcoded URLs (use environment variables for API base URL)
- [ ] Error messages use i18n/translations (if app is i18n'd)
- [ ] Form validation follows app's existing patterns
- [ ] Loading states consistent with rest of app
- [ ] Accessibility: form is keyboard navigable
- [ ] Accessibility: form labels linked to inputs
- [ ] Accessibility: error messages announced to screen readers
- [ ] Type safety: all API calls use generated client types
- [ ] No console errors or warnings
- [ ] Code follows app's style guide and conventions

## Documentation Checklist

- [ ] Component has JSDoc/TypeScript comments
- [ ] Unusual logic is explained in code comments
- [ ] Props/types are documented
- [ ] README updated with registration flow explanation
- [ ] Developer onboarding docs explain invite-only registration

## Sign-Off

- [ ] Implementation reviewed against this checklist
- [ ] All core requirements implemented
- [ ] All edge cases handled
- [ ] Testing completed with real backend
- [ ] Ready for QA testing

---

**Questions?** Refer to:
1. [registration-flow.md](./registration-flow.md) - Detailed flow and API calls
2. [openapi.yaml](./openapi.yaml) - Exact API contract
3. [spec.md](./spec.md) - Complete feature requirements
