import assert from "node:assert/strict";
import test from "node:test";
import { handleProfileUpdate } from "./api-profile";

test("handleProfileUpdate returns 400 for invalid payload", async () => {
  const result = await handleProfileUpdate(
    { name: "", email: "bad", currentPassword: "" },
    "u1",
    {
      findUserById: async () => null,
      comparePassword: async () => false,
      hashPassword: async () => "hash",
      updateUser: async () => undefined,
    }
  );

  assert.equal(result.status, 400);
  assert.equal(typeof result.body.error, "string");
});

test("handleProfileUpdate returns 400 for invalid current password", async () => {
  const result = await handleProfileUpdate(
    {
      name: "Alice",
      email: "alice@mail.com",
      currentPassword: "bad",
      newPassword: "",
    },
    "u1",
    {
      findUserById: async () => ({ passwordHash: "stored" }),
      comparePassword: async () => false,
      hashPassword: async () => "hash",
      updateUser: async () => undefined,
    }
  );

  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Mot de passe actuel incorrect.");
});

test("handleProfileUpdate updates normalized user data", async () => {
  let updated:
    | {
        userId: string;
        data: { name: string; email: string; passwordHash?: string };
      }
    | undefined;

  const result = await handleProfileUpdate(
    {
      name: "  Alice Dupont ",
      email: "ALICE@MAIL.COM",
      currentPassword: "OldPass123!",
      newPassword: "NewPass123!",
    },
    "u1",
    {
      findUserById: async () => ({ passwordHash: "stored-hash" }),
      comparePassword: async () => true,
      hashPassword: async () => "new-hash",
      updateUser: async (userId, data) => {
        updated = { userId, data };
      },
    }
  );

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    success: true,
    name: "Alice Dupont",
    email: "alice@mail.com",
  });
  assert.deepEqual(updated, {
    userId: "u1",
    data: {
      name: "Alice Dupont",
      email: "alice@mail.com",
      passwordHash: "new-hash",
    },
  });
});
