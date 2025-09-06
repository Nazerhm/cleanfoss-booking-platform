// Test booking API endpoint with actual data
const https = require('https');
const http = require('http');

const testBookingData = {
  customerId: "test-customer-" + Date.now(),
  customerInfo: {
    name: "Test Customer",
    email: "test@example.com",
    phone: "12345678",
    address: "Test Address 123, Copenhagen"
  },
  vehicleInfo: {
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    licensePlate: "ABC123"
  },
  locationInfo: {
    address: "Service Location 456, Copenhagen",
    coordinates: { lat: 55.6761, lng: 12.5683 }
  },
  scheduledDate: new Date().toISOString(),
  selectedServices: ["basic-wash", "interior-clean"],
  totalPrice: 299,
  companyId: "test-company"
};

const postData = JSON.stringify(testBookingData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/bookings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔍 Testing booking API endpoint...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Booking creation successful!');
        console.log('📄 Booking ID:', response.bookingId || response.id);
      } else {
        console.log('⚠️  Booking API response:', response);
      }
    } catch (error) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();
