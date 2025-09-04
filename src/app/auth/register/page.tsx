import React from 'react'
import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Opret konto | CleanFoss',
  description: 'Opret din CleanFoss konto og få adgang til vores tjenester. Hurtig og sikker registrering.',
}

interface RegisterPageProps {
  searchParams: {
    redirect?: string
  }
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
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

        {/* Register Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10">
          <RegisterForm 
            redirectTo={redirectTo}
          />
          
          {/* Additional links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Har du allerede en konto?{' '}
                <Link 
                  href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                >
                  Log ind
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
        
        {/* Terms and Privacy */}
        <div className="mt-2 space-x-4">
          <a href="#" className="text-gray-400 hover:text-gray-600">
            Handelsbetingelser
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-600">
            Privatlivspolitik
          </a>
        </div>
      </div>
    </div>
  )
}
