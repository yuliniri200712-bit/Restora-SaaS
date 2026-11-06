export type AuthUser = {
  uid: string;
  email: string | null;
};

export interface AuthRepository {
  createAccount(email: string, password: string): Promise<AuthUser>;
  signIn(email: string, password: string): Promise<AuthUser>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  subscribeToChanges(listener: (user: AuthUser | null) => void): () => void;
}
