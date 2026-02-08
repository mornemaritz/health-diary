# Implementation Plan: Frontend-Backend API Integration

**Branch**: `002-ui-backend-integration` | **Date**: 2026-02-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-ui-backend-integration/spec.md`

## Summary

Integrate the health-diary-ui React/TypeScript frontend with the health-diary-be .NET backend API by implementing authenticated API communication, token management, and UI forms for all health record types (medication, hydration, bowel movement, food, observations). The backend provides a complete OpenAPI 3.0 specification; the UI will consume these endpoints securely using JWT tokens stored in localStorage with automatic refresh token handling.

**Technical Approach**: Use React hooks (`useEffect`, `useContext`) and native Fetch API with interceptor pattern for authentication headers. Implement a custom Auth context for session management rather than external dependencies. Create reusable form components for each health record type that are already partially implemented (RecordDialog, RecordMedicationDialogContent patterns exist). UI will validate form input before API submission and display OpenAPI error responses to users.

## Technical Context

**Frontend Stack**: React 19.1.1, TypeScript, Vite, MUI 7.3.2, react-router-dom 7.9.1
**Backend Stack**: .NET 9, Entity Framework Core, PostgreSQL
**API Specification**: OpenAPI 3.0.0 (openapi.yaml, 799 lines, fully defines auth + health record endpoints)
**Authentication**: JWT (Bearer tokens), access token + refresh token pattern
**Storage**: Frontend: localStorage for tokens | Backend: PostgreSQL
**Testing**: Frontend: Vitest (existing setup via Vite), Backend: xUnit
**Target Platform**: Docker containers (docker-compose.yml at root)
**Performance Goals**: <2s API response, <1min form submission to summary display, 95% requests <2s
**Constraints**: Minimize external dependencies; use native APIs where feasible; leverage MUI for UI consistency
**Scale/Scope**: Single authenticated user initially (multi-user in backend design, single-user UI focus)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Code Quality**: React components will use TypeScript strict mode, follow functional component patterns with proper prop typing, include JSDoc comments on utility functions. All API client code will be extracted to services/ directory for testability and reusability. Code review required for all PRs.

✅ **Testing Standards**: Will plan integration tests using Vitest to verify API contract compliance (mocked requests). Unit tests for Auth context provider. E2E scenarios (register → login → create record → view summary) will be testable via manual/automated UI testing. Test coverage planned for auth service, form validation, error handling.

✅ **User Experience Consistency**: All forms use MUI for consistent styling (matches existing components). API error messages from OpenAPI responses are displayed to users unchanged. Form validation provides field-specific feedback matching OpenAPI schemas. Token expiration handling is transparent to user (automatic refresh).

✅ **Performance Requirements**: API response time targets <2s are inherited from OpenAPI endpoints. Form submission validated client-side before API call (no wasted requests). LocalStorage operations are O(1). No performance regression expected; localStorage adds <10ms overhead.

**Constitution Compliance Status**: ✅ **PASS** - All four principles can be upheld with planned React patterns (context for auth, service layer for API calls, native APIs to minimize dependencies).

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-backend-integration/
├── spec.md                # Feature specification
├── plan.md                # This file
├── research.md            # Phase 0 (to be generated)
├── data-model.md          # Phase 1 (to be generated)
├── quickstart.md          # Phase 1 (to be generated)
├── contracts/             # Phase 1 (to be generated)
│   ├── api-client.ts      # Generated TypeScript types from OpenAPI
│   └── service-interface.ts
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

**Frontend (health-diary-ui/)**:
```text
health-diary-ui/src/
├── services/              # API client, auth service, health record service
│   ├── apiClient.ts       # HTTP client with JWT auth interceptor
│   ├── authService.ts     # Login, register, token refresh logic
│   └── healthRecordService.ts  # CRUD operations for all record types
├── contexts/              # React context providers
│   └── AuthContext.tsx    # User auth state, token storage/retrieval
├── pages/                 # Page components (Login, Register, Dashboard)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── components/            # Reusable form/UI components
│   ├── RecordDialog.tsx   # (existing, generic dialog wrapper)
│   ├── RecordMedicationDialogContent.tsx  # (existing, extend with API call)
│   ├── RecordBottleDialog.tsx             # (existing, extend with API call)
│   ├── BowelMovementForm.tsx              # (new)
│   ├── FoodConsumptionForm.tsx            # (new)
│   ├── ObservationForm.tsx                # (new)
│   └── DailySummary.tsx   # (new) Display all records for a date
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Access auth context
│   └── useApi.ts          # Handle API calls with error + loading state
├── types/                 # TypeScript interfaces (generated from OpenAPI)
│   └── index.ts
└── main.tsx, App.tsx      # Entry point

tests/
├── integration/           # Test API interactions
│   └── authFlow.test.ts   # Register → Login → Authenticated request flow
└── unit/
    ├── authService.test.ts
    └── AuthContext.test.tsx
```

**Backend** (health-diary-be/): Already has API endpoints; this plan focuses on frontend consumption only.

**Structure Decision**: Monorepo structure (health-diary-ui + health-diary-be side by side). Frontend uses service layer pattern (apiClient → authService/healthRecordService) for separation of concerns. Context API for global auth state avoids Redux/Zustand complexity. Custom Fetch-based HTTP client avoids axios/tanstack-query overhead. TypeScript types generated from OpenAPI for type-safe API calls.

## Complexity Tracking

No Constitution Check violations. Structure is minimal and leverages existing MUI + React Router setup.
