/**
 * Optional Redis cache utility.
 * Gracefully degrades when REDIS_URI is not set (app works without cache).
 * Set REDIS_URI in .env to enable caching for production.
 */
let redisClient = null;

const initRedis = async () => {
    if (!process.env.REDIS_URI?.trim()) return null;
    try {
        const { createClient } = await import("redis");
        const client = createClient({ url: process.env.REDIS_URI.trim() });
        client.on("error", (err) => console.warn("Redis error:", err.message));
        await client.connect();
        return client;
    } catch (err) {
        console.warn("Redis not available (install 'redis' and set REDIS_URI):", err.message);
        return null;
    }
};

export const getCache = async () => {
    if (!redisClient) redisClient = await initRedis();
    return redisClient;
};

export const cacheGet = async (key) => {
    const client = await getCache();
    if (!client) return null;
    try {
        const val = await client.get(key);
        return val ? JSON.parse(val) : null;
    } catch {
        return null;
    }
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
    const client = await getCache();
    if (!client) return;
    try {
        await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch {
        // ignore
    }
};

export const cacheDel = async (key) => {
    const client = await getCache();
    if (!client) return;
    try {
        await client.del(key);
    } catch {
        // ignore
    }
};
