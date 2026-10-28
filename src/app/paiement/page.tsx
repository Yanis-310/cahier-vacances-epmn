import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import Navbar from "@/components/Navbar";
import CheckoutButton from "./CheckoutButton";

async function getPriceLabel() {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return null;
  try {
    const price = await getStripe().prices.retrieve(priceId);
    if (price.unit_amount == null) return null;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: price.currency.toUpperCase(),
    }).format(price.unit_amount / 100);
  } catch {
    return null;
  }
}

export default async function PaiementPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.hasAccess) redirect("/exercises");

  const priceLabel = await getPriceLabel();

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex items-start justify-center px-4 py-12"
        style={{ backgroundColor: "#FCF4E8" }}
      >
        <div
          className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md"
          style={{ border: "1.5px solid #F2C073" }}
        >
          <h1 className="text-xl font-semibold text-center">
            Débloquer le cahier de vacances
          </h1>
          <p className="text-foreground/70 mt-2 text-center">
            Un paiement unique donne accès à tous les exercices et aux
            évaluations, sans abonnement.
          </p>

          {priceLabel && (
            <p className="text-3xl font-bold text-center mt-6" style={{ color: "#F2C073" }}>
              {priceLabel}
            </p>
          )}

          <ul className="text-sm text-foreground/80 mt-6 space-y-1.5">
            <li>✓ Tous les exercices, avec correction</li>
            <li>✓ Évaluations illimitées</li>
            <li>✓ Suivi de votre progression</li>
          </ul>

          <CheckoutButton />

          <p className="text-xs text-foreground/60 mt-4 text-center">
            Paiement sécurisé par Stripe. Vos données bancaires ne transitent
            pas par notre site.
          </p>
        </div>
      </main>
    </>
  );
}
