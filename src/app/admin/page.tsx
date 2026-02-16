import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
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

  const total = exercises.length;
  const active = exercises.filter((e) => e.isActive).length;
  const inactive = total - active;

  return (
    <AdminExercisesClient
      initialExercises={exercises}
      stats={{ total, active, inactive }}
    />
  );
}
