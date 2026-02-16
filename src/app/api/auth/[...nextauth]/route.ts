import { handlers } from "@/lib/auth";
import {
  getClientIp,
  getRateLimitOptionsFromEnv,
  limitRate,
  logRateLimitExceeded,
  retryAfterSeconds,
} from "@/lib/rate-limit";

const LOGIN_RATE_LIMIT = getRateLimitOptionsFromEnv("LOGIN_RATE_LIMIT", {
  max: 5,
  windowMs: 10 * 60 * 1000,
});

function normalizeEmail(value: string | null) {
  return (value ?? "").trim().toLowerCase();
}

async function readEmailFromRequest(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";
  const cloned = request.clone();

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const bodyText = await cloned.text();
      const params = new URLSearchParams(bodyText);
      return normalizeEmail(params.get("email"));
    }

    if (contentType.includes("application/json")) {
      const parsed = (await cloned.json()) as { email?: unknown };
      return normalizeEmail(typeof parsed.email === "string" ? parsed.email : "");
    }
  } catch {
    return "";
  }

  return "";
}

function tooManyRequestsResponse(resetAt: number) {
  return new Response(
    JSON.stringify({ error: "Trop de tentatives de connexion. Réessayez plus tard." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds(resetAt)),
      },
    }
  );
}

export const { GET } = handlers;

export async function POST(request: Request) {
  const pathname = new URL(request.url).pathname;

  if (pathname.endsWith("/callback/credentials")) {
    const ip = getClientIp(request);
    const email = await readEmailFromRequest(request);
    const key = `${ip}:${email || "unknown"}`;
    const rate = limitRate("login", key, LOGIN_RATE_LIMIT);

    if (!rate.allowed) {
      logRateLimitExceeded("login", key, rate.resetAt);
      return tooManyRequestsResponse(rate.resetAt);
    }
  }

  return handlers.POST(request as Parameters<typeof handlers.POST>[0]);
}
