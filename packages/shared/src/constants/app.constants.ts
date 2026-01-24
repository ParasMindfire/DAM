export const APP_CONSTANTS = {
  JWT_EXPIRY: '7d',
  BCRYPT_ROUNDS: 10,
  REDIS_TTL: {
    SESSION: 60 * 60 * 24 * 7, // 7 days
    CACHE: 60 * 60, // 1 hour
  },
} as const;
