'use client';

export default function DateTimeSelection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vælg dato og tid
        </h2>
        <p className="text-gray-600">
          Vælg hvornår du vil have din service udført.
        </p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          📅 Dato/tid vælger kommer snart! Denne del er under udvikling.
        </p>
      </div>
    </div>
  );
}
