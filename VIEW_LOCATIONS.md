# 🗺️ Viewing WanderNav Locations

There are several ways to view what's in your locations collection:

## 📋 **Location Data Structure**

Each location in your database has this structure:
```javascript
{
  "_id": "ObjectId",           // MongoDB auto-generated ID
  "name": "string",            // Location name
  "description": "string",     // Description (optional)
  "latitude": "number",        // GPS latitude
  "longitude": "number"        // GPS longitude
}
```

## 🔍 **Method 1: Using the API (Recommended)**

Run the Node.js script to view locations through your Spring Boot API:

```bash
cd WanderNavFinal
node view-locations.js
```

**Expected Output:**
```
🗺️  Viewing WanderNav Locations...

📋 Fetching all locations from database...
✅ Found 5 location(s):

1. Central Park
   📍 Coordinates: 40.7829, -73.9654
   📝 Description: Famous urban park in Manhattan, New York
   🆔 ID: 507f1f77bcf86cd799439011

2. Times Square
   📍 Coordinates: 40.7580, -73.9855
   📝 Description: Major commercial intersection and tourist destination
   🆔 ID: 507f1f77bcf86cd799439012
...
```

## 🗄️ **Method 2: Direct MongoDB Query**

Connect to MongoDB shell and run queries:

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use wander_db

# View all locations
db.locations.find()

# Count total locations
db.locations.countDocuments()

# Find specific location
db.locations.findOne({name: "Central Park"})

# Find locations near coordinates
db.locations.find({
  latitude: { $gte: 40.75, $lte: 40.77 },
  longitude: { $gte: -73.99, $lte: -73.97 }
})
```

## 🌐 **Method 3: Using the API Endpoints**

### **Get All Locations:**
```bash
curl http://localhost:8080/api/locations
```

### **Get Location by ID:**
```bash
curl http://localhost:8080/api/locations/LOCATION_ID
```

### **Create New Location:**
```bash
curl -X POST http://localhost:8080/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Location",
    "description": "A new place",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

## 📊 **Method 4: MongoDB Compass (GUI)**

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `wander_db` database
4. Click on `locations` collection
5. View, edit, and manage your location data visually

## 🛠️ **Troubleshooting**

### **No Locations Found:**
If you see "No locations found", the collection might be empty. Run:
```bash
node view-locations.js
```
This will automatically add sample locations.

### **Connection Issues:**
1. **MongoDB not running:**
   ```bash
   # Start MongoDB
   mongod
   ```

2. **Spring Boot not running:**
   ```bash
   cd WanderNavFinal/server
   ./mvnw spring-boot:run
   ```

3. **Database doesn't exist:**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Create database
   use wander_db
   
   # Create collection
   db.createCollection("locations")
   ```

## 📈 **Sample Location Data**

If you need to add sample locations manually:

```javascript
// In MongoDB shell
use wander_db

db.locations.insertMany([
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
  }
])
```

## 🔗 **Available API Endpoints**

- `GET /api/locations` - Get all locations
- `GET /api/locations/{id}` - Get location by ID
- `POST /api/locations` - Create new location
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Delete location

## 📱 **Frontend Integration**

Your React Native app can fetch locations using:
```javascript
import { searchApiService } from '../src/services/api';

// Search for locations
const locations = await searchApiService.performSearch({
  query: "park",
  type: "places"
});
``` 