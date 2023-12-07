import Redis from "ioredis";

const redis = new Redis(
  "redis://default:845167ecc98b43c29fb188fb9e832600@us1-harmless-oriole-41192.upstash.io:41192"
);

export { redis };
