const firebaseMessages: Record<string, string> = {
  "auth/email-already-in-use":
    "Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/missing-email": "Ingresa tu correo electrónico.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/wrong-password": "El correo o la contraseña no son correctos.",
  "auth/user-not-found": "El correo o la contraseña no son correctos.",
  "auth/user-disabled": "Esta cuenta está deshabilitada. Contacta al soporte.",
  "auth/operation-not-allowed":
    "El registro con correo y contraseña no está habilitado en Firebase.",
  "auth/too-many-requests":
    "Hubo demasiados intentos. Espera un momento antes de intentarlo de nuevo.",
  "auth/network-request-failed":
    "No fue posible conectar con Firebase. Verifica que Authentication Emulator esté iniciado.",
};

export class AuthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthValidationError";
  }
}

export function getFirebaseAuthErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthValidationError) return error.message;

  const code = getFirebaseAuthErrorCode(error);
  if (code && firebaseMessages[code]) return firebaseMessages[code];

  return "No fue posible completar la operación. Inténtalo de nuevo.";
}
