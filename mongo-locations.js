// MongoDB Shell Script to view locations
// Run this in MongoDB shell: mongosh < mongo-locations.js

// Switch to the WanderNav database
use wander_db

print("🗺️  WanderNav Locations Database Query")
print("=====================================")

// Check if locations collection exists
const collections = db.getCollectionNames()
if (collections.includes("locations")) {
    print("✅ Locations collection found")
} else {
    print("❌ Locations collection not found")
    print("💡 The collection will be created when you add your first location")
}

print("\n📊 Collection Statistics:")
print("========================")
print("Total documents in locations: " + db.locations.countDocuments())

// Show all locations
print("\n📍 All Locations:")
print("==================")
const locations = db.locations.find().toArray()

if (locations.length === 0) {
    print("📭 No locations found in database")
    print("\n💡 To add sample locations, run the view-locations.js script")
} else {
    locations.forEach((location, index) => {
        print(`${index + 1}. ${location.name}`)
        print(`   📍 Coordinates: ${location.latitude}, ${location.longitude}`)
        print(`   📝 Description: ${location.description || 'No description'}`)
        print(`   🆔 ID: ${location._id}`)
        print("")
    })
}

// Show location by coordinates (example query)
print("🔍 Sample Queries:")
print("==================")
print("1. Find locations near Times Square (40.7580, -73.9855):")
const nearbyLocations = db.locations.find({
    latitude: { $gte: 40.75, $lte: 40.77 },
    longitude: { $gte: -73.99, $lte: -73.97 }
}).toArray()
print(`   Found ${nearbyLocations.length} nearby locations`)

print("\n2. Find locations with descriptions:")
const locationsWithDesc = db.locations.find({
    description: { $exists: true, $ne: "" }
}).toArray()
print(`   Found ${locationsWithDesc.length} locations with descriptions`)

print("\n3. Location names only:")
const names = db.locations.find({}, {name: 1, _id: 0}).toArray()
names.forEach(loc => print(`   - ${loc.name}`))

print("\n💡 Useful MongoDB Commands:")
print("===========================")
print("db.locations.find()                    - Show all locations")
print("db.locations.findOne()                 - Show first location")
print("db.locations.countDocuments()          - Count total locations")
print("db.locations.find({name: 'Central Park'}) - Find by name")
print("db.locations.deleteMany({})            - Delete all locations")
print("db.locations.drop()                    - Drop collection") 