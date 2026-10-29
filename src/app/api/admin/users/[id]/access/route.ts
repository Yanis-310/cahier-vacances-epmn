import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireAdmin } from "@/lib/access-control";
import { handleAccessUpdate } from "@/lib/admin-user";

const accessSelect = {
  id: true,
  role: true,
  paidAt: true,
  stripeCheckoutSessionId: true,
} as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
    }

    const result = await handleAccessUpdate(body, id, {
      findUser: (userId) =>
        prisma.user.findUnique({ where: { id: userId }, select: accessSelect }),
      setPaidAt: (userId, paidAt) =>
        prisma.user.update({
          where: { id: userId },
          data: { paidAt },
          select: accessSelect,
        }),
    });

    if (result.status === 200) {
      revalidatePath("/admin/users");
    }
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
