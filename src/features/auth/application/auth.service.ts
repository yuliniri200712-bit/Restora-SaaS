import { FirebaseAuthRepository } from "../data/firebase-auth.repository";
import { AuthValidationError } from "../domain/auth-errors";
import { AuthUser } from "../domain/auth-user";

const repository = new FirebaseAuthRepository();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new AuthValidationError("Ingresa tu correo electrónico.");
  }
  if (!emailPattern.test(normalizedEmail)) {
    throw new AuthValidationError("Ingresa un correo electrónico válido.");
  }
  if (!password) throw new AuthValidationError("Ingresa tu contraseña.");

  return { email: normalizedEmail, password };
}

export async function registerAccount(
  email: string,
  password: string,
): Promise<AuthUser> {
  const credentials = normalizeCredentials(email, password);
  if (credentials.password.length < 6) {
    throw new AuthValidationError(
      "La contraseña debe tener al menos 6 caracteres.",
    );
  }
  return repository.createAccount(credentials.email, credentials.password);
}

export async function signInAccount(
  email: string,
  password: string,
): Promise<AuthUser> {
  const credentials = normalizeCredentials(email, password);
  return repository.signIn(credentials.email, credentials.password);
}

export function signOutAccount(): Promise<void> {
  return repository.signOut();
}

export function subscribeToAuthChanges(
  listener: (user: AuthUser | null) => void,
): () => void {
  return repository.subscribeToChanges(listener);
}
