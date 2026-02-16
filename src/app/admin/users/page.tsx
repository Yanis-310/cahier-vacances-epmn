import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isOwnerRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!isOwnerRole(session.user.role)) {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <AdminUsersClient
      initialUsers={users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }))}
    />
  );
}
