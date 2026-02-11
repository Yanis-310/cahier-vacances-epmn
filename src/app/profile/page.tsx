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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Mon profil
          </h1>
          <p className="text-foreground/50 mt-2 text-lg">
            Gérez vos informations et vos paramètres de compte.
          </p>
        </div>

        <ProfileClient
          user={{
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
          }}
        />
      </main>
    </>
  );
}
