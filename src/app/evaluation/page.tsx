import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StartButton from "./StartButton";

export default async function EvaluationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const evaluations = await prisma.evaluation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const completed = evaluations.filter((e) => e.completedAt);
  const inProgress = evaluations.find((e) => !e.completedAt);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <Link
            href="/exercises"
            className="text-sm text-foreground/40 hover:text-primary transition-colors"
          >
            ← Retour aux exercices
          </Link>
          <h1 className="text-3xl font-bold mt-3">Mode Évaluation</h1>
          <p className="text-foreground/60 mt-2 max-w-xl">
            Testez vos connaissances avec une évaluation de 20 questions tirées
            aléatoirement parmi les exercices du cahier. Chaque évaluation est
            unique.
          </p>
        </div>

        {/* Start or resume */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Nouvelle évaluation</h2>
              <p className="text-sm text-foreground/50 mt-1">
                20 questions — tous types confondus
              </p>
            </div>
            <div className="flex gap-3">
              {inProgress && (
                <Link
                  href={`/evaluation/${inProgress.id}`}
                  className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary-pale transition-colors"
                >
                  Reprendre
                </Link>
              )}
              <StartButton />
            </div>
          </div>
        </div>

        {/* History */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Historique ({completed.length} tentative
              {completed.length > 1 ? "s" : ""})
            </h2>
            <div className="space-y-2">
              {completed.map((ev) => {
                const pct = ev.total > 0 ? Math.round((ev.score! / ev.total) * 100) : 0;
                const color =
                  pct >= 75
                    ? "text-success"
                    : pct >= 50
                    ? "text-warning"
                    : "text-error";

                return (
                  <Link
                    key={ev.id}
                    href={`/evaluation/${ev.id}/result`}
                    className="flex items-center justify-between bg-white rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <span className="font-medium group-hover:text-primary transition-colors">
                        Évaluation du{" "}
                        {new Date(ev.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${color}`}>
                        {ev.score}/{ev.total}
                      </span>
                      <span className={`text-sm ${color}`}>{pct}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {completed.length === 0 && (
          <p className="text-center text-foreground/40 py-8">
            Aucune évaluation terminée pour le moment.
          </p>
        )}
      </main>
    </>
  );
}
