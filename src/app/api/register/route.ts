import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleRegister } from "@/lib/api-register";
import {
  getClientIp,
  getRateLimitOptionsFromEnv,
  limitRate,
  logRateLimitExceeded,
  retryAfterSeconds,
} from "@/lib/rate-limit";

const REGISTER_RATE_LIMIT = getRateLimitOptionsFromEnv("REGISTER_RATE_LIMIT", {
  max: 5,
  windowMs: 10 * 60 * 1000,
});

export async function POST(request: Request) {
  const rateKey = getClientIp(request);
  const rate = limitRate("register", rateKey, REGISTER_RATE_LIMIT);
  if (!rate.allowed) {
    logRateLimitExceeded("register", rateKey, rate.resetAt);
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds(rate.resetAt)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await handleRegister(body, {
    hashPassword: (password) => bcrypt.hash(password, 10),
    createUser: async (data) => {
      await prisma.user.create({ data });
    },
  });

  return NextResponse.json(result.body, { status: result.status });
}
