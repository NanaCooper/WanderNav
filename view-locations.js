const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function viewLocations() {
  console.log('🗺️  Viewing WanderNav Locations...\n');

  try {
    // Get all locations
    console.log('📋 Fetching all locations from database...');
    const response = await axios.get(`${BASE_URL}/api/locations`);
    const locations = response.data;

    if (locations.length === 0) {
      console.log('📭 No locations found in database.');
      console.log('\n💡 Would you like to add some sample locations? (y/n)');
      // For now, let's add some sample data
      await addSampleLocations();
    } else {
      console.log(`✅ Found ${locations.length} location(s):\n`);
      
      locations.forEach((location, index) => {
        console.log(`${index + 1}. ${location.name}`);
        console.log(`   📍 Coordinates: ${location.latitude}, ${location.longitude}`);
        console.log(`   📝 Description: ${location.description || 'No description'}`);
        console.log(`   🆔 ID: ${location.id}`);
        console.log('');
      });
    }

    // Show available endpoints
    console.log('🔗 Available Location Endpoints:');
    console.log('   GET    /api/locations          - Get all locations');
    console.log('   GET    /api/locations/{id}     - Get location by ID');
    console.log('   POST   /api/locations          - Create new location');
    console.log('   PUT    /api/locations/{id}     - Update location');
    console.log('   DELETE /api/locations/{id}     - Delete location');

  } catch (error) {
    console.error('❌ Error fetching locations:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your Spring Boot server is running:');
      console.log('   cd WanderNavFinal/server');
      console.log('   ./mvnw spring-boot:run');
    }
  }
}

async function addSampleLocations() {
  console.log('\n➕ Adding sample locations...\n');

  const sampleLocations = [
    {
      name: "Central Park",
      description: "Famous urban park in Manhattan, New York",
      latitude: 40.7829,
      longitude: -73.9654
    },
    {
      name: "Times Square",
      description: "Major commercial intersection and tourist destination",
      latitude: 40.7580,
      longitude: -73.9855
    },
    {
      name: "Empire State Building",
      description: "Iconic 102-story skyscraper in Midtown Manhattan",
      latitude: 40.7484,
      longitude: -73.9857
    },
    {
      name: "Statue of Liberty",
      description: "Famous landmark and symbol of freedom",
      latitude: 40.6892,
      longitude: -74.0445
    },
    {
      name: "Brooklyn Bridge",
      description: "Historic suspension bridge connecting Manhattan and Brooklyn",
      latitude: 40.7061,
      longitude: -73.9969
    }
  ];

  try {
    for (const location of sampleLocations) {
      const response = await axios.post(`${BASE_URL}/api/locations`, location);
      console.log(`✅ Added: ${location.name}`);
    }
    
    console.log('\n🎉 Sample locations added successfully!');
    console.log('🔄 Refreshing location list...\n');
    
    // Fetch and display the locations again
    const response = await axios.get(`${BASE_URL}/api/locations`);
    const locations = response.data;
    
    console.log(`📋 Now showing ${locations.length} location(s):\n`);
    
    locations.forEach((location, index) => {
      console.log(`${index + 1}. ${location.name}`);
      console.log(`   📍 Coordinates: ${location.latitude}, ${location.longitude}`);
      console.log(`   📝 Description: ${location.description || 'No description'}`);
      console.log(`   🆔 ID: ${location.id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error adding sample locations:', error.message);
  }
}

async function getLocationById(id) {
  try {
    const response = await axios.get(`${BASE_URL}/api/locations/${id}`);
    const location = response.data;
    
    console.log(`\n📍 Location Details (ID: ${id}):`);
    console.log(`   Name: ${location.name}`);
    console.log(`   Description: ${location.description || 'No description'}`);
    console.log(`   Coordinates: ${location.latitude}, ${location.longitude}`);
    console.log(`   ID: ${location.id}`);
    
  } catch (error) {
    console.error(`❌ Error fetching location ${id}:`, error.message);
  }
}

// Main execution
viewLocations();

// Export functions for potential reuse
module.exports = {
  viewLocations,
  addSampleLocations,
  getLocationById
}; 