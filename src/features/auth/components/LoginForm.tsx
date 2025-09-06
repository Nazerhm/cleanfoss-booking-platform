'use client'

import React from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useFormManager } from '@/hooks/useFormManager'
import { AuthValidators, processApiErrors, type LoginFormData } from '@/utils/formValidation'

interface LoginFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
  redirectTo?: string
  className?: string
}

export default function LoginForm({
  onSuccess,
  onToggleMode,
  redirectTo = '/',
  className = ''
}: LoginFormProps) {
  const router = useRouter()

  // Use consolidated form management hook
  const form = useFormManager<LoginFormData>({
    initialValues: {
      email: '',
      password: ''
    },
    validate: AuthValidators.login,
    onSubmit: async (values) => {
      // Handle login submission
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false
      })

      if (result?.error) {
        form.setError('general', 'Ugyldig e-mail eller adgangskode')
        return
      }

      // Get updated session and handle success
      await getSession()
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(redirectTo)
      }
    }
  })

  // Enhanced form submission with error handling
  const handleFormSubmit = async (values: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false
      })

      if (result?.error) {
        throw new Error('Ugyldig e-mail eller adgangskode')
      }

      if (result?.ok) {
        // Refresh session data
        await getSession()
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(redirectTo)
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errors = processApiErrors(error)
      form.setErrors(errors)
    }
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <form onSubmit={form.handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Log ind</h2>
          <p className="text-gray-600 mt-2">
            Log ind på din konto for at fortsætte
          </p>
        </div>

        {/* General error message */}
        {form.errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {form.errors.general}
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
            value={form.values.email}
            onChange={(e) => form.setValue('email', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${form.errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="din@email.dk"
            disabled={form.isLoading}
            aria-describedby={form.errors.email ? 'login-email-error' : undefined}
            autoComplete="email"
          />
          {form.errors.email && (
            <p id="login-email-error" className="text-red-600 text-sm mt-1">
              {form.errors.email}
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
            value={form.values.password}
            onChange={(e) => form.setValue('password', e.target.value)}
            className={`
              w-full h-11 px-3 border rounded-lg text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${form.errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Indtast din adgangskode"
            disabled={form.isLoading}
            aria-describedby={form.errors.password ? 'login-password-error' : undefined}
            autoComplete="current-password"
          />
          {form.errors.password && (
            <p id="login-password-error" className="text-red-600 text-sm mt-1">
              {form.errors.password}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={form.isLoading}
          className={`
            w-full h-11 bg-blue-600 text-white font-medium rounded-lg
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        >
          {form.isLoading ? (
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
