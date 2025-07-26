const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testBackendConnection() {
  console.log('🔍 Testing WanderNav Backend Connection...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server availability...');
    const healthResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      validateStatus: () => true // Don't throw on 401/403
    });
    console.log(`   ✅ Server is running (Status: ${healthResponse.status})`);

    // Test 2: Test registration endpoint
    console.log('\n2. Testing registration endpoint...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      username: 'testuser@example.com',
      password: 'testpassword123'
    });
    console.log(`   ✅ Registration endpoint working (Status: ${registerResponse.status})`);

    // Test 3: Test search endpoint
    console.log('\n3. Testing search endpoint...');
    const searchResponse = await axios.post(`${BASE_URL}/api/search`, {
      query: 'test',
      type: 'places'
    });
    console.log(`   ✅ Search endpoint working (Status: ${searchResponse.status})`);

    // Test 4: Test weather endpoint
    console.log('\n4. Testing weather endpoint...');
    const weatherResponse = await axios.get(`${BASE_URL}/api/weather`, {
      params: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    });
    console.log(`   ✅ Weather endpoint working (Status: ${weatherResponse.status})`);

    console.log('\n🎉 All backend endpoints are working correctly!');
    console.log('\n📱 Frontend should be able to connect to:');
    console.log('   - Android Emulator: http://10.0.2.2:8080');
    console.log('   - iOS Simulator: http://localhost:8080');
    console.log('   - Physical Device: http://YOUR_COMPUTER_IP:8080');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your Spring Boot server is running:');
      console.log('   cd WanderNavFinal/server');
      console.log('   ./mvnw spring-boot:run');
    }
    
    if (error.response) {
      console.log(`\n📊 Response status: ${error.response.status}`);
      console.log(`📊 Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testBackendConnection(); 