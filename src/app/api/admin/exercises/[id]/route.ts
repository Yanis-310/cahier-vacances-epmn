import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireAdmin } from "@/lib/access-control";
import { parseUpdateExercisePayload } from "@/lib/admin-exercise";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.exercise.findUnique({
      where: { id },
      select: { id: true, type: true, content: true, answers: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
    }

    let payload;
    try {
      payload = parseUpdateExercisePayload(body, {
        type: existing.type,
        content: existing.content,
        answers: existing.answers,
      });
    } catch {
      return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        number: true,
        title: true,
        type: true,
        isActive: true,
        content: true,
        answers: true,
      },
    });

    revalidatePath("/exercises");
    revalidatePath("/evaluation");
    revalidatePath("/admin");

    return NextResponse.json({ exercise: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Le numero d'exercice existe deja." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const source = await prisma.exercise.findUnique({
      where: { id },
      select: {
        number: true,
        title: true,
        type: true,
        isActive: true,
        content: true,
        answers: true,
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
    }

    const maxNumberRow = await prisma.exercise.findFirst({
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const nextNumber = (maxNumberRow?.number ?? 0) + 1;

    const duplicated = await prisma.exercise.create({
      data: {
        number: nextNumber,
        title: `${source.title} (copie)`,
        type: source.type,
        isActive: source.isActive,
        content: (source.content ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        answers: (source.answers ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        number: true,
        title: true,
        type: true,
        isActive: true,
        content: true,
        answers: true,
      },
    });

    revalidatePath("/exercises");
    revalidatePath("/evaluation");
    revalidatePath("/admin");

    return NextResponse.json({ exercise: duplicated }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
