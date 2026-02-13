import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.",
    }),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides." },
      { status: 400 }
    );
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    // Handle unique constraint violation (race condition on email)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà." },
        { status: 409 }
      );
    }
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
