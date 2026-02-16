import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireOwner } from "@/lib/access-control";

export async function GET() {
  try {
    await requireOwner();

    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
