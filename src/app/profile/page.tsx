import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative" style={{ backgroundColor: "#FCF4E8" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative">
          {/* Section wrapper for decorative overflow */}
          <div className="relative">
            {/* Decorative sun - top-left corner */}
            <img
              src="/icons/solar/soleil2 1.png"
              alt=""
              className="absolute object-contain pointer-events-none z-20 hidden sm:block"
              style={{ top: "-42px", left: "-36px", width: "96px", height: "96px" }}
            />

            {/* Decorative hibiscus - top-right corner */}
            <img
              src="/icons/solar/fleur 1.png"
              alt=""
              className="absolute object-contain pointer-events-none z-30"
              style={{ top: "-70px", right: "-50px", width: "180px", height: "180px" }}
            />

            <section
              className="rounded-2xl border-2 bg-white shadow-sm relative overflow-hidden"
              style={{ borderColor: "#F2C073" }}
            >
              <div className="p-6 sm:p-8">
                <p
                  className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                  style={{ borderColor: "#F2C073", color: "#333" }}
                >
                  Espace personnel
                </p>
                <h1
                  className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{ color: "#F2C073" }}
                >
                  Mon profil
                </h1>
                <p className="mt-3 text-base leading-relaxed text-foreground/60 sm:text-lg">
                  Gérez vos informations et vos paramètres de compte.
                </p>
              </div>
            </section>
          </div>

          <section className="mt-8 relative">
            {/* Decorative palm tree - right side, profile area */}
            <img
              src="/icons/solar/palmiersurf 1.png"
              alt=""
              className="hidden lg:block absolute pointer-events-none z-10"
              style={{ top: "50%", right: "-210px", width: "210px", transform: "translateY(-50%)" }}
            />

            <ProfileClient
              user={{
                name: user.name,
                email: user.email,
                createdAt: user.createdAt.toISOString(),
              }}
            />
          </section>
        </div>
      </main>
    </>
  );
}
