# Audio Library Server

Node.js/Express backend API for audio content sharing platform with user authentication, file upload, and social features.

**Live API:** `https://ba478cc6-c46f-467a-b890-fa8e86a38e25.e1-us-east-azure.choreoapps.dev`

**Deployed on:** WSO2 Choreo

## Features

- JWT authentication with role-based access control
- Audio file upload and streaming with range request support
- User profiles with follow/unfollow system
- Audio likes, comments, and personalized feeds
- Public/private content management
- Admin dashboard with system statistics
- Advanced search and filtering

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **File Upload:** Multer
- **Validation:** express-validator

## Quick Start

```bash
git clone https://github.com/MuhammadAbdelkader/audio-library.git
cd audio-library/server
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/audio-library
JWT_SECRET=your-secure-jwt-secret
PORT=3000
```

```bash
npm run dev  # Development
npm start    # Production
```

## API Endpoints

### Authentication
```http
POST /api/register    # Register user (multipart/form-data)
POST /api/login       # Login user
```

### Audio Management
```http
GET  /api/audio                    # Get public audios
POST /api/audio                    # Upload audio (auth required)
GET  /api/audio/stream/:id         # Stream audio
POST /api/audio/:id/like           # Like/unlike audio
POST /api/audio/:id/comments       # Add comment
```

### User Profile
```http
GET  /api/profile                  # Get user profile
PUT  /api/profile                  # Update profile
POST /api/profile/follow/:userId   # Follow user
GET  /api/profile/feed             # Get following feed
```

### Admin (Admin role required)
```http
GET /api/admin/stats               # System statistics
GET /api/admin/users               # All users
GET /api/admin/audios              # All audios
```

## File Support

- **Audio:** MP3, M4A (max 50MB)
- **Images:** JPG, JPEG, PNG (max 50MB)
- **Organization:** Auto-organized by user directories

## Deployment

Deployed on **WSO2 Choreo** cloud platform.

**Environment Configuration:**
- MongoDB Atlas cluster for database
- Cloud-based file storage
- JWT authentication with secure secret
- Port 3000 for production server

## Authentication

Include JWT token in requests:
```http
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
├── config/           # Database & file upload config
├── controllers/      # Business logic
├── middlewares/      # Auth, validation, error handling
├── models/          # MongoDB schemas
├── routes/          # API routes
├── uploads/         # File storage
├── app.js           # Express configuration
└── server.js        # Entry point
```

## Author

**Muhammad Abdelkader**  
GitHub: [@MuhammadAbdelkader](https://github.com/MuhammadAbdelkader)

## License

MIT