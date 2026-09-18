# Quickstart: Frontend-Backend API Integration

**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)
**Date**: 2026-02-08
**For**: Frontend developers implementing React components

## Overview

This quickstart shows how to integrate the health-diary-ui React frontend with the health-diary-be API. The integration covers:

1. **Authentication**: User registration, login, token storage, and refresh
2. **API Communication**: Secure requests with JWT tokens
3. **Health Records**: Create and view medication, hydration, bowel movement, food, and observation records
4. **Token Management**: Automatic token refresh on expiration

## Prerequisites

- Node.js 18+ and npm
- React 19.1.1 with TypeScript
- Vite as build tool
- MUI (Material-UI) 7.3.2 for components
- Backend API running on `http://localhost:5000` (development)

## Architecture Overview

```
User Interaction (React Component)
        ↓
React Context (AuthContext) - Global auth state
        ↓
Services (authService, healthRecordService)
        ↓
API Client (apiClient.ts) - HTTP wrapper with JWT interceptor
        ↓
Fetch API - Native browser HTTP
        ↓
Backend API (openapi.yaml)
        ↓
Database (PostgreSQL)
```

## Step-by-Step Integration

### Step 1: Set Up Project Structure

Create the required directories in `health-diary-ui/src/`:

```bash
mkdir -p src/services
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/pages
mkdir -p tests/unit
mkdir -p tests/integration
```

### Step 2: Generate TypeScript Types from OpenAPI

Install the type generator:

```bash
npm install --save-dev openapi-typescript
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "generate:types": "openapi-typescript ../health-diary-be/openapi.yaml -o src/types/api.ts"
  }
}
```

Run to generate types:

```bash
npm run generate:types
```

This creates `src/types/api.ts` with all request/response types from the OpenAPI spec.

### Step 3: Create API Client Wrapper

File: `src/services/apiClient.ts`

```typescript
/**
 * API client wrapper around native Fetch API
 * Handles JWT token injection, error responses, and token refresh
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'healthDiary_accessToken';
const REFRESH_TOKEN_KEY = 'healthDiary_refreshToken';

export interface ApiResponse<T> {
  data?: T;
  statusCode?: number;
  message?: string;
  details?: unknown;
}

/**
 * Get stored access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored refresh token from localStorage
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Make authenticated API request with JWT token in Authorization header
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401: Token may be expired, attempt refresh
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry original request with new token
      return apiFetch<T>(endpoint, options);
    }
  }

  // Parse response
  const contentType = response.headers.get('content-type');
  let responseData: ApiResponse<T> = {};

  if (contentType?.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = { message: response.statusText };
  }

  // Non-2xx responses are errors
  if (!response.ok) {
    throw {
      statusCode: response.status,
      message: responseData.message || 'API request failed',
      details: responseData.details,
    };
  }

  return responseData;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as {
      accessToken?: string;
      expiresAt?: string;
    };

    if (data.accessToken) {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.expiresAt) {
        localStorage.setItem('healthDiary_accessTokenExpiresAt', data.expiresAt);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Clear stored tokens (on logout)
 */
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('healthDiary_accessTokenExpiresAt');
  localStorage.removeItem('healthDiary_refreshTokenExpiresAt');
}

/**
 * Store tokens in localStorage (called after login/registration)
 */
export function storeTokens(
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresAt: string,
  refreshTokenExpiresAt: string
): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem('healthDiary_accessTokenExpiresAt', accessTokenExpiresAt);
  localStorage.setItem('healthDiary_refreshTokenExpiresAt', refreshTokenExpiresAt);
}
```

### Step 4: Create Auth Service

File: `src/services/authService.ts`

```typescript
/**
 * Authentication service: login, register, token management
 */
import { apiFetch, storeTokens, clearTokens } from './apiClient';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
}

export const authService = {
  /**
   * Register a new user with an invite token
   */
  async register(
    email: string,
    username: string,
    name: string,
    password: string,
    inviteToken: string
  ): Promise<User> {
    const response = await apiFetch<{ id: string; email: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          inviteToken,
          email,
          username,
          name,
          password,
        }),
      }
    );

    if (!response.data?.id) {
      throw new Error(response.message || 'Registration failed');
    }

    return {
      id: response.data.id,
      email,
      username,
      name,
    };
  },

  /**
   * Login user and store tokens
   */
  async login(email: string, password: string): Promise<User> {
    const response = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.data?.accessToken) {
      throw new Error(response.message || 'Login failed');
    }

    storeTokens(
      response.data.accessToken,
      response.data.refreshToken,
      response.data.accessTokenExpiresAt,
      response.data.refreshTokenExpiresAt
    );

    // Parse user info from JWT or return basic info
    return { id: '', email, username: '', name: '' };
  },

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    clearTokens();
  },

  /**
   * Validate an invite link
   */
  async validateInvite(token: string): Promise<boolean> {
    try {
      await apiFetch('/api/auth/invite/validate', {
        method: 'GET',
        headers: {},
      });
      return true;
    } catch {
      return false;
    }
  },
};
```

### Step 5: Create Health Record Service

File: `src/services/healthRecordService.ts`

```typescript
/**
 * Health record service: CRUD operations for all record types
 */
import { apiFetch } from './apiClient';

export interface MedicationRecord {
  date: string;
  time: string;
  medication?: string;
  dosage?: string;
}

export interface HydrationRecord {
  date: string;
  time: string;
  quantity?: number;
}

export interface BowelMovementRecord {
  date: string;
  time: string;
  consistency?: 'Hard' | 'Normal' | 'Soft' | 'Diarrhea';
}

export interface FoodRecord {
  date: string;
  time: string;
  food?: string;
  quantity?: string;
}

export interface ObservationRecord {
  date: string;
  time: string;
  notes?: string;
  category?: string;
}

export interface DailySummaryResponse {
  date: string;
  data: Array<Record<string, unknown>>;
}

export const healthRecordService = {
  async createMedication(
    record: MedicationRecord
  ): Promise<{ id: string; message: string }> {
    const response = await apiFetch<{ id: string; message: string }>(
      '/api/health/medication',
      { method: 'POST', body: JSON.stringify(record) }
    );
    return response.data || { id: '', message: '' };
  },

  async createHydration(
    record: HydrationRecord
  ): Promise<{ id: string; message: string }> {
    const response = await apiFetch<{ id: string; message: string }>(
      '/api/health/bottle',
      { method: 'POST', body: JSON.stringify(record) }
    );
    return response.data || { id: '', message: '' };
  },

  async createBowelMovement(
    record: BowelMovementRecord
  ): Promise<{ id: string; message: string }> {
    const response = await apiFetch<{ id: string; message: string }>(
      '/api/health/bowel-movement',
      { method: 'POST', body: JSON.stringify(record) }
    );
    return response.data || { id: '', message: '' };
  },

  async createFood(
    record: FoodRecord
  ): Promise<{ id: string; message: string }> {
    const response = await apiFetch<{ id: string; message: string }>(
      '/api/health/solid-food',
      { method: 'POST', body: JSON.stringify(record) }
    );
    return response.data || { id: '', message: '' };
  },

  async createObservation(
    record: ObservationRecord
  ): Promise<{ id: string; message: string }> {
    const response = await apiFetch<{ id: string; message: string }>(
      '/api/health/note',
      { method: 'POST', body: JSON.stringify(record) }
    );
    return response.data || { id: '', message: '' };
  },

  async getDailySummary(date: string): Promise<DailySummaryResponse> {
    const response = await apiFetch<DailySummaryResponse>(
      `/api/health/summary/${date}`
    );
    return response.data || { date, data: [] };
  },
};
```

### Step 6: Create Auth Context

File: `src/contexts/AuthContext.tsx`

```typescript
/**
 * Global auth state context for managing user login, tokens, and session
 */
import React, { createContext, useState, useCallback } from 'react';
import { authService, type User } from '../services/authService';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (
    email: string,
    username: string,
    name: string,
    password: string,
    inviteToken: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (
      email: string,
      username: string,
      name: string,
      password: string,
      inviteToken: string
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const newUser = await authService.register(
          email,
          username,
          name,
          password,
          inviteToken
        );
        setUser(newUser);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginUser = await authService.login(email, password);
      setUser(loginUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### Step 7: Create useAuth Hook

File: `src/hooks/useAuth.ts`

```typescript
/**
 * Hook to access auth context
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 8: Update App Component

Wrap your app with `AuthProvider`:

```typescript
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      {/* Your routes/pages */}
    </AuthProvider>
  );
}
```

### Step 9: Create Login Page Example

File: `src/pages/LoginPage.tsx`

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled by context
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Login</Typography>
        <form onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={isLoading}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={isLoading}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};
```

## Testing

Create integration tests in `tests/integration/authFlow.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../src/services/authService';

describe('Auth Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('should login and store tokens', async () => {
    const mockResponse = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      accessTokenExpiresAt: '2026-02-09T12:00:00Z',
      refreshTokenExpiresAt: '2026-02-15T12:00:00Z',
      message: 'Success',
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

    await authService.login('test@example.com', 'password123');

    expect(localStorage.getItem('healthDiary_accessToken')).toBe('test-token');
    expect(localStorage.getItem('healthDiary_refreshToken')).toBe(
      'test-refresh'
    );
  });
});
```

## Environment Variables

Create `.env.local`:

```
VITE_API_URL=http://localhost:5000
```

## Next Steps

1. Run `npm run generate:types` to create type definitions
2. Implement the API client, services, and context
3. Create login/register pages
4. Implement health record forms
5. Create daily summary display component
6. Add integration tests
7. Test with backend API running locally

## Common Patterns

### Using API in Component

```typescript
const { data, isLoading, error } = useApi(
  () => healthRecordService.getDailySummary(date),
  [date]
);
```

### Handling API Errors

```typescript
try {
  await healthRecordService.createMedication(record);
} catch (err: any) {
  setError(err.message); // "Date and Time are required"
}
```

### Protected Routes

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}
```
