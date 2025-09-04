'use client'

import React, { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
  redirectTo?: string
  className?: string
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  redirectTo = '/',
  className = ''
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  // Close modal on successful authentication
  const handleSuccess = () => {
    onClose()
  }

  // Toggle between login and register modes
  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
  }

  // Handle background click to close modal
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 ${className}`}
      onClick={handleBackgroundClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${mode}-modal-title`}
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
          aria-label="Luk modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <div className="p-8">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onToggleMode={toggleMode}
              redirectTo={redirectTo}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onToggleMode={toggleMode}
              redirectTo={redirectTo}
            />
          )}
        </div>
      </div>
    </div>
  )
}
