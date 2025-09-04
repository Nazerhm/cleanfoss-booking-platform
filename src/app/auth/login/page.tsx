import React from 'react'
import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Log ind | CleanFoss',
  description: 'Log ind på din CleanFoss konto for at få adgang til dine bookinger og indstillinger.',
}

interface LoginPageProps {
  searchParams: {
    redirect?: string
    error?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = searchParams.redirect || '/'
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600">CleanFoss</h1>
          </Link>
        </div>

        {/* Error message from URL params */}
        {searchParams.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 text-center">
            {searchParams.error === 'CredentialsSignin' 
              ? 'Ugyldig e-mail eller adgangskode'
              : 'Der opstod en fejl under login. Prøv igen.'
            }
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10">
          <LoginForm 
            redirectTo={redirectTo}
          />
          
          {/* Additional links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Har du ikke en konto?{' '}
                <Link 
                  href={`/auth/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                >
                  Opret konto
                </Link>
              </p>
              
              <p className="text-gray-600">
                <Link 
                  href="/"
                  className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                >
                  ← Tilbage til forsiden
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; 2025 CleanFoss. Alle rettigheder forbeholdes.</p>
      </div>
    </div>
  )
}
