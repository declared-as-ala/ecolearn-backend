# EcoLearn Backend

Express.js API backend for EcoLearn educational platform.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecolearn
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

For production (MongoDB Atlas):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecolearn
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

### Development

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Seed Database

```bash
npm run seed
```

## Deployment on Vercel

1. Push code to GitHub repository
2. Import project in Vercel dashboard as a Node.js project
3. Add environment variables in Vercel:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `NODE_ENV` - Set to `production`
4. Deploy!

The project is configured with `vercel.json` for serverless function deployment.

### Important Notes for Vercel

- Vercel runs serverless functions, so persistent connections might need adjustment
- MongoDB connection should use connection pooling
- Environment variables must be set in Vercel dashboard

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses (filtered by grade level)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:courseId/video/watch` - Mark video as watched
- `POST /api/courses/:courseId/exercises/:exerciseId` - Submit exercise
- `POST /api/courses/:courseId/games/:gameId` - Submit game

### Users
- `PUT /api/users/grade-level` - Update student grade level
- `GET /api/users/progress` - Get user progress

## License

MIT
