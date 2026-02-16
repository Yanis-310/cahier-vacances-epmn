import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isOwnerRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
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
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-4">
        <Link
          href="/admin"
          className="inline-flex items-center rounded-lg border border-foreground/20 px-3 py-2 text-sm hover:bg-foreground/5"
        >
          Retour admin exercices
        </Link>
        <AdminUsersClient
          initialUsers={users.map((user) => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
          }))}
        />
      </main>
    </>
  );
}
