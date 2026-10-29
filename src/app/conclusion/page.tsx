import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TexteCahierView from "@/components/TexteCahierView";
import { CONCLUSION } from "@/content/cahier-textes";

export default async function ConclusionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.hasAccess) redirect("/paiement");

  const [activeCount, completedCount] = await Promise.all([
    prisma.exercise.count({ where: { isActive: true } }),
    prisma.userProgress.count({
      where: { userId: session.user.id, completed: true, exercise: { isActive: true } },
    }),
  ]);
  const remaining = activeCount - completedCount;

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-12" style={{ backgroundColor: "#FCF4E8" }}>
        <article
          className="bg-white rounded-xl shadow-sm p-8 sm:p-10 w-full max-w-2xl mx-auto"
          style={{ border: "1.5px solid #F2C073" }}
        >
          {remaining > 0 ? (
            <>
              <h1 className="text-2xl font-bold mb-4" style={{ color: "#F2C073" }}>
                Encore un petit effort
              </h1>
              <p className="text-foreground/80">
                Il vous reste {remaining} exercice{remaining > 1 ? "s" : ""} à terminer avant
                de découvrir le mot de la fin.
              </p>
            </>
          ) : (
            <TexteCahierView texte={CONCLUSION} />
          )}
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/exercises"
              className="btn-solar-primary px-6 py-3 rounded-lg font-medium text-center"
            >
              Retour aux exercices
            </Link>
            <Link
              href="/evaluation"
              className="btn-solar-outline px-6 py-3 rounded-lg font-medium text-center"
            >
              Mode évaluation
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
