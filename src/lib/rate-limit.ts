type Bucket = {
  count: number;
  resetAt: number;
};

type LimitOptions = {
  max: number;
  windowMs: number;
};

const bucketsByScope = new Map<string, Map<string, Bucket>>();

function getScope(scope: string): Map<string, Bucket> {
  const existing = bucketsByScope.get(scope);
  if (existing) return existing;
  const created = new Map<string, Bucket>();
  bucketsByScope.set(scope, created);
  return created;
}

function cleanupExpiredBuckets(scopeBuckets: Map<string, Bucket>, now: number) {
  for (const [key, bucket] of scopeBuckets.entries()) {
    if (bucket.resetAt <= now) {
      scopeBuckets.delete(key);
    }
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function limitRate(scope: string, key: string, options: LimitOptions) {
  const now = Date.now();
  const scopeBuckets = getScope(scope);
  cleanupExpiredBuckets(scopeBuckets, now);

  const bucket = scopeBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    scopeBuckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, options.max - 1),
      resetAt: now + options.windowMs,
    };
  }

  bucket.count += 1;

  if (bucket.count > options.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, options.max - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function retryAfterSeconds(resetAt: number) {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function getRateLimitOptionsFromEnv(
  prefix: string,
  defaults: LimitOptions
): LimitOptions {
  const max = parsePositiveInt(process.env[`${prefix}_MAX`]) ?? defaults.max;
  const windowMs =
    parsePositiveInt(process.env[`${prefix}_WINDOW_MS`]) ?? defaults.windowMs;

  return { max, windowMs };
}

export function logRateLimitExceeded(
  scope: string,
  key: string,
  resetAt: number
) {
  const resetAtIso = new Date(resetAt).toISOString();
  console.warn(
    `[security][rate-limit] blocked scope=${scope} key=${key} resetAt=${resetAtIso}`
  );
}
