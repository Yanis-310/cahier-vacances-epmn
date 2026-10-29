import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireAdmin } from "@/lib/access-control";
import { accessStatus } from "@/lib/admin-user";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        paidAt: true,
        stripeCheckoutSessionId: true,
      },
    });

    return NextResponse.json({
      users: users.map(({ paidAt, stripeCheckoutSessionId, ...user }) => ({
        ...user,
        access: accessStatus({ role: user.role, paidAt, stripeCheckoutSessionId }),
      })),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
