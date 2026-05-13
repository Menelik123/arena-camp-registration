import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

export async function saveRegistration(id: string, data: unknown) {
  const r = getRedis();
  // TTL of 2 hours — enough time to complete payment
  await r.set(`reg:${id}`, JSON.stringify(data), { ex: 7200 });
}

export async function getRegistration(id: string) {
  const r = getRedis();
  const raw = await r.get(`reg:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function deleteRegistration(id: string) {
  const r = getRedis();
  await r.del(`reg:${id}`);
}
