import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Le mot de passe doit contenir une majuscule.",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Le mot de passe doit contenir un caractère spécial.",
    }),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Ce lien est invalide ou a expiré." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  return NextResponse.json({ success: true });
}
