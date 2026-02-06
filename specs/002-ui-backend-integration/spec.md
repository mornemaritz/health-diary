# Feature Specification: Frontend-Backend API Integration

**Feature Branch**: `002-ui-backend-integration`  
**Created**: 2026-02-06  
**Status**: Draft  
**Input**: User description: "Integrate the health-diary-ui frontend with the health-diary-be api authentication functionality and the health record related functionality. Use the OpenAPI definition in openapi.yaml for the integration"

## User Scenarios & Testing

### User Story 1 - User Registration and Account Setup (Priority: P1)

A user receives an invite link via email and creates their account by registering with their email, username, name, and password. They validate the invite token before being allowed to complete registration, establishing their identity in the system.

**Why this priority**: Account creation is foundational - all other functionality depends on users being able to register and access the system. This is the critical entry point for new users.

**Independent Test**: Can be fully tested by completing a registration flow with a valid invite token and verifying the user can access their account.

**Acceptance Scenarios**:

1. **Given** a user receives a valid invite link with a token, **When** they access the registration page, **Then** they see a registration form requesting email, username, name, and password
2. **Given** user enters valid registration data including an invite token, **When** they submit the form, **Then** they receive confirmation and can proceed to login
3. **Given** a user attempts to register without a valid invite token, **When** they submit the form, **Then** they receive an error message indicating the invite is invalid or expired
4. **Given** a user provides invalid data (username already exists, weak password, malformed email), **When** they submit, **Then** they see specific error messages for each validation failure

---

### User Story 2 - User Authentication and Session Management (Priority: P1)

A user logs in with their email and password, receives authentication tokens (access and refresh), and maintains an authenticated session for interacting with protected API endpoints. The UI securely stores tokens and automatically refreshes them when needed.

**Why this priority**: Authentication is required for all data access - users cannot interact with any health records without authentication. This is critical for system security and data privacy.

**Independent Test**: Can be fully tested by logging in with valid credentials, storing tokens, making an authenticated API request, and verifying the session is properly maintained.

**Acceptance Scenarios**:

1. **Given** a user navigates to the login page, **When** they enter valid email and password, **Then** they receive access and refresh tokens and are logged in
2. **Given** a user logs in successfully, **When** they perform actions requiring authentication, **Then** their access token is included in the Authorization header
3. **Given** an access token has expired, **When** the UI detects a 401 Unauthorized response, **Then** it automatically uses the refresh token to obtain a new access token
4. **Given** a user has an active session, **When** they refresh the page, **Then** their session persists using stored tokens
5. **Given** a user logs out, **When** they are redirected to the login page, **Then** their tokens are cleared from storage

---

### User Story 3 - Record a Medication Administration (Priority: P2)

A user records when they took medication by entering the date, time, medication name, and dosage. The UI sends this data to the API, which creates the record and returns a confirmation. The medication is added to the user's health history.

**Why this priority**: Medication tracking is a core health diary feature. While users can access the app with just login and registration, medication tracking delivers immediate value. It's the first health record type most users will interact with.

**Independent Test**: Can be fully tested by logging in, navigating to the medication record form, entering valid data, submitting, and verifying the record appears in the daily summary.

**Acceptance Scenarios**:

1. **Given** an authenticated user accesses the medication recording interface, **When** they enter date, time, medication name, and dosage, **Then** a form validates all required fields are present
2. **Given** the user submits valid medication data, **When** the API creates the record, **Then** the UI displays a success message and the record appears in the daily summary
3. **Given** the user submits medication data missing required fields (date or time), **When** they attempt submission, **Then** they see a validation error indicating what's missing
4. **Given** a medication record is created, **When** the user views their daily summary, **Then** the medication record is displayed with date, time, name, and dosage

---

### User Story 4 - Record Hydration (Bottle Consumption) (Priority: P2)

A user tracks their water intake by recording a bottle/hydration event with date, time, and quantity consumed. Multiple records can be created throughout the day to track cumulative fluid intake.

**Why this priority**: Hydration tracking is a key health metric that complements medication tracking. Users benefit from being able to record multiple hydration events throughout the day.

**Independent Test**: Can be fully tested by creating a hydration record and verifying it appears in the daily summary with all provided details.

**Acceptance Scenarios**:

1. **Given** an authenticated user accesses the hydration recording interface, **When** they enter date, time, and quantity (in ml or oz), **Then** the UI validates the quantity is a positive number
2. **Given** the user submits valid hydration data, **When** the API creates the record, **Then** the UI displays a success message and updates the daily summary
3. **Given** a user has recorded multiple hydration events on the same day, **When** they view the daily summary, **Then** all hydration records are displayed together
4. **Given** required fields (date or time) are missing, **When** the user attempts submission, **Then** they see a validation error

---

### User Story 5 - Record Bowel Movement (Priority: P2)

A user records bowel movement events with date, time, and consistency level (Hard, Normal, Soft, or Diarrhea). This helps track digestive health patterns over time.

**Why this priority**: Bowel movement tracking provides important digestive health insights. It's a distinct health metric that appears in the daily summary and helps identify patterns.

**Independent Test**: Can be fully tested by recording a bowel movement with a valid consistency level and verifying it appears in the daily summary.

**Acceptance Scenarios**:

1. **Given** an authenticated user accesses the bowel movement recording interface, **When** they enter date, time, and select a consistency level, **Then** the UI displays the four available consistency options (Hard, Normal, Soft, Diarrhea)
2. **Given** the user submits valid bowel movement data, **When** the API creates the record, **Then** the UI displays a success message and the record appears in the daily summary
3. **Given** a user selects a consistency level, **When** they view the daily summary, **Then** the consistency is clearly displayed with the bowel movement record
4. **Given** required fields are missing, **When** the user attempts submission, **Then** they see a validation error

---

### User Story 6 - Record Solid Food Consumption (Priority: P2)

A user records solid food intake by entering date, time, food description, and quantity consumed. Multiple food records can track dietary intake throughout the day.

**Why this priority**: Dietary tracking complements health monitoring and helps users understand their nutritional patterns. It provides value alongside medication and hydration tracking.

**Independent Test**: Can be fully tested by recording a solid food entry and verifying it appears in the daily summary with the provided details.

**Acceptance Scenarios**:

1. **Given** an authenticated user accesses the food recording interface, **When** they enter date, time, food description, and quantity, **Then** the UI validates all required fields
2. **Given** the user submits valid food data, **When** the API creates the record, **Then** the UI displays a success message and the record appears in the daily summary
3. **Given** a user has recorded multiple food items on the same day, **When** they view the daily summary, **Then** all food records are displayed together
4. **Given** the user enters descriptive food information, **When** the record is saved and displayed, **Then** the description is preserved exactly as entered

---

### User Story 7 - Record Observations and Notes (Priority: P2)

A user can record general observations or notes with date, time, notes content, and an optional category. This allows free-form health tracking for items that don't fit other categories.

**Why this priority**: Notes provide flexibility for users to record health observations outside structured categories. It's valuable for capturing important health events but is supplementary to the core record types.

**Independent Test**: Can be fully tested by recording a note with content and an optional category, and verifying it appears in the daily summary.

**Acceptance Scenarios**:

1. **Given** an authenticated user accesses the notes recording interface, **When** they enter date, time, and notes content, **Then** the UI validates that date and time are required
2. **Given** the user optionally adds a category to their notes, **When** they submit the record, **Then** the category is stored and displayed with the note
3. **Given** the user submits a note without a category, **When** the record is saved, **Then** it is still created and displayed successfully
4. **Given** a user has recorded multiple notes on the same day, **When** they view the daily summary, **Then** all notes are displayed together with their content and categories

---

### User Story 8 - View Daily Summary (Priority: P1)

A user can view all their health records for a specific date organized by record type (medications, hydration, bowel movements, food, observations). The summary provides a comprehensive view of their daily health tracking.

**Why this priority**: The daily summary is the primary way users view and understand their health records. It's the central hub for reviewing recorded data and seeing health patterns.

**Independent Test**: Can be fully tested by recording multiple types of records on the same day and verifying the daily summary displays all records organized by type.

**Acceptance Scenarios**:

1. **Given** an authenticated user navigates to a specific date, **When** the UI requests the daily summary from the API, **Then** all health records for that date are retrieved and displayed
2. **Given** records of different types exist for a date (medication, hydration, food, notes, bowel movement), **When** the daily summary is displayed, **Then** records are organized and clearly separated by type
3. **Given** no records exist for a selected date, **When** the user views the daily summary, **Then** they see a message indicating no records for that date
4. **Given** a user clicks on a date with records, **When** the summary loads, **Then** all record details (date, time, specific data like medication name/dosage) are displayed

---

### Edge Cases

- What happens when a user tries to record data for a future date? (Allow it - users may pre-log planned events)
- What happens when a user's access token expires during a long session? (Automatic refresh using the refresh token)
- What happens if both access and refresh tokens are invalid? (Force re-authentication and redirect to login)
- What happens if the API is unreachable when recording? (Display an offline/connection error message)
- What happens when a user tries to register with an email that already exists? (Display validation error indicating email is taken)
- What happens if a password reset link is accessed after it has expired? (Display error and prompt to request a new reset)
- What happens if the same refresh token is used multiple times? (Treat as a security issue and invalidate the session)

## Requirements

### Functional Requirements

**Authentication Requirements**:
- **FR-001**: System MUST provide a user registration endpoint that validates invite tokens and creates new user accounts with email, username, name, and password
- **FR-002**: System MUST provide a login endpoint that authenticates users with email and password, returning both an access token and refresh token
- **FR-003**: System MUST support automatic token refresh when an access token expires, using the refresh token
- **FR-004**: System MUST enforce JWT authentication on all protected health record endpoints
- **FR-005**: System MUST validate that access tokens are present and valid before allowing access to protected resources
- **FR-006**: System MUST clear authentication state when a user logs out (UI-side token removal)

**Health Record Creation Requirements**:
- **FR-007**: System MUST provide endpoints for creating health records of the following types: medication administration, hydration (bottle), bowel movement, solid food, and observations/notes
- **FR-008**: System MUST require date and time for all health record types
- **FR-009**: System MUST validate that bowel movement records include a consistency level from the allowed enum (Hard, Normal, Soft, Diarrhea)
- **FR-010**: System MUST validate that medication records include medication name and dosage information
- **FR-011**: System MUST validate that hydration records include a quantity value
- **FR-012**: System MUST validate that food records include a food description
- **FR-013**: System MUST validate that observation records include notes content
- **FR-014**: System MUST return the created record ID in the response when a health record is successfully created

**Health Record Retrieval Requirements**:
- **FR-015**: System MUST provide a daily summary endpoint that retrieves all health records for a specified date
- **FR-016**: System MUST organize retrieved records by type (medications, hydration, bowel movements, food, observations)
- **FR-017**: System MUST only return records for the authenticated user (no cross-user data exposure)
- **FR-018**: System MUST accept dates in yyyy-MM-dd format for the daily summary endpoint

**UI Integration Requirements**:
- **FR-019**: UI MUST securely store authentication tokens (access and refresh) in localStorage or sessionStorage
- **FR-020**: UI MUST automatically include the access token in the Authorization header for all authenticated API requests
- **FR-021**: UI MUST intercept 401 Unauthorized responses and attempt token refresh before retrying the request
- **FR-022**: UI MUST display appropriate error messages to users when API requests fail
- **FR-023**: UI MUST provide forms for each health record type with fields corresponding to the OpenAPI schema
- **FR-024**: UI MUST validate user input on the client side before submitting to the API
- **FR-025**: UI MUST persist the current date selection so users can easily navigate between dates in their health diary

### Key Entities

- **User**: Represents a registered user with email, username, name, and encrypted password
- **AuthToken**: JWT tokens (access and refresh) issued upon successful authentication; stored client-side in the UI
- **HealthRecord**: Base entity representing a health tracking entry with date, time, recordType, and type-specific data
- **MedicationAdministration**: A health record capturing medication name, dosage, date, and time of administration
- **HydrationRecord**: A health record capturing quantity of liquid consumed, date, and time
- **BowelMovement**: A health record capturing consistency level (Hard, Normal, Soft, Diarrhea), date, and time
- **FoodConsumption**: A health record capturing food description, quantity, date, and time
- **Observation**: A health record capturing free-form notes, optional category, date, and time
- **DailySummary**: A collection of all health records for a given date, organized by record type

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete the registration flow (receive invite, navigate to register page, enter credentials, and confirm account creation) in under 3 minutes
- **SC-002**: Users can authenticate (log in with email/password, receive tokens, and gain access to protected features) successfully in under 1 minute
- **SC-003**: Users can record a health event (any of the five record types) with all required data in under 2 minutes per record
- **SC-004**: The daily summary loads for any selected date and displays all existing records within 2 seconds of page navigation
- **SC-005**: Token refresh occurs transparently without requiring user re-authentication, maintaining session continuity when tokens expire
- **SC-006**: 95% of API requests from the UI complete within 2 seconds
- **SC-007**: Users can navigate between different dates and see updated summaries without logging out
- **SC-008**: Form validation errors provide specific, actionable feedback to users (e.g., "Date is required" rather than "Validation failed")
- **SC-009**: All API responses follow consistent error response format with statusCode and message fields
- **SC-010**: Users report successful integration between UI and API with ability to create and view all five health record types without using API tools directly

## Assumptions

- Users have valid email addresses and will receive invite links at the provided email
- Dates entered by users are treated as timezone-naive or in the user's local timezone (timezone handling is deferred)
- Password reset functionality is handled server-side but not integrated into the UI in this feature (only invite-based registration is covered)
- Admin functionality (generating invites, initiating password resets) exists in the backend but is out of scope for this UI integration feature
- The UI will store tokens in localStorage (not sessionStorage), persisting sessions across browser restarts
- The OpenAPI specification is authoritative for API contracts and response formats
- Error responses from the API always include a message field that can be displayed to users
- No pagination or filtering of health records is required; the daily summary returns all records for the requested date

