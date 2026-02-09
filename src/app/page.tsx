import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Cahier de Vacances des{" "}
              <span className="text-primary">Médiateurs Professionnels</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto mb-10">
              Révisez et approfondissez vos connaissances en médiation
              professionnelle grâce à des exercices interactifs, à votre rythme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-light transition-colors"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="border-2 border-primary text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-pale transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">30 exercices</h3>
              <p className="text-foreground/60">
                Des exercices variés couvrant tous les fondamentaux de la
                médiation professionnelle.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mode évaluation</h3>
              <p className="text-foreground/60">
                Testez-vous avec des évaluations aléatoires de 20 à 25
                questions et suivez votre progression.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Sauvegarde automatique
              </h3>
              <p className="text-foreground/60">
                Votre progression est sauvegardée automatiquement. Reprenez où
                vous en étiez, à tout moment.
              </p>
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
