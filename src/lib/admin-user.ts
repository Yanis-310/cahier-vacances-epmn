import { UserRole } from "@prisma/client";
import { z } from "zod";

const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

export function parseRoleUpdatePayload(input: unknown) {
  return roleUpdateSchema.parse(input);
}

export type AccessStatus = "role" | "stripe" | "offered" | "none";

// "offered" = paidAt set by an admin, without a Stripe checkout session.
export function accessStatus(user: {
  role: UserRole;
  paidAt: Date | null;
  stripeCheckoutSessionId: string | null;
}): AccessStatus {
  if (user.role === "ADMIN" || user.role === "OWNER") return "role";
  if (!user.paidAt) return "none";
  return user.stripeCheckoutSessionId ? "stripe" : "offered";
}

const accessUpdateSchema = z.object({
  granted: z.boolean(),
});

interface AccessTarget {
  id: string;
  role: UserRole;
  paidAt: Date | null;
  stripeCheckoutSessionId: string | null;
}

interface AccessUpdateDeps {
  findUser: (userId: string) => Promise<AccessTarget | null>;
  setPaidAt: (userId: string, paidAt: Date | null) => Promise<AccessTarget>;
}

export async function handleAccessUpdate(
  body: unknown,
  targetId: string,
  deps: AccessUpdateDeps
): Promise<{ status: number; body: Record<string, unknown> }> {
  const parsed = accessUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Donnees invalides." } };
  }

  const target = await deps.findUser(targetId);
  if (!target) {
    return { status: 404, body: { error: "Utilisateur introuvable." } };
  }

  const current = accessStatus(target);
  if (current === "role") {
    return {
      status: 400,
      body: { error: "Les admins ont deja acces a tout le site." },
    };
  }

  if (parsed.data.granted) {
    if (current !== "none") {
      return { status: 200, body: { access: current } };
    }
    const updated = await deps.setPaidAt(target.id, new Date());
    return { status: 200, body: { access: accessStatus(updated) } };
  }

  if (current === "stripe") {
    return {
      status: 400,
      body: { error: "Impossible de retirer un acces paye par Stripe." },
    };
  }
  if (current === "none") {
    return { status: 200, body: { access: current } };
  }
  const updated = await deps.setPaidAt(target.id, null);
  return { status: 200, body: { access: accessStatus(updated) } };
}

export function canUpdateRole(params: {
  actorId: string;
  targetId: string;
  targetRole: UserRole;
}) {
  if (params.targetRole === "OWNER") {
    return { allowed: false, error: "Impossible de modifier un owner." } as const;
  }
  if (params.actorId === params.targetId) {
    return {
      allowed: false,
      error: "Vous ne pouvez pas modifier votre propre role.",
    } as const;
  }
  return { allowed: true } as const;
}
