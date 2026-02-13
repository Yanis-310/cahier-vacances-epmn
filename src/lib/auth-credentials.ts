interface CredentialsLike {
  email?: unknown;
  password?: unknown;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

interface AuthorizeDeps {
  findUserByEmail: (email: string) => Promise<UserRecord | null>;
  comparePassword: (password: string, hash: string) => Promise<boolean>;
}

export async function authorizeCredentials(
  credentials: CredentialsLike | undefined,
  deps: AuthorizeDeps
) {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await deps.findUserByEmail(String(credentials.email));
  if (!user) return null;

  const isValid = await deps.comparePassword(
    String(credentials.password),
    user.passwordHash
  );

  if (!isValid) return null;

  return { id: user.id, name: user.name, email: user.email };
}
