export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export interface AuthRepository {
  createAccount(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthUser>;
  signIn(email: string, password: string): Promise<AuthUser>;
  sendPasswordReset(email: string): Promise<void>;
  updateDisplayName(displayName: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  subscribeToChanges(listener: (user: AuthUser | null) => void): () => void;
}
