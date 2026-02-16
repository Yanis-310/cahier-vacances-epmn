import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/access-control";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        user={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          role: session.user.role,
        }}
      />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
