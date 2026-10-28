import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { handleStripeEvent } from "@/lib/payment";
import { getStripe, grantAccess } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  // The signature is computed on the raw body, so it must not be parsed first.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event, { grantAccess });
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error("Stripe webhook error", err);
    // 500 makes Stripe retry the delivery later.
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
