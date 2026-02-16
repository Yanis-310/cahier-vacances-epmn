import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  getClientIp,
  getRateLimitOptionsFromEnv,
  limitRate,
  logRateLimitExceeded,
  retryAfterSeconds,
} from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres.")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Le mot de passe doit contenir une majuscule.",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Le mot de passe doit contenir un caractere special.",
    }),
});

const RESET_PASSWORD_RATE_LIMIT = getRateLimitOptionsFromEnv(
  "RESET_PASSWORD_RATE_LIMIT",
  {
    max: 5,
    windowMs: 15 * 60 * 1000,
  }
);

export async function POST(request: Request) {
  const rateKey = getClientIp(request);
  const rate = limitRate("reset-password", rateKey, RESET_PASSWORD_RATE_LIMIT);
  if (!rate.allowed) {
    logRateLimitExceeded("reset-password", rateKey, rate.resetAt);
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez plus tard." },
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
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const { token, password } = parsed.data;

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      if (resetToken) {
        await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      }
      return NextResponse.json(
        { error: "Ce lien est invalide ou a expire." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}