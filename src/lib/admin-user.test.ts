import assert from "node:assert/strict";
import test from "node:test";
import {
  accessStatus,
  canUpdateRole,
  handleAccessUpdate,
  parseRoleUpdatePayload,
} from "./admin-user";

test("parseRoleUpdatePayload accepts ADMIN and USER", () => {
  assert.equal(parseRoleUpdatePayload({ role: "ADMIN" }).role, "ADMIN");
  assert.equal(parseRoleUpdatePayload({ role: "USER" }).role, "USER");
});

test("parseRoleUpdatePayload rejects OWNER", () => {
  assert.throws(() => parseRoleUpdatePayload({ role: "OWNER" }));
});

test("canUpdateRole blocks owner target", () => {
  const result = canUpdateRole({
    actorId: "a1",
    targetId: "u1",
    targetRole: "OWNER",
  });
  assert.equal(result.allowed, false);
});

test("canUpdateRole blocks self update", () => {
  const result = canUpdateRole({
    actorId: "u1",
    targetId: "u1",
    targetRole: "ADMIN",
  });
  assert.equal(result.allowed, false);
});

type Target = {
  id: string;
  role: "OWNER" | "ADMIN" | "USER";
  paidAt: Date | null;
  stripeCheckoutSessionId: string | null;
};

function accessDeps(target: Target | null) {
  const writes: Array<Date | null> = [];
  return {
    writes,
    deps: {
      findUser: async () => target,
      setPaidAt: async (_id: string, paidAt: Date | null) => {
        writes.push(paidAt);
        return { ...(target as Target), paidAt };
      },
    },
  };
}

const user = (overrides: Partial<Target> = {}): Target => ({
  id: "u1",
  role: "USER",
  paidAt: null,
  stripeCheckoutSessionId: null,
  ...overrides,
});

test("accessStatus distinguishes role, stripe, offered and none", () => {
  assert.equal(accessStatus(user({ role: "ADMIN" })), "role");
  assert.equal(accessStatus(user()), "none");
  assert.equal(accessStatus(user({ paidAt: new Date() })), "offered");
  assert.equal(
    accessStatus(user({ paidAt: new Date(), stripeCheckoutSessionId: "cs_1" })),
    "stripe"
  );
});

test("handleAccessUpdate rejects invalid body", async () => {
  const { deps } = accessDeps(user());
  const result = await handleAccessUpdate({ granted: "yes" }, "u1", deps);
  assert.equal(result.status, 400);
});

test("handleAccessUpdate returns 404 for unknown user", async () => {
  const { deps } = accessDeps(null);
  const result = await handleAccessUpdate({ granted: true }, "u1", deps);
  assert.equal(result.status, 404);
});

test("handleAccessUpdate grants access to a user without access", async () => {
  const { deps, writes } = accessDeps(user());
  const result = await handleAccessUpdate({ granted: true }, "u1", deps);
  assert.equal(result.status, 200);
  assert.equal(result.body.access, "offered");
  assert.equal(writes.length, 1);
  assert.ok(writes[0] instanceof Date);
});

test("handleAccessUpdate does not rewrite an existing Stripe payment", async () => {
  const { deps, writes } = accessDeps(
    user({ paidAt: new Date(), stripeCheckoutSessionId: "cs_1" })
  );
  const result = await handleAccessUpdate({ granted: true }, "u1", deps);
  assert.equal(result.status, 200);
  assert.equal(result.body.access, "stripe");
  assert.equal(writes.length, 0);
});

test("handleAccessUpdate revokes offered access", async () => {
  const { deps, writes } = accessDeps(user({ paidAt: new Date() }));
  const result = await handleAccessUpdate({ granted: false }, "u1", deps);
  assert.equal(result.status, 200);
  assert.equal(result.body.access, "none");
  assert.deepEqual(writes, [null]);
});

test("handleAccessUpdate refuses to revoke Stripe-paid access", async () => {
  const { deps, writes } = accessDeps(
    user({ paidAt: new Date(), stripeCheckoutSessionId: "cs_1" })
  );
  const result = await handleAccessUpdate({ granted: false }, "u1", deps);
  assert.equal(result.status, 400);
  assert.equal(writes.length, 0);
});

test("handleAccessUpdate refuses admin and owner targets", async () => {
  const { deps, writes } = accessDeps(user({ role: "OWNER" }));
  const result = await handleAccessUpdate({ granted: true }, "u1", deps);
  assert.equal(result.status, 400);
  assert.equal(writes.length, 0);
});
