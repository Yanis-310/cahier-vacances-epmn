import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Email invalide."),
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.",
    })
    .optional()
    .or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Données invalides.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { name, currentPassword, newPassword } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect." },
        { status: 400 }
      );
    }

    const updateData: { name: string; email: string; passwordHash?: string } = {
      name: name.trim(),
      email,
    };

    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, name: updateData.name, email });
  } catch (err) {
    // Handle unique constraint violation on email (race condition)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
