import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { grantAccessFromCheckoutSession } from "@/lib/payment";
import { getStripe, grantAccess } from "@/lib/stripe";
import Navbar from "@/components/Navbar";

// The webhook is the main source of truth, but it can arrive a few seconds
// after the redirect. Checking the session with Stripe here (server side, so
// it cannot be forged) lets the user start right away.
async function confirmPayment(checkoutSessionId: string, userId: string) {
  try {
    const checkout = await getStripe().checkout.sessions.retrieve(checkoutSessionId);
    if (checkout.client_reference_id !== userId) return false;
    return grantAccessFromCheckoutSession(checkout, { grantAccess });
  } catch {
    return false;
  }
}

export default async function PaiementSuccesPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { session_id } = await searchParams;
  const confirmed =
    session.user.hasAccess ||
    (!!session_id && (await confirmPayment(session_id, session.user.id)));

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex items-start justify-center px-4 py-12"
        style={{ backgroundColor: "#FCF4E8" }}
      >
        <div
          className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md text-center"
          style={{ border: "1.5px solid #F2C073" }}
        >
          {confirmed ? (
            <>
              <h1 className="text-xl font-semibold">Merci, votre accès est actif.</h1>
              <p className="text-foreground/70 mt-2">
                Vous pouvez commencer les exercices dès maintenant.
              </p>
              <Link
                href="/exercises"
                className="inline-block mt-6 px-6 py-3 rounded-xl font-medium text-white hover:opacity-90"
                style={{ backgroundColor: "#F2C073" }}
              >
                Commencer
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Paiement en cours de validation</h1>
              <p className="text-foreground/70 mt-2">
                Votre paiement n&apos;est pas encore confirmé. Rechargez cette
                page dans quelques instants.
              </p>
              <Link
                href="/paiement"
                className="inline-block mt-6 text-sm underline text-foreground/70"
              >
                Retour à la page de paiement
              </Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
