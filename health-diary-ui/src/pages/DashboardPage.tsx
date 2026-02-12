/**
 * DashboardPage Component
 * Main dashboard displaying daily summary of health records
 * Allows date navigation and shows loading/error states
 */

import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material'
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Today as TodayIcon,
} from '@mui/icons-material'
import DailySummary from '../components/DailySummary'
import { getDailySummary } from '../services/healthRecordService'
import type { DailySummaryResponse } from '../services/healthRecordService'
import { useAuth } from '../hooks/useAuth'

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Format date to YYYY-MM-DD string for API
   */
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Load daily summary for selected date
   */
  const loadDailySummary = async (date: Date) => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const dateStr = formatDateForApi(date)
      const result = await getDailySummary(dateStr)

      // Check if result has error property
      if ('error' in result) {
        setError(result.error)
        setSummary(null)
      } else {
        setSummary(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily summary')
      setSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Load summary when date changes
   */
  useEffect(() => {
    loadDailySummary(selectedDate)
  }, [selectedDate, isAuthenticated])

  /**
   * Navigate to previous day
   */
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  /**
   * Navigate to next day
   */
  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  /**
   * Jump to today
   */
  const goToToday = () => {
    setSelectedDate(new Date())
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Health Dashboard
        </Typography>

        {/* Date Navigation */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <Button
              startIcon={<PrevIcon />}
              onClick={goToPreviousDay}
              variant="outlined"
              size="small"
            >
              Previous
            </Button>

            <Typography
              variant="h6"
              sx={{
                minWidth: 250,
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>

            <Button
              startIcon={<NextIcon />}
              onClick={goToNextDay}
              variant="outlined"
              size="small"
            >
              Next
            </Button>

            <Button
              startIcon={<TodayIcon />}
              onClick={goToToday}
              variant="contained"
              size="small"
            >
              Today
            </Button>
          </Stack>
        </Paper>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Daily Summary Display */}
        {!isLoading && summary && (
          <DailySummary summary={summary} date={selectedDate} />
        )}

        {/* Empty State (no records and not loading) */}
        {!isLoading && !summary && !error && (
          <DailySummary summary={{}} date={selectedDate} />
        )}
      </Box>
    </Container>
  )
}

export default DashboardPage
