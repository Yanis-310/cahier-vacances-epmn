import assert from "node:assert/strict";
import test from "node:test";
import { canUpdateRole, parseRoleUpdatePayload } from "./admin-user";

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
