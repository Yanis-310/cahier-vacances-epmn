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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <section className="overflow-hidden rounded-2xl border border-foreground/8 bg-white shadow-sm">
          <div className="h-1.5 w-full bg-primary/80" />
          <div className="bg-primary-pale/25 p-6 sm:p-8">
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Espace personnel
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Mon profil
            </h1>
            <p className="mt-3 text-base leading-relaxed text-foreground/60 sm:text-lg">
              G\u00E9rez vos informations et vos param\u00E8tres de compte.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <ProfileClient
            user={{
              name: user.name,
              email: user.email,
              createdAt: user.createdAt.toISOString(),
            }}
          />
        </section>
      </main>
    </>
  );
}
