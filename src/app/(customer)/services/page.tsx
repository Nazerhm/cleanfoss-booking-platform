'use client';

import { useEffect } from 'react';

export default function ServicesPage() {
  useEffect(() => {
    window.location.href = '/booking';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Omdirigerer til booking...
        </h1>
        <p className="text-gray-600 mb-4">
          Du bliver automatisk omdirigeret til vores nye booking-side.
        </p>
        <a 
          href="/booking" 
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Gå til booking
        </a>
      </div>
    </div>
  );
}
