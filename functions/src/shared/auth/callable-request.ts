import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

export function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Inicia sesión para continuar.");
  }
  return uid;
}

export function parseDocumentId(value: unknown, label: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (
    normalized.length === 0 ||
    normalized.includes("/") ||
    normalized.length > 128
  ) {
    throw new HttpsError(
      "invalid-argument",
      `El identificador de ${label} no es válido.`,
    );
  }
  return normalized;
}
