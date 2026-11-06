import { FirebaseAuthRepository } from "../data/firebase-auth.repository";
import {
  AuthValidationError,
  getFirebaseAuthErrorCode,
} from "../domain/auth-errors";
import { AuthUser } from "../domain/auth-user";

const repository = new FirebaseAuthRepository();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new AuthValidationError("Ingresa tu correo electrónico.");
  }
  if (!emailPattern.test(normalizedEmail)) {
    throw new AuthValidationError("Ingresa un correo electrónico válido.");
  }

  return normalizedEmail;
}

function normalizeCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!password) throw new AuthValidationError("Ingresa tu contraseña.");

  return { email: normalizedEmail, password };
}

function normalizeDisplayName(displayName: string): string {
  const normalizedName = displayName.trim().replace(/\s+/g, " ");
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new AuthValidationError(
      "El nombre debe tener entre 2 y 80 caracteres.",
    );
  }

  return normalizedName;
}

export async function registerAccount(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthUser> {
  const credentials = normalizeCredentials(email, password);
  const normalizedName = normalizeDisplayName(displayName);
  if (credentials.password.length < 6) {
    throw new AuthValidationError(
      "La contraseña debe tener al menos 6 caracteres.",
    );
  }
  return repository.createAccount(
    credentials.email,
    credentials.password,
    normalizedName,
  );
}

export async function signInAccount(
  email: string,
  password: string,
): Promise<AuthUser> {
  const credentials = normalizeCredentials(email, password);
  return repository.signIn(credentials.email, credentials.password);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);

  try {
    await repository.sendPasswordReset(normalizedEmail);
  } catch (error) {
    const code = getFirebaseAuthErrorCode(error);
    if (code === "auth/user-not-found" || code === "auth/user-disabled") {
      return;
    }

    throw error;
  }
}

export function updateAccountDisplayName(displayName: string): Promise<AuthUser> {
  return repository.updateDisplayName(normalizeDisplayName(displayName));
}

export function signOutAccount(): Promise<void> {
  return repository.signOut();
}

export function subscribeToAuthChanges(
  listener: (user: AuthUser | null) => void,
): () => void {
  return repository.subscribeToChanges(listener);
}
