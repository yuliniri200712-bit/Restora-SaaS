"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAccount, subscribeToAuthChanges } from "../application/auth.service";
import { getAuthErrorMessage } from "../domain/auth-errors";
import { AuthUser } from "../domain/auth-user";

export function AccountSession() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (!currentUser) router.replace("/login");
    });
  }, [router]);

  async function handleSignOut() {
    setErrorMessage("");
    try {
      await signOutAccount();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  }

  if (isLoading || !user) {
    return (
      <main className="session-loading" aria-live="polite">
        <span className="loading-indicator" aria-hidden="true" />
        <p>Verificando tu sesión…</p>
      </main>
    );
  }

  return (
    <main className="session-page">
      <header className="session-header">
        <Link className="brand" href="/" aria-label="Restora, inicio">
          <span className="brand-mark" aria-hidden="true">R</span><span>restora</span>
        </Link>
        <button className="secondary-button" onClick={handleSignOut} type="button">
          Cerrar sesión
        </button>
      </header>
      <section className="session-card">
        <div className="session-icon" aria-hidden="true">✓</div>
        <p className="eyebrow">SESIÓN ACTIVA</p>
        <h1>Ya estás dentro.</h1>
        <p className="session-description">
          La autenticación de tu cuenta está funcionando. En próximas jornadas
          conectaremos el perfil del restaurante y sus permisos.
        </p>
        <div className="account-email">
          <span className="account-avatar" aria-hidden="true">
            {(user.email?.[0] ?? "R").toUpperCase()}
          </span>
          <span>
            <span className="account-label">Cuenta autenticada</span>
            <strong>{user.email ?? "Correo no disponible"}</strong>
          </span>
        </div>
        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
        <Link className="text-link" href="/">Volver al inicio <span aria-hidden="true">→</span></Link>
      </section>
      <p className="session-footnote">Identidad verificada por Firebase Authentication</p>
    </main>
  );
}
