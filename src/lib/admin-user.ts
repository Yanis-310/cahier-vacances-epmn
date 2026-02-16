import { UserRole } from "@prisma/client";
import { z } from "zod";

const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

export function parseRoleUpdatePayload(input: unknown) {
  return roleUpdateSchema.parse(input);
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
