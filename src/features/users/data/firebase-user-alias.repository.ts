import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "@/lib/firebase/client";
import { UserAlias, UserAliasRepository } from "../domain/user-alias";

type ClaimAliasInput = { alias: string };
type AliasResponse = UserAlias;

export class FirebaseUserAliasRepository implements UserAliasRepository {
  async getOwnAlias(): Promise<UserAlias> {
    const getAlias = httpsCallable<Record<string, never>, AliasResponse>(
      getFirebaseFunctions(),
      "getOwnAlias",
    );
    const result = await getAlias({});
    return result.data;
  }

  async claimOwnAlias(alias: string): Promise<UserAlias> {
    const claimAlias = httpsCallable<ClaimAliasInput, AliasResponse>(
      getFirebaseFunctions(),
      "claimOwnAlias",
    );
    const result = await claimAlias({ alias });
    return result.data;
  }
}
