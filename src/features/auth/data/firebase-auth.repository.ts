import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { AuthRepository, AuthUser } from "../domain/auth-user";

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, email: user.email };
}

export class FirebaseAuthRepository implements AuthRepository {
  async createAccount(email: string, password: string): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );
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

  async signOut(): Promise<void> {
    await signOut(getFirebaseAuth());
  }

  subscribeToChanges(listener: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      listener(user ? toAuthUser(user) : null);
    });
  }
}
