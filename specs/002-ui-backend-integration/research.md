# Research: UI-Backend Integration

**Date**: 2026-02-01  
**Feature**: UI and Backend API Integration (002-ui-backend-integration)  
**Purpose**: Resolve technical unknowns and establish best practices for API integration

## 1. JWT Token Management in React

### Decision: localStorage with automatic refresh

**Implementation**:
- Store access and refresh tokens in localStorage
- Decode JWT `exp` claim to determine token expiry
- Implement refresh logic 1 minute before expiry
- Automatically refresh on 401 responses

**Rationale**:
- localStorage persists across page reloads
- Reduces repeated login prompts
- Simple to implement with vanilla Fetch
- Standard practice for web applications

**Alternatives Considered**:
- **sessionStorage**: Loses tokens on page reload; users would need to re-login frequently
- **Memory-only storage**: Loses tokens on page reload; not suitable for persistent sessions
- **HTTP-only cookies**: Requires backend changes to set SameSite and Secure flags; adds complexity

**Technical Approach**:
```typescript
// Token stored as: { accessToken, refreshToken, expiresAt }
// Refresh triggered by timer or 401 response
// New access token obtained without user interruption
```

---

## 2. HTTP Client Architecture: Vanilla Fetch API

### Decision: Centralized fetch wrapper with 80%+ vanilla Fetch coverage

**Implementation**:
- Create `api/client.ts` with fetch wrapper for auth headers and error handling
- Wrapper automatically adds `Authorization: Bearer <token>` header
- Wrapper handles token refresh on 401 responses
- Individual API services (auth.ts, health.ts) use wrapper for type safety

**Rationale**:
- Vanilla Fetch is native browser API; no dependencies
- Reduces bundle size vs axios/react-query
- Meets requirement: "use vanilla javascript as far as possible"
- Wrapper pattern ensures consistency across all API calls
- Type-safe with TypeScript interfaces

**Alternatives Considered**:
- **axios**: Adds dependency, larger bundle size, overkill for CRUD operations
- **react-query**: Excellent for caching, but adds complexity; can be added later if needed
- **Unfetcher pattern**: Direct fetch calls scattered throughout components; loses consistency, easy to miss token attachment

**Coverage Target**: 80%+ of API calls use vanilla Fetch through wrapper; 20% flexibility for special cases

---

## 3. Error Handling and User Feedback

### Decision: Standardized error response mapping with user-friendly messages

**Implementation**:
- Centralize error handling in `api/errors.ts`
- Map HTTP status codes to user-friendly messages
- Hide technical details (stack traces, internal errors)
- Preserve validation error messages from backend
- Display errors via toast/snackbar notifications

**Status Code Mapping**:
| Status | User Message | Recovery |
|--------|--------------|----------|
| 400 | "Please check your input and try again" | Show validation details if provided |
| 401 | "Your session has expired. Please log in." | Redirect to login |
| 409 | "This record already exists. Try a different date/time." | Show specific conflict details |
| 500 | "An error occurred. Please try again later." | Log to monitoring; show generic message |
| Network timeout | "Connection timed out. Please try again." | Show retry button |

**Rationale**:
- Users don't understand HTTP status codes
- Consistent messaging reduces support burden
- Preserve backend validation errors for form improvement
- Clear recovery paths for each error type

---

## 4. Date/Time Handling and Formatting

### Decision: Client-side date/time in user's local timezone; send to backend in ISO format

**Implementation**:
- UI uses native JavaScript Date and moment.js (already in project)
- User sees dates in local timezone
- Convert to ISO format (yyyy-MM-dd for date, HH:mm:ss for time) when sending to backend
- Treat backend responses as UTC (already in ISO format)
- No timezone conversion needed; backend accepts local dates

**Rationale**:
- Spec assumes local dates (no timezone conversion mentioned)
- Consistent with existing UI code (uses moment.js)
- Backend expects yyyy-MM-dd format
- Avoid timezone complexity unless required

**Implementation**:
```typescript
// Client: local date/time input
const date = moment().format('yyyy-MM-dd'); // '2026-02-01'
const time = moment().format('HH:mm:ss');   // '14:47:00'
// Send to backend as-is
```

---

## 5. Request Retry Strategy for Transient Failures

### Decision: Automatic retry for 5xx errors with exponential backoff; manual retry for 4xx errors

**Implementation**:
- Auto-retry 5xx (server errors) up to 3 times with exponential backoff: 100ms, 200ms, 400ms
- No auto-retry for 4xx (client errors) - show error and let user retry manually
- Add retry button to error messages
- Track retry attempts in error state

**Rationale**:
- 5xx errors are transient and often resolve quickly
- 4xx errors indicate user action needed; auto-retry won't help
- Exponential backoff prevents overwhelming server
- User has control over retries; not forced to wait

---

## 6. Concurrent Request Handling

### Decision: Prevent race conditions with request deduplication and proper state management

**Implementation**:
- Use request deduplication: if same request is already in-flight, reuse existing promise
- Use React hooks for state management (useState, useCallback)
- Ensure form submissions are idempotent (can safely retry without duplicating)
- Backend enforces duplicate prevention via unique constraints

**Rationale**:
- Users often click submit multiple times
- Race conditions can cause data inconsistency
- Request deduplication is simple and effective
- Backend provides final safety check via constraints

---

## 7. Loading States and User Feedback

### Decision: Three-state pattern (loading, success, error) with 1-second delay before showing loading indicator

**Implementation**:
- Request starts: set `isLoading = true` after 1 second (debounce)
- Request succeeds: show success message (toast) for 2 seconds, clear loading
- Request fails: show error message (persistent), retry button, clear loading
- Forms disable submit button while loading
- Show spinners or skeleton screens while loading

**Rationale**:
- 1-second delay prevents UI flicker for fast responses (success criteria SC-010)
- Toast for success is subtle; persistent message for error is clear
- Disabled buttons prevent accidental double submissions
- Clear visual feedback for all states

---

## 8. Authentication Flow: Login and Token Refresh

### Decision: Separate login endpoint; automatic silent refresh; manual logout

**Implementation**:

**Login**:
- User submits email/password
- API returns { accessToken, refreshToken, expiresIn }
- Store tokens in localStorage
- Redirect to dashboard

**Token Refresh** (automatic, silent):
- On app load, check if token is expired
- 1 minute before expiry, silently refresh
- On 401 response, immediately refresh and retry request
- If refresh fails, redirect to login

**Logout**:
- Clear localStorage
- Redirect to login
- Triggered by user clicking logout or 401 after refresh failure

**Rationale**:
- Silent refresh means users don't see interruption (success criteria SC-008)
- Automatic refresh on load prevents 401 errors on first request
- Manual logout gives user control

---

## 9. API Base URL Configuration

### Decision: Environment variable with fallback to relative URLs

**Implementation**:
```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:5000

// .env.production
VITE_API_BASE_URL=https://api.health-diary.app

// client.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
```

**Rationale**:
- Environment variables allow different URLs per deployment
- Fallback to window.location.origin for same-domain deployments
- Vite's import.meta.env for frontend environment access
- Supports local development, staging, and production

---

## 10. TypeScript Interfaces and Type Safety

### Decision: Centralized type definitions for all API request/response objects

**Implementation**:
- `api/types.ts` contains all TypeScript interfaces
- One interface per API request/response
- Use discriminated unions for polymorphic responses (e.g., HealthRecordDto)
- Interfaces match backend C# models but in TypeScript

**Rationale**:
- Type safety prevents runtime errors
- Single source of truth for data contracts
- Interfaces document expected data structure
- Autocomplete support in IDE

**Example Interface**:
```typescript
// From backend C# model
export interface MedicationAdministration {
  id: string;
  medication: string;
  dosage: string;
  schedule: 'SevenAm' | 'ThreePm' | 'SevenPm' | 'TenPm' | 'AdHoc';
  date: string; // yyyy-MM-dd
  time: string; // HH:mm:ss
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}
```

---

## 11. Testing Strategy

### Decision: Unit tests for API services + E2E tests for user flows

**Unit Tests**:
- Test API client token attachment and refresh
- Test error handling and retry logic
- Test date/time formatting
- Mock backend responses

**E2E Tests**:
- Test complete user flow: login → submit record → view summary
- Test token expiry and refresh
- Test error scenarios (invalid input, duplicate, network failure)
- Use Cypress or Playwright

**Rationale**:
- Unit tests ensure API layer is robust
- E2E tests verify integration works end-to-end
- Mocking backend allows fast test execution
- E2E tests with real backend for pre-release verification

---

## 12. Security Considerations

### Decision: localStorage tokens with standard JWT validation and HTTPS enforcement

**Implementation**:
- Store tokens in localStorage (note: vulnerable to XSS; mitigated by Content Security Policy)
- Validate JWT signature on backend (already done)
- HTTPS only in production (enforced via environment)
- No sensitive data in localStorage
- Clear tokens on logout

**Rationale**:
- localStorage is standard for SPAs
- Backend JWT validation is sufficient
- HTTPS prevents man-in-the-middle attacks
- XSS mitigation via Content Security Policy (assumed configured)

**Rationale Against httpOnly Cookies**:
- Would require backend session management (unnecessary complexity)
- Would require CSRF protection (additional complexity)
- Frontend token management is acceptable for this use case

---

## Summary of Key Decisions

| Component | Decision | Rationale |
|-----------|----------|-----------|
| Token Storage | localStorage | Persistent across reloads; simple implementation |
| HTTP Client | Vanilla Fetch wrapper | Minimize dependencies; meet vanilla JS requirement |
| Error Handling | Centralized, user-friendly | Consistent UX; hide technical details |
| Date/Time | Local timezone, ISO format | Match backend expectations; no timezone complexity |
| Retry Strategy | Auto 5xx, manual 4xx | Fast recovery from transient failures |
| Loading States | 3-state with 1s delay | Prevent UI flicker; clear user feedback |
| Auth Flow | Silent refresh on 401 | Seamless user experience; no interruption |
| API Base URL | Environment variable | Support multiple deployments |
| Type Safety | Centralized TypeScript | Prevent runtime errors; autocomplete |
| Testing | Unit + E2E | Verify API layer and user flows |
| Security | JWT + HTTPS | Standard web app security model |

---

## Next Steps: Phase 1

With these research findings resolved, Phase 1 will:
1. Create `data-model.md` documenting API request/response structures
2. Create `contracts/` directory with OpenAPI examples for each endpoint
3. Create `quickstart.md` with setup and usage instructions
4. Update agent context with new technologies (TypeScript, Fetch API patterns)
