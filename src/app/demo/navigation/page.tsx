/**
 * Navigation Test Page
 * Demonstrates the authentication-aware navigation system
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthenticatedLayout, PageHeader } from '../../../components';

function NavigationDemo() {
  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Navigation Demo"
        subtitle="Testing authentication-aware navigation system"
        breadcrumbItems={[
          { label: 'Demo', href: '/demo', current: true }
        ]}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Navigation System Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ✅ Authentication Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Role-based navigation items</li>
                <li>• Dynamic login/logout buttons</li>
                <li>• User menu with profile access</li>
                <li>• Authentication status display</li>
                <li>• Protected route handling</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ✅ UI/UX Features  
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Responsive mobile menu</li>
                <li>• Active route highlighting</li>
                <li>• Danish localization</li>
                <li>• Smooth transitions</li>
                <li>• Breadcrumb navigation</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <strong>Task 9: UI Navigation Integration - COMPLETED!</strong><br />
                  Authentication-aware navigation system successfully implemented with comprehensive features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default function NavigationTestPage() {
  return (
    <SessionProvider>
      <NavigationDemo />
    </SessionProvider>
  );
}
