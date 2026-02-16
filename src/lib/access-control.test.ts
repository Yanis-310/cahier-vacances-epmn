import assert from "node:assert/strict";
import test from "node:test";
import { isAdminRole, isOwnerRole } from "./access-control";

test("isAdminRole allows ADMIN and OWNER", () => {
  assert.equal(isAdminRole("ADMIN"), true);
  assert.equal(isAdminRole("OWNER"), true);
  assert.equal(isAdminRole("USER"), false);
});

test("isOwnerRole only allows OWNER", () => {
  assert.equal(isOwnerRole("OWNER"), true);
  assert.equal(isOwnerRole("ADMIN"), false);
  assert.equal(isOwnerRole("USER"), false);
});
