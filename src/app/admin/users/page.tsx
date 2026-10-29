import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, isOwnerRole } from "@/lib/access-control";
import { accessStatus } from "@/lib/admin-user";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdminRole(session.user.role)) {
    redirect("/admin");
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [users, adminCount, newThisMonth] = await Promise.all([
    prisma.user.findMany({
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
    }),
    prisma.user.count({
      where: { role: { in: ["ADMIN", "OWNER"] } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: firstOfMonth } },
    }),
  ]);

  return (
    <AdminUsersClient
      initialUsers={users.map(({ paidAt, stripeCheckoutSessionId, ...user }) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        access: accessStatus({ role: user.role, paidAt, stripeCheckoutSessionId }),
      }))}
      canManageRoles={isOwnerRole(session.user.role)}
      stats={{
        total: users.length,
        admins: adminCount,
        newThisMonth,
      }}
    />
  );
}
