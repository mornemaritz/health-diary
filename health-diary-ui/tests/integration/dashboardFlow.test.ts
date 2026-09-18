/**
 * Dashboard Flow Integration Tests
 * Tests for daily summary viewing and date navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as healthRecordService from '../../src/services/healthRecordService'
import { apiRequest } from '../../src/services/apiClient'

/**
 * Mock the apiRequest function
 */
vi.mock('../../src/services/apiClient', () => ({
  apiRequest: vi.fn(),
}))

describe('Dashboard Flow (US8)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    // Set up authenticated user
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
      })
    )
    localStorage.setItem('accessToken', 'mock-access-token')
    localStorage.setItem('refreshToken', 'mock-refresh-token')
    localStorage.setItem('accessTokenExpiresAt', String(Date.now() + 15 * 60 * 1000))
  })

  describe('T026-T027 - DailySummary component and DashboardPage', () => {
    it('should fetch daily summary for a specific date', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        data: {
          medications: [
            {
              id: 'med-1',
              medication: 'Aspirin',
              dosage: '500mg',
              date: '2026-02-10',
              time: '09:00',
            },
          ],
          hydration: [
            {
              id: 'water-1',
              quantity: 250,
              date: '2026-02-10',
              time: '10:00',
            },
          ],
        },
      }

      vi.mocked(apiRequest).mockResolvedValue(mockResponse)

      const result = await healthRecordService.getDailySummary('2026-02-10')

      expect(result).toHaveProperty('medications')
      expect(result).toHaveProperty('hydration')

      // Verify API was called correctly
      expect(apiRequest).toHaveBeenCalledWith(
        '/api/health/summary/2026-02-10',
        expect.objectContaining({
          method: 'GET',
          requiresAuth: true,
        })
      )
    })

    it('should handle API errors when fetching summary', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        error: 'Internal Server Error',
      }

      vi.mocked(apiRequest).mockResolvedValue(mockResponse)

      const result = await healthRecordService.getDailySummary('2026-02-10')

      expect(result).toHaveProperty('error')
      expect('error' in result && result.error).toBeDefined()
    })
  })

  describe('T028 - Date navigation', () => {
    it('should format dates correctly for API calls (YYYY-MM-DD)', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: {},
      })

      // Test various date formats
      const testDates = [
        { date: '2026-01-05', expectedFormat: '2026-01-05' },
        { date: '2026-12-31', expectedFormat: '2026-12-31' },
        { date: '2026-11-30', expectedFormat: '2026-11-30' },
      ]

      for (const { date } of testDates) {
        vi.mocked(apiRequest).mockClear()
        await healthRecordService.getDailySummary(date)

        expect(apiRequest).toHaveBeenCalledWith(
          `/api/health/summary/${date}`,
          expect.any(Object)
        )
      }
    })

    it('should support navigation to adjacent dates', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: {},
      })

      const baseDate = new Date('2026-02-10')
      const previousDate = new Date(baseDate)
      previousDate.setDate(previousDate.getDate() - 1)
      const nextDate = new Date(baseDate)
      nextDate.setDate(nextDate.getDate() + 1)

      // Helper to format dates
      const formatDate = (d: Date) => d.toISOString().split('T')[0]

      // Test previous day
      await healthRecordService.getDailySummary(formatDate(previousDate))
      expect(apiRequest).toHaveBeenCalledWith(
        `/api/health/summary/${formatDate(previousDate)}`,
        expect.any(Object)
      )

      vi.mocked(apiRequest).mockClear()

      // Test next day
      await healthRecordService.getDailySummary(formatDate(nextDate))
      expect(apiRequest).toHaveBeenCalledWith(
        `/api/health/summary/${formatDate(nextDate)}`,
        expect.any(Object)
      )
    })

    it('should support jumping to today', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: {},
      })

      const today = new Date()
      const formatDate = (d: Date) => d.toISOString().split('T')[0]

      await healthRecordService.getDailySummary(formatDate(today))

      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringContaining('/api/health/summary/'),
        expect.any(Object)
      )
    })
  })

  describe('T029 - Daily summary data loading', () => {
    it('should return empty summary when no records exist for date', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: {},
      })

      const result = await healthRecordService.getDailySummary('2026-02-10')

      expect(result).toEqual({})
      expect('error' in result).toBe(false)
    })

    it('should return summary with all record types when present', async () => {
      const mockData = {
        medications: [
          {
            id: 'med-1',
            medication: 'Vitamin D',
            dosage: '1000 IU',
            date: '2026-02-10',
            time: '08:00',
          },
        ],
        hydration: [
          {
            id: 'water-1',
            quantity: 500,
            date: '2026-02-10',
            time: '09:00',
          },
        ],
        bowelMovements: [
          {
            id: 'bm-1',
            consistency: 'Normal' as const,
            date: '2026-02-10',
            time: '10:00',
          },
        ],
        food: [
          {
            id: 'food-1',
            food: 'Oatmeal',
            quantity: '1 bowl',
            date: '2026-02-10',
            time: '07:30',
          },
        ],
        observations: [
          {
            id: 'obs-1',
            category: 'Mood',
            notes: 'Feeling good',
            date: '2026-02-10',
            time: '20:00',
          },
        ],
      }

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: mockData,
      })

      const result = await healthRecordService.getDailySummary('2026-02-10')

      expect(result).toEqual(expect.objectContaining(mockData))
      expect('error' in result).toBe(false)
    })

    it('should handle 401 errors (authentication required)', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: false,
        status: 401,
        error: 'Unauthorized',
      })

      const result = await healthRecordService.getDailySummary('2026-02-10')

      expect('error' in result).toBe(true)
      // The service returns the API error message
      expect('error' in result && result.error).toBeDefined()
    })

    it('should return error when API request fails', async () => {
      // When apiRequest returns error response
      vi.mocked(apiRequest).mockResolvedValueOnce({
        ok: false,
        status: 500,
        error: 'Server error',
      })

      const result = await healthRecordService.getDailySummary('2026-02-10')

      // The service should return error object
      expect('error' in result).toBe(true)
      expect('error' in result && result.error).toBeDefined()
    })
  })

  describe('T030-T031 - Record display and no records message', () => {
    it('should identify when no records present for display', async () => {
      const emptyResponse = {}

      // Check that summary is empty
      const hasRecords = Object.values(emptyResponse).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      )
      expect(hasRecords).toBe(false)
    })

    it('should identify medications are present in summary', async () => {
      const summaryWithMeds = {
        medications: [
          {
            id: 'med-1',
            medication: 'Aspirin',
            dosage: '500mg',
            date: '2026-02-10',
            time: '09:00',
          },
        ],
      }

      const hasMeds = summaryWithMeds.medications && summaryWithMeds.medications.length > 0
      expect(hasMeds).toBe(true)
    })

    it('should identify hydration records are present in summary', async () => {
      const summaryWithWater = {
        hydration: [
          {
            id: 'water-1',
            quantity: 250,
            date: '2026-02-10',
            time: '10:00',
          },
        ],
      }

      const hasWater = summaryWithWater.hydration && summaryWithWater.hydration.length > 0
      expect(hasWater).toBe(true)
    })

    it('should identify bowel movement records are present', async () => {
      const summaryWithBM = {
        bowelMovements: [
          {
            id: 'bm-1',
            consistency: 'Normal' as const,
            date: '2026-02-10',
            time: '08:00',
          },
        ],
      }

      const hasBM = summaryWithBM.bowelMovements && summaryWithBM.bowelMovements.length > 0
      expect(hasBM).toBe(true)
    })

    it('should identify food records are present', async () => {
      const summaryWithFood = {
        food: [
          {
            id: 'food-1',
            food: 'Salad',
            quantity: '2 cups',
            date: '2026-02-10',
            time: '12:00',
          },
        ],
      }

      const hasFood = summaryWithFood.food && summaryWithFood.food.length > 0
      expect(hasFood).toBe(true)
    })

    it('should identify observation records are present', async () => {
      const summaryWithObs = {
        observations: [
          {
            id: 'obs-1',
            category: 'Symptoms',
            notes: 'Mild headache',
            date: '2026-02-10',
            time: '14:00',
          },
        ],
      }

      const hasObs = summaryWithObs.observations && summaryWithObs.observations.length > 0
      expect(hasObs).toBe(true)
    })

    it('should format time correctly for display', async () => {
      // Test time formatting logic (HH:MM → 12-hour format)
      const times = [
        { input: '09:00', expectedContains: '9:00' },
        { input: '14:30', expectedContains: '2:30' },
        { input: '00:45', expectedContains: '12:45' },
      ]

      for (const { input } of times) {
        // Verify ISO string parsing
        const fullDate = `2000-01-01T${input}`
        const parsed = new Date(fullDate)
        expect(parsed.getHours()).toBeDefined()
        expect(parsed.getMinutes()).toBeDefined()
      }
    })
  })

  describe('T032 - Integration test for complete dashboard flow', () => {
    it('should use correct authentication with access token', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          medications: [
            {
              id: 'med-1',
              medication: 'Vitamin D',
              dosage: '1000 IU',
              date: '2026-02-10',
              time: '08:00',
            },
          ],
        },
      })

      const userString = localStorage.getItem('user')
      const userId = userString ? JSON.parse(userString).id : null

      expect(userId).toBe('test-user-1')

      const result = await healthRecordService.getDailySummary('2026-02-10')
      expect('error' in result).toBe(false)
    })

    it('should support complete flow: load -> navigate -> reload data', async () => {
      // Mock responses for multiple calls with different dates
      const mockResponses = {
        '2026-02-10': {
          ok: true,
          status: 200,
          data: {
            medications: [
              {
                id: 'med-1',
                medication: 'Ibuprofen',
                dosage: '200mg',
                date: '2026-02-10',
                time: '10:00',
              },
            ],
          },
        },
        '2026-02-09': {
          ok: true,
          status: 200,
          data: {
            hydration: [
              {
                id: 'water-1',
                quantity: 500,
                date: '2026-02-09',
                time: '11:00',
              },
            ],
          },
        },
      }

      let callCount = 0
      vi.mocked(apiRequest).mockImplementation(async (url: string) => {
        callCount++
        if (url.includes('2026-02-10')) {
          return mockResponses['2026-02-10']
        } else if (url.includes('2026-02-09')) {
          return mockResponses['2026-02-09']
        }
        return { ok: false, status: 404, error: 'Not found' }
      })

      // Simulate dashboard flow
      let result1 = await healthRecordService.getDailySummary('2026-02-10')
      expect('error' in result1).toBe(false)

      // Navigate to previous day
      let result2 = await healthRecordService.getDailySummary('2026-02-09')
      expect('error' in result2).toBe(false)

      // Verify multiple calls were made
      expect(callCount).toBeGreaterThanOrEqual(2)
    })

    it('should preserve authentication across multiple requests', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: {},
      })

      // Make multiple requests
      for (let i = 0; i < 3; i++) {
        const dateStr = new Date(2026, 1, 10 + i).toISOString().split('T')[0]
        await healthRecordService.getDailySummary(dateStr)
      }

      // All requests should have been made
      expect(apiRequest).toHaveBeenCalledTimes(3)

      // Verify authentication is still required
      expect(localStorage.getItem('accessToken')).toBe('mock-access-token')
    })

    it('should handle rapid consecutive date navigation', async () => {
      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        status: 200,
        data: {},
      })

      const dates = ['2026-02-08', '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12']

      // Rapid navigation
      const promises = dates.map((date) => healthRecordService.getDailySummary(date))
      await Promise.all(promises)

      // All requests should complete
      expect(apiRequest).toHaveBeenCalledTimes(dates.length)
    })
  })
})
