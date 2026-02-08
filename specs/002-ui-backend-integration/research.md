# Research Phase 0: UI-Backend Integration Technical Analysis

**Date**: 2026-02-06  
**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)

## Overview

This document consolidates research findings for integrating the health-diary-ui (Vite + vanilla JS) with the health-diary-be (C# .NET9 + EF Core) API. The integration uses the OpenAPI 3.0 specification for contract definition and JWT authentication for session management.

---

## Decision 1: Frontend Architecture & API Client Library

### Decision

Use **vanilla JavaScript with native Fetch API** for HTTP communication. No external API client library (axios, fetch wrapper) is required.

### Rationale

- **Minimal dependencies philosophy**: The project explicitly specifies using Vite with minimal libraries and vanilla HTML/CSS/JavaScript
- **Fetch API is native**: Modern browsers have robust Fetch API support; no polyfills needed for target users
- **Simplicity**: For a single-page app with 8 API endpoints, native Fetch is sufficient without Redux or complex state management
- **OpenAPI generation optional**: While tools like OpenAPI Generator exist, manually written API methods are more appropriate for this project's minimal-library approach
- **Vite advantage**: Vite's fast refresh and module bundling work seamlessly with vanilla JS without additional tooling

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| axios HTTP library | Adds external dependency; Fetch API is sufficient |
| OpenAPI code generator | Generates boilerplate; manual API layer is simpler and more transparent |
| TanStack Query (React Query) | Project doesn't use React; overkill for 8 endpoints |
| REST client library wrapper | Adds abstraction layer; direct Fetch calls are clearer in vanilla JS |

### Implementation Details

- Create `src/api/client.js` with base fetch wrapper that:
  - Adds Authorization header with access token from localStorage
  - Handles 401 responses by attempting token refresh
  - Provides consistent error formatting
  - Returns Promise-based responses matching OpenAPI contract
- Create individual service modules (e.g., `src/api/auth.js`, `src/api/health.js`) exporting typed functions

---

## Decision 2: Token Storage & Session Persistence

### Decision

Use **localStorage** for persistent storage of both access and refresh tokens. Implement automatic token refresh on 401 responses before retrying the request.

### Rationale

- **Specification requirement**: Feature spec explicitly assumes "The UI will store tokens in localStorage (not sessionStorage), persisting sessions across browser restarts"
- **User experience**: Users should not need to re-login after page refresh or closing/reopening the browser
- **XSS vulnerability trade-off**: localStorage is susceptible to XSS but acceptable for this health tracking application where the risk profile is lower than financial apps; additional mitigations (Content Security Policy) are addressed in deployment, not UI code
- **Simplicity**: localStorage is simpler than alternatives (sessionStorage loses data on close, in-memory loses on refresh)
- **Token refresh flow**: Automatic refresh on 401 is transparent to users and maintains session continuity per SC-005 success criteria

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| sessionStorage | Loses data on browser close; violates session persistence requirement |
| In-memory token storage | Loses data on page refresh; breaks SC-005 success criteria |
| Secure cookie (HttpOnly) | Requires server to set CORS headers and handle credential flow; adds backend complexity |
| Memory + localStorage encryption | Adds complexity without proportional security benefit for this use case |

### Implementation Details

- Create `src/services/tokenService.js` with functions:
  - `setTokens(accessToken, refreshToken, expiresAt, refreshExpiresAt)` - persist to localStorage
  - `getAccessToken()` - retrieve with optional validation
  - `getRefreshToken()` - retrieve from storage
  - `clearTokens()` - remove on logout
  - `isTokenExpired(token)` - check JWT expiration
- Create `src/api/authInterceptor.js` to intercept responses:
  - Detect 401 status codes
  - Call refresh endpoint with refresh token
  - Retry original request with new access token
  - Redirect to login if refresh fails

---

## Decision 3: Form Validation Strategy

### Decision

Implement **client-side HTML5 validation** with custom JavaScript enhancement for complex rules. Use OpenAPI schema as the source of truth for validation rules.

### Rationale

- **HTML5 native**: Built-in validation attributes (required, type=email, minLength, pattern) are performant and accessible
- **User experience**: Real-time validation feedback without network latency
- **Specification alignment**: FR-024 requires client-side validation; FR-022 requires displaying error messages
- **OpenAPI schema mapping**: Each validation rule in `openapi.yaml` (minLength, pattern, enum) maps to HTML attributes or custom validators
- **Fallback validation**: Server-side validation in backend serves as security boundary; client validation is UX enhancement
- **No form library overhead**: Vite + vanilla JS doesn't benefit from heavyweight form libraries (React Hook Form, Formik)

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Server-only validation | Poor UX; users wait for network round-trip for feedback |
| Heavy form library (React Hook Form) | Project uses vanilla JS, not React |
| Custom validation framework | HTML5 + custom validators adequate for 5 form types |

### Implementation Details

- Create `src/utils/validation.js` with functions:
  - `validateEmail(email)` - RFC 5322 pattern matching
  - `validatePassword(password)` - minimum 8 characters, complexity rules if needed
  - `validateUsername(username)` - minLength 3, maxLength 50, pattern `^[a-zA-Z0-9_-]+$` from OpenAPI
  - `validateRequired(value, fieldName)` - non-empty check
  - `validateEnum(value, allowedValues)` - bowel movement consistency check
- Create `src/components/Form.js` or use native `<form>` elements with:
  - HTML5 validation attributes from OpenAPI schema
  - Custom `onchange` handlers for additional validation
  - Error message display beneath each field

---

## Decision 4: Date/Time Handling & Timezone Approach

### Decision

Handle all dates/times as **ISO 8601 strings in yyyy-MM-dd and HH:mm:ss format** in HTML input elements and API payloads. Treat all times as user's local timezone; no explicit timezone conversion in this feature.

### Rationale

- **OpenAPI schema specification**: Uses `format: date` (yyyy-MM-dd) and `format: time` (HH:mm:ss) for all health records
- **HTML input types**: `<input type="date">` produces ISO 8601 date strings; `<input type="time">` produces HH:mm strings
- **Feature assumption**: Spec assumes "Dates entered by users are treated as timezone-naive or in the user's local timezone (timezone handling is deferred)"
- **Simplicity**: No timezone library (moment.js, date-fns) required; native Date API sufficient
- **Backend alignment**: Backend stores dates as provided without timezone conversion per API contract

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Include timezone in payload | Feature assumes timezone handling is deferred; adds complexity |
| UTC conversion client-side | Violates assumption; would require timezone library and server support |
| Timestamp-based (Unix epoch) | OpenAPI schema specifies date/time strings, not timestamps |

### Implementation Details

- Use HTML5 date/time inputs:
  ```html
  <input type="date" name="date" required>
  <input type="time" name="time" required>
  ```
- Convert to API format: `new Date(dateInput.value).toISOString().split('T')[0]` for date
- For time, use `timeInput.value` directly (format HH:mm)
- No timezone conversion in request payloads
- Display dates/times as-is from API without conversion

---

## Decision 5: State Management & Component Organization

### Decision

Use **simple global state with vanilla JavaScript closures and custom events** for authentication state. No state management library (Redux, Zustand, Context API - React specific).

### Rationale

- **Scope**: Feature has ~8 main UI elements (login, register, forms for 5 record types, summary, navigation)
- **Data flow**: One-way flow from API → localStorage → DOM (simple)
- **No framework constraints**: Vanilla JS doesn't have built-in state management like React Context
- **Minimal dependencies**: Aligns with project philosophy
- **Custom events**: Browser's native CustomEvent API allows loose coupling between modules

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Global window object | Anti-pattern; pollutes namespace |
| Redux | Framework-agnostic but overly complex for this scope |
| MobX | Adds dependency; overkill for simple auth state |

### Implementation Details

- Create `src/services/authState.js` as singleton:
  ```javascript
  const authState = (() => {
    let isAuthenticated = false;
    let currentUser = null;
    
    return {
      login(user) { isAuthenticated = true; currentUser = user; },
      logout() { isAuthenticated = false; currentUser = null; },
      getState() { return { isAuthenticated, currentUser }; }
    };
  })();
  ```
- Use CustomEvent for state changes:
  ```javascript
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: newState }));
  ```
- Each page/component listens to relevant events and re-renders

---

## Decision 6: Error Handling & User Messaging

### Decision

Implement **centralized error handler** that maps HTTP status codes and backend error responses to user-friendly messages. Display errors inline in forms and as toast/modal notifications for critical errors.

### Rationale

- **FR-022 requirement**: UI MUST display appropriate error messages when API requests fail
- **SC-008 requirement**: Form validation errors MUST provide specific, actionable feedback
- **Consistency**: Central handler ensures all API errors follow same format
- **Accessibility**: Error messages should be clear, not technical (avoid "400 Bad Request", use "Email is required")
- **OpenAPI contract**: API returns `{ statusCode, message, details }` format; leverage this structure

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Inline try-catch in every API call | Repetitive; hard to maintain consistent messaging |
| Console logging only | Poor UX; users don't see errors |

### Implementation Details

- Create `src/services/errorHandler.js`:
  - Map HTTP status codes (400, 401, 409, 500) to user messages
  - Extract message from `response.json().message` field
  - Handle network errors (offline, timeout) separately
- Create `src/components/NotificationManager.js`:
  - Display error toast for temporary issues (validation, conflict)
  - Display modal for critical issues (401 → redirect to login, 500 → retry or contact support)

---

## Decision 7: Navigation & Page Routing

### Decision

Implement **simple hash-based routing** with vanilla JavaScript. No third-party router library (React Router, Navigo).

### Rationale

- **Minimal complexity**: Feature has 5-6 main pages (login, register, home/summary, forms for each record type)
- **Hash routing advantages**: Works without server-side routing configuration; no build step needed
- **Vite static files**: App served as static files; server doesn't need route awareness
- **Simplicity**: Manual hash routing is ~50 lines of code; library routing adds unnecessary abstraction

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Full SPA router library | Adds dependency; manual routing sufficient |
| Server-side rendering | Not applicable; API is separate from UI |

### Implementation Details

- Create `src/router.js`:
  ```javascript
  const routes = {
    '#/': HomePage,
    '#/login': LoginPage,
    '#/register': RegisterPage,
    '#/record/medication': MedicationFormPage
  };
  window.addEventListener('hashchange', () => renderRoute(window.location.hash));
  ```

---

## Decision 8: Testing Strategy for Frontend

### Decision

Plan for **unit tests using a minimal testing framework** (e.g., Vitest with Vite integration) and **manual integration testing** for API workflows. No end-to-end testing framework in this feature.

### Rationale

- **Constitution requirement**: Testing Standards mandate automated tests for critical paths
- **Critical paths identified**:
  - Token refresh flow (401 → refresh → retry)
  - Form validation for each record type
  - API error handling and display
- **Minimal framework**: Vitest runs natively with Vite; no webpack config needed
- **Manual testing**: User flows (registration, login, recording) are best validated manually during development; E2E frameworks (Playwright, Cypress) are deferred to later

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Jest + Babel | Vitest is simpler for Vite projects; Jest requires config |
| Playwright/Cypress E2E | Valuable but deferred; unit tests provide initial coverage |

### Implementation Details

- Set up Vitest in `vite.config.ts`
- Write unit tests for:
  - `tokenService.js` - storage/retrieval functions
  - `validation.js` - form validators against OpenAPI rules
  - `errorHandler.js` - status code mapping
- Integration tests (manual) cover:
  - Login → token storage → authenticated request → 401 → refresh → retry
  - Form submission → validation → API call → display result
  - Logout → token removal → redirect to login

---

## Summary of Technical Decisions

| Decision | Choice | Impact |
|----------|--------|--------|
| API client library | Native Fetch API | No external dependency; ~100 lines of wrapper code |
| Token storage | localStorage + auto-refresh on 401 | Session persistence across refreshes; automatic transparent token rotation |
| Form validation | HTML5 + custom validators | Fast real-time feedback; no form library dependency |
| Date/Time handling | ISO 8601 strings, local timezone | Maps to HTML input types; defers timezone complexity |
| State management | Vanilla closures + CustomEvent | Minimal code; loose coupling between modules |
| Error handling | Centralized error handler | Consistent messaging; reduced duplication |
| Routing | Hash-based manual routing | ~50 lines code; no router library |
| Testing | Vitest unit tests + manual integration | Core logic covered; user flows validated manually |

---

## Technical Dependencies Summary

### Frontend (Vite + Vanilla JS)

**No new external dependencies** - project uses:
- Vite (build tool) - already in place
- HTML5 native APIs (Fetch, localStorage, CustomEvent, input validation)
- CSS (vanilla, minimal)
- JavaScript ES6+ (no polyfills needed for modern browsers)

### Testing

- **Vitest**: For unit testing (install if not present)
  - Integrates natively with Vite
  - No additional webpack configuration needed

### Backend (C# .NET9)

**No changes required** - existing:
- Entity Framework Core (ORM)
- JWT authentication (already implemented)
- OpenAPI endpoints (already defined in openapi.yaml)

---

## Validation Against OpenAPI Contract

The implementation approach aligns with the OpenAPI 3.0 specification:

✅ **Authentication Endpoints**:
- `/api/auth/register` - POST with RegisterRequest schema
- `/api/auth/login` - POST with LoginRequest schema
- `/api/auth/token/refresh` - POST with RefreshTokenRequest schema
- `BearerAuth` security scheme - JWT in Authorization header

✅ **Health Record Endpoints** (5 POST endpoints):
- `/api/health/medication` - MedicationAdministration schema
- `/api/health/bottle` - BottleConsumption schema
- `/api/health/bowel-movement` - BowelMovement schema
- `/api/health/solid-food` - SolidFoodConsumption schema
- `/api/health/note` - Observation schema

✅ **Summary Endpoint**:
- `/api/health/summary/{date}` - GET returns DailySummary schema

✅ **Error Handling**:
- Consistent Error schema with `statusCode` and `message` fields
- HTTP status codes (201, 400, 401, 409) align with UI error handling

---

## Next Steps (Phase 1: Design)

1. **Data Model** (data-model.md):
   - Map OpenAPI schemas to frontend data structures
   - Define DTO interfaces for type safety

2. **API Contracts** (contracts/):
   - Document expected request/response formats for each endpoint
   - Define error scenarios and status codes

3. **Quickstart** (quickstart.md):
   - Setup instructions for local development
   - Running tests and building for production

