/**
 * LogoutButton Component
 * Provides a button to logout the current user
 * Clears tokens and redirects to login page
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, CircularProgress } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../hooks/useAuth'

export type LogoutButtonProps = {
  variant?: 'text' | 'outlined' | 'contained'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

/**
 * T022: LogoutButton Component
 * Logs out the user and clears authentication state
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
}) => {
  const navigate = useNavigate()
  const { logout, isLoading } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  /**
   * Handle logout with confirmation dialog
   */
  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      logout()
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      // Redirect to login page
      navigate('/login', {
        state: { successMessage: 'You have been logged out successfully.' },
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={() => setIsDialogOpen(true)}
        disabled={isLoading || isLoggingOut}
        startIcon={isLoggingOut ? <CircularProgress size={20} /> : <LogoutIcon />}
        color="error"
      >
        {isLoggingOut ? 'Logging Out...' : 'Logout'}
      </Button>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setIsDialogOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>
              Confirm Logout
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#666' }}>
              Are you sure you want to logout? You will need to sign in again to access your
              health diary.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging Out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LogoutButton
