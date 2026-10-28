import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

let client: Stripe | null = null;

export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

export function getAppUrl(request: Request) {
  return (process.env.NEXTAUTH_URL ?? new URL(request.url).origin).replace(/\/$/, "");
}

// Idempotent: Stripe can deliver the same event several times, and the
// success page may grant access before the webhook arrives.
export async function grantAccess(userId: string, checkoutSessionId: string) {
  await prisma.user.updateMany({
    where: { id: userId, paidAt: null },
    data: { paidAt: new Date(), stripeCheckoutSessionId: checkoutSessionId },
  });
}
