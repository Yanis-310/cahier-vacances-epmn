import type { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "OWNER"];

type SessionRoleShape = {
  user?: {
    id?: string | null;
    role?: UserRole | null;
  };
};

export class AuthorizationError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.status = status;
    this.name = "AuthorizationError";
  }
}

export function isAdminRole(role: UserRole | null | undefined) {
  return !!role && ADMIN_ROLES.includes(role);
}

export function isOwnerRole(role: UserRole | null | undefined) {
  return role === "OWNER";
}

export async function requireAdmin() {
  const session = (await auth()) as SessionRoleShape | null;
  if (!session?.user?.id) {
    throw new AuthorizationError(401, "Unauthorized");
  }
  if (!isAdminRole(session.user.role)) {
    throw new AuthorizationError(403, "Forbidden");
  }
  return session;
}

export async function requireOwner() {
  const session = (await auth()) as SessionRoleShape | null;
  if (!session?.user?.id) {
    throw new AuthorizationError(401, "Unauthorized");
  }
  if (!isOwnerRole(session.user.role)) {
    throw new AuthorizationError(403, "Forbidden");
  }
  return session;
}
