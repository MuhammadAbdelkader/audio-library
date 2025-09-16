# Audio Library

A full-stack audio content sharing platform where users can upload, stream, and discover audio content with social features.

**Live API:** `https://ba478cc6-c46f-467a-b890-fa8e86a38e25.e1-us-east-azure.choreoapps.dev`

## Overview

Audio Library is a MEAN stack application that allows users to:

- Upload and stream audio files (podcasts, audiobooks, music)
- Create profiles and follow other users
- Like, comment, and discover content
- Organize content by genres and privacy settings
- Admin dashboard for content management

## Architecture

- **Backend:** Node.js/Express API with MongoDB
- **Frontend:** Angular (Coming Soon)
- **Database:** MongoDB Atlas
- **Deployment:** WSO2 Choreo
- **Storage:** File-based with user organization

## Current Status

- ✅ **Server (Complete)** - Fully functional REST API with authentication, file upload, and social features
- 🚧 **Client (In Development)** - Angular frontend coming soon

## Repository Structure

```
audio-library/
├── server/          # Node.js/Express backend API
│   ├── config/      # Database and file upload configuration
│   ├── controllers/ # API business logic
│   ├── middlewares/ # Authentication and validation
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API endpoints
│   └── README.md    # Server documentation
└── client/          # Angular frontend (Coming Soon)
```

## Features

### User Management
- JWT authentication and authorization
- User profiles with profile pictures
- Follow/unfollow system
- Role-based access (User/Admin)

### Audio Features
- Upload audio files with cover images
- Stream audio with range request support
- Public/private content settings
- Genre categorization
- Like and comment system

### Social Features
- Following feed of user content
- Search and filter capabilities
- User interaction tracking
- Content discovery

### Admin Features
- System statistics and analytics
- User and content management
- Administrative controls

## Getting Started

### Server Setup

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
npm run dev
```

### Client Setup
Frontend development in progress. Check back soon for Angular application.

## API Documentation

The server provides a RESTful API with the following main endpoints:

- `/api/register` - User registration
- `/api/login` - User authentication  
- `/api/audio` - Audio content management
- `/api/profile` - User profile operations
- `/api/admin` - Administrative functions

Full API documentation available in the [server README](./server/README.md).

## Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Express-validator

**Frontend (Planned):**
- Angular
- TypeScript
- Angular Material UI
- RxJS for reactive programming

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Author

**Muhammad Abdelkader**  
GitHub: [@MuhammadAbdelkader](https://github.com/MuhammadAbdelkader)

## License

MIT
