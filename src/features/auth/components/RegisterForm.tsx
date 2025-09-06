'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface RegisterFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
  redirectTo?: string
  className?: string
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export default function RegisterForm({
  onSuccess,
  onToggleMode,
  redirectTo = '/',
  className = ''
}: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  // Calculate password strength
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: '', color: 'gray-300' }
    }

    let score = 0
    
    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Character checks
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1

    if (score <= 2) {
      return { score, label: 'Svag', color: 'red-500' }
    } else if (score <= 4) {
      return { score, label: 'Medium', color: 'yellow-500' }
    } else {
      return { score, label: 'Stærk', color: 'green-500' }
    }
  }

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrævet'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Navn skal være mindst 2 tegn'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail er påkrævet'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Indtast en gyldig e-mail adresse'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Adgangskode er påkrævet'
    } else {
      const strength = getPasswordStrength(formData.password)
      if (strength.score < 3) {
        newErrors.password = 'Adgangskoden skal være stærkere (mindst 8 tegn, store/små bogstaver og tal)'
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bekræft adgangskode er påkrævet'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Adgangskoderne matcher ikke'
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
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Handle validation errors
          const fieldErrors: FormErrors = {}
          data.details.forEach((error: {field: string, message: string}) => {
            if (error.field === 'email' || error.field === 'password' || error.field === 'name') {
              fieldErrors[error.field as keyof FormErrors] = error.message
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({
            general: data.error || 'Der opstod en fejl under oprettelse af konto'
          })
        }
        return
      }

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (loginResult?.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(redirectTo)
        }
      } else {
        // Registration successful but login failed - redirect to login
        setErrors({
          general: 'Konto oprettet! Du kan nu logge ind med dine oplysninger.'
        })
        if (onToggleMode) {
          setTimeout(onToggleMode, 2000)
        }
      }

    } catch (error) {
      console.error('Registration error:', error)
      setErrors({
        general: 'Der opstod en fejl under oprettelse af konto. Prøv igen.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className={`w-full max-w-md ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Opret konto</h2>
          <p className="text-gray-600 mt-2">
            Opret din CleanFoss konto for at komme i gang
          </p>
        </div>

        {/* General message */}
        {errors.general && (
          <div className={`border rounded-lg p-4 text-sm ${
            errors.general.includes('oprettet') 
              ? 'bg-green-50 border-green-200 text-green-600'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {errors.general}
          </div>
        )}

        {/* Name field */}
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
            Fulde navn *
          </label>
          <input
            type="text"
            id="register-name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Dit fulde navn"
            disabled={isLoading}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            autoComplete="name"
          />
          {errors.name && (
            <p id="register-name-error" className="text-red-600 text-sm mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail *
          </label>
          <input
            type="email"
            id="register-email"
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
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <p id="register-email-error" className="text-red-600 text-sm mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password field with strength indicator */}
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
            Adgangskode *
          </label>
          <input
            type="password"
            id="register-password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Mindst 8 tegn, store/små bogstaver og tal"
            disabled={isLoading}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            autoComplete="new-password"
          />
          
          {/* Password strength indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Styrke:</span>
                <span className={`font-medium text-${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {errors.password && (
            <p id="register-password-error" className="text-red-600 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password field */}
        <div>
          <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Bekræft adgangskode *
          </label>
          <input
            type="password"
            id="register-confirm-password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Indtast adgangskoden igen"
            disabled={isLoading}
            aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p id="register-confirm-password-error" className="text-red-600 text-sm mt-1">
              {errors.confirmPassword}
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
              Opretter konto...
            </span>
          ) : (
            'Opret konto'
          )}
        </button>

        {/* Toggle to login */}
        {onToggleMode && (
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Har du allerede en konto?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
              >
                Log ind
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
