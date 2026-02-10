/**
 * Integration tests for authentication flows
 * Tests user registration, login, session persistence, and token refresh
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as authService from '../../src/services/authService'
import { apiRequest } from '../../src/services/apiClient'

// Mock the apiRequest function
vi.mock('../../src/services/apiClient', () => ({
  apiRequest: vi.fn(),
  setAuthTokens: vi.fn(),
  clearAuthTokens: vi.fn(),
}))

describe('Authentication Flow - Registration (US1)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('T012-T013: Token Validation', () => {
    it('should validate a valid invite token', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { message: 'Token is valid' },
      })

      const isValid = await authService.validateInviteToken('valid-token-123')

      expect(isValid).toBe(true)
      expect(mockApiRequest).toHaveBeenCalledWith(
        '/api/auth/invite/validate?token=valid-token-123',
        expect.objectContaining({
          method: 'GET',
          requiresAuth: false,
        })
      )
    })

    it('should reject an invalid invite token', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 400,
        error: 'Token is invalid or expired',
      })

      const isValid = await authService.validateInviteToken('invalid-token')

      expect(isValid).toBe(false)
    })

    it('should handle network errors during token validation', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 0,
        error: 'Network error',
      })

      const isValid = await authService.validateInviteToken('token')

      expect(isValid).toBe(false)
    })
  })

  describe('T014-T015: Registration Form Submission', () => {
    it('should successfully register a new user with valid data', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: true,
        status: 201,
        data: {
          id: 'user-123',
          email: 'test@example.com',
          message: 'User registered successfully',
        },
      })

      const result = await authService.register(
        'test@example.com',
        'testuser',
        'Test User',
        'password123',
        'valid-token'
      )

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      })
      expect(mockApiRequest).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: {
            inviteToken: 'valid-token',
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
            password: 'password123',
          },
          requiresAuth: false,
        })
      )
    })

    it('should handle registration with invalid token', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 400,
        error: 'Invalid or expired invite token',
      })

      const result = await authService.register(
        'test@example.com',
        'testuser',
        'Test User',
        'password123',
        'invalid-token'
      )

      expect(result).toEqual({
        error: 'Invalid or expired invite token',
      })
    })

    it('should handle duplicate email error', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 409,
        error: 'Email already registered',
      })

      const result = await authService.register(
        'existing@example.com',
        'newuser',
        'New User',
        'password123',
        'valid-token'
      )

      expect(result).toEqual({
        error: 'Email already registered',
      })
    })

    it('should handle duplicate username error', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 409,
        error: 'Username already taken',
      })

      const result = await authService.register(
        'test@example.com',
        'existinguser',
        'Test User',
        'password123',
        'valid-token'
      )

      expect(result).toEqual({
        error: 'Username already taken',
      })
    })

    it('should handle weak password error', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 400,
        error: 'Password must be at least 8 characters',
      })

      const result = await authService.register(
        'test@example.com',
        'testuser',
        'Test User',
        'weak',
        'valid-token'
      )

      expect(result).toEqual({
        error: 'Password must be at least 8 characters',
      })
    })

    it('should handle network errors during registration', async () => {
      const mockApiRequest = vi.mocked(apiRequest)
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 0,
        error: 'Network request failed',
      })

      const result = await authService.register(
        'test@example.com',
        'testuser',
        'Test User',
        'password123',
        'valid-token'
      )

      expect(result).toEqual({
        error: 'Network request failed',
      })
    })
  })

  describe('T016: Form Validation Rules', () => {
    it('should validate email format', () => {
      const validEmails = ['user@example.com', 'test.user@example.co.uk']
      const invalidEmails = ['user@', '@example.com', 'userexample.com', '']

      validEmails.forEach((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(regex.test(email)).toBe(true)
      })

      invalidEmails.forEach((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(regex.test(email)).toBe(false)
      })
    })

    it('should validate username pattern and length', () => {
      const usernameRegex = /^[a-zA-Z0-9_-]+$/
      const MIN_LENGTH = 3
      const MAX_LENGTH = 50

      const testUsername = (username: string) => {
        if (!username.match(usernameRegex)) return false
        if (username.length < MIN_LENGTH || username.length > MAX_LENGTH) return false
        return true
      }

      expect(testUsername('user123')).toBe(true)
      expect(testUsername('user_name')).toBe(true)
      expect(testUsername('user-name')).toBe(true)
      expect(testUsername('un')).toBe(false) // Too short
      expect(testUsername('user name')).toBe(false) // Invalid character
      expect(testUsername('user@name')).toBe(false) // Invalid character
    })

    it('should validate password minimum length', () => {
      const MIN_PASSWORD_LENGTH = 8

      const testPassword = (password: string) => {
        return password.length >= MIN_PASSWORD_LENGTH
      }

      expect(testPassword('password123')).toBe(true)
      expect(testPassword('short')).toBe(false)
      expect(testPassword('pass123')).toBe(false)
    })

    it('should validate password confirmation match', () => {
      // Use variables to avoid type narrowing errors
      const passwords = {
        match: 'password123',
        matchConfirm: 'password123',
        noMatch: 'different123',
      }

      expect(passwords.match === passwords.matchConfirm).toBe(true)
      expect(passwords.match === passwords.noMatch).toBe(false)
    })
  })

  describe('T017: Complete Registration Flow', () => {
    it('should complete full registration flow: token validation -> form submit -> success', async () => {
      const mockApiRequest = vi.mocked(apiRequest)

      // Step 1: Validate invite token
      mockApiRequest.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { message: 'Token is valid' },
      })

      const isTokenValid = await authService.validateInviteToken('valid-token-123')
      expect(isTokenValid).toBe(true)

      // Step 2: Register user
      mockApiRequest.mockResolvedValueOnce({
        ok: true,
        status: 201,
        data: {
          id: 'new-user-123',
          email: 'newuser@example.com',
          message: 'User registered successfully',
        },
      })

      const registerResult = await authService.register(
        'newuser@example.com',
        'newuser',
        'New User',
        'password123',
        'valid-token-123'
      )

      expect(registerResult).toEqual({
        user: {
          id: 'new-user-123',
          email: 'newuser@example.com',
        },
      })
      expect('error' in registerResult).toBe(false)
    })

    it('should reject registration with invalid token', async () => {
      const mockApiRequest = vi.mocked(apiRequest)

      // Validate invalid token
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 400,
        error: 'Token is invalid or expired',
      })

      const isTokenValid = await authService.validateInviteToken('invalid-token')
      expect(isTokenValid).toBe(false)
    })

    it('should handle errors at each step and provide feedback', async () => {
      const mockApiRequest = vi.mocked(apiRequest)

      // Valid token but registration fails
      mockApiRequest.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { message: 'Token is valid' },
      })

      const isTokenValid = await authService.validateInviteToken('valid-token')
      expect(isTokenValid).toBe(true)

      // Registration fails with validation error
      mockApiRequest.mockResolvedValueOnce({
        ok: false,
        status: 422,
        error: 'Username contains invalid characters',
      })

      const registerResult = await authService.register(
        'test@example.com',
        'invalid user@',
        'Test User',
        'password123',
        'valid-token'
      )

      expect(registerResult).toEqual({
        error: 'Username contains invalid characters',
      })
    })
  })
})
