/**
 * RegisterPage Component
 * Enables new users to register with an invite token
 * Validates invite token, form inputs, and submits registration request
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import * as authService from '../services/authService'

type FormData = {
  inviteToken: string
  email: string
  username: string
  name: string
  password: string
  confirmPassword: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/
const MIN_PASSWORD_LENGTH = 8

/**
 * RegisterPage Component
 * Handles user registration with invite token validation and form validation
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    inviteToken: searchParams.get('token') || '',
    email: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  /**
   * T013: Validate invite token on component mount
   */
  useEffect(() => {
    const validateToken = async () => {
      setIsValidatingToken(true)
      setTokenError(null)

      if (!formData.inviteToken) {
        setTokenError('Invite token is required. Please use the link from your invite email.')
        setIsValidatingToken(false)
        return
      }

      try {
        const isValid = await authService.validateInviteToken(formData.inviteToken)
        if (isValid) {
          setIsTokenValid(true)
          setTokenError(null)
        } else {
          setIsTokenValid(false)
          setTokenError('This invite token is invalid or has expired.')
        }
      } catch (error) {
        setIsTokenValid(false)
        setTokenError('Failed to validate invite token. Please try again.')
      } finally {
        setIsValidatingToken(false)
      }
    }

    validateToken()
  }, [formData.inviteToken])

  /**
   * T014: Validate form data client-side
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      errors.username = 'Username must be between 3 and 50 characters'
    } else if (!USERNAME_PATTERN.test(formData.username)) {
      errors.username =
        'Username can only contain letters, numbers, hyphens, and underscores'
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  /**
   * T015 & T016: Handle form submission and registration
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await register(
        formData.email,
        formData.username,
        formData.name,
        formData.password,
        formData.inviteToken
      )

      setSubmitSuccess(true)

      // Redirect to login page after success
      setTimeout(() => {
        navigate('/login', {
          state: {
            successMessage: 'Registration successful! Please log in with your credentials.',
            email: formData.email,
          },
        })
      }, 1500)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Create Your Account
        </Typography>

        {/* Token validation status */}
        {isValidatingToken && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Validating invite...</Typography>
          </Box>
        )}

        {tokenError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {tokenError}
          </Alert>
        )}

        {!isValidatingToken && !isTokenValid && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Your invite token is invalid or expired. Please request a new invite link.
          </Alert>
        )}

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Registration successful! Redirecting to login...
          </Alert>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        {/* Registration form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: isTokenValid && !isValidatingToken ? 'block' : 'none' }}
        >
          <Stack spacing={2.5}>
            {/* Email field */}
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />

            {/* Username field */}
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={isSubmitting}
              autoComplete="username"
              required
              placeholder="Letters, numbers, hyphens, underscores only"
            />

            {/* Full Name field */}
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={isSubmitting}
              autoComplete="name"
              required
            />

            {/* Password field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isSubmitting}
              autoComplete="new-password"
              required
            />

            {/* Confirm Password field */}
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={isSubmitting}
              autoComplete="new-password"
              required
            />

            {/* Submit button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating Account...
                </>
              ) : (
                'Register'
              )}
            </Button>

            {/* Login link */}
            <Typography align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/login')}
                disabled={isSubmitting}
                sx={{ textTransform: 'none', p: 0, ml: 0.5 }}
              >
                Log in here
              </Button>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}

export default RegisterPage
