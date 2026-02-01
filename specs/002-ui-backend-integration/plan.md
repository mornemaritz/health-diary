# Implementation Plan: UI and Backend API Integration

**Branch**: `002-ui-backend-integration` | **Date**: 2026-02-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-ui-backend-integration/spec.md`

**Note**: This plan outlines the design and implementation approach for integrating the React-based UI with the .NET backend API.

## Summary

Implement API integration layer in the React UI to communicate with the Health Diary backend API. The integration will use vanilla JavaScript Fetch API for HTTP requests (minimizing external dependencies), implement JWT token management with automatic refresh, and provide comprehensive error handling. This feature enables end-to-end functionality for user authentication, health record submission, and daily summary retrieval.

## Technical Context

**Frontend Language/Version**: JavaScript/TypeScript (React 19.1.1, Vite)
**Frontend UI Framework**: React 19 with Material-UI (MUI) 7.3.2
**Backend Language/Version**: C# 13, .NET 9
**Backend Primary Dependencies**: Entity Framework Core, PostgreSQL (Npgsql)
**API Protocol**: REST (HTTP/HTTPS with JSON)
**Authentication**: JWT (Bearer tokens with refresh token rotation)
**HTTP Client**: Vanilla JavaScript Fetch API (80%+ coverage requirement)
**Storage**: JWT tokens in localStorage or sessionStorage
**Testing Framework**: React Testing Library (for UI), Cypress/Playwright (for E2E)
**Target Platform**: Web browsers (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Integrated full-stack application
**Performance Goals**: Auth response <2s, API calls <5s, load indicators after 1s
**Constraints**: No heavy HTTP client libraries; 80%+ vanilla Fetch usage
**Scale/Scope**: 10,000 users (backend capacity)


## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality:** ✅ PASS - All integration code will follow React/TypeScript style guides, be well-documented with JSDoc comments, use functional components with hooks (no class-based components), avoid prop drilling with context/hooks, and require code review via PR process.

- **Testing Standards:** ✅ PASS - Critical paths will have unit tests (React Testing Library) and E2E tests (Cypress). Tests will cover: authentication flow, each health record submission, daily summary retrieval, token refresh, error handling, and duplicate record scenarios. All tests must pass before merge.

- **User Experience Consistency:** ✅ PASS - All API calls will use consistent error response handling (FR-011). Success/error states will be standardized across all forms. Date/time formatting will be consistent (FR-013). Token handling will be transparent to user. All API responses will be mapped to user-friendly messages.

- **Performance Requirements:** ✅ PASS - Response time targets: auth <2s (SC-001), API calls <5s (SC-010), loading indicators after 1s. Concurrent request handling (SC-012) planned to prevent race conditions. Success criteria block regressions by requiring 100% compliance with date/time formats (SC-011) and token inclusion (SC-002).

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-backend-integration/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (research findings)
├── data-model.md        # Phase 1 output (API data models and contracts)
├── quickstart.md        # Phase 1 output (quick start guide)
├── contracts/           # Phase 1 output (API contract examples)
└── checklists/
    └── requirements.md  # Quality checklist (from spec phase)
```

### Source Code (UI - health-diary-ui)

```text
health-diary-ui/
├── src/
│   ├── api/              # NEW: API service layer (all HTTP calls)
│   │   ├── client.ts     # HTTP client with auth/token management
│   │   ├── auth.ts       # Authentication endpoints
│   │   ├── health.ts     # Health record endpoints
│   │   ├── types.ts      # TypeScript interfaces for API responses
│   │   └── errors.ts     # Error handling utilities
│   ├── services/         # EXISTING: Application logic (unchanged)
│   ├── components/       # EXISTING: React components (updated for API calls)
│   ├── pages/            # EXISTING: Page components (updated for API calls)
│   └── layout/           # EXISTING: Layout components (unchanged)
├── tests/
│   ├── api/              # NEW: API service tests
│   ├── integration/      # UPDATED: E2E tests with backend
│   └── unit/             # EXISTING: Component tests
```

### Source Code (Backend - health-diary-be)

```text
health-diary-be/
├── src/
│   ├── Program.cs        # EXISTING: API endpoints (no changes needed)
│   ├── Data/             # EXISTING: Database context
│   ├── Models/           # EXISTING: Data models and DTOs
│   └── Services/         # EXISTING: Business logic
└── tests/
    └── Unit/             # EXISTING: Service tests
```

**Structure Decision**: The integration uses the existing backend API without modifications. The UI receives new `api/` layer containing:
- HTTP client with vanilla Fetch API (80%+ usage target)
- JWT token management with automatic refresh
- Request/response mapping and error handling
- TypeScript interfaces for type-safe API interactions

This keeps the UI and backend cleanly separated while centralizing API communication logic.

## Complexity Tracking

> **Rationale for integration architecture choices:**

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Vanilla Fetch API (80%+ coverage) | Minimize dependencies, reduce bundle size, use browser native APIs | Use axios/react-query: overkill for REST CRUD, increases bundle, violates constraint |
| JWT in localStorage | Stateless, works with cookies, simple token refresh | sessionStorage: loses tokens on page reload; server sessions: requires backend changes |
| Centralized API client layer | Single source of truth for auth headers, error handling, token refresh | Scattered fetch calls: difficult to maintain, easy to miss token attachment, inconsistent error handling |
| No Redux/complex state management | React hooks sufficient for auth state and form state | Redux: overkill for this feature, adds complexity without benefit |

## Phase 0 & Phase 1 Completion

### ✅ Phase 0: Research (Complete)

**Artifacts Created**: `research.md` (336 lines)

All technical unknowns resolved:
1. JWT token management in React (localStorage with automatic refresh)
2. HTTP client architecture (vanilla Fetch API wrapper)
3. Error handling and user feedback (standardized mapping)
4. Date/time handling (local timezone, ISO format)
5. Request retry strategy (auto 5xx, manual 4xx)
6. Concurrent request handling (deduplication)
7. Loading states and UX (3-state with 1s delay)
8. Authentication flow (login, refresh, logout)
9. API base URL configuration (environment variables)
10. TypeScript interfaces (centralized type definitions)
11. Testing strategy (unit + E2E)
12. Security considerations (JWT + HTTPS)

### ✅ Phase 1: Design & Contracts (Complete)

**Artifacts Created**:
- `data-model.md` (436 lines) - API request/response models, validation rules, enums
- `contracts/api-contracts.md` (517 lines) - All endpoint contracts with examples
- `quickstart.md` - Setup and integration guide for frontend developers
- Agent context updated with new technologies

**Data Models Defined**:
- Authentication: AuthRequest, AuthResponse, RefreshTokenRequest/Response
- Health Records: Medication, Bottle, BowelMovement, SolidFood, Observation (request/response)
- Summary: DailySummary, HealthRecordDto
- Error: ErrorResponse
- State: ApiClientState, AuthState

**API Contracts Documented**:
- All 10 endpoints with request/response examples
- Error scenarios (400, 401, 409, 429, 500)
- CORS requirements
- Rate limiting
- Authentication header format
- Date/time format standards

### Constitution Check: Re-validation Post-Design

- **Code Quality:** ✅ PASS - Architecture supports clean separation of concerns with dedicated `api/` layer
- **Testing Standards:** ✅ PASS - Clear testing strategy with unit (React Testing Library) and E2E (Cypress) tests
- **User Experience Consistency:** ✅ PASS - Standardized error handling and loading states across all endpoints
- **Performance Requirements:** ✅ PASS - Performance targets defined and measurable (auth <2s, API <5s)

**Gate Status**: ✅ PASS - Ready for Phase 2 task planning

---

## Next Steps: Phase 2 (Tasks)

Run `/speckit.tasks` to generate detailed implementation tasks from this plan:

```bash
cd /work/health-diary
/speckit.tasks
```

This will create `tasks.md` with:
- Prioritized development tasks
- Acceptance criteria for each task
- Estimated effort/complexity
- Dependencies between tasks
- Test requirements

