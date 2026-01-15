# Feature Specification: UI-Backend API Integration

**Feature Branch**: `002-ui-backend-integration`  
**Created**: January 15, 2026  
**Status**: Draft  
**Input**: User description: "health-diary-ui needs to be integrated with health-diary-be. Using openapi.yaml make the necessary changes"


## User Scenarios & Testing *(mandatory)*

**Constitution Alignment:**
- **Code Quality:** OpenAPI specification is clear, standardized, and serves as the contract between UI and backend. All endpoints are documented with consistent patterns and response formats.
- **Testing Standards:** Each user story can be tested independently using the OpenAPI spec. Frontend and backend teams can develop and test in parallel.
- **User Experience Consistency:** Error responses, authentication flows, and data formats are consistent across all endpoints. Response structures follow standard conventions.
- **Performance Requirements:** API response times meet acceptable thresholds. Data pagination prevents large payload transfers.

### User Story 1 - Configure API Client from OpenAPI Specification (Priority: P1)

The frontend team can automatically generate API client code from the OpenAPI specification, eliminating manual coding of API calls and reducing integration errors.

**Why this priority**: This is the foundation for all UI-backend integration. Without a working API client generated from the spec, the frontend cannot communicate with the backend at all.

**Independent Test**: Frontend developers can generate TypeScript/JavaScript client from openapi.yaml and successfully import and use the generated API client in their application to make requests to the backend.

**Acceptance Scenarios**:

1. **Given** the OpenAPI specification is available, **When** a frontend developer runs code generation tools (e.g., OpenAPI Generator, Swagger Codegen), **Then** a type-safe API client is generated with all endpoints properly typed.
2. **Given** the generated API client exists, **When** a developer imports it into a React component, **Then** they can call API methods with full IDE autocomplete and type checking.
3. **Given** the generated client is used in the application, **When** the developer hovers over API method parameters, **Then** they see documentation from the OpenAPI specification.

---

### User Story 2 - Authenticate with Backend API (Priority: P1)

Users can log in through the UI, receive JWT tokens from the backend, and use those tokens to authenticate subsequent API requests.

**Why this priority**: Authentication is fundamental. Without working auth, no user can access personalized health data. This must work before any data access features.

**Independent Test**: A user can log in through the UI with valid credentials, receive access and refresh tokens, and those tokens are automatically included in subsequent API requests. Failed authentication returns appropriate error messages.

**Acceptance Scenarios**:

1. **Given** a user opens the login page, **When** they enter valid email and password, **Then** the UI receives access and refresh tokens and stores them securely.
2. **Given** a user has valid tokens, **When** they make any authenticated API request, **Then** the access token is automatically included in the Authorization header.
3. **Given** a user's access token has expired, **When** they make a request, **Then** the UI automatically uses the refresh token to obtain a new access token and retries the request.
4. **Given** a user enters invalid credentials, **When** they click login, **Then** they see a clear error message (e.g., "Invalid email or password").
5. **Given** a user enters their email without having registered, **When** they attempt to log in, **Then** they see the registration option with their email pre-filled.

---

### User Story 3 - Register User via Invite Link (Priority: P1)

Users can register for the application by clicking an invite link, providing their information, and creating an account. The UI validates input and communicates with the backend to create the user account.

**Why this priority**: Users cannot use the application without accounts. Invite-only registration is a security requirement. This must work for users to access the system.

**Independent Test**: A user can click an invite link, fill in registration form with valid data, submit, and successfully create a new account that they can then use to log in.

**Acceptance Scenarios**:

1. **Given** a user clicks a valid invite link, **When** the page loads, **Then** the invite token is validated with the backend and the registration form appears.
2. **Given** the registration form is displayed, **When** a user enters valid information (username, email, password, name), **Then** all fields show no validation errors.
3. **Given** a user submits valid registration data, **When** the backend processes it, **Then** the UI shows a success message and redirects to the login page.
4. **Given** a user attempts to register with a username that already exists, **When** they submit the form, **Then** the UI displays an error message and suggests an alternative.
5. **Given** a user enters a weak password (less than 8 characters), **When** they try to submit, **Then** the UI shows a validation error before sending to the backend.

---

### User Story 4 - View and Create Health Records (Priority: P1)

Users can view their daily health records (medications, hydration, bowel movements, food, observations) and create new records. The UI displays data retrieved from the backend and submits new records through the API.

**Why this priority**: This is the core feature of the health diary. Users cannot accomplish their main goal (tracking health) without this working.

**Independent Test**: A user can view today's health records on the UI, create a new medication record, and see it immediately appear in the daily summary without page reload.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and viewing the dashboard, **When** the page loads, **Then** the UI fetches and displays all health records for today using the API.
2. **Given** health records are displayed, **When** a user clicks "Add Medication", **Then** a form appears with fields for time, medication name, dosage, and schedule.
3. **Given** a user fills in the medication form with valid data, **When** they click "Save", **Then** the UI submits the data to the backend API and displays a success message.
4. **Given** the medication record was created successfully, **When** the user views the daily summary, **Then** the new medication appears in the list without requiring a page refresh.
5. **Given** a user submits a health record with an invalid date/time, **When** the backend rejects it, **Then** the UI displays a user-friendly error message.

---

### User Story 5 - View Medication Schedules and Dosage Information (Priority: P2)

Users can see available medication schedules and pre-configured dosage groups to assist them in selecting the correct schedule when recording medications.

**Why this priority**: This improves the user experience by preventing data entry errors and making the application more helpful. It's important but secondary to basic record creation.

**Independent Test**: When a user opens the medication creation form, they can see a list of available schedules (7am, 3pm, 7pm, 10pm, Ad Hoc) fetched from the backend, and select one.

**Acceptance Scenarios**:

1. **Given** a user opens the medication form, **When** the form loads, **Then** the UI fetches medication dosage groups from the backend.
2. **Given** dosage groups are available, **When** a user clicks the "Schedule" dropdown, **Then** they see all available schedule options with descriptions.
3. **Given** a user is on a page showing medication dosage groups, **When** they filter by schedule, **Then** the UI calls the backend to fetch only medications for that schedule and displays them.

---

### User Story 6 - Access Data with Proper Security and Error Handling (Priority: P2)

All API requests are properly authenticated, error responses provide helpful information, and the UI gracefully handles network failures and unexpected errors.

**Why this priority**: Security and reliability are crucial but secondary to basic functionality. Once core features work, we ensure they work securely and handle failures gracefully.

**Independent Test**: When a user attempts to access another user's data, the API returns a 403 Forbidden error and the UI displays an appropriate message. When network connectivity is lost, the UI shows a meaningful error.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they attempt to access an endpoint without valid authentication, **Then** the API returns a 401 Unauthorized error.
2. **Given** a user tries to access data they don't have permission for, **When** the request is made, **Then** the API returns a 403 Forbidden error and the UI shows an error message.
3. **Given** a user makes an API request and the network connection is lost, **When** the request fails, **Then** the UI shows a user-friendly error message and offers to retry.

---

### Edge Cases

- What happens when a user's session expires in the middle of creating a record? (Should use refresh token automatically)
- How does the UI handle pagination of large datasets? (Should implement page-based or cursor-based pagination)
- What happens when the OpenAPI specification is updated with new endpoints? (Should have a clear versioning and migration strategy)
- How does the UI handle concurrent requests that might modify the same data? (Should handle race conditions gracefully)
- What happens when the backend returns validation errors on individual fields? (Should display field-level error messages)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The OpenAPI specification MUST document all authentication endpoints (login, register, token refresh, password reset) with complete request and response schemas.
- **FR-002**: The OpenAPI specification MUST document all health record endpoints (create medication, bottle, bowel movement, food, observation) with complete request and response schemas.
- **FR-003**: The OpenAPI specification MUST document all medication schedule and dosage group endpoints with complete request and response schemas.
- **FR-004**: The OpenAPI specification MUST include a daily summary endpoint that retrieves all health records for a given date.
- **FR-005**: The OpenAPI specification MUST define consistent error response schema for all endpoints with status code, error code, and message fields.
- **FR-006**: The OpenAPI specification MUST document JWT authentication scheme and how tokens are used in request headers.
- **FR-007**: The OpenAPI specification MUST document rate limiting behavior and constraints for authentication endpoints.
- **FR-008**: The OpenAPI specification MUST include a servers section defining local development and production API endpoints.
- **FR-009**: All endpoints MUST have clear operation IDs that can be used for code generation.
- **FR-010**: All request and response bodies MUST use camelCase property names for consistency with JavaScript/TypeScript conventions.
- **FR-011**: The OpenAPI specification MUST document all possible HTTP status codes (200, 201, 400, 401, 403, 409, 429, etc.) for each endpoint.
- **FR-012**: The OpenAPI specification MUST include a components/schemas section with reusable schema definitions to prevent duplication.
- **FR-013**: The UI MUST generate an API client from the OpenAPI specification using standard code generation tools.
- **FR-014**: The UI MUST automatically include JWT access tokens in the Authorization header for all authenticated requests.
- **FR-015**: The UI MUST implement automatic token refresh when access tokens expire.
- **FR-016**: The UI MUST handle and display API error responses with user-friendly messages.

### Key Entities *(include if feature involves data)*

- **User**: Represents a registered user with email, username, name, authentication credentials, and account status. Relationship to health records is one-to-many.
- **MedicationAdministration**: Represents a medication dosage taken at a specific date and time, with medication name, dosage, and schedule information.
- **BottleConsumption**: Represents hydration intake recorded at a specific date and time, with quantity information.
- **BowelMovement**: Represents bowel movement event with date, time, consistency, color, and size information.
- **SolidFoodConsumption**: Represents food intake with date, time, food description, and quantity.
- **Observation**: Represents a general note or health observation with date, time, text content, and category.
- **MedicationDosageGroup**: Represents pre-configured medication information with medication name, dosage, and recommended schedule.
- **DailySummary**: Represents aggregated health records for a specific date, containing all health record types organized by type.
- **Token**: Represents JWT tokens (access and refresh) with expiration times and claims.
- **InviteLink**: Represents an invitation to register, with expiration date and usage status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: OpenAPI specification is complete with at least 95% of endpoints documented with request/response schemas and all status codes defined.
- **SC-002**: Frontend developers can generate a working TypeScript API client from the OpenAPI specification with zero manual modifications required for basic usage.
- **SC-003**: Users can complete the registration flow (clicking invite link → filling form → creating account) without any manual API calls, using only the generated API client.
- **SC-004**: Users can complete the login flow and receive authenticated tokens that work for subsequent API calls.
- **SC-005**: Users can create at least one new health record (medication, bottle, bowel movement, food, or observation) from the UI and see it immediately appear in their daily summary.
- **SC-006**: All API requests from the UI include proper authentication headers and fail gracefully with appropriate error messages when authentication is missing or invalid.
- **SC-007**: The OpenAPI specification uses consistent naming conventions across all endpoints and schemas (camelCase for properties, clear operation IDs, descriptive parameter names).
- **SC-008**: Documentation for each API endpoint is clear enough that new developers can understand the functionality without reading backend source code.
- **SC-009**: The application handles at least 100 concurrent authenticated users making simultaneous requests to read and write health records without performance degradation.
- **SC-010**: API response times for health record operations are consistently under 1 second for typical usage patterns (reading daily summary, creating new records).

## Assumptions

- The backend API is already running with all endpoints implemented (verified by the PR showing endpoint implementations).
- The OpenAPI specification file (openapi.yaml) exists and needs to be updated to accurately reflect the actual backend implementation.
- Frontend development uses TypeScript/JavaScript with standard API code generation tools (e.g., OpenAPI Generator, Swagger Codegen).
- JWT tokens are passed in the `Authorization: Bearer <token>` header format.
- The application uses a single API server in development and production (no multi-region or complex routing).
- User data is user-specific (no admin features to view other users' data in this feature scope).

## Notes

- The specification assumes the backend implementation is complete based on the existing endpoint implementations in Program.cs.
- Code generation from OpenAPI spec is a standard practice and should be integrated into the frontend build process.
- Error response standardization in the OpenAPI spec is critical for good developer experience in the frontend.
