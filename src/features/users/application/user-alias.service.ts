import { AuthValidationError } from "@/features/auth/domain/auth-errors";
import { FirebaseUserAliasRepository } from "../data/firebase-user-alias.repository";
import { UserAlias } from "../domain/user-alias";

const repository = new FirebaseUserAliasRepository();
const aliasPattern = /^[a-z][a-z0-9_]{2,19}$/;

function normalizeAlias(value: string): string {
  const alias = value.trim().toLowerCase();
  if (!aliasPattern.test(alias)) {
    throw new AuthValidationError(
      "Usa entre 3 y 20 caracteres: letras, números o guion bajo; empieza con una letra.",
    );
  }

  return alias;
}

export function getOwnAlias(): Promise<UserAlias> {
  return repository.getOwnAlias();
}

export function updateOwnAlias(value: string): Promise<UserAlias> {
  return repository.claimOwnAlias(normalizeAlias(value));
}
