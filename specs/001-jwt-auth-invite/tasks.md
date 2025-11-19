
# Tasks: JWT Auth & Invite-Only Registration

## Phase 1: Setup
- [ ] T001 Create project structure per plan.md
- [ ] T002 Configure PostgreSQL connection in health-diary-be/src/appsettings.json
- [ ] T003 [P] Install dependencies in health-diary-be/src/HealthDiary.Api.csproj
- [ ] T004 [P] Add EF Core migration for initial schema in health-diary-be/src/Data/
- [ ] T005 [P] Add xUnit test project in health-diary-be/tests/Unit/

## Phase 2: Foundational
- [ ] T006 Implement User, InviteLink, PasswordResetLink, AccessToken, RefreshToken entities in health-diary-be/src/Models/
- [ ] T007 Implement DbContext and migrations in health-diary-be/src/Data/HealthDiaryContext.cs
- [ ] T008 Implement JWT authentication middleware in health-diary-be/src/Services/
- [ ] T009 Implement rate limiting middleware in health-diary-be/src/Services/

## Phase 3: [US1] Registration via Invite Link (P1)
- [ ] T010 [US1] Implement endpoint to generate invite links in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T011 [US1] Implement registration endpoint in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T012 [P] [US1] Validate invite link (single-use, expiration) in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T013 [P] [US1] Unit test registration flow in health-diary-be/tests/Unit/HealthRecordServiceTests.cs

## Phase 4: [US2] Login (P1)
- [ ] T014 [US2] Implement login endpoint in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T015 [P] [US2] Issue access and refresh tokens in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T016 [P] [US2] Store refresh tokens securely in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T017 [P] [US2] Unit test login flow in health-diary-be/tests/Unit/HealthRecordServiceTests.cs

## Phase 5: [US3] Token Refresh (P1)
- [ ] T018 [US3] Implement token refresh endpoint in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T019 [P] [US3] Validate refresh token (expiration, single-use) in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T020 [P] [US3] Unit test token refresh flow in health-diary-be/tests/Unit/HealthRecordServiceTests.cs

## Phase 6: [US4] Access Control (P1)
- [ ] T021 [US4] Protect resources with JWT access token middleware in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T022 [P] [US4] Unit test access control in health-diary-be/tests/Unit/HealthRecordServiceTests.cs

## Phase 7: [US5] Invalid/Expired Invite Link (P2)
- [ ] T023 [US5] Implement error handling for invalid/expired invite links in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T024 [P] [US5] Unit test invalid/expired invite link handling in health-diary-be/tests/Unit/HealthRecordServiceTests.cs

## Phase 8: [US6] Password Reset (P2)
- [ ] T025 [US6] Implement endpoint to generate password reset link in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T026 [US6] Implement endpoint to reset password using link in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T027 [P] [US6] Validate password reset link (single-use, expiration) in health-diary-be/src/Services/HealthRecordService.cs
- [ ] T028 [P] [US6] Unit test password reset flow in health-diary-be/tests/Unit/HealthRecordServiceTests.cs

## Final Phase: Polish & Cross-Cutting Concerns
- [ ] T029 Update OpenAPI contract in specs/001-jwt-auth-invite/contracts/auth.yaml
- [ ] T030 Update quickstart.md and README.md with endpoint documentation
- [ ] T031 Code review and ensure all tests pass before merge

## Dependencies
- Phase 1 (Setup) → Phase 2 (Foundational) → User Story Phases (3-8) → Final Phase
- US1 (Registration) is required for US2 (Login), US3 (Token Refresh), US4 (Access Control)
- US5 (Invalid/Expired Invite Link) and US6 (Password Reset) are independent after foundational phases

## Parallel Execution Examples
- T003, T004, T005 can run in parallel
- T012, T013 can run in parallel after T011
- T015, T016, T017 can run in parallel after T014
- T019, T020 can run in parallel after T018
- T022 can run in parallel after T021
- T024 can run in parallel after T023
- T027, T028 can run in parallel after T026

## MVP Scope
- US1 (Registration via Invite Link) and US2 (Login) are minimum for MVP

## Format Validation
- All tasks follow strict checklist format: `- [ ] Txxx [P] [USx] Description with file path`
