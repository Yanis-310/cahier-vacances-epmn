import assert from "node:assert/strict";
import test from "node:test";
import {
  grantAccessFromCheckoutSession,
  handleCheckout,
  handleStripeEvent,
  hasPaidAccess,
} from "./payment";

test("hasPaidAccess allows admins and paid users only", () => {
  assert.equal(hasPaidAccess({ role: "USER", paidAt: null }), false);
  assert.equal(hasPaidAccess({ role: "USER", paidAt: new Date() }), true);
  assert.equal(hasPaidAccess({ role: "ADMIN", paidAt: null }), true);
  assert.equal(hasPaidAccess({ role: "OWNER", paidAt: null }), true);
});

const unpaidUser = { email: "a@mail.com", role: "USER" as const, paidAt: null };

test("handleCheckout requires the withdrawal waiver", async () => {
  let called = false;
  const result = await handleCheckout({}, "u1", {
    findUser: async () => unpaidUser,
    createCheckoutSession: async () => {
      called = true;
      return { url: "https://checkout" };
    },
  });

  assert.equal(result.status, 400);
  assert.equal(called, false);
});

test("handleCheckout returns 409 when access is already active", async () => {
  const result = await handleCheckout({ waiveWithdrawal: true }, "u1", {
    findUser: async () => ({ ...unpaidUser, paidAt: new Date() }),
    createCheckoutSession: async () => ({ url: "https://checkout" }),
  });

  assert.equal(result.status, 409);
});

test("handleCheckout creates a session for the user", async () => {
  let params: { userId: string; email: string } | undefined;
  const result = await handleCheckout({ waiveWithdrawal: true }, "u1", {
    findUser: async () => unpaidUser,
    createCheckoutSession: async (p) => {
      params = p;
      return { url: "https://checkout" };
    },
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { url: "https://checkout" });
  assert.deepEqual(params, { userId: "u1", email: "a@mail.com" });
});

test("handleCheckout returns 502 when Stripe fails", async () => {
  const result = await handleCheckout({ waiveWithdrawal: true }, "u1", {
    findUser: async () => unpaidUser,
    createCheckoutSession: async () => {
      throw new Error("stripe down");
    },
  });

  assert.equal(result.status, 502);
});

test("grantAccessFromCheckoutSession ignores unpaid sessions", async () => {
  const granted: string[] = [];
  const ok = await grantAccessFromCheckoutSession(
    { id: "cs_1", client_reference_id: "u1", payment_status: "unpaid", mode: "payment" },
    { grantAccess: async (userId) => void granted.push(userId) }
  );

  assert.equal(ok, false);
  assert.deepEqual(granted, []);
});

test("handleStripeEvent grants access on completed paid checkout", async () => {
  const granted: [string, string][] = [];
  const result = await handleStripeEvent(
    {
      type: "checkout.session.completed",
      data: {
        object: { id: "cs_1", client_reference_id: "u1", payment_status: "paid", mode: "payment" },
      },
    },
    { grantAccess: async (userId, sessionId) => void granted.push([userId, sessionId]) }
  );

  assert.equal(result.status, 200);
  assert.deepEqual(granted, [["u1", "cs_1"]]);
});

test("handleStripeEvent acknowledges unrelated events", async () => {
  const result = await handleStripeEvent(
    { type: "customer.created", data: { object: {} } },
    { grantAccess: async () => assert.fail("should not grant") }
  );

  assert.equal(result.status, 200);
});
