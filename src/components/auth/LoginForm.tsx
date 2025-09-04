'use client'

import React, { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
  redirectTo?: string
  className?: string
}

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginForm({
  onSuccess,
  onToggleMode,
  redirectTo = '/',
  className = ''
}: LoginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Handle form field changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail er påkrævet'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Indtast en gyldig e-mail adresse'
    }

    if (!formData.password) {
      newErrors.password = 'Adgangskode er påkrævet'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setErrors({
          general: 'Ugyldig e-mail eller adgangskode'
        })
      } else if (result?.ok) {
        // Refresh session data
        await getSession()
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(redirectTo)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({
        general: 'Der opstod en fejl under login. Prøv igen.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Log ind</h2>
          <p className="text-gray-600 mt-2">
            Log ind på din konto for at fortsætte
          </p>
        </div>

        {/* General error message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        {/* Email field */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail *
          </label>
          <input
            type="email"
            id="login-email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="din@email.dk"
            disabled={isLoading}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <p id="login-email-error" className="text-red-600 text-sm mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
            Adgangskode *
          </label>
          <input
            type="password"
            id="login-password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Indtast din adgangskode"
            disabled={isLoading}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            autoComplete="current-password"
          />
          {errors.password && (
            <p id="login-password-error" className="text-red-600 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full h-11 bg-blue-600 text-white font-medium rounded-lg
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logger ind...
            </span>
          ) : (
            'Log ind'
          )}
        </button>

        {/* Toggle to registration */}
        {onToggleMode && (
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Har du ikke en konto?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
              >
                Opret konto
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
