/**
 * Health Record service
 * Handles CRUD operations for all health record types
 */

import { apiRequest } from './apiClient'

export type MedicationRecord = {
  date: string
  time: string
  medication?: string
  dosage?: string
}

export type HydrationRecord = {
  date: string
  time: string
  quantity?: number
}

export type BowelMovementRecord = {
  date: string
  time: string
  consistency?: 'Hard' | 'Normal' | 'Soft' | 'Diarrhea'
}

export type FoodRecord = {
  date: string
  time: string
  food?: string
  quantity?: string
}

export type ObservationRecord = {
  date: string
  time: string
  notes?: string
  category?: string
}

export type DailySummaryResponse = {
  medications?: Array<{ id: string } & MedicationRecord>
  hydration?: Array<{ id: string } & HydrationRecord>
  bowelMovements?: Array<{ id: string } & BowelMovementRecord>
  food?: Array<{ id: string } & FoodRecord>
  observations?: Array<{ id: string } & ObservationRecord>
}

/**
 * Create a medication record
 */
export async function createMedication(
  data: MedicationRecord
): Promise<{ id: string } | { error: string }> {
  const result = await apiRequest<{ id: string; message: string }>(
    '/api/health/medication',
    {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }
  )

  if (!result.ok || !result.data?.id) {
    return { error: result.error || 'Failed to create medication record' }
  }

  return { id: result.data.id }
}

/**
 * Create a hydration record
 */
export async function createHydration(
  data: HydrationRecord
): Promise<{ id: string } | { error: string }> {
  const result = await apiRequest<{ id: string; message: string }>(
    '/api/health/bottle',
    {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }
  )

  if (!result.ok || !result.data?.id) {
    return { error: result.error || 'Failed to create hydration record' }
  }

  return { id: result.data.id }
}

/**
 * Create a bowel movement record
 */
export async function createBowelMovement(
  data: BowelMovementRecord
): Promise<{ id: string } | { error: string }> {
  const result = await apiRequest<{ id: string; message: string }>(
    '/api/health/bowel-movement',
    {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }
  )

  if (!result.ok || !result.data?.id) {
    return { error: result.error || 'Failed to create bowel movement record' }
  }

  return { id: result.data.id }
}

/**
 * Create a food record
 */
export async function createFood(
  data: FoodRecord
): Promise<{ id: string } | { error: string }> {
  const result = await apiRequest<{ id: string; message: string }>(
    '/api/health/solid-food',
    {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }
  )

  if (!result.ok || !result.data?.id) {
    return { error: result.error || 'Failed to create food record' }
  }

  return { id: result.data.id }
}

/**
 * Create an observation record
 */
export async function createObservation(
  data: ObservationRecord
): Promise<{ id: string } | { error: string }> {
  const result = await apiRequest<{ id: string; message: string }>(
    '/api/health/note',
    {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }
  )

  if (!result.ok || !result.data?.id) {
    return { error: result.error || 'Failed to create observation record' }
  }

  return { id: result.data.id }
}

/**
 * Get daily summary for a specific date
 */
export async function getDailySummary(
  date: string
): Promise<DailySummaryResponse | { error: string }> {
  const result = await apiRequest<DailySummaryResponse>(
    `/api/health/summary/${date}`,
    {
      method: 'GET',
      requiresAuth: true,
    }
  )

  if (!result.ok || !result.data) {
    return { error: result.error || 'Failed to fetch daily summary' }
  }

  return result.data
}
