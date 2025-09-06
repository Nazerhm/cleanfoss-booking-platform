'use client';

import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  SparklesIcon,
  TruckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function CustomerHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Professionel Bilpleje
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Book din næste bilrengøring online og få din bil til at skinne igen. 
              Hurtig booking, fair priser og professionel service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/services"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
              >
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Se Alle Services
              </Link>
              <Link 
                href="/bookings/new"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-400 transition-colors duration-200 flex items-center justify-center"
              >
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Book Nu
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hvorfor vælge CleanFoss?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vi gør det nemt at holde din bil ren med moderne booking, 
            fair priser og professionel service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nem Online Booking
            </h3>
            <p className="text-gray-600">
              Book din service online i få klik. Vælg tid, sted og betalingsmetode der passer dig.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <SparklesIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Professionel Kvalitet
            </h3>
            <p className="text-gray-600">
              Vores erfarne tekniker bruger professionelt udstyr og miljøvenlige produkter.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Mobil Service
            </h3>
            <p className="text-gray-600">
              Vi kommer til dig - på dit kontor, hjem eller andre steder der passer dig.
            </p>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Populære Services
            </h2>
            <p className="text-lg text-gray-600">
              Vores mest efterspurgte services til alle køretøjstyper
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    Fra {service.price} DKK
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/services"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Se alle services
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klar til at få din bil rengjort?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Book din service nu og få din bil til at skinne igen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/bookings/new"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Book Service Nu
            </Link>
            <Link 
              href="/services"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-400 transition-colors duration-200"
            >
              Se Priser
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const popularServices = [
  {
    name: 'Eksterior Vask',
    description: 'Grundig udvendig rengøring med hånddokumentation og voks',
    price: 350,
    icon: '🚗'
  },
  {
    name: 'Interiør Rengøring',
    description: 'Dyb rengøring af indvendige overflader og støvsugning',
    price: 400,
    icon: '🧽'
  },
  {
    name: 'Premium Pakke',
    description: 'Komplet service både inde og ude med polering',
    price: 750,
    icon: '✨'
  },
  {
    name: 'SUV Special',
    description: 'Specialservice til store køretøjer med ekstra tid',
    price: 450,
    icon: '🚙'
  }
];
