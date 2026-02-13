import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { handleProfileUpdate } from "@/lib/api-profile";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await handleProfileUpdate(body, session.user.id, {
    findUserById: (userId) =>
      prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      }),
    comparePassword: bcrypt.compare,
    hashPassword: (password) => bcrypt.hash(password, 10),
    updateUser: async (userId, data) => {
      await prisma.user.update({
        where: { id: userId },
        data,
      });
    },
  });

  return NextResponse.json(result.body, { status: result.status });
}
