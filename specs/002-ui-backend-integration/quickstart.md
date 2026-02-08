# Quickstart Guide: UI-Backend Integration Development

**Date**: 2026-02-06  
**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)  
**Branch**: `002-ui-backend-integration`

## Quick Links

- **Feature Spec**: [spec.md](spec.md)
- **Implementation Plan**: [plan.md](plan.md)
- **Research**: [research.md](research.md)
- **Data Models**: [data-model.md](data-model.md)
- **API Contracts**: [contracts/](contracts/)

---

## Development Environment Setup

### Prerequisites

- **Node.js**: 18+ (required for Vite and npm)
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **Postman** or **curl**: For manual API testing (optional)
- **.NET 9 runtime**: If running backend locally (already running if using existing API)

### Quick Check

```bash
# Verify Node.js version
node --version  # Should be v18.0.0 or higher

# Verify npm version
npm --version   # Should be v8.0.0 or higher
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd /work/health-diary/health-diary-ui
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `health-diary-ui` root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Optional: Development features
VITE_DEBUG_MODE=false
VITE_LOG_API_CALLS=true
```

**Note**: Adjust `VITE_API_BASE_URL` based on your backend server location:
- Local development: `http://localhost:5000`
- Remote API: `https://api.example.com`
- Docker: `http://health-diary-be:5000` (if using docker-compose)

### Step 4: Update vite.config.ts (if needed)

Ensure Vite configuration includes the API base URL:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:5000')
  }
})
```

---

## Running the Frontend

### Development Server

```bash
cd /work/health-diary/health-diary-ui
npm run dev
```

Output:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open your browser and navigate to `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

Output:
```
vite v5.0.0 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/main.abc123.js      245.67 kB │ gzip: 78.90 kB
```

### Preview Production Build

```bash
npm run preview
```

---

## Running Tests

### Unit Tests

```bash
npm run test
```

Tests use Vitest and run all files matching `**/*.test.js` or `**/*.test.ts`.

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory.

### Run Specific Test File

```bash
npm run test -- tokenService.test.js
```

---

## Backend Setup

### Using Existing Backend

If the C# .NET9 backend is already running:

```bash
# Check if backend is accessible
curl http://localhost:5000/api/health/summary/2026-02-06 \
  -H "Authorization: Bearer test-token"
```

If you get a 401 error, that's expected (token is invalid). The key is receiving a response, not a connection error.

### Running Backend Locally

If you need to run the backend yourself:

```bash
# Navigate to backend directory
cd /work/health-diary/health-diary-be

# Install dependencies
dotnet restore

# Build
dotnet build

# Run
dotnet run

# Output should show:
# Listening on http://localhost:5000
```

### Using Docker Compose

```bash
cd /work/health-diary

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f health-diary-be
```

---

## Testing Workflow

### 1. Register a New User (Manual)

**Prerequisite**: Get an invite token from an admin.

```bash
# In Postman or curl:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "inviteToken": "550e8400-e29b-41d4-a716-446655440000",
    "email": "testuser@example.com",
    "username": "testuser",
    "name": "Test User",
    "password": "TestPassword123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'

# Response includes:
# {
#   "accessToken": "eyJ0eXAiOiJKV1QiLC...",
#   "accessTokenExpiresAt": "2026-02-06T13:00:00Z",
#   "refreshToken": "eyJ0eXAiOiJKV1QiLC...",
#   "refreshTokenExpiresAt": "2026-02-13T12:00:00Z"
# }
```

### 3. Create a Health Record

```bash
curl -X POST http://localhost:5000/api/health/medication \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "date": "2026-02-06",
    "time": "09:00",
    "medication": "Aspirin",
    "dosage": "100mg"
  }'

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440001",
#   "message": "Medication record created successfully"
# }
```

### 4. View Daily Summary

```bash
curl -X GET http://localhost:5000/api/health/summary/2026-02-06 \
  -H "Authorization: Bearer {accessToken}"

# Response includes all records for the date organized by type
```

---

## UI Testing in Browser

### Scenario 1: Complete Registration and Login

1. Open `http://localhost:5173/`
2. Navigate to register page (should show if not logged in)
3. Enter:
   - Invite token (from URL or pasted)
   - Email: `testuser@example.com`
   - Username: `testuser`
   - Name: `Test User`
   - Password: `TestPassword123`
4. Click Register
5. Should redirect to login page
6. Enter email and password
7. Should redirect to dashboard/summary page

### Scenario 2: Record a Medication

1. Logged in on dashboard
2. Click "Record Medication" button
3. Enter:
   - Date: Today's date
   - Time: Current time
   - Medication: "Ibuprofen"
   - Dosage: "200mg"
4. Click Submit
5. Should show success message
6. Daily summary should update to show the record

### Scenario 3: View Daily Summary

1. Logged in on dashboard
2. Select a date using date picker
3. All records for that date should display organized by type
4. Empty state should show "No records for this date" if none exist

### Scenario 4: Token Refresh

1. Logged in on dashboard
2. Open browser DevTools → Application → localStorage
3. Note the `health_diary_access_token` value
4. Wait for it to expire (or use a short-lived test token)
5. Make an API call (record something or navigate)
6. Observe automatic token refresh (should not require re-login)

### Scenario 5: Session Persistence

1. Logged in on dashboard
2. Close browser or refresh page
3. Should remain logged in (localStorage persists tokens)
4. Dashboard should load without returning to login

---

## Project Structure Overview

### Frontend Organization

```
health-diary-ui/
├── src/
│   ├── api/
│   │   ├── client.js           # Fetch wrapper with auth + 401 handling
│   │   ├── auth.js             # Login, register, token refresh
│   │   └── health.js           # Health record endpoints
│   ├── services/
│   │   ├── authState.js        # Auth state management
│   │   ├── tokenService.js     # Token storage (localStorage)
│   │   ├── errorHandler.js     # Centralized error handling
│   │   └── dateService.js      # Date/time utilities
│   ├── utils/
│   │   ├── validation.js       # Form validators
│   │   └── constants.js        # Config, messages
│   ├── components/
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── HomePage.js
│   │   ├── RecordMedicationForm.js
│   │   ├── RecordBottleForm.js
│   │   ├── RecordBowelForm.js
│   │   ├── RecordFoodForm.js
│   │   ├── RecordNoteForm.js
│   │   ├── DailySummary.js
│   │   ├── NotificationManager.js
│   │   └── Navigation.js
│   ├── styles/
│   │   ├── main.css
│   │   └── components.css
│   ├── __tests__/
│   │   ├── tokenService.test.js
│   │   ├── validation.test.js
│   │   ├── errorHandler.test.js
│   │   └── authInterceptor.test.js
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts          # Vite type definitions
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
└── .env                       # Environment variables
```

---

## Debugging Tips

### Browser DevTools

**Network Tab**:
- View all API requests
- Check request/response headers
- Verify Authorization header includes access token
- Monitor response times (should be <2 seconds)

**Console Tab**:
- Check for JavaScript errors
- View API error responses
- Use `console.log()` in code for debugging

**Application Tab**:
- View localStorage contents
- Check stored tokens and expiration times
- Clear localStorage to simulate logout

### Debugging API Client

Add logging to `src/api/client.js`:

```javascript
async function fetchWithAuth(url, options = {}) {
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  const token = getAccessToken();
  if (token) {
    console.log('[API] Including access token');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log(`[API] Response: ${response.status}`);
  return response;
}
```

### Testing Token Refresh

Manually trigger token refresh to verify it works:

```javascript
// In browser console:
import { refreshAccessToken } from './services/tokenService.js';

refreshAccessToken().then(token => {
  console.log('New token:', token);
}).catch(error => {
  console.error('Refresh failed:', error);
});
```

---

## Common Issues & Solutions

### Issue: CORS Error

**Error**: `Access to XMLHttpRequest at 'http://localhost:5000/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**:
- Verify backend CORS configuration includes `localhost:5173`
- Update backend to allow requests from UI origin
- Check `openapi.yaml` for CORS settings

### Issue: 401 Unauthorized on Every Request

**Error**: "Unauthorized - Valid access token required"

**Solution**:
- Verify token is stored in localStorage correctly
- Check Authorization header is being sent: `Authorization: Bearer {token}`
- Ensure token hasn't expired
- Verify token format is valid JWT

### Issue: Token Refresh Loop

**Symptom**: Page keeps refreshing tokens repeatedly

**Solution**:
- Add max retry limit (1-2 refresh attempts per request)
- Check refresh token hasn't expired
- Verify refresh endpoint is returning valid token
- Add rate limiting to refresh requests

### Issue: Form Submission Hangs

**Symptom**: Form doesn't respond after clicking submit

**Solution**:
- Check browser console for errors
- Verify API is reachable (ping endpoint)
- Check network timeout isn't too short
- Ensure form validation passes before submit

### Issue: Data Not Persisting

**Symptom**: Records created but don't appear in summary

**Solution**:
- Verify 201 response received from API
- Check daily summary uses correct date format
- Ensure authenticated (token valid)
- Check browser console for errors

---

## Performance Optimization

### Bundle Size

Check bundle size before building for production:

```bash
npm run build
# Examine size in dist/ folder
```

Target: Keep main JS bundle under 100KB (gzipped).

### API Response Time

Monitor API response times in Network tab:
- Target: 95% of requests < 2 seconds (SC-006)
- If slower, profile backend or optimize queries

### Frontend Rendering

Use browser DevTools Performance tab:
1. Record performance
2. Perform action (login, create record, load summary)
3. Review frame rate and long tasks
4. Optimize if needed

---

## Next Steps

1. **Implement Components**: Based on design files and user stories
2. **Add Unit Tests**: For tokenService, validation, errorHandler
3. **Integration Testing**: Register → login → create records → view summary
4. **Performance Testing**: Verify SC-006 (2-second response times)
5. **Code Review**: Ensure compliance with constitution.md standards
6. **Deployment**: Build and deploy to staging environment

---

## Support & Documentation

- **OpenAPI Spec**: [health-diary-be/openapi.yaml](../../health-diary-be/openapi.yaml)
- **Data Models**: [data-model.md](data-model.md)
- **API Contracts**: [contracts/](contracts/)
- **Feature Spec**: [spec.md](spec.md)

---

## Scripts Summary

```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests once
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Linting (if configured)
npm run lint        # Run ESLint
npm run format      # Run Prettier

# Other
npm install         # Install dependencies
npm list           # View installed packages
```

---

**Ready to start developing?** 

Begin with the feature spec and data models, then implement components and tests following the API contracts.

