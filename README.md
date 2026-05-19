# Realtime Coaching Feed

A production-minded full-stack realtime coaching feed built with Node.js, Express, MongoDB, Redis, Socket.IO, Next.js, and Tailwind CSS.

## Folder Structure

```txt
realtime-coaching-feed/
  backend/
    src/
      config/          MongoDB, Redis, and environment setup
      controllers/     REST controller logic
      middleware/      Validation and error middleware
      models/          Mongoose models
      routes/          Express routes
      sockets/         Socket.IO registration and emit helpers
      utils/           Shared constants
      validators/      Zod request schemas
      app.js
      server.js
    .env.example
    package.json
  frontend/
    app/               Next.js app routes
      admin/           Admin publisher page
      page.jsx         Home realtime feed page
    components/        Reusable UI components
    lib/               API and socket clients
    .env.local.example
    package.json
  package.json
  README.md
```

## Installation

```bash
cd realtime-coaching-feed
npm install
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Start MongoDB and Redis locally, or update the environment files with hosted URLs.

Run both apps:

```bash
npm run dev
```

Open:

- Home feed: http://localhost:3000
- Admin page: http://localhost:3000/admin
- API health: http://localhost:5000/health

## Backend Environment

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

## Frontend Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## API

### `GET /feed`

Returns all feed items newest first.

```json
{
  "source": "cache",
  "data": [
    {
      "_id": "665f...",
      "title": "Practice update",
      "description": "Focus on transition speed today.",
      "createdAt": "2026-05-19T08:30:00.000Z"
    }
  ]
}
```

### `POST /feed`

Creates a feed item, clears the Redis cache, and broadcasts a realtime update.

```json
{
  "title": "Practice update",
  "description": "Focus on transition speed today.",
  "clientRequestId": "optional-client-generated-id"
}
```

## Redis Caching Flow

1. The home page calls `GET /feed`.
2. The backend first checks Redis using the `feeds:all:v1` cache key.
3. On a cache hit, the API returns the cached feed list immediately.
4. On a cache miss, the API reads MongoDB, sorts by `createdAt` descending, stores the result in Redis with a TTL, and returns it.
5. When `POST /feed` creates a new feed, the backend deletes the Redis key. The next `GET /feed` rebuilds the cache from MongoDB.
6. If Redis is down, the app logs a warning and continues serving from MongoDB.

## Socket.IO Realtime Flow

1. The browser creates one shared Socket.IO client with reconnect enabled.
2. Clients listen for `feed:created`.
3. Admin submissions go through `POST /feed`; the server emits `feed:created` only after MongoDB confirms the write.
4. The home page merges incoming feeds by MongoDB `_id`, which prevents duplicate realtime items.
5. On connect or reconnect, the home page silently refetches `GET /feed` to reconcile anything missed while offline.
6. Socket event listeners are removed during React cleanup to prevent duplicate handlers in development and route transitions.

## Production Notes

- Set `CLIENT_ORIGIN` to the deployed frontend URL.
- Use MongoDB Atlas or a managed MongoDB cluster for production.
- Use a managed Redis service with persistence and monitoring.
- Keep `FEED_CACHE_TTL_SECONDS` short for highly active feeds.
- Run the backend behind a reverse proxy or platform load balancer.
- For multiple backend instances, configure a Socket.IO Redis adapter so websocket broadcasts reach clients connected to any instance.
- Add authentication to `/admin` and `POST /feed` before exposing this publicly.

## Useful Commands

```bash
npm run dev:backend
npm run dev:frontend
npm run start --workspace backend
npm run build --workspace frontend
```
