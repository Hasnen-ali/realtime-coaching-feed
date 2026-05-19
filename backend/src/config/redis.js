import { createClient } from 'redis';
import { env } from './env.js';

let client;
let ready = false;
let warnedUnavailable = false;

const warnRedisUnavailable = (message) => {
  if (warnedUnavailable) return;
  warnedUnavailable = true;
  console.warn('Redis unavailable, continuing without cache:', message);
};

export const connectRedis = async () => {
  client = createClient({
    url: env.redisUrl,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: () => false
    }
  });

  client.on('ready', () => {
    ready = true;
    console.log('Redis connected');
  });

  client.on('end', () => {
    ready = false;
  });

  client.on('error', (error) => {
    ready = false;
    warnRedisUnavailable(error.message);
  });

  try {
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Redis connection timed out')), 1500);
      })
    ]);
  } catch (error) {
    ready = false;
    warnRedisUnavailable(error.message);

    if (client?.isOpen) {
      await client.disconnect();
    }
  }
};

export const isRedisReady = () => ready && client?.isReady;

export const redisGetJson = async (key) => {
  if (!isRedisReady()) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(`Redis read failed for ${key}:`, error.message);
    return null;
  }
};

export const redisSetJson = async (key, value, ttlSeconds) => {
  if (!isRedisReady()) return;

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.warn(`Redis write failed for ${key}:`, error.message);
  }
};

export const redisDel = async (key) => {
  if (!isRedisReady()) return;

  try {
    await client.del(key);
  } catch (error) {
    console.warn(`Redis delete failed for ${key}:`, error.message);
  }
};

export const closeRedis = async () => {
  if (client?.isOpen) {
    await client.quit();
  }
};
