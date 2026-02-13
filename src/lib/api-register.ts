import { z } from "zod";

const passwordRule =
  "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8, passwordRule)
    .refine((val) => /[A-Z]/.test(val), { message: passwordRule })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: passwordRule }),
});

interface RegisterDeps {
  hashPassword: (password: string) => Promise<string>;
  createUser: (data: {
    name: string;
    email: string;
    passwordHash: string;
  }) => Promise<void>;
}

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

export async function handleRegister(body: unknown, deps: RegisterDeps): Promise<ApiResult> {
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Données invalides." } };
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const passwordHash = await deps.hashPassword(parsed.data.password);
    await deps.createUser({ name, email, passwordHash });
    return { status: 201, body: { success: true } };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { status: 409, body: { error: "Un compte avec cet email existe déjà." } };
    }

    return { status: 500, body: { error: "Erreur serveur." } };
  }
}
