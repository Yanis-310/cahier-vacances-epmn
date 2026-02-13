import { z } from "zod";

const passwordRule =
  "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.";

export const profileSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Email invalide."),
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
  newPassword: z
    .string()
    .min(8, passwordRule)
    .refine((val) => /[A-Z]/.test(val), { message: passwordRule })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: passwordRule })
    .optional()
    .or(z.literal("")),
});

interface UserRecord {
  passwordHash: string;
}

interface UpdateData {
  name: string;
  email: string;
  passwordHash?: string;
}

interface ProfileDeps {
  findUserById: (userId: string) => Promise<UserRecord | null>;
  comparePassword: (password: string, hash: string) => Promise<boolean>;
  hashPassword: (password: string) => Promise<string>;
  updateUser: (userId: string, data: UpdateData) => Promise<void>;
}

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

export async function handleProfileUpdate(
  body: unknown,
  userId: string,
  deps: ProfileDeps
): Promise<ApiResult> {
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Données invalides.";
    return { status: 400, body: { error: firstError } };
  }

  const { currentPassword, newPassword } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();

  try {
    const user = await deps.findUserById(userId);
    if (!user) {
      return { status: 404, body: { error: "Utilisateur introuvable." } };
    }

    const isValid = await deps.comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return { status: 400, body: { error: "Mot de passe actuel incorrect." } };
    }

    const updateData: UpdateData = { name, email };
    if (newPassword) {
      updateData.passwordHash = await deps.hashPassword(newPassword);
    }

    await deps.updateUser(userId, updateData);
    return { status: 200, body: { success: true, name, email } };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { status: 400, body: { error: "Cet email est déjà utilisé." } };
    }
    return { status: 500, body: { error: "Erreur serveur." } };
  }
}
