import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import {
  getClientIp,
  getRateLimitOptionsFromEnv,
  limitRate,
  logRateLimitExceeded,
  retryAfterSeconds,
} from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

const FORGOT_PASSWORD_RATE_LIMIT = getRateLimitOptionsFromEnv(
  "FORGOT_PASSWORD_RATE_LIMIT",
  {
    max: 5,
    windowMs: 15 * 60 * 1000,
  }
);

export async function POST(request: Request) {
  const rateKey = getClientIp(request);
  const rate = limitRate("forgot-password", rateKey, FORGOT_PASSWORD_RATE_LIMIT);
  if (!rate.allowed) {
    logRateLimitExceeded("forgot-password", rateKey, rate.resetAt);
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez plus tard." },
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Delete any existing tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        await sendPasswordResetEmail(email, resetUrl);
      } catch (err) {
        console.error("Failed to send reset email:", err);
      }
    }
  } catch (err) {
    console.error("Forgot password error:", err);
  }

  // Always return success to avoid leaking whether the email exists
  return NextResponse.json({ success: true });
}
