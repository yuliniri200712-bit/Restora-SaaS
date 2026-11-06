export type UserAlias = {
  alias: string | null;
};

export interface UserAliasRepository {
  getOwnAlias(): Promise<UserAlias>;
  claimOwnAlias(alias: string): Promise<UserAlias>;
}
