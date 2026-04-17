import Redis from "ioredis";

// Graceful fallback Redis Client
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1, // Fail fast if offline
  retryStrategy(times) {
    if (times > 3) {
      console.warn("Redis connection failed. Falling back to non-cached mode.");
      return null; // Stop retrying
    }
    return Math.min(times * 50, 2000);
  }
});

redis.on("error", (err) => {
  console.warn("Redis Error:", err.message);
});

redis.on("connect", () => {
  console.log("Redis Connected Successfully");
});

export const getCache = async (key) => {
  if (redis.status !== "ready") return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const setCache = async (key, value, ttl = 3600) => {
  if (redis.status !== "ready") return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (err) {
    console.warn("Failed to set cache:", err.message);
  }
};

export const deleteCache = async (key) => {
  if (redis.status !== "ready") return;
  try {
    await redis.del(key);
  } catch (err) {
    console.warn("Failed to delete cache:", err.message);
  }
};
