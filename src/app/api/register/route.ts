import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleRegister } from "@/lib/api-register";

export async function POST(request: Request) {
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
