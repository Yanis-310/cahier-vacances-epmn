import { NextResponse } from "next/server";
import { AuthorizationError, requireAdmin } from "@/lib/access-control";

export async function GET() {
  try {
    const session = await requireAdmin();
    return NextResponse.json({
      ok: true,
      userId: session.user?.id,
      role: session.user?.role,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
