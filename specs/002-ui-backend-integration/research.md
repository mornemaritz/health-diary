# Research: Frontend-Backend API Integration

**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)
**Date**: 2026-02-08
**Phase**: 0 - Research & Unknowns Resolution

## Research Questions & Findings

### 1. API Client Architecture: Fetch vs External Libraries

**Question**: Should the frontend use native Fetch API with custom interceptor pattern, or a library like axios/TanStack Query?

**Rationale**: The project explicitly states "Be judicious when selecting external libraries. Ensure that these add value without adding unnecessary complexity."

**Decision**: **Use native Fetch API with custom wrapper pattern**

**Findings**:
- **Fetch API**: Natively available in modern browsers (no bundle overhead), sufficient for this feature's requirements (JWT auth headers, error handling, basic retry logic)
- **axios**: Adds ~15KB gzipped; provides convenience methods (interceptors, request cancellation) that can be replicated with Fetch
- **TanStack Query**: Excellent for complex data synchronization but adds 35KB+ gzipped; overkill for single-user read/write operations
- **Alternatives considered**: 
  - axios: Simpler request/response interceptors but violates minimal dependency principle
  - TanStack Query: Better caching/invalidation but unnecessary complexity for this MVP
  - GraphQL: Overkill for CRUD operations; backend is REST-based

**Implications**: 
- Implement custom fetch wrapper with interceptor pattern in `services/apiClient.ts`
- Handle token refresh manually via 401 response interception
- Cache tokens in localStorage (no complex state management needed)

**Status**: ✅ Resolved

---

### 2. Token Storage: localStorage vs sessionStorage

**Question**: Should tokens persist across browser sessions (localStorage) or be cleared on browser close (sessionStorage)?

**Rationale**: Specification states "The UI will store tokens in localStorage (not sessionStorage), persisting sessions across browser restarts"

**Decision**: **Use localStorage for both access and refresh tokens**

**Findings**:
- **localStorage**: Data persists across browser restarts; common pattern for health/medical apps where users expect persistent login
- **sessionStorage**: Clears on browser close; more secure but breaks the assumption that users want persistent sessions
- **Secure Cookie**: Most secure but requires backend support; not compatible with CORS for local development
- **Alternatives considered**:
  - In-memory only (lose session on refresh): Breaks UX requirement
  - sessionStorage: Users must re-login frequently; frustrating for daily health tracking

**Implications**:
- Tokens survive browser restart
- Users can close app and return within token expiration window (typically 1 hour for access token)
- Logout explicitly clears localStorage tokens
- No XSS protection beyond standard browser sandbox; acceptable for health diary (not banking app)

**Status**: ✅ Resolved

---

### 3. Form Validation: Client-side Only vs Server-side

**Question**: Should form validation occur client-side only, or should server errors also update form state?

**Rationale**: Performance requirement states "Form submission validated client-side before API call (no wasted requests)"

**Decision**: **Implement dual-layer validation: client-side (fast feedback) + server-side (security/data integrity)**

**Findings**:
- **Client-side only**: Fastest UX but allows malformed requests if validation logic diverges from backend
- **Server-side only**: Slow feedback loop, contradicts performance goals
- **Dual-layer**: Client validates against OpenAPI schema locally; server validates and returns specific errors if validation rules differ
- **Alternatives considered**:
  - Shared validation library (zod, io-ts): Adds dependency; requires sync with OpenAPI schema changes
  - OpenAPI schema parser (swagger-parser): Adds complexity; most rules are simple (required fields, format, enum)

**Implications**:
- Client validates required fields, formats (date/time), and enum values before sending
- API responses (4xx errors) are parsed and field-specific errors are displayed
- Validation logic is simple enough to maintain manually; not overly complex

**Status**: ✅ Resolved

---

### 4. React Context vs State Management Library

**Question**: Is React Context + useReducer sufficient for auth state, or should we use Redux/Zustand?

**Rationale**: Constitution requires minimal dependencies; spec focuses on single authenticated user

**Decision**: **Use React Context + useState for auth state**

**Findings**:
- **Context API**: Built-in to React; sufficient for global auth state (user data, tokens, loading states)
- **Redux**: Adds 8KB+ (redux-core + react-redux); provides time-travel debugging but unnecessary complexity for this feature
- **Zustand**: Lightweight (2.5KB) but not required; Context works fine for single global store
- **Alternatives considered**:
  - Redux: Over-engineering for single feature; more boilerplate
  - MobX: Adds 60KB+; overkill
  - Jotai/Recoil: Experimental; Context is stable and sufficient

**Implications**:
- Implement `AuthContext` with `useAuth` hook
- Avoid Redux/Zustand to keep bundle size minimal
- Use Context for auth state only (user, tokens, loading); component-level state for forms

**Status**: ✅ Resolved

---

### 5. OpenAPI Type Generation

**Question**: Should TypeScript types be hand-written or generated from openapi.yaml?

**Rationale**: OpenAPI spec is definitive; auto-generation prevents drift and ensures type safety

**Decision**: **Generate types from OpenAPI using openapi-typescript**

**Findings**:
- **openapi-typescript**: CLI tool; generates TypeScript interfaces from OpenAPI 3.0 spec; ~5KB package
- **Hand-written**: Time-consuming; error-prone if API changes; spec is already authoritative
- **swagger-codegen**: Java-based; heavy; overkill for types-only generation
- **Alternatives considered**:
  - Manual TypeScript interfaces: Works but no automation when API changes
  - codegen from schema: Requires JavaScript codegen pipeline complexity

**Implications**:
- Add `npm run generate:types` script to generate types from openapi.yaml
- Types are committed to version control (not generated at build time)
- When API changes, regenerate types and update consuming code
- Single source of truth: openapi.yaml

**Status**: ✅ Resolved

---

### 6. Date/Time Handling in Forms

**Question**: How should date/time inputs be handled (separate date + time fields vs single datetime picker)?

**Rationale**: OpenAPI schema has separate `date` (format: date) and `time` (format: time) fields

**Decision**: **Use separate date and time input fields matching OpenAPI schema**

**Findings**:
- **Separate fields**: Matches API schema exactly; users expect this separation for health apps; MUI DatePicker + TextField(type=time) available
- **Combined datetime**: Better UX but requires combining into separate API fields; adds complexity
- **Native HTML5 inputs**: `<input type="date">` and `<input type="time">` work but less polished than MUI
- **Alternatives considered**:
  - Single datetime picker: Requires combining/splitting before API call; unnecessary transformation
  - Timestamp (milliseconds): API expects yyyy-MM-dd and HH:mm separately

**Implications**:
- Form has two input fields for each record (date picker, time picker)
- No timezone complexity; dates are treated as local to user's timezone
- API receives date and time as separate fields

**Status**: ✅ Resolved

---

### 7. Error Handling and User Feedback

**Question**: How should API errors be displayed to users (generic messages vs detailed API responses)?

**Rationale**: Constitution requires consistent error messages; OpenAPI spec includes error response schema

**Decision**: **Display API error messages directly from response; add client-side validation feedback for common issues**

**Findings**:
- **Generic messages**: Poor UX; doesn't help users understand what went wrong (e.g., "error occurred")
- **API messages**: Detailed; helps users fix issues (e.g., "Email already in use"); requires parsing error response
- **Localization**: Out of scope for MVP; English error messages acceptable
- **Alternatives considered**:
  - Show error codes only: Cryptic; doesn't help users
  - Custom error messages: Duplicates backend logic; maintenance burden

**Implications**:
- Error responses from API are displayed to users as-is
- Client-side validation provides immediate feedback (e.g., "This field is required")
- Errors are shown in form fields or toast notifications depending on context
- No custom error message translation needed for MVP

**Status**: ✅ Resolved

---

### 8. Testing Strategy: Unit vs Integration vs E2E

**Question**: What testing approach provides best coverage vs maintenance balance?

**Rationale**: Constitution requires "Automated tests MUST cover all critical paths"

**Decision**: **Integration tests + unit tests for critical paths; E2E as manual validation**

**Findings**:
- **Unit tests**: Test individual services (authService, healthRecordService) with mocked API
- **Integration tests**: Test component + service together (e.g., LoginPage calling authService)
- **E2E tests**: Full browser automation (Playwright/Cypress); slow; high maintenance; skip for MVP
- **Alternatives considered**:
  - E2E only: Too slow; requires running backend; brittle to small UI changes
  - Unit only: Misses integration bugs (e.g., token not sent in headers)
  - No tests: Violates Constitution

**Implications**:
- Vitest for unit + integration tests
- Mock API responses using jest.mock or Mock Service Worker (MSW)
- Manual E2E testing via browser during development
- Test coverage focused on: auth flows, form validation, error handling

**Status**: ✅ Resolved

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP Client | Fetch API + custom wrapper | Minimal dependencies; Fetch sufficient for JWT auth |
| Token Storage | localStorage | Persistent sessions as per spec |
| Auth State | React Context | Built-in; sufficient for single global store |
| Form Validation | Dual-layer (client + server) | Fast feedback; secure API validation |
| Type Generation | openapi-typescript | Single source of truth; prevents drift |
| Date/Time Input | Separate fields | Matches API schema; expected UX |
| Error Display | API messages + validation feedback | Detailed feedback helps users |
| Testing | Integration + Unit | Balanced coverage; maintainable |

## Open Questions Resolved

✅ All technical unknowns have been researched and resolved. No blockers identified.

**Constitution Check Re-evaluation**: All decisions maintain compliance with Code Quality, Testing Standards, UX Consistency, and Performance requirements.
