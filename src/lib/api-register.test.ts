import assert from "node:assert/strict";
import test from "node:test";
import { handleRegister } from "./api-register";

test("handleRegister returns 400 for invalid payload", async () => {
  const result = await handleRegister(
    { name: "", email: "bad", password: "123" },
    {
      hashPassword: async () => "hash",
      createUser: async () => undefined,
    }
  );

  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Données invalides.");
});

test("handleRegister normalizes input and creates user", async () => {
  let created:
    | {
        name: string;
        email: string;
        passwordHash: string;
      }
    | undefined;

  const result = await handleRegister(
    { name: "  Alice  ", email: "ALICE@MAIL.COM", password: "Pass123!" },
    {
      hashPassword: async () => "hashed-password",
      createUser: async (data) => {
        created = data;
      },
    }
  );

  assert.equal(result.status, 201);
  assert.deepEqual(result.body, { success: true });
  assert.deepEqual(created, {
    name: "Alice",
    email: "alice@mail.com",
    passwordHash: "hashed-password",
  });
});

test("handleRegister returns 409 on duplicate email", async () => {
  const duplicate = Object.assign(new Error("duplicate"), { code: "P2002" });

  const result = await handleRegister(
    { name: "Alice", email: "alice@mail.com", password: "Pass123!" },
    {
      hashPassword: async () => "hash",
      createUser: async () => {
        throw duplicate;
      },
    }
  );

  assert.equal(result.status, 409);
  assert.equal(result.body.error, "Un compte avec cet email existe déjà.");
});
