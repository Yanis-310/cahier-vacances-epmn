import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireAdmin } from "@/lib/access-control";
import { parseCreateExercisePayload } from "@/lib/admin-exercise";

export async function GET() {
  try {
    await requireAdmin();
    const exercises = await prisma.exercise.findMany({
      orderBy: { number: "asc" },
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
    return NextResponse.json({ exercises });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
    }

    let payload;
    try {
      payload = parseCreateExercisePayload(body);
    } catch {
      return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
    }

    const created = await prisma.exercise.create({
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

    return NextResponse.json({ exercise: created }, { status: 201 });
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
