import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireOwner } from "@/lib/access-control";
import { canUpdateRole, parseRoleUpdatePayload } from "@/lib/admin-user";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOwner();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
    }

    let payload: { role: "ADMIN" | "USER" };
    try {
      payload = parseRoleUpdatePayload(body);
    } catch {
      return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true, email: true, createdAt: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const check = canUpdateRole({
      actorId: session.user?.id ?? "",
      targetId: target.id,
      targetRole: target.role,
    });
    if (!check.allowed) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { role: payload.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
