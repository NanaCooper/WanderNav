# 🗺️ WanderNav - Navigation & Travel Companion App

A full-stack mobile application built with React Native (Expo) and Spring Boot, featuring user authentication, location search, weather information, and route management.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Location Search**: Search for places, users, and hazards
- **Weather Information**: Get weather data for any location
- **Route Management**: Create and manage personal navigation routes
- **Real-time Updates**: Live location tracking and updates
- **Cross-platform**: Works on iOS and Android

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Axios** for API communication
- **AsyncStorage** for local data persistence

### Backend
- **Spring Boot** 3.2.0
- **MongoDB** for database
- **Spring Security** with JWT authentication
- **Maven** for dependency management
- **Swagger/OpenAPI** for API documentation

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Java** 21
- **MongoDB** (running on localhost:27017)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd WanderNavFinal
```

### 2. Start MongoDB
```bash
# MongoDB should be running as a Windows service
# Check status:
Get-Service -Name "MongoDB"
```

### 3. Start the Backend
```bash
cd server
./mvnw spring-boot:run
```
The backend will be available at `http://localhost:8080`

### 4. Start the Frontend
```bash
cd client/WanderNav
npm install
npx expo start --offline
```

### 5. Test the App
- Scan the QR code with Expo Go app
- Or press `a` for Android emulator
- Or press `w` for web version

## 🔧 Configuration

### Backend Configuration
The backend configuration is in `server/src/main/resources/application.properties`:
```properties
# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/wander_db
spring.data.mongodb.database=wander_db

# Server
server.port=8080

# JWT
jwt.secret=your-secret-key-here-make-it-long-and-secure-in-production
jwt.expiration=86400000
```

### Frontend Configuration
API endpoints are configured in `client/WanderNav/src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://10.0.2.2:8080'; // Android Emulator
// Use 'http://localhost:8080' for iOS Simulator
// Use 'http://YOUR_IP:8080' for physical device
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Search & Weather
- `POST /api/search` - Search for places, users, hazards
- `GET /api/weather` - Get weather for location

### Routes & Locations
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create route
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create location

## 🗄️ Database Schema

### Users Collection
```javascript
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string (encrypted)",
  "email": "string"
}
```

### Routes Collection
```javascript
{
  "_id": "ObjectId",
  "name": "string",
  "userId": "string",
  "locationIds": ["string"]
}
```

### Locations Collection
```javascript
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "latitude": "number",
  "longitude": "number"
}
```

## 🛡️ Security

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Properly configured for cross-origin requests
- **Input Validation**: Server-side validation for all inputs

## 🧪 Testing

### Backend Testing
```bash
cd server
./mvnw test
```

### API Testing
```powershell
# Test registration
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"testuser","password":"testpass"}'

# Test login
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"testuser","password":"testpass"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB service is running
   - Check if port 27017 is available

2. **Backend Won't Start**
   - Verify Java 21 is installed
   - Check if port 8080 is available
   - Ensure all dependencies are installed

3. **Frontend Network Error**
   - Verify backend is running on port 8080
   - Check API_BASE_URL in api.ts
   - Ensure correct IP address for your environment

4. **Authentication Issues**
   - Check JWT secret in application.properties
   - Verify user exists in database
   - Check password encoding

## 📁 Project Structure

```
WanderNavFinal/
├── client/                 # React Native frontend
│   └── WanderNav/
│       ├── app/           # Expo Router screens
│       ├── src/
│       │   └── services/  # API services
│       ├── components/    # Reusable components
│       └── constants/     # App constants
├── server/                # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/wandernav/wander_backend/
│   │       ├── controllers/  # REST controllers
│   │       ├── models/       # Data models
│   │       ├── repositories/ # Data access
│   │       ├── security/     # JWT & security
│   │       └── config/       # Configuration
│   └── src/main/resources/
│       └── application.properties
└── docs/                  # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native and Expo team
- Spring Boot community
- MongoDB team
- All contributors and testers

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Create an issue in the repository
4. Contact the development team

---

**Happy Navigating! 🗺️✨** 