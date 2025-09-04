import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  SparklesIcon,
  TruckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
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
                href="/booking" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 justify-center"
              >
                Book Nu
                <CalendarDaysIcon className="w-5 h-5" />
              </Link>
              <Link 
                href="/services" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-2 justify-center"
              >
                Se Services
                <WrenchScrewdriverIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hvorfor vælge CleanFoss?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vi gør bilrengøring nemt, hurtigt og professionelt
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nem booking</h3>
              <p className="text-gray-600">Book din tid online på få minutter</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professionel kvalitet</h3>
              <p className="text-gray-600">Erfarne medarbejdere og kvalitetsprodukter</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vi kommer til dig</h3>
              <p className="text-gray-600">Service på din adresse eller vores lokation</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klar til en ren bil?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Book din tid nu og få din bil til at se ud som ny
          </p>
          <Link 
            href="/booking" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            Book Nu
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}