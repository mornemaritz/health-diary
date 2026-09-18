/**
 * Integration tests for health record flows (User Story 3 – Medication Administration)
 * Tests medication dosage group fetching, data reshaping, and medication record creation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as healthRecordService from '../../src/services/healthRecordService'
import { apiRequest } from '../../src/services/apiClient'

vi.mock('../../src/services/apiClient', () => ({
  apiRequest: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockMedicationDosageGroups = [
  { id: 'g1', medicationDosage: { id: 'd1', medication: 'Epilim', dosage: '4ml' }, schedule: 'SevenAm' },
  { id: 'g2', medicationDosage: { id: 'd2', medication: 'Gabapentin', dosage: '300mg' }, schedule: 'SevenAm' },
  { id: 'g3', medicationDosage: { id: 'd3', medication: 'Movicol', dosage: '0.5 sachet' }, schedule: 'ThreePm' },
  { id: 'g4', medicationDosage: { id: 'd4', medication: 'Urbanol', dosage: '5mg' }, schedule: 'SevenPm' },
  { id: 'g5', medicationDosage: { id: 'd5', medication: 'Senokot', dosage: '0.5 tablet' }, schedule: 'TenPm' },
  { id: 'g6', medicationDosage: { id: 'd6', medication: 'Panado', dosage: '10ml' }, schedule: 'AdHoc' },
]

// ---------------------------------------------------------------------------
// T033/T034 – getMedicationDosageGroups (service layer)
// ---------------------------------------------------------------------------

describe('getMedicationDosageGroups (T034)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches from the correct endpoint with auth', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ ok: true, status: 200, data: mockMedicationDosageGroups })

    await healthRecordService.getMedicationDosageGroups()

    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/health/medications/dosage-groups',
      expect.objectContaining({ method: 'GET', requiresAuth: true })
    )
  })

  it('reshapes API response – groups medications by schedule key', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ ok: true, status: 200, data: mockMedicationDosageGroups })

    const result = await healthRecordService.getMedicationDosageGroups()

    expect('error' in result).toBe(false)
    if ('error' in result) return

    expect(result['7am']).toEqual(['Epilim - 4ml', 'Gabapentin - 300mg'])
    expect(result['3pm']).toEqual(['Movicol - 0.5 sachet'])
    expect(result['7pm']).toEqual(['Urbanol - 5mg'])
    expect(result['10pm']).toEqual(['Senokot - 0.5 tablet'])
    expect(result['adhoc']).toEqual(['Panado - 10ml'])
  })

  it('combines medication and dosage as "Medication - Dosage" strings', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: [{ id: 'g1', medicationDosage: { id: 'd1', medication: 'Aspirine', dosage: '500mg' }, schedule: 'AdHoc' }],
    })

    const result = await healthRecordService.getMedicationDosageGroups()

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result['adhoc']).toEqual(['Aspirine - 500mg'])
  })

  it('returns empty schedule arrays when API returns an empty list', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ ok: true, status: 200, data: [] })

    const result = await healthRecordService.getMedicationDosageGroups()

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result['7am']).toEqual([])
    expect(result['adhoc']).toEqual([])
  })

  it('returns an error object when the API call fails', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ ok: false, status: 401, error: 'Unauthorized' })

    const result = await healthRecordService.getMedicationDosageGroups()

    expect('error' in result).toBe(true)
    if (!('error' in result)) return
    expect(result.error).toBe('Unauthorized')
  })

  it('returns a fallback error message when the API gives no error text', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ ok: false, status: 500, error: undefined })

    const result = await healthRecordService.getMedicationDosageGroups()

    expect('error' in result).toBe(true)
    if (!('error' in result)) return
    expect(result.error).toBe('Failed to fetch medication dosage groups')
  })
})

// ---------------------------------------------------------------------------
// T039/T040 – createMedication (service layer)
// ---------------------------------------------------------------------------

describe('createMedication (T039)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a medication record and returns the id', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({
      ok: true,
      status: 201,
      data: { id: 'rec-uuid-001', message: 'Medication record created successfully' },
    })

    const result = await healthRecordService.createMedication({
      date: '2026-05-22',
      time: '07:00',
      medication: 'Epilim',
      dosage: '4ml',
      schedule: 'SevenAm',
    })

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.id).toBe('rec-uuid-001')
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/health/medication',
      expect.objectContaining({ method: 'POST', requiresAuth: true })
    )
  })

  it('returns an error when required fields are missing (API 400)', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({
      ok: false,
      status: 400,
      error: 'Date and Time are required',
    })

    const result = await healthRecordService.createMedication({
      date: '',
      time: '',
    })

    expect('error' in result).toBe(true)
    if (!('error' in result)) return
    expect(result.error).toBe('Date and Time are required')
  })

  it('returns an error when the API returns a conflict (409)', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({
      ok: false,
      status: 409,
      error: 'Conflict - Record could not be created',
    })

    const result = await healthRecordService.createMedication({
      date: '2026-05-22',
      time: '07:00',
    })

    expect('error' in result).toBe(true)
    if (!('error' in result)) return
    expect(result.error).toBe('Conflict - Record could not be created')
  })

  it('returns an error when the API call fails with a server error', async () => {
    const mockApiRequest = vi.mocked(apiRequest)
    mockApiRequest.mockResolvedValueOnce({ ok: false, status: 500, error: undefined })

    const result = await healthRecordService.createMedication({
      date: '2026-05-22',
      time: '07:00',
    })

    expect('error' in result).toBe(true)
    if (!('error' in result)) return
    expect(result.error).toBe('Failed to create medication record')
  })
})
