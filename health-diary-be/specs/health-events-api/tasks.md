---
description: "Task list for Health Events REST API implementation"
---

# Tasks: Health Events REST API

**Input**: Design documents from `/specs/health-events-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Constitution Principles**: Map tasks to these principles where relevant:
- **Code Quality:** Linting, documentation, and code review are required for all code changes.
- **Testing Standards:** Unit, integration, and regression tests MUST be implemented for all critical paths. All tests MUST pass before merge.
- **User Experience Consistency:** API/UX review, error/response format checks, and backward compatibility MUST be enforced unless a major version is planned.
- **Performance Requirements:** Profiling and performance regression checks MUST be performed. Performance targets MUST be met before release.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize .NET Minimal API project with EF Core and Npgsql
- [ ] T003 Configure PostgreSQL connection and migrations
- [ ] T004 [P] Configure linting and formatting tools
- [ ] T005 [P] Set up CI pipeline for build, test, and code quality checks

---

## Phase 2: Data Model & Contracts

- [ ] T101 Define Event/Action models based on modelexamples.ts
- [ ] T102 Implement EF Core entities and DbContext
- [ ] T103 Create API contracts for event/action creation, retrieval, and summary
- [ ] T104 Document API endpoints and expected responses (including error codes)

---

## Phase 3: Core API Implementation

- [ ] T201 Implement POST endpoint to add event/action for a date
- [ ] T202 Implement GET endpoint to retrieve events/actions by date
- [ ] T203 Implement GET endpoint to retrieve summary by date
- [ ] T204 Handle edge cases: valid date range, duplicate events (409), missing fields (400), invalid date format (400)
- [ ] T205 Ensure standardized error responses

---

## Phase 4: Testing

- [ ] T301 Write unit tests for models and validation logic
- [ ] T302 Write integration tests for API endpoints
- [ ] T303 Write regression tests for edge cases and error handling
- [ ] T304 Achieve coverage threshold for all critical paths

---

## Phase 5: Performance & Review

- [ ] T401 Profile API endpoints for performance goals (<200ms p95)
- [ ] T402 Review code for quality, documentation, and style compliance
- [ ] T403 Conduct API/UX review for consistency and backward compatibility
- [ ] T404 Final code review and merge

---

## Phase 6: Deployment

- [ ] T501 Prepare deployment scripts and environment configs
- [ ] T502 Deploy to staging and run smoke tests
- [ ] T503 Monitor for performance regressions and errors
- [ ] T504 Release to production
