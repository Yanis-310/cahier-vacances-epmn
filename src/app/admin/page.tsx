import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isAdminRole, isOwnerRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AdminExercisesClient from "./AdminExercisesClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

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

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {isOwnerRole(session.user.role) && (
          <div className="mb-4">
            <Link
              href="/admin/users"
              className="inline-flex items-center rounded-lg border border-foreground/20 px-3 py-2 text-sm hover:bg-foreground/5"
            >
              Gerer les utilisateurs admin
            </Link>
          </div>
        )}
        <AdminExercisesClient initialExercises={exercises} />
      </main>
    </>
  );
}
