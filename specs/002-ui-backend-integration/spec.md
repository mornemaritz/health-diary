# Feature Specification: UI and Backend API Integration

**Feature Branch**: `002-ui-backend-integration`  
**Created**: 2026-02-01  
**Status**: Draft  
**Input**: User description: "The ui located in the health-diary-ui folder must be integrated with the backend api located in the health-diary-be folder. Vanilla javascript must be used as far as possible."


## Overview

Integrate the existing Health Diary UI (React-based) with the Health Diary Backend API (.NET-based) to enable end-to-end functionality for health record management and user authentication. The integration ensures the UI can authenticate users, manage health records (medication, hydration, bowel movements, food intake, notes), and retrieve daily summaries through REST API calls. Vanilla JavaScript/TypeScript must be used for API calls instead of heavy client libraries where feasible.

## User Scenarios & Testing

### User Story 1 - User Authentication (Priority: P1)

Users must be able to log in using their email address and password to access the health diary application.

**Why this priority**: Authentication is the foundation for all other features. Without working login, users cannot access any protected resources.

**Independent Test**: Can be fully tested by attempting to log in with valid and invalid credentials, and verifying that valid credentials return JWT tokens while invalid credentials are rejected.

**Acceptance Scenarios**:

1. **Given** a user has registered with valid credentials, **When** the user submits their email and password on the login form, **Then** the system authenticates the user and returns access and refresh JWT tokens.
2. **Given** a user enters an incorrect password, **When** the user submits the login form, **Then** the system denies authentication and displays a clear error message.
3. **Given** a user receives a valid access token, **When** the user accesses protected API endpoints, **Then** the access token is automatically included in request headers.
4. **Given** an access token is expired, **When** the user makes a request, **Then** the system uses the refresh token to obtain a new access token without requiring re-authentication.

---

### User Story 2 - Record Medication Administration (Priority: P1)

Users must be able to record medication administration events with specific medications, dosages, times, and schedules.

**Why this priority**: Medication tracking is the primary use case for the application. This is critical functionality that must work reliably.

**Independent Test**: Can be fully tested by submitting medication records via the UI form and verifying they are persisted in the backend and retrievable.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and viewing the record dialog, **When** the user selects medications, dosages, and time and submits the form, **Then** the system creates a medication record in the backend and displays a success message.
2. **Given** a user attempts to record duplicate medication (same medication, time, and schedule on same date), **When** the user submits the form, **Then** the system rejects the duplicate and displays a conflict message.
3. **Given** a user has recorded medications, **When** the user views the daily summary, **Then** the system displays all recorded medications with their details.

---

### User Story 3 - Record Hydration (Bottle Consumption) (Priority: P2)

Users must be able to record bottle/hydration intake events with specific bottle sizes and times.

**Why this priority**: Hydration tracking is part of the core health monitoring suite, important for user data collection but secondary to medication tracking.

**Independent Test**: Can be fully tested by submitting bottle consumption records and verifying they appear in daily summaries.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and recording hydration, **When** the user specifies bottle size and time and submits, **Then** the system creates a bottle consumption record in the backend.
2. **Given** a user has recorded hydration events, **When** the user views the daily summary, **Then** the system displays the count and details of bottle consumptions.

---

### User Story 4 - Record Bowel Movement (Priority: P2)

Users must be able to record bowel movement events with associated details like size, consistency, and color.

**Why this priority**: Bowel tracking is part of the standard health monitoring but secondary to medication tracking.

**Independent Test**: Can be fully tested by submitting bowel movement records with details and verifying they are saved and retrievable.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and recording bowel movement, **When** the user provides details (size, consistency, color) and time, **Then** the system creates a bowel movement record in the backend.
2. **Given** a user has recorded bowel movements, **When** the user views the daily summary, **Then** the system displays bowel movement records with their details.

---

### User Story 5 - Record Food Intake (Priority: P2)

Users must be able to record solid food intake events with optional notes about the meal.

**Why this priority**: Food tracking provides context for overall health monitoring but is secondary to medication and core health metrics.

**Independent Test**: Can be fully tested by recording food intake events and confirming they appear in daily summaries.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and recording food intake, **When** the user specifies food and optional notes, **Then** the system creates a food intake record in the backend.
2. **Given** a user has recorded food intakes, **When** the user views the daily summary, **Then** the system displays food intake records.

---

### User Story 6 - Add Observations/Notes (Priority: P2)

Users must be able to record general observations or notes about their health status.

**Why this priority**: Notes provide qualitative health data but are supplementary to quantitative health metrics.

**Independent Test**: Can be fully tested by creating observation records and confirming they are saved and displayed.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and adding notes, **When** the user enters observation text and submits, **Then** the system creates an observation record in the backend.
2. **Given** a user has added observations, **When** the user views the daily summary, **Then** the system displays all observation records.

---

### User Story 7 - View Daily Summary (Priority: P1)

Users must be able to view a consolidated summary of all health records for a specific date, including counts and details of each record type.

**Why this priority**: The daily summary is the primary dashboard view that gives users visibility into their health data. This must work reliably for all record types.

**Independent Test**: Can be fully tested by fetching summary data for a date with mixed record types and verifying counts and details are accurate.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and has recorded various health events for a date, **When** the user navigates to the daily summary view, **Then** the system retrieves all records from the backend and displays them organized by record type with accurate counts.
2. **Given** a user views a summary for a date with no records, **When** the summary loads, **Then** the system displays a summary with zero counts.
3. **Given** the backend has multiple records for a date, **When** the user views the summary, **Then** the system displays all records correctly categorized by type (Medication, Bottle, Bowel Movement, Food, Notes).

---

### User Story 8 - Manage Medication Schedules (Priority: P3)

The UI must retrieve available medication dosage groups organized by schedule from the backend to populate medication selection dropdowns.

**Why this priority**: This is infrastructure for the medication recording UI but doesn't directly deliver user value. It's needed for full integration but can be addressed after core record submission works.

**Independent Test**: Can be fully tested by fetching medication dosage groups and verifying they match backend data.

**Acceptance Scenarios**:

1. **Given** a user opens the medication recording dialog, **When** the UI loads, **Then** the system fetches available medications grouped by schedule from the backend.
2. **Given** medications are organized by schedule (7am, 3pm, 7pm, 10pm, adhoc), **When** a user selects a schedule, **Then** the UI displays only medications applicable to that schedule.

---

### Edge Cases

- What happens when the user's access token expires during a form submission? The system should silently refresh the token and retry the request.
- How does the system handle network timeouts when submitting a record? The system should display a clear error message and allow the user to retry.
- What if the backend returns validation errors for a submitted record? The system should display these errors clearly on the form without losing user input.
- What happens when a user attempts to submit a duplicate record? The system should display the 409 Conflict error with clear messaging about the duplicate.
- How does the system handle dates and times in different user timezones? All dates/times are treated as local user dates; backend receives dates in `yyyy-MM-dd` and times in `HH:mm:ss` format.

## Requirements

### Functional Requirements

- **FR-001**: The UI MUST authenticate users by sending email and password credentials to the `/api/auth/login` endpoint and receiving JWT access and refresh tokens.
- **FR-002**: The UI MUST include JWT access tokens in the `Authorization: Bearer <token>` header for all requests to protected API endpoints.
- **FR-003**: The UI MUST implement automatic token refresh using the refresh token when the access token expires, without interrupting user workflow.
- **FR-004**: The UI MUST provide a medication record submission form that sends POST requests to `/api/health/medication` with medication, dosage, schedule, date, and time.
- **FR-005**: The UI MUST provide a hydration record submission form that sends POST requests to `/api/health/bottle` with bottle size, date, and time.
- **FR-006**: The UI MUST provide a bowel movement record submission form that sends POST requests to `/api/health/bowel-movement` with size, consistency, color, date, and time.
- **FR-007**: The UI MUST provide a food intake record submission form that sends POST requests to `/api/health/solid-food` with food description and optional notes, date, and time.
- **FR-008**: The UI MUST provide an observation/note submission form that sends POST requests to `/api/health/note` with observation text, date, and time.
- **FR-009**: The UI MUST retrieve and display daily summaries by sending GET requests to `/api/health/summary/{date}` and rendering all records for the specified date.
- **FR-010**: The UI MUST retrieve available medication dosage groups by sending GET requests to `/api/health/medications/dosage-groups` and `/api/health/medications/dosage-groups/schedule/{schedule}`.
- **FR-011**: The UI MUST display API error responses (4xx/5xx) with user-friendly error messages without exposing technical details.
- **FR-012**: The UI MUST use vanilla JavaScript/TypeScript for HTTP requests (fetch API or equivalent) instead of heavy client libraries where feasible.
- **FR-013**: All date values MUST be formatted as `yyyy-MM-dd` and time values as `HH:mm:ss` when sent to the backend.
- **FR-014**: The UI MUST persist JWT tokens securely (localStorage or sessionStorage) and automatically attach them to API requests.
- **FR-015**: The UI MUST handle 409 Conflict responses (duplicate records) and display a clear message to the user.
- **FR-016**: The UI MUST clear stored tokens and redirect to login when receiving 401 Unauthorized responses.
- **FR-017**: All API calls MUST use absolute URLs or a configurable API base URL (e.g., environment variables or config file).
- **FR-018**: The UI MUST support responsive API request handling with proper error states (loading, error, success).

### Key Entities

- **User**: Authenticated via JWT tokens; has access to personal health records.
- **MedicationAdministration**: Record of medication taken with medication name, dosage, schedule, date, and time.
- **BottleConsumption**: Record of hydration with bottle size, date, and time.
- **BowelMovement**: Record of bowel movement with size, consistency, color, date, and time.
- **SolidFoodConsumption**: Record of food intake with food description, optional notes, date, and time.
- **Observation**: Record of general observation/note with text, date, and time.
- **DailySummary**: Aggregated view of all records for a specific date with counts and details for each record type.
- **JWT Token Pair**: Access token (short-lived) and refresh token (long-lived) for stateless authentication.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can successfully log in and obtain JWT tokens within 2 seconds of submission.
- **SC-002**: 100% of authenticated API requests include valid JWT tokens in the Authorization header.
- **SC-003**: 100% of successful API responses (2xx status) result in appropriate UI state updates (success messages, data display, or form clearing).
- **SC-004**: 100% of error API responses (4xx/5xx status) display user-friendly error messages without technical details.
- **SC-005**: Medication records can be submitted and retrieved without data loss or corruption.
- **SC-006**: Daily summaries display all record types (Medication, Bottle, Bowel, Food, Notes) with accurate counts matching backend data.
- **SC-007**: Duplicate record attempts (same date/time/type) are rejected with clear 409 Conflict messaging.
- **SC-008**: Token refresh occurs automatically before token expiry; users experience no interruption or forced re-authentication.
- **SC-009**: All HTTP requests use vanilla JavaScript Fetch API (or equivalent built-in methods) for at least 80% of API calls, minimizing external dependencies.
- **SC-010**: The UI responds to all API calls within 5 seconds (including network latency), with loading indicators displayed after 1 second of waiting.
- **SC-011**: All date/time values sent to the backend are in the correct format (yyyy-MM-dd and HH:mm:ss) 100% of the time.
- **SC-012**: Concurrent record submissions (multiple forms submitted while others are in-flight) are handled correctly without data corruption or race conditions.

## Assumptions

- The backend API is fully functional with all endpoints listed in the [Health Events API spec](../health-events-api/spec.md) implemented and working.
- JWT token expiry times are configured on the backend; the frontend will use standard JWT expiry claims (`exp`) to determine when refresh is needed.
- The backend CORS (Cross-Origin Resource Sharing) is configured to allow requests from the UI domain.
- Users have already been registered via the authentication system (from 001-jwt-auth-invite spec).
- All health records belong to the authenticated user; the backend enforces user isolation (not in scope for this feature but assumed to exist).
- Date and time inputs from users are assumed to be in the user's local timezone; the system treats them as local dates without timezone conversion.
- The UI will run on the same domain or a configured API base URL accessible from the UI domain.
- React and associated UI libraries (MUI, React Router) are already properly configured in the project and this feature focuses on API integration.
- The backend API is accessible over HTTP/HTTPS and follows standard REST conventions.

## Dependencies

- **001-jwt-auth-invite**: Authentication system must be functional for users to log in and obtain tokens.
- **health-events-api**: All health record endpoints must be implemented and functional.
- Backend API must be deployed and accessible from the UI application.

## Out of Scope

- Email delivery or invitation link generation (handled in 001-jwt-auth-invite).
- Password reset functionality via email (handled in 001-jwt-auth-invite).
- Real-time data synchronization or WebSocket integration.
- Offline-first or offline data storage.
- Export/import of health records.
- Data visualization or analytics dashboards.
- Advanced filtering or search of historical records.
- User profile management or preference settings.
