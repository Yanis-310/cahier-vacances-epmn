import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import AnalyticsClient from "./AnalyticsClient";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, exercises, progressRecords, evaluationCount, evaluationAvg] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.exercise.findMany({
        where: { isActive: true },
        orderBy: { number: "asc" },
        select: { id: true, number: true, title: true, type: true },
      }),
      prisma.userProgress.findMany({
        where: { updatedAt: { gte: thirtyDaysAgo }, completed: true },
        select: {
          userId: true,
          exerciseId: true,
          score: true,
          updatedAt: true,
        },
      }),
      prisma.evaluation.count({ where: { completedAt: { not: null } } }),
      prisma.evaluation.aggregate({
        where: { completedAt: { not: null } },
        _avg: { score: true },
      }),
    ]);

  // Active users
  const activeUserIds = new Set(progressRecords.map((p) => p.userId));

  // Activity by day
  const activityMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    activityMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of progressRecords) {
    const day = p.updatedAt.toISOString().slice(0, 10);
    if (activityMap.has(day)) {
      activityMap.set(day, (activityMap.get(day) ?? 0) + 1);
    }
  }
  const activity = Array.from(activityMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Per-exercise stats
  const exerciseStats = exercises.map((ex) => {
    const exProgress = progressRecords.filter((p) => p.exerciseId === ex.id);
    const scores = exProgress
      .map((p) => p.score)
      .filter((s): s is number => s !== null);
    return {
      id: ex.id,
      number: ex.number,
      title: ex.title,
      type: ex.type,
      completedCount: exProgress.length,
      averageScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
    };
  });

  const data = {
    users: { total: totalUsers, active: activeUserIds.size },
    evaluations: {
      total: evaluationCount,
      averageScore: evaluationAvg._avg.score
        ? Math.round(evaluationAvg._avg.score)
        : null,
    },
    exercises: exerciseStats,
    activity,
    totalUsers,
  };

  return <AnalyticsClient data={data} />;
}
