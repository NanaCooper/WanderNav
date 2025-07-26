# MongoDB Database Setup for WanderNav

## 🗄️ **Database: MongoDB**

Your WanderNav project uses **MongoDB** as the database.

### **Connection Details:**
- **Database Type**: MongoDB
- **Host**: localhost
- **Port**: 27017
- **Database Name**: wander_db
- **Connection URI**: `mongodb://localhost:27017/wander_db`

## 🚀 **Setup Instructions**

### 1. **Install MongoDB**

#### **Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb
```

#### **macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

#### **Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org
```

### 2. **Start MongoDB Service**

#### **Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

#### **macOS:**
```bash
# Start MongoDB service
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### **Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### 3. **Verify MongoDB is Running**

```bash
# Connect to MongoDB shell
mongosh

# Or older versions
mongo
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to:          mongodb://127.0.0.1:27017/...
Using MongoDB:          x.x.x
...
```

### 4. **Create Database and Collections**

```javascript
// Switch to your database
use wander_db

// Create collections (MongoDB creates them automatically when you insert data)
// But you can create them explicitly:
db.createCollection("users")
db.createCollection("routes")
db.createCollection("locations")

// Verify collections exist
show collections
```

### 5. **Test Database Connection**

Run your Spring Boot application:
```bash
cd WanderNavFinal/server
./mvnw spring-boot:run
```

You should see logs like:
```
INFO  o.s.d.m.c.MongoTemplate - Connected to database: wander_db
```

## 📊 **Database Collections**

Your application uses these MongoDB collections:

### **users** Collection
```javascript
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string (encrypted)",
  "email": "string"
}
```

### **routes** Collection
```javascript
{
  "_id": "ObjectId",
  "name": "string",
  "userId": "string (reference to user)",
  "locationIds": ["string (references to locations)"]
}
```

### **locations** Collection
```javascript
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "latitude": "number",
  "longitude": "number"
}
```

## 🛠️ **Troubleshooting**

### **MongoDB Won't Start**
1. Check if port 27017 is available: `netstat -an | grep 27017`
2. Verify data directory exists: `mkdir -p /data/db`
3. Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`

### **Connection Refused**
1. Ensure MongoDB service is running
2. Check firewall settings
3. Verify connection string in `application.properties`

### **Authentication Issues**
1. Check if MongoDB requires authentication
2. Update connection string if needed: `mongodb://username:password@localhost:27017/wander_db`

## 🔍 **Useful MongoDB Commands**

```javascript
// Show all databases
show dbs

// Switch to database
use wander_db

// Show collections
show collections

// Find all users
db.users.find()

// Find user by username
db.users.findOne({username: "testuser"})

// Count documents
db.users.countDocuments()

// Delete all documents in collection
db.users.deleteMany({})
```

## 📈 **Monitoring**

### **MongoDB Compass (GUI)**
Download MongoDB Compass for a visual interface:
https://www.mongodb.com/try/download/compass

### **MongoDB Atlas (Cloud)**
For production, consider MongoDB Atlas:
https://www.mongodb.com/atlas

## 🔐 **Security Notes**

- MongoDB by default has no authentication in development
- For production, enable authentication and use strong passwords
- Consider using MongoDB Atlas for cloud hosting
- Regularly backup your database
- Use environment variables for connection strings in production 