import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleCheckout } from "@/lib/payment";
import { getAppUrl, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const appUrl = getAppUrl(request);

  const result = await handleCheckout(body, session.user.id, {
    findUser: (userId) =>
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true, paidAt: true },
      }),
    createCheckoutSession: ({ userId, email }) =>
      getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
        client_reference_id: userId,
        customer_email: email,
        metadata: { userId, waiveWithdrawal: "true" },
        locale: "fr",
        success_url: `${appUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/paiement`,
      }),
  });

  return NextResponse.json(result.body, { status: result.status });
}
