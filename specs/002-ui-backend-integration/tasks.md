# Tasks: Frontend-Backend API Integration

**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)  
**Input**: Design documents from `/specs/002-ui-backend-integration/`  
**Prerequisites**: plan.md, spec.md (user stories), research.md, data-model.md, contracts/  

**Constitution Principles**:

- **Code Quality**: TypeScript strict mode, JSDoc comments, service layer extraction, code review required
- **Testing Standards**: Integration tests for API contracts (Vitest), unit tests for Auth context, all tests pass before merge
- **User Experience Consistency**: MUI styling consistency, API error messages displayed to users, transparent token refresh
- **Performance Requirements**: <2s API response targets, client-side validation before API calls, no localStorage performance regression

## Implementation Strategy & Execution Order

### MVP Scope (Recommended for Phase 1)

Implement **User Stories 1, 2, and 8** to create a complete MVP:

- US1 (Registration) → US2 (Login) → US8 (Daily Summary View)
- Enables end-to-end authentication and basic dashboard
- Users can register, log in, and see their health data

### Full Implementation

Add health record types sequentially:

- Phase 1 MVP: US1, US2, US8 (Auth + Dashboard)
- Phase 2: US3 (Medication) - First health record type
- Phase 3: US4-7 (Remaining health record types in parallel)

### Parallelization Opportunities

**After Phase 2 (Foundation) complete**:

- US1 & US2 can be developed in parallel (different pages, both use AuthService)
- US3-7 can be developed in parallel (each record type is independent, same pattern)

**Example parallel execution** (6 developers):

```
Developer 1: US1 (Registration)
Developer 2: US2 (Login) + US8 (Dashboard setup)
Developer 3: US3 (Medication form)
Developer 4: US4 (Hydration form)
Developer 5: US5 (Bowel movement form)
Developer 6: US6 (Food form) + US7 (Observations form)

Dependencies: All wait for Phase 2 foundational tasks
```

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project structure and tooling setup

- [x] T001 Create directory structure per plan.md in health-diary-ui/src/ (services/, contexts/, hooks/, pages/, components/, types/)
- [x] T002 Generate TypeScript types from openapi.yaml by running `npm run generate:types` and verify types in src/types/api.ts
- [x] T003 [P] Configure Vitest for React component and integration testing in vite.config.ts
- [x] T004 [P] Update package.json with scripts: generate:types, test, test:watch (if not present)
- [x] T005 Create .env.local template with VITE_API_URL=http://localhost:5000

**Checkpoint**: All file structure and tooling in place - ready to implement foundational services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and context that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until Phase 2 is 100% complete and tested

### Foundational Implementation Tasks

- [x] T006 [P] Create API client wrapper with JWT interceptor in health-diary-ui/src/services/apiClient.ts (handles Fetch, token injection, 401 response interception)
- [x] T007 [P] Create Auth service with register/login/logout methods in health-diary-ui/src/services/authService.ts (uses apiClient, stores tokens via localStorage)
- [x] T008 Create Health Record service with CRUD methods in health-diary-ui/src/services/healthRecordService.ts (createMedication, createHydration, createBowelMovement, createFood, createObservation, getDailySummary)
- [x] T009 [P] Create AuthContext provider with user state, login/register/logout actions in health-diary-ui/src/contexts/AuthContext.tsx (wraps entire app)
- [x] T010 [P] Create useAuth hook for accessing auth context in health-diary-ui/src/hooks/useAuth.ts
- [x] T011 Update health-diary-ui/src/App.tsx to wrap with AuthProvider and set up routing skeleton (pages not yet created)

**Checkpoint**: All authentication infrastructure in place - each user story phase can now use these services independently

---

## Phase 3: User Story 1 - User Registration and Account Setup (Priority: P1) 🎯 MVP

**Goal**: Enable new users to register with an invite token, creating their account identity

**Independent Test**: Complete registration flow with valid invite token → verify user can proceed to login

### Implementation for User Story 1

- [x] T012 [P] [US1] Create RegisterPage component skeleton in health-diary-ui/src/pages/RegisterPage.tsx (layout and form inputs for email, username, name, password, invite token)
- [x] T013 [P] [US1] Implement invite token validation in RegisterPage (call authService.validateInvite before form enable)
- [x] T014 [US1] Implement form validation in RegisterPage (client-side: email format, username pattern, password minimum 8 chars, all required fields) in health-diary-ui/src/pages/RegisterPage.tsx
- [x] T015 [US1] Add register form submission handler in RegisterPage (call authService.register, handle errors, show validation error messages)
- [x] T016 [US1] Add success handling: redirect to LoginPage after successful registration in RegisterPage
- [x] T017 [P] [US1] Create integration test for registration flow in tests/integration/authFlow.test.ts (valid registration, invalid token, validation errors)

**Checkpoint**: Users can register via valid invite token and proceed to login

---

## Phase 4: User Story 2 - User Authentication and Session Management (Priority: P1) 🎯 MVP

**Goal**: Authenticate users via login, maintain session with persistent tokens, handle token refresh automatically

**Independent Test**: Login → tokens stored → page refresh preserves session → automatic refresh on token expiration → logout clears tokens

### Implementation for User Story 2

- [x] T018 [P] [US2] Create LoginPage component in health-diary-ui/src/pages/LoginPage.tsx (email, password form inputs, submit button)
- [x] T019 [US2] Implement login form submission in LoginPage (call useAuth().login, show error messages on 401, redirect to DashboardPage on success)
- [x] T020 [US2] Add session persistence in AuthContext (restore user + tokens from localStorage on app mount/refresh)
- [x] T021 [US2] Implement token refresh functionality in apiClient.ts (intercept 401 responses, call /api/auth/token/refresh, retry original request with new token)
- [x] T022 [US2] Add logout functionality: LogoutButton component in health-diary-ui/src/components/LogoutButton.tsx (calls useAuth().logout, clears localStorage via authService.logout, redirects to LoginPage)
- [x] T023 [P] [US2] Create protected route wrapper in health-diary-ui/src/components/ProtectedRoute.tsx (redirect unauthenticated users to LoginPage)
- [x] T024 [P] [US2] Add token expiration checking in AuthContext (compare expiresAt with current time, warn user or auto-refresh)
- [x] T025 [US2] Create integration test for auth flow in tests/integration/authFlow.test.ts (login, session restore, token refresh, logout)

**Checkpoint**: Full authentication cycle works - users can login, maintain sessions across page refreshes, auto-refresh expiring tokens, logout cleanly

---

## Phase 5: User Story 8 - View Daily Summary (Priority: P1) 🎯 MVP

**Goal**: Display all health records for a specific date, organized by record type

**Independent Test**: Authenticated user selects a date → daily summary loads and displays all records grouped by type

### Implementation for User Story 8

- [x] T026 [P] [US8] Create DailySummary component skeleton in health-diary-ui/src/components/DailySummary.tsx (displays records by type: medications, hydration, bowel movements, food, observations)
- [x] T027 [P] [US8] Create DashboardPage component in health-diary-ui/src/pages/DashboardPage.tsx (date picker, calls healthRecordService.getDailySummary, renders DailySummary component)
- [x] T028 [US8] Implement date navigation in DashboardPage (navigate to previous/next day, jump to today, show selected date)
- [x] T029 [US8] Implement daily summary data loading in DashboardPage (fetch GET /api/health/summary/{date}, show loading state, handle 401 token errors)
- [x] T030 [US8] Implement record display in DailySummary component (organize by type, show metadata: date, time, type-specific fields)
- [x] T031 [US8] Add "no records" message in DailySummary (display message when date has no records)
- [x] T032 [P] [US8] Create integration test for daily summary in tests/integration/dashboardFlow.test.ts (load summary, verify record display, test date navigation)

**Checkpoint**: MVP complete - users can register, login, and view their daily health summary

---

## Phase 6: User Story 3 - Record Medication Administration (Priority: P2)

**Goal**: Allow authenticated users to record when they took medication with date, time, medication name, and dosage

**Independent Test**: Authenticated user opens medication form → enters valid data → submits → record appears in daily summary

### Implementation for User Story 3

- [x] T033 [P] [US3] Update openapi.yaml to document GET /api/health/medications/dosage-groups endpoint in health-diary-be/openapi.yaml (include request/response schemas for MedicationDosageGroup and MedicationDosage)
- [x] T034 [P] [US3] Add getMedicationDosageGroups method to healthRecordService in health-diary-ui/src/services/healthRecordService.ts (fetch GET /api/health/medications/dosage-groups with authentication)
- [x] T035 [US3] Update RecordMedicationDialogContent to fetch medication dosage groups on component mount in health-diary-ui/src/components/RecordMedicationDialogContent.tsx (call healthRecordService.getMedicationDosageGroups, reshape API response to match hardcoded medications constant structure on line 15: transform Schedule enum to lowercase keys, combine Medication and Dosage as "Medication - Dosage" strings)
- [x] T036 [US3] Add medication selection dropdown/autocomplete in RecordMedicationDialogContent (display MedicationDosageGroup list, allow user to select a MedicationDosage)
- [x] T037 [P] [US3] Extend RecordMedicationDialogContent component in health-diary-ui/src/components/RecordMedicationDialogContent.tsx (add form submission handler calling healthRecordService.createMedication)
- [x] T038 [US3] Add medication form validation in RecordMedicationDialogContent (required: date, time; optional: medication, dosage; validate date format yyyy-MM-dd, time HH:mm)
- [x] T039 [US3] Implement API integration for medication creation in RecordMedicationDialogContent (call healthRecordService.createMedication, show success message, close dialog, trigger summary refresh)
- [x] T040 [US3] Add error handling in RecordMedicationDialogContent (display API errors from /api/health/medication response)
- [x] T041 [P] [US3] Create integration test for medication recording in tests/integration/recordFlow.test.ts (valid form, validation errors, API failure handling, medication selection from API)

**Checkpoint**: Medication recording works end-to-end with medication selection from API

---

## Phase 7: User Story 4 - Record Hydration (Priority: P2)

**Goal**: Allow users to record water/hydration intake with date, time, and quantity

**Independent Test**: Authenticated user opens hydration form → enters valid data → submits → record appears in daily summary

### Implementation for User Story 4

- [ ] T042 [P] [US4] Create HydrationForm component in health-diary-ui/src/components/HydrationForm.tsx (date picker, time input, quantity number input)
- [ ] T043 [US4] Implement hydration form validation in HydrationForm (required: date, time; optional: quantity; validate quantity is positive number)
- [ ] T044 [US4] Implement API integration in HydrationForm (call healthRecordService.createHydration, show success, trigger summary refresh)
- [ ] T045 [US4] Add error handling in HydrationForm (display API errors from /api/health/bottle response)
- [ ] T046 [P] [US4] Create integration test for hydration recording in tests/integration/recordFlow.test.ts (valid form, validation, API errors)

**Checkpoint**: Hydration recording works end-to-end

---

## Phase 8: User Story 5 - Record Bowel Movement (Priority: P2)

**Goal**: Allow users to record bowel movement events with date, time, and consistency level

**Independent Test**: Authenticated user opens bowel movement form → selects consistency → submits → record appears in daily summary

### Implementation for User Story 5

- [ ] T047 [P] [US5] Create BowelMovementForm component in health-diary-ui/src/components/BowelMovementForm.tsx (date picker, time input, consistency select dropdown with options: Hard, Normal, Soft, Diarrhea)
- [ ] T048 [US5] Implement bowel movement form validation in BowelMovementForm (required: date, time, consistency; consistency must be one of enum values)
- [ ] T049 [US5] Implement API integration in BowelMovementForm (call healthRecordService.createBowelMovement, show success, trigger summary refresh)
- [ ] T050 [US5] Add error handling in BowelMovementForm (display API errors from /api/health/bowel-movement response)
- [ ] T051 [P] [US5] Create integration test for bowel movement recording in tests/integration/recordFlow.test.ts (valid form, consistency enum validation, API errors)

**Checkpoint**: Bowel movement recording works end-to-end

---

## Phase 9: User Story 6 - Record Solid Food Consumption (Priority: P2)

**Goal**: Allow users to record solid food intake with date, time, food description, and quantity

**Independent Test**: Authenticated user opens food form → enters food details → submits → record appears in daily summary

### Implementation for User Story 6

- [ ] T052 [P] [US6] Create FoodConsumptionForm component in health-diary-ui/src/components/FoodConsumptionForm.tsx (date picker, time input, food description text field, quantity field)
- [ ] T053 [US6] Implement food form validation in FoodConsumptionForm (required: date, time; optional: food, quantity)
- [ ] T054 [US6] Implement API integration in FoodConsumptionForm (call healthRecordService.createFood, show success, trigger summary refresh)
- [ ] T055 [US6] Add error handling in FoodConsumptionForm (display API errors from /api/health/solid-food response)
- [ ] T056 [P] [US6] Create integration test for food recording in tests/integration/recordFlow.test.ts (valid form, missing optional fields, API errors)

**Checkpoint**: Food consumption recording works end-to-end

---

## Phase 10: User Story 7 - Record Observations and Notes (Priority: P2)

**Goal**: Allow users to record free-form health observations with date, time, notes, and optional category

**Independent Test**: Authenticated user opens observation form → enters notes → optionally adds category → submits → record appears in daily summary

### Implementation for User Story 7

- [ ] T057 [P] [US7] Create ObservationForm component in health-diary-ui/src/components/ObservationForm.tsx (date picker, time input, notes text area, category text field)
- [ ] T058 [US7] Implement observation form validation in ObservationForm (required: date, time, notes; optional: category; notes must be non-empty)
- [ ] T059 [US7] Implement API integration in ObservationForm (call healthRecordService.createObservation, show success, trigger summary refresh)
- [ ] T060 [US7] Add error handling in ObservationForm (display API errors from /api/health/note response)
- [ ] T061 [P] [US7] Create integration test for observation recording in tests/integration/recordFlow.test.ts (valid form, category optional, API errors)

**Checkpoint**: All health record types can be recorded end-to-end

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Refine error handling, improve UX, add monitoring, finalize documentation

### Error Handling & Loading States

- [ ] T062 [P] Add loading spinners to all form submissions (show spinner in submit button during API call)
- [ ] T063 [P] Implement error toast notifications for API failures (display API error messages in MUI Snackbar/Toast)
- [ ] T064 [P] Add field-level error display in all forms (show red error text below each field with validation message)
- [ ] T065 [P] Handle network connectivity errors (show offline message, retry option if network unavailable)
- [ ] T066 Add session timeout handling (warn user before token expires, auto-logout on refresh failure)

### UX Improvements

- [ ] T067 [P] Add date preset buttons in date picker (Today, Yesterday, 7 days ago buttons)
- [ ] T068 [P] Implement record confirmation dialogs (confirm before submitting to prevent accidental posts)
- [ ] T069 Persist selected date in browser session (user's selected date remembered across page reloads)
- [ ] T070 Add empty state messaging throughout app (when no records, no search results, etc.)
- [ ] T071 Implement form reset after successful submission (clear fields, ready for next record)

### Testing & Quality

- [ ] T072 [P] Add unit tests for apiClient.ts (token injection, refresh logic, error parsing)
- [ ] T073 [P] Add unit tests for authService.ts (register, login, logout, token storage)
- [ ] T074 [P] Add unit tests for AuthContext provider (state updates, login/logout, error handling)
- [ ] T075 [P] Add unit tests for form validation functions (email format, username pattern, required fields)
- [ ] T076 Create E2E test scenario document in specs/002-ui-backend-integration/e2e-scenarios.md (user journeys for manual testing)

### Documentation

- [ ] T077 Update README.md with setup instructions (npm install, npm run generate:types, npm run dev, npm test)
- [ ] T078 Add code comments for complex logic (token refresh, 401 interception, form validation)
- [ ] T079 [P] Document API error codes and what to do in each case (500 errors, 409 conflicts, 400 validation)
- [ ] T080 [P] Create troubleshooting guide for common issues (token not stored, API unreachable, form validation not working)

### Performance & Monitoring

- [ ] T081 [P] Add performance logging for API calls (log request time, identify slow endpoints)
- [ ] T082 [P] Monitor bundle size (ensure no unexpected dependencies added)
- [ ] T083 Profile localStorage operations (verify <10ms overhead as planned)

**Checkpoint**: Feature is production-ready with robust error handling, excellent UX, and comprehensive tests

---

## Dependencies & Execution Flow

### Critical Path (Must complete in order)

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3-5 (MVP: US1, US2, US8)
  ↓
Phase 6-10 (Health records: US3-7) - Can run in parallel
  ↓
Phase 11 (Polish)
```

### User Story Dependencies

```
US1 (Registration)
  ↓ must complete before
US2 (Login/Auth)
  ↓ must complete before
US3-8 (All other stories) - Can run in parallel once auth works
  ↓
All stories independent after Phase 2 foundation is complete
```

### Phase 2 Blocking

All Phase 2 tasks must be 100% complete before ANY user story work. If Phase 2 is incomplete:
- User stories can't test API integration
- Auth state won't work
- No token refresh mechanism
- Pages will crash trying to use undefined services

**Status check**: Phase 2 is complete when all services, context, and hooks exist and can be imported without errors.

---

## Task Checklist Summary

- **Total Tasks**: 83
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 6 tasks (🚫 Blocking)
- **User Story 1 (Registration)**: 7 tasks
- **User Story 2 (Auth & Session)**: 8 tasks
- **User Story 8 (Dashboard)**: 7 tasks
- **User Story 3 (Medication)**: 9 tasks (includes API endpoint documentation + medication selection from API)
- **User Story 4 (Hydration)**: 5 tasks
- **User Story 5 (Bowel Movement)**: 5 tasks
- **User Story 6 (Food)**: 5 tasks
- **User Story 7 (Observations)**: 5 tasks
- **Polish Phase**: 22 tasks

### Parallelization Opportunities

**After Phase 2 (6 developers)**:
- 3 developers: US1, US2, US8 sequentially (critical path for MVP) - ~1 week
- 3 developers: Prepare US3-7 component stubs, write tests (ready for Phase 2 completion)

**After MVP completes**:
- 5 developers: US3, US4, US5, US6, US7 in parallel - ~3-4 days each

**Total estimated time**: ~2-3 weeks for full feature (smaller team: 4-5 weeks)

---

## MVP Recommendation

**Minimum Viable Product** (recommended first release):
- ✅ Phase 1: Setup
- ✅ Phase 2: Foundational (all services)
- ✅ Phase 3: User Story 1 (Registration)
- ✅ Phase 4: User Story 2 (Authentication)
- ✅ Phase 5: User Story 8 (Daily Summary)
- ⏸️ Phase 6-10: Defer health record creation to Phase 2 release
- ⏸️ Phase 11: Include critical polish items (error handling, loading states); defer nice-to-haves

**MVP delivers**: Essential auth flow + ability to view health data. Health record creation can be added in subsequent releases.
