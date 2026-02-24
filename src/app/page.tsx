import Link from "next/link";
import Navbar from "@/components/Navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientGreeting from "@/components/ClientGreeting";

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    return <Dashboard userId={session.user.id} userName={session.user.name || "Utilisateur"} />;
  }

  return <Landing />;
}

async function Dashboard({ userId, userName }: { userId: string; userName: string }) {
  const [progressList, exerciseCount, lastEvaluation, lastProgress] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId, completed: true },
      orderBy: { updatedAt: "desc" },
      select: { exerciseId: true, updatedAt: true },
    }),
    prisma.exercise.count(),
    prisma.evaluation.findFirst({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      select: { score: true, total: true, completedAt: true },
    }),
    prisma.userProgress.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { exercise: { select: { number: true, title: true, id: true } } },
    }),
  ]);

  const completedCount = progressList.length;

  const progressPercent = exerciseCount > 0 ? Math.round((completedCount / exerciseCount) * 100) : 0;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero — mirrors Landing structure */}
        <section className="hero-landing">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-40 text-center">
            <ClientGreeting />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {userName}
            </h1>
            <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto mb-10">
              Poursuivez votre parcours de médiation professionnelle, à votre rythme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={lastProgress ? `/exercises/${lastProgress.exercise.id}` : "/exercises"}
                className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-light transition-colors"
              >
                {lastProgress ? "Reprendre les exercices" : "Commencer les exercices"}
              </Link>
              <Link
                href="/evaluation"
                className="border-2 border-primary text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-pale transition-colors"
              >
                Mode évaluation
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards — same 3-column grid as Landing */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Progress Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Votre progression</h3>
              <p className="text-foreground/60 mb-4">
                {completedCount} exercice{completedCount !== 1 ? "s" : ""} complété{completedCount !== 1 ? "s" : ""} sur {exerciseCount}.
              </p>
              {/* Progress bar */}
              <div className="w-full bg-foreground/5 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-foreground/40 mt-2">{progressPercent}% complété</p>
            </div>

            {/* Exercises Card */}
            <Link
              href={lastProgress ? `/exercises/${lastProgress.exercise.id}` : "/exercises"}
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {lastProgress ? "Continuer les exercices" : "30 exercices"}
              </h3>
              <p className="text-foreground/60">
                {lastProgress
                  ? `Exercice ${lastProgress.exercise.number} — ${lastProgress.exercise.title}`
                  : "Des exercices variés couvrant tous les fondamentaux de la médiation professionnelle."
                }
              </p>
            </Link>

            {/* Evaluation Card */}
            <Link
              href="/evaluation"
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mode évaluation</h3>
              <p className="text-foreground/60">
                {lastEvaluation
                  ? `Dernière note : ${Math.round(((lastEvaluation.score || 0) / lastEvaluation.total) * 100)}% — Testez-vous à nouveau.`
                  : "Testez-vous avec des évaluations aléatoires de 20 questions et suivez votre progression."
                }
              </p>
            </Link>
          </div>
        </section>

        {/* Footer — mirrors Landing */}
        <footer className="bg-white border-t border-foreground/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-foreground/40">
            © {new Date().getFullYear()} EPMN — École Professionnelle de la
            Médiation et de la Négociation
          </div>
        </footer>
      </main>
    </>
  );
}

function Landing() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero-landing">
          {/* Hero content */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 sm:pt-32 sm:pb-52 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: '#F2C073' }}>
              Cahier de Vacances des Médiateurs Professionnels
            </h1>
            <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto mb-10">
              Révisez et approfondissez vos connaissances en médiation
              professionnelle grâce à des exercices interactifs, à votre rythme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-solar-primary px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block text-center"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="btn-solar-outline px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block text-center"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ backgroundColor: '#FCF4E8' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 — Progression */}
              <div className="bg-white rounded-xl p-8 shadow-sm relative overflow-hidden">
                <img src="/icons/solar/plante4 1.png" alt="" className="absolute -top-3 -right-3 w-28 h-28 object-contain pointer-events-none" />
                <div className="mb-4">
                  <img src="/icons/solar/icone progression 1.png" alt="Progression" className="w-16 h-16 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">30 exercices</h3>
                <p className="text-foreground/60">
                  Des exercices variés couvrant tous les fondamentaux de la
                  médiation professionnelle.
                </p>
              </div>

              {/* Card 2 — Exercices */}
              <div className="bg-white rounded-xl p-8 shadow-sm relative overflow-hidden">
                <img src="/icons/solar/plante4 1.png" alt="" className="absolute -top-3 -right-3 w-28 h-28 object-contain pointer-events-none" />
                <div className="mb-4">
                  <img src="/icons/solar/icones exercices 1.png" alt="Exercices" className="w-16 h-16 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mode évaluation</h3>
                <p className="text-foreground/60">
                  Testez-vous avec des évaluations aléatoires de 20 questions et suivez
                  votre progression.
                </p>
              </div>

              {/* Card 3 — Évaluation */}
              <div className="bg-white rounded-xl p-8 shadow-sm relative overflow-hidden">
                <img src="/icons/solar/plante4 1.png" alt="" className="absolute -top-3 -right-3 w-28 h-28 object-contain pointer-events-none" />
                <div className="mb-4">
                  <img src="/icons/solar/icone validation 3.png" alt="Validation" className="w-16 h-16 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sauvegarde automatique</h3>
                <p className="text-foreground/60">
                  Votre progression est sauvegardée automatiquement. Reprenez où vous
                  en étiez, à tout moment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-foreground/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-foreground/40">
            © {new Date().getFullYear()} EPMN — École Professionnelle de la
            Médiation et de la Négociation
          </div>
        </footer>
      </main>
    </>
  );
}
