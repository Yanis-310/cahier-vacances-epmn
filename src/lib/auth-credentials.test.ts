import assert from "node:assert/strict";
import test from "node:test";
import { authorizeCredentials } from "./auth-credentials";

test("authorizeCredentials returns null when credentials are missing", async () => {
  const result = await authorizeCredentials(undefined, {
    findUserByEmail: async () => null,
    comparePassword: async () => false,
  });
  assert.equal(result, null);
});

test("authorizeCredentials returns null when user is not found", async () => {
  const result = await authorizeCredentials(
    { email: "a@a.com", password: "Pass123!" },
    {
      findUserByEmail: async () => null,
      comparePassword: async () => false,
    }
  );

  assert.equal(result, null);
});

test("authorizeCredentials returns null when password is invalid", async () => {
  const result = await authorizeCredentials(
    { email: "a@a.com", password: "wrong" },
    {
      findUserByEmail: async () => ({
        id: "u1",
        name: "Alice",
        email: "a@a.com",
        role: "USER",
        passwordHash: "hash",
      }),
      comparePassword: async () => false,
    }
  );

  assert.equal(result, null);
});

test("authorizeCredentials returns user payload when credentials are valid", async () => {
  const result = await authorizeCredentials(
    { email: "a@a.com", password: "Pass123!" },
    {
      findUserByEmail: async () => ({
        id: "u1",
        name: "Alice",
        email: "a@a.com",
        role: "USER",
        passwordHash: "hash",
      }),
      comparePassword: async () => true,
    }
  );

  assert.deepEqual(result, {
    id: "u1",
    name: "Alice",
    email: "a@a.com",
    role: "USER",
  });
});
