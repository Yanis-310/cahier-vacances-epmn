import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TexteCahierView from "@/components/TexteCahierView";
import { PREAMBULE, PREAMBULE_RETOURS } from "@/content/cahier-textes";

export default async function PreambulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.hasAccess) redirect("/paiement");

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-12" style={{ backgroundColor: "#FCF4E8" }}>
        <article
          className="bg-white rounded-xl shadow-sm p-6 sm:p-10 w-full max-w-2xl mx-auto"
          style={{ border: "1.5px solid #F2C073" }}
        >
          <div className="mb-6 text-right">
            <Link href="/exercises" className="text-sm font-semibold hover:underline" style={{ color: "#F2C073" }}>
              Passer directement aux exercices →
            </Link>
          </div>

          <TexteCahierView texte={PREAMBULE} />

          <div className="mt-8 flex justify-center">
            <Link
              href="/exercises"
              className="btn-solar-primary px-6 py-3 rounded-lg font-medium text-center"
            >
              Commencer les exercices
            </Link>
          </div>

          <aside className="mt-10 rounded-lg p-5 text-sm leading-relaxed" style={{ backgroundColor: "#FCF4E8" }}>
            <h2 className="font-semibold text-foreground mb-2">{PREAMBULE_RETOURS.heading}</h2>
            <p className="text-foreground/75">
              {PREAMBULE_RETOURS.before}{" "}
              <a
                href={`mailto:${PREAMBULE_RETOURS.email}`}
                className="font-semibold underline break-all"
                style={{ color: "#c98f2e" }}
              >
                {PREAMBULE_RETOURS.email}
              </a>
            </p>
            <p className="text-foreground/75 mt-2">{PREAMBULE_RETOURS.after}</p>
          </aside>
        </article>
      </main>
    </>
  );
}
