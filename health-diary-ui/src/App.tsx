import type React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './layout/components/Home'
import RegisterPage from './pages/RegisterPage'

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Main application route - renders existing Home component */}
        <Route path="/" element={<Home />} />

        {/* User Story 1: Registration */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Placeholder routes for remaining user stories (pages not yet created) */}
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page (Coming Soon)</div>} />

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
)

export default App
