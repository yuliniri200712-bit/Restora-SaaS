import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { AuthRepository, AuthUser } from "../domain/auth-user";
import { AuthValidationError } from "../domain/auth-errors";

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

export class FirebaseAuthRepository implements AuthRepository {
  async createAccount(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );

    try {
      await updateProfile(credential.user, { displayName });
    } catch {
      // The account already exists; the user can complete the profile from /cuenta.
    }

    return toAuthUser(credential.user);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );
    return toAuthUser(credential.user);
  }

  async sendPasswordReset(email: string): Promise<void> {
    const auth = getFirebaseAuth();
    auth.languageCode = "es";
    await sendPasswordResetEmail(auth, email);
  }

  async updateDisplayName(displayName: string): Promise<AuthUser> {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      throw new AuthValidationError("Tu sesión expiró. Inicia sesión de nuevo.");
    }

    await updateProfile(auth.currentUser, { displayName });
    return toAuthUser(auth.currentUser);
  }

  async signOut(): Promise<void> {
    await signOut(getFirebaseAuth());
  }

  subscribeToChanges(listener: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      listener(user ? toAuthUser(user) : null);
    });
  }
}
