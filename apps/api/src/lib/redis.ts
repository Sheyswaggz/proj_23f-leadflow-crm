import Redis from 'ioredis';

const redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

export async function blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
  await redis.setex('bl:' + token, expiresInSeconds, '1');
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  return (await redis.get('bl:' + token)) === '1';
}

export default redis;
