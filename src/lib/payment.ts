import { z } from "zod";
import type { UserRole } from "@prisma/client";

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

export const PAYMENT_REQUIRED_ERROR = "Accès réservé aux comptes ayant réglé l'accès.";

// Admins and owners never need to pay. Kept free of auth imports: auth.ts uses it.
export function hasPaidAccess(user: {
  role?: UserRole | null;
  paidAt?: Date | string | null;
}) {
  return user.role === "ADMIN" || user.role === "OWNER" || !!user.paidAt;
}

export const checkoutSchema = z.object({
  // Required by the French Code de la consommation (art. L221-28): the user
  // asks for immediate access and waives the 14-day withdrawal right.
  waiveWithdrawal: z.literal(true),
});

interface CheckoutDeps {
  findUser: (userId: string) => Promise<{
    email: string;
    role: UserRole;
    paidAt: Date | null;
  } | null>;
  createCheckoutSession: (params: {
    userId: string;
    email: string;
  }) => Promise<{ url: string | null }>;
}

export async function handleCheckout(
  body: unknown,
  userId: string,
  deps: CheckoutDeps
): Promise<ApiResult> {
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: "Vous devez accepter l'accès immédiat pour continuer." },
    };
  }

  const user = await deps.findUser(userId);
  if (!user) {
    return { status: 401, body: { error: "Non autorisé" } };
  }
  if (hasPaidAccess(user)) {
    return { status: 409, body: { error: "Votre accès est déjà actif." } };
  }

  try {
    const session = await deps.createCheckoutSession({ userId, email: user.email });
    if (!session.url) {
      return { status: 500, body: { error: "Erreur serveur." } };
    }
    return { status: 200, body: { url: session.url } };
  } catch {
    return { status: 502, body: { error: "Le service de paiement est indisponible." } };
  }
}

// Subset of Stripe.Checkout.Session we rely on.
export interface CheckoutSessionLike {
  id: string;
  client_reference_id: string | null;
  payment_status: string;
  mode?: string | null;
}

interface GrantDeps {
  grantAccess: (userId: string, checkoutSessionId: string) => Promise<void>;
}

// Returns true when the session is paid and access was granted.
export async function grantAccessFromCheckoutSession(
  session: CheckoutSessionLike,
  deps: GrantDeps
) {
  if (session.mode && session.mode !== "payment") return false;
  if (session.payment_status !== "paid") return false;
  if (!session.client_reference_id) return false;

  await deps.grantAccess(session.client_reference_id, session.id);
  return true;
}

export interface StripeEventLike {
  type: string;
  data: { object: unknown };
}

export async function handleStripeEvent(
  event: StripeEventLike,
  deps: GrantDeps
): Promise<ApiResult> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await grantAccessFromCheckoutSession(
        event.data.object as CheckoutSessionLike,
        deps
      );
      break;
    default:
      break;
  }
  return { status: 200, body: { received: true } };
}
