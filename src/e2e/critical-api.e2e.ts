import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "../..");
const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3101";
const shouldRun = Boolean(process.env.DATABASE_URL);

class CookieJar {
  private readonly store = new Map<string, string>();

  apply(response: Response) {
    const headers = response.headers as Headers & { getSetCookie?: () => string[] };
    const setCookies = headers.getSetCookie?.() ?? [];

    if (setCookies.length === 0) {
      const single = response.headers.get("set-cookie");
      if (single) setCookies.push(single);
    }

    for (const cookie of setCookies) {
      const cookiePair = cookie.split(";")[0]?.trim();
      if (!cookiePair) continue;

      const separator = cookiePair.indexOf("=");
      if (separator <= 0) continue;

      const name = cookiePair.slice(0, separator).trim();
      const value = cookiePair.slice(separator + 1).trim();

      if (!name) continue;
      if (!value) {
        this.store.delete(name);
      } else {
        this.store.set(name, value);
      }
    }
  }

  toHeaderValue() {
    return Array.from(this.store.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

async function fetchWithJar(url: string, init: RequestInit, jar: CookieJar) {
  const headers = new Headers(init.headers);
  const cookieHeader = jar.toHeaderValue();
  if (cookieHeader) headers.set("cookie", cookieHeader);

  const response = await fetch(url, { ...init, headers, redirect: "manual" });
  jar.apply(response);
  return response;
}

async function waitForServerReady(url: string, timeoutMs = 120_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${url}/api/auth/csrf`, { redirect: "manual" });
      if (response.ok) return;
    } catch {
      // Retry until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server did not start within ${timeoutMs}ms`);
}

function startServer(): ChildProcess {
  return spawn("npm run dev:nofork", {
    cwd: projectRoot,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: "3101",
      NODE_ENV: "test",
    },
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function stopServer(child: ChildProcess) {
  if (child.killed) return;

  child.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
    setTimeout(() => {
      if (!child.killed) child.kill("SIGKILL");
      resolve();
    }, 4_000);
  });
}

async function getCsrfToken(jar: CookieJar) {
  const response = await fetchWithJar(`${baseUrl}/api/auth/csrf`, { method: "GET" }, jar);
  assert.equal(response.status, 200);

  const data = (await response.json()) as { csrfToken: string };
  assert.ok(data.csrfToken);
  return data.csrfToken;
}

async function loginWithCredentials(email: string, password: string) {
  const jar = new CookieJar();
  const csrfToken = await getCsrfToken(jar);

  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${baseUrl}/exercises`,
    json: "true",
  });

  const response = await fetchWithJar(
    `${baseUrl}/api/auth/callback/credentials`,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: form,
    },
    jar
  );

  return { response, jar };
}

test(
  "critical api security/e2e coverage",
  { skip: !shouldRun, timeout: 180_000 },
  async () => {
    const server = startServer();

    const email = `e2e_${Date.now()}@example.test`;
    const password = "StrongPass123!";
    const exerciseId = randomUUID();
    const exerciseNumber = Math.floor(900_000 + Math.random() * 99_000);
    const emailsToCleanup = new Set<string>([email]);

    try {
      await waitForServerReady(baseUrl);

      await prisma.exercise.create({
        data: {
          id: exerciseId,
          number: exerciseNumber,
          title: "E2E Security Exercise",
          type: "single_choice",
          content: {
            instruction: "Pick the right answer",
            options: ["A", "B"],
            questions: [{ id: 1, text: "Question" }],
          },
          answers: { "1": "A" },
        },
      });

      const protectedEndpoints = [
        {
          url: `${baseUrl}/api/progress`,
          body: {
            exerciseId,
            userAnswers: { "1": "A" },
            completed: true,
          },
        },
        {
          url: `${baseUrl}/api/profile`,
          body: {
            name: "No Auth",
            email: "noauth@example.test",
            currentPassword: "NoAuth123!",
          },
        },
        {
          url: `${baseUrl}/api/evaluation`,
          body: {},
        },
        {
          url: `${baseUrl}/api/evaluation/${randomUUID()}`,
          body: { userAnswers: {} },
        },
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(endpoint.body),
        });

        assert.equal(response.status, 401, `expected 401 on ${endpoint.url}`);
      }

      const registerResponse = await fetch(`${baseUrl}/api/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "E2E User", email, password }),
      });
      assert.equal(registerResponse.status, 201);

      const successfulLogin = await loginWithCredentials(email, password);
      assert.equal(successfulLogin.response.status, 200);

      const progressResponse = await fetchWithJar(
        `${baseUrl}/api/progress`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            exerciseId,
            userAnswers: { "1": "A" },
            completed: true,
          }),
        },
        successfulLogin.jar
      );
      assert.equal(progressResponse.status, 200);

      const createEvaluationResponse = await fetchWithJar(
        `${baseUrl}/api/evaluation`,
        { method: "POST" },
        successfulLogin.jar
      );
      assert.equal(createEvaluationResponse.status, 200);
      const evaluationPayload = (await createEvaluationResponse.json()) as { id: string };
      assert.ok(evaluationPayload.id);

      const submitEvaluationResponse = await fetchWithJar(
        `${baseUrl}/api/evaluation/${evaluationPayload.id}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userAnswers: {} }),
        },
        successfulLogin.jar
      );
      assert.equal(submitEvaluationResponse.status, 200);

      const registerStatuses: number[] = [];
      for (let i = 0; i < 7; i += 1) {
        const rateEmail = `rate_${Date.now()}_${i}@example.test`;
        emailsToCleanup.add(rateEmail);
        const response = await fetch(`${baseUrl}/api/register`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: `Rate ${i}`,
            email: rateEmail,
            password,
          }),
        });
        registerStatuses.push(response.status);
      }
      assert.ok(registerStatuses.includes(429));

      const forgotStatuses: number[] = [];
      for (let i = 0; i < 7; i += 1) {
        const response = await fetch(`${baseUrl}/api/forgot-password`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        forgotStatuses.push(response.status);
      }
      assert.ok(forgotStatuses.includes(429));

      const resetStatuses: number[] = [];
      for (let i = 0; i < 7; i += 1) {
        const response = await fetch(`${baseUrl}/api/reset-password`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            token: `invalid-token-${i}`,
            password: password,
          }),
        });
        resetStatuses.push(response.status);
      }
      assert.ok(resetStatuses.includes(429));

      const loginStatuses: number[] = [];
      for (let i = 0; i < 7; i += 1) {
        const attempt = await loginWithCredentials(email, `WrongPass_${i}!`);
        loginStatuses.push(attempt.response.status);
      }
      assert.ok(loginStatuses.includes(429));
    } finally {
      await prisma.user.deleteMany({
        where: { email: { in: Array.from(emailsToCleanup) } },
      });
      await prisma.exercise.deleteMany({ where: { id: exerciseId } });

      await stopServer(server);
    }
  }
);
