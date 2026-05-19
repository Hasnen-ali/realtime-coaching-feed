import { Feed } from '../models/Feed.js';
import { emitFeedCreated } from '../sockets/feedSocket.js';
import { FEED_CACHE_KEY } from '../utils/cacheKeys.js';
import { env } from '../config/env.js';
import { redisDel, redisGetJson, redisSetJson } from '../config/redis.js';

export const getFeeds = async (_req, res, next) => {
  try {
    const cachedFeeds = await redisGetJson(FEED_CACHE_KEY);

    if (cachedFeeds) {
      return res.json({
        source: 'cache',
        data: cachedFeeds
      });
    }

    const feeds = await Feed.find({})
      .sort({ createdAt: -1 })
      .lean();

    await redisSetJson(FEED_CACHE_KEY, feeds, env.feedCacheTtlSeconds);

    return res.json({
      source: 'database',
      data: feeds
    });
  } catch (error) {
    return next(error);
  }
};

export const createFeed = async (req, res, next) => {
  try {
    const { title, description, clientRequestId } = req.body;

    const feed = await Feed.create({ title, description });
    const payload = {
      ...feed.toObject(),
      clientRequestId
    };

    // Invalidate instead of mutating the list cache so concurrent writes cannot drift.
    await redisDel(FEED_CACHE_KEY);
    emitFeedCreated(payload);

    return res.status(201).json({
      message: 'Feed created',
      data: payload
    });
  } catch (error) {
    return next(error);
  }
};
