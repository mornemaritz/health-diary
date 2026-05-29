# Data Model: Frontend-Backend API Integration

**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)
**Date**: 2026-02-08
**Phase**: 1 - Design

## Entity Definitions

### User

**Purpose**: Represents an authenticated user of the health diary

**Frontend Representation**:
```typescript
interface User {
  id: string;              // UUID
  email: string;           // Email address (unique)
  username: string;        // Username (unique, 3-50 chars, alphanumeric + - _)
  name: string;            // Full name
}
```

**Relationships**:
- One User → Many HealthRecords (one user owns many health records)
- One User → One AuthState (current login session)

**Validation Rules**:
- `email`: Required, must be valid email format
- `username`: Required, 3-50 characters, pattern ^[a-zA-Z0-9_-]+$
- `name`: Required, non-empty string

**State Transitions**:
- Not Registered → Registered (via /api/auth/register)
- Logged Out → Logged In (via /api/auth/login)
- Logged In → Logged Out (via logout button)

---

### AuthToken

**Purpose**: JWT tokens issued by backend for authenticated requests

**Frontend Representation**:
```typescript
interface AuthTokens {
  accessToken: string;           // JWT access token (short-lived, ~1 hour)
  accessTokenExpiresAt: string;  // ISO 8601 datetime when access token expires
  refreshToken: string;          // JWT refresh token (long-lived, ~7 days)
  refreshTokenExpiresAt: string; // ISO 8601 datetime when refresh token expires
}
```

**Storage**:
- Location: browser localStorage
- Keys: `healthDiary_accessToken`, `healthDiary_refreshToken`, `healthDiary_accessTokenExpiresAt`, `healthDiary_refreshTokenExpiresAt`
- Cleared on logout or when refresh fails

**Lifecycle**:
- Issued by /api/auth/login (access + refresh tokens)
- Access token refreshed by /api/auth/token/refresh when expired
- Tokens cleared on logout

**Validation Rules**:
- `accessToken`: Required for authenticated requests; included in Authorization header as `Bearer {token}`
- `refreshToken`: Used only for token refresh endpoint
- `expiresAt`: Must be compared with current time to detect expiration

---

### AuthState

**Purpose**: Frontend representation of current login session

**Frontend Representation**:
```typescript
interface AuthState {
  user: User | null;              // Current user or null if not logged in
  tokens: AuthTokens | null;      // Current tokens or null if not logged in
  isLoading: boolean;             // Loading state (during login/register)
  error: string | null;           // Last error message or null
  isAuthenticated: boolean;       // Computed: user && tokens are valid
  tokenExpiredAt: Date | null;    // When access token expires (computed from accessTokenExpiresAt)
}
```

**State Transitions**:
```
Initial (not logged in)
  ↓ login/register (loading=true)
  ↓ success
Authenticated (user, tokens, isAuthenticated=true)
  ↓ token refresh (auto on 401)
  ↓ success
Authenticated (tokens refreshed)
  ↓ logout
Logged out (user=null, tokens=null)
  ↓ login again
Authenticated (user, tokens)

Error states:
  ↓ login fails
Not authenticated (error="Invalid email or password")
  ↓ retry or navigate to register
Not authenticated (error cleared)
```

**Responsibilities**:
- Maintain current user and token information
- Automatically refresh token on expiration
- Detect and handle 401 Unauthorized responses

---

### HealthRecord (Base Entity)

**Purpose**: Base representation of any health tracking record

**Frontend Representation**:
```typescript
interface HealthRecord {
  id: string;              // UUID (from API response)
  recordType: string;      // Type: "medication" | "hydration" | "bowel-movement" | "food" | "observation"
  date: string;            // Date in yyyy-MM-dd format
  time: string;            // Time in HH:mm format
  createdAt?: string;      // ISO 8601 timestamp (from API)
  [key: string]: any;      // Type-specific fields (see below)
}
```

**Validation Rules**:
- `date`: Required, must be valid date
- `time`: Required, must be valid time
- `recordType`: Required, one of five types

---

### MedicationAdministration

**Purpose**: Record of a medication taken at a specific date/time

**Extends**: HealthRecord

**Frontend Representation**:
```typescript
interface MedicationAdministration extends HealthRecord {
  recordType: "medication";
  medication: string;    // Name of medication
  dosage: string;        // Dosage amount (e.g., "500mg", "2 tablets")
}
```

**Validation Rules**:
- `date`, `time`: Required (inherited)
- `medication`: Optional but recommended
- `dosage`: Optional but recommended

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recordType": "medication",
  "date": "2026-02-08",
  "time": "09:00",
  "medication": "Aspirin",
  "dosage": "500mg"
}
```

---

### HydrationRecord

**Purpose**: Record of fluid intake (water/bottle consumption)

**Extends**: HealthRecord

**Frontend Representation**:
```typescript
interface HydrationRecord extends HealthRecord {
  recordType: "hydration";
  quantity: number;      // Amount in ml or oz
}
```

**Validation Rules**:
- `date`, `time`: Required (inherited)
- `quantity`: Required, must be positive number

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "recordType": "hydration",
  "date": "2026-02-08",
  "time": "10:30",
  "quantity": 500
}
```

---

### BowelMovementRecord

**Purpose**: Record of bowel movement event with consistency level

**Extends**: HealthRecord

**Frontend Representation**:
```typescript
interface BowelMovementRecord extends HealthRecord {
  recordType: "bowel-movement";
  consistency: "Hard" | "Normal" | "Soft" | "Diarrhea";
}
```

**Validation Rules**:
- `date`, `time`: Required (inherited)
- `consistency`: Required, must be one of four enum values

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "recordType": "bowel-movement",
  "date": "2026-02-08",
  "time": "14:00",
  "consistency": "Normal"
}
```

---

### FoodConsumptionRecord

**Purpose**: Record of solid food intake

**Extends**: HealthRecord

**Frontend Representation**:
```typescript
interface FoodConsumptionRecord extends HealthRecord {
  recordType: "food";
  food: string;          // Description of food consumed
  quantity: string;      // Amount consumed (e.g., "1 plate", "200g")
}
```

**Validation Rules**:
- `date`, `time`: Required (inherited)
- `food`: Optional but recommended
- `quantity`: Optional

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "recordType": "food",
  "date": "2026-02-08",
  "time": "12:00",
  "food": "Chicken and rice",
  "quantity": "1 plate"
}
```

---

### ObservationRecord

**Purpose**: General notes or observations

**Extends**: HealthRecord

**Frontend Representation**:
```typescript
interface ObservationRecord extends HealthRecord {
  recordType: "observation";
  notes: string;         // Observation text content
  category?: string;     // Optional category for organization
}
```

**Validation Rules**:
- `date`, `time`: Required (inherited)
- `notes`: Required, non-empty string
- `category`: Optional

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "recordType": "observation",
  "date": "2026-02-08",
  "time": "15:30",
  "notes": "Feeling more energetic today",
  "category": "General"
}
```

---

### DailySummary

**Purpose**: All health records for a specific date, organized by type

**Frontend Representation**:
```typescript
interface DailySummary {
  date: string;                                    // yyyy-MM-dd
  data: {
    medications: MedicationAdministration[];
    hydration: HydrationRecord[];
    bowelMovements: BowelMovementRecord[];
    food: FoodConsumptionRecord[];
    observations: ObservationRecord[];
  };
}
```

**Composition**: Aggregates all HealthRecord types for a given date from API response

**Example Data**:
```json
{
  "date": "2026-02-08",
  "data": [
    { "id": "...", "recordType": "medication", "date": "2026-02-08", "time": "09:00", "medication": "Aspirin", "dosage": "500mg" },
    { "id": "...", "recordType": "hydration", "date": "2026-02-08", "time": "10:30", "quantity": 500 },
    { "id": "...", "recordType": "bowel-movement", "date": "2026-02-08", "time": "14:00", "consistency": "Normal" }
  ]
}
```

---

## Frontend State Architecture

### Global State (AuthContext)

```typescript
interface AuthContextValue {
  // Current state
  authState: AuthState;
  
  // Actions
  register: (email: string, username: string, name: string, password: string, inviteToken: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;  // Internal, auto-called
  
  // Selectors
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
}
```

### Component-Level State (Examples)

**LoginPage**:
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [submitError, setSubmitError] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

**MedicationForm**:
```typescript
const [date, setDate] = useState(today());
const [time, setTime] = useState('09:00');
const [medication, setMedication] = useState('');
const [dosage, setDosage] = useState('');
const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
```

---

## Data Flow

### 1. Registration Flow

```
User Input (RegisterPage)
  ↓ form validation
Client-side Validation (email, username, password strength, required fields)
  ↓ if valid
POST /api/auth/register (with inviteToken, email, username, name, password)
  ↓ success (201)
AuthContext updates: user set (id, email, username, name)
  ↓
Redirect to LoginPage (user must login with new credentials)

  ↓ if error (400)
Display error message (e.g., "Email already in use")
  ↓
User retries with different data
```

### 2. Login Flow

```
User Input (LoginPage: email, password)
  ↓
AuthContext.login(email, password)
  ↓
POST /api/auth/login
  ↓ success (200)
Response includes: accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt
  ↓
AuthContext stores tokens in localStorage + state
  ↓
AuthContext sets user info from token claims (or separate user endpoint)
  ↓
Redirect to DashboardPage (authenticated)

  ↓ if error (401)
Display "Invalid email or password"
  ↓
User retries
```

### 3. Health Record Creation Flow

```
User Input (RecordMedicationForm)
  ↓ client validation (date, time required; medication/dosage optional)
Validation passes
  ↓
healthRecordService.createMedication(date, time, medication, dosage)
  ↓
GET authState from AuthContext → extract accessToken
  ↓
POST /api/health/medication with Authorization: Bearer {accessToken}
  ↓ success (201)
Response includes: id, message
  ↓
Display success message
  ↓
Close dialog / Refresh daily summary
  ↓
DailySummary reloads via GET /api/health/summary/{date}

  ↓ if error (401 - token expired)
Automatically call refreshToken()
  ↓
Retry POST /api/health/medication with new token
  ↓
On success: create record as normal
On failure: display "Session expired, please login again"

  ↓ if error (400 - validation)
Display API error (e.g., "Date and Time are required")
  ↓
User corrects and retries
```

### 4. Token Refresh Flow

```
API Response: 401 Unauthorized
  ↓ (automatic, transparent to user)
AuthContext.refreshToken()
  ↓
POST /api/auth/token/refresh with { refreshToken }
  ↓ success (200)
Response includes: accessToken, expiresAt
  ↓
Update localStorage + authState with new accessToken
  ↓
Retry original request with new token
  ↓ if retry succeeds
Complete action as normal
  ↓ if retry fails with 401
Clear tokens / logout
  ↓
Redirect to LoginPage with message "Session expired, please login again"
```

### 5. Daily Summary Load Flow

```
User navigates to date
  ↓
DashboardPage calls healthRecordService.getSummary(date)
  ↓
GET /api/health/summary/{date} with Authorization: Bearer {accessToken}
  ↓ success (200)
Response includes: date, data (array of HealthRecords)
  ↓
DailySummary component displays records organized by type
  ↓
Records grouped: medications, hydration, bowel-movements, food, observations

  ↓ if error (400 - invalid date)
Display "Invalid date format"
  ↓
User picks a valid date

  ↓ if error (401 - token expired)
Automatic refresh + retry (as in token refresh flow above)
```

---

## TypeScript Type Generation

**Source**: openapi.yaml (OpenAPI 3.0.0)
**Tool**: openapi-typescript CLI
**Output**: `src/types/api.ts` (auto-generated, committed to repo)

Generated types will include:
- `components.schemas.User` (from spec)
- `components.schemas.AuthTokens` (from spec)
- `components.schemas.MedicationAdministration` (from spec)
- `components.schemas.BottleConsumption` (from spec)
- `components.schemas.BowelMovement` (from spec)
- `components.schemas.SolidFoodConsumption` (from spec)
- `components.schemas.Observation` (from spec)
- `components.schemas.DailySummary` (from spec)
- All request/response types for auth endpoints

**Update Process**:
1. Update openapi.yaml in backend
2. Run `npm run generate:types` in frontend
3. Types are regenerated in `src/types/api.ts`
4. Consuming code is updated if types changed
