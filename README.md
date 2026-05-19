# Realtime Coaching Feed

A full-stack realtime coaching feed application where an admin can publish coaching updates and all connected users see them instantly without refreshing the page.

This project demonstrates practical backend engineering, realtime communication, caching, database modeling, API design, and a responsive modern frontend.

## Project Highlights

- Realtime feed updates using Socket.IO
- Admin page to publish new coaching updates
- Home page that displays newest updates first
- MongoDB database with Mongoose schema modeling
- Redis caching for faster feed reads
- Graceful fallback when Redis is unavailable
- Duplicate feed prevention on realtime updates
- Socket reconnect handling with automatic feed sync
- Optimistic UI on admin submissions
- Responsive UI built with Next.js and Tailwind CSS
- Clean backend structure using routes, controllers, models, middleware, config, and sockets
- Validation and error handling for production-style APIs

## Tech Stack

**Frontend**

- Next.js
- React
- Tailwind CSS
- Axios
- Socket.IO Client
- Day.js

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- Socket.IO
- Zod validation

## Pages

### Home Page

URL:

```txt
http://localhost:3000
```

The home page shows all coaching updates in realtime. New updates appear automatically at the top of the feed.

### Admin Page

URL:

```txt
http://localhost:3000/admin
```

The admin page allows an authorized user or coach to create a new feed item. Once submitted, the update is saved in MongoDB and broadcast instantly to all connected clients.

## How It Works

### Realtime Flow

1. A user opens the home page.
2. The frontend connects to the backend using Socket.IO.
3. The admin creates a new coaching update from the admin page.
4. The backend saves the update in MongoDB.
5. After the database write succeeds, the backend emits a `feed:created` event.
6. All connected clients receive the new feed item instantly.
7. The frontend merges the new item by MongoDB `_id` to prevent duplicates.
8. If the socket reconnects, the frontend silently refetches the feed to recover missed updates.

### Redis Caching Flow

1. The frontend calls `GET /feed`.
2. The backend checks Redis for cached feed data.
3. If cached data exists, it returns the feed quickly from Redis.
4. If cache is missing, the backend reads from MongoDB.
5. MongoDB results are saved back into Redis with a TTL.
6. When a new feed is created, the backend clears the Redis cache.
7. If Redis is unavailable, the app continues working directly from MongoDB.

## API Endpoints

### `GET /feed`

Returns all feed items, newest first.

Example response:

```json
{
  "source": "database",
  "data": [
    {
      "_id": "665f1234567890",
      "title": "Practice update",
      "description": "Focus on quick transitions and communication today.",
      "createdAt": "2026-05-19T08:30:00.000Z"
    }
  ]
}
```

### `POST /feed`

Creates a new feed item.

Example body:

```json
{
  "title": "Practice update",
  "description": "Focus on quick transitions and communication today."
}
```

## Database Schema

```js
Feed {
  title: String,
  description: String,
  createdAt: Date
}
```

## Folder Structure

```txt
realtime-coaching-feed/
  backend/
    src/
      config/          Database, Redis, and environment setup
      controllers/     API business logic
      middleware/      Error handling and validation middleware
      models/          Mongoose models
      routes/          Express route definitions
      sockets/         Socket.IO logic
      utils/           Shared constants
      validators/      Request validation schemas
      app.js           Express app setup
      server.js        HTTP and Socket.IO server
    .env.example
    package.json
  frontend/
    app/
      admin/           Admin page
      page.jsx         Home feed page
    components/        Reusable UI components
    lib/               API and socket clients
    .env.local.example
    package.json
  package.json
  README.md
```

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Hasnen-ali/realtime-coaching-feed.git
cd realtime-coaching-feed
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Files

For backend:

```bash
cp backend/.env.example backend/.env
```

For frontend:

```bash
cp frontend/.env.local.example frontend/.env.local
```

On Windows PowerShell, you can use:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.local.example frontend\.env.local
```

### 4. Start MongoDB

Make sure MongoDB is running locally or update `backend/.env` with your MongoDB Atlas connection string.

Default local connection:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/coaching-feed
```

### 5. Start Redis

Redis is recommended for caching, but the app still works if Redis is not running.

Default local connection:

```env
REDIS_URL=redis://127.0.0.1:6379
```

### 6. Run the App

Run backend:

```bash
npm run dev --workspace backend
```

Run frontend in a second terminal:

```bash
npm run dev --workspace frontend
```

Or run both together:

```bash
npm run dev
```

## Environment Variables

### Backend

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/coaching-feed
REDIS_URL=redis://127.0.0.1:6379
FEED_CACHE_TTL_SECONDS=60
CLIENT_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Useful Commands

```bash
npm run dev
npm run dev --workspace backend
npm run dev --workspace frontend
npm run build --workspace frontend
npm run lint --workspace frontend
```

## Production Notes

- Protect the admin page with authentication before public deployment.
- Use MongoDB Atlas or another managed MongoDB service in production.
- Use a managed Redis service for reliable caching.
- Configure a Socket.IO Redis adapter when running multiple backend instances.
- Set `CLIENT_ORIGIN` to the deployed frontend URL.
- Keep `.env` files private and never commit production secrets.

## Author

Developed by [Hasnen Ali](https://github.com/Hasnen-ali).
