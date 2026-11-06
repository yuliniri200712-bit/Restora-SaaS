import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  CallableRequest,
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

initializeApp();

const firestore = getFirestore();
const usernamePattern = /^[a-z][a-z0-9_]{2,19}$/;

type AliasRequest = { alias?: unknown };
type AliasResponse = { alias: string | null };

function requireUserId(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Inicia sesión para continuar.");
  }

  return uid;
}

function normalizeAlias(value: unknown): string {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", "Ingresa un alias válido.");
  }

  const alias = value.trim().toLowerCase();
  if (!usernamePattern.test(alias)) {
    throw new HttpsError(
      "invalid-argument",
      "Usa entre 3 y 20 caracteres: letras, números o guion bajo; empieza con una letra.",
    );
  }

  return alias;
}

export const getOwnAlias = onCall<
  Record<string, never>,
  Promise<AliasResponse>
>(
  { region: "us-central1" },
  async (request) => {
    const uid = requireUserId(request);
    const profile = await firestore.collection("userAliasOwners").doc(uid).get();
    const storedAlias: unknown = profile.get("alias");

    return {
      alias: typeof storedAlias === "string" ? storedAlias : null,
    };
  },
);

export const claimOwnAlias = onCall<AliasRequest, Promise<AliasResponse>>(
  { region: "us-central1" },
  async (request) => {
    const uid = requireUserId(request);
    const alias = normalizeAlias(request.data?.alias);
    const aliasRef = firestore.collection("userAliases").doc(alias);
    const ownerRef = firestore.collection("userAliasOwners").doc(uid);

    await firestore.runTransaction(async (transaction) => {
      const [aliasSnapshot, ownerSnapshot] = await Promise.all([
        transaction.get(aliasRef),
        transaction.get(ownerRef),
      ]);
      const currentAlias = ownerSnapshot.get("alias");
      const oldAliasRef =
        typeof currentAlias === "string" &&
        usernamePattern.test(currentAlias) &&
        currentAlias !== alias
          ? firestore.collection("userAliases").doc(currentAlias)
          : null;
      const oldAliasSnapshot = oldAliasRef
        ? await transaction.get(oldAliasRef)
        : null;

      if (aliasSnapshot.exists && aliasSnapshot.get("uid") !== uid) {
        throw new HttpsError(
          "already-exists",
          "Ese alias ya está en uso. Prueba con otro.",
        );
      }

      if (oldAliasRef && oldAliasSnapshot?.get("uid") === uid) {
        transaction.delete(oldAliasRef);
      }

      transaction.set(aliasRef, {
        uid,
        createdAt: aliasSnapshot.get("createdAt") ?? FieldValue.serverTimestamp(),
      });
      transaction.set(
        ownerRef,
        {
          alias,
          createdAt: ownerSnapshot.get("createdAt") ?? FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    return { alias };
  },
);
