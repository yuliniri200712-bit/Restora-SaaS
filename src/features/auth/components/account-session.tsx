"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  signOutAccount,
  subscribeToAuthChanges,
  updateAccountDisplayName,
} from "../application/auth.service";
import { getAuthErrorMessage } from "../domain/auth-errors";
import { AuthUser } from "../domain/auth-user";
import {
  getOwnAlias,
  updateOwnAlias,
} from "@/features/users/application/user-alias.service";

export function AccountSession() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [alias, setAlias] = useState("");
  const [aliasMessage, setAliasMessage] = useState("");
  const [isLoadingAlias, setIsLoadingAlias] = useState(true);
  const [isSavingAlias, setIsSavingAlias] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setDisplayName(currentUser?.displayName ?? "");
      setIsLoading(false);
      if (!currentUser) {
        setAlias("");
        setIsLoadingAlias(false);
        router.replace("/login");
        return;
      }

      setIsLoadingAlias(true);
      void getOwnAlias()
        .then((profile) => {
          if (!isCancelled) setAlias(profile.alias ?? "");
        })
        .catch((error: unknown) => {
          if (!isCancelled) setErrorMessage(getAuthErrorMessage(error));
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingAlias(false);
        });
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
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

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setProfileMessage("");
    setIsSavingProfile(true);

    try {
      const updatedUser = await updateAccountDisplayName(displayName);
      setUser(updatedUser);
      setDisplayName(updatedUser.displayName ?? "");
      setProfileMessage("Tu nombre se actualizó correctamente.");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveAlias(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setAliasMessage("");
    setIsSavingAlias(true);

    try {
      const savedAlias = await updateOwnAlias(alias);
      setAlias(savedAlias.alias ?? "");
      setAliasMessage("Tu alias único se guardó correctamente.");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSavingAlias(false);
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
            {(user.displayName?.[0] ?? user.email?.[0] ?? "R").toUpperCase()}
          </span>
          <span>
            <span className="account-label">Cuenta autenticada</span>
            <strong>{user.email ?? "Correo no disponible"}</strong>
          </span>
        </div>
        {!user.displayName && (
          <p className="profile-prompt" role="status">
            Completa tu perfil agregando el nombre que quieres mostrar en tu cuenta.
          </p>
        )}
        <h2 className="profile-heading">Perfil de usuario</h2>
        <form className="profile-form" onSubmit={handleSaveProfile}>
          <label className="field-label" htmlFor="account-display-name">Nombre visible</label>
          <input
            autoComplete="name"
            className="text-input"
            id="account-display-name"
            maxLength={80}
            minLength={2}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setProfileMessage("");
              setErrorMessage("");
            }}
            required
            type="text"
            value={displayName}
          />
          <button className="primary-button" disabled={isSavingProfile} type="submit">
            {isSavingProfile ? "Guardando…" : "Guardar perfil"}
          </button>
        </form>
        {profileMessage && <p className="profile-success" role="status">{profileMessage}</p>}
        <h2 className="profile-heading">Alias único</h2>
        <p className="profile-alias-hint">
          Tu nombre visible puede repetirse; este alias identifica tu cuenta y es único en Restora.
        </p>
        <form className="profile-form" onSubmit={handleSaveAlias}>
          <label className="field-label" htmlFor="account-alias">Alias</label>
          <input
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            className="text-input"
            disabled={isLoadingAlias || isSavingAlias}
            id="account-alias"
            maxLength={20}
            minLength={3}
            onChange={(event) => {
              setAlias(event.target.value);
              setAliasMessage("");
              setErrorMessage("");
            }}
            pattern="[A-Za-z][A-Za-z0-9_]{2,19}"
            placeholder="ej. andres_restora"
            required
            spellCheck={false}
            type="text"
            value={isLoadingAlias ? "" : alias}
          />
          <span className="field-hint">3–20 caracteres; letras, números y guion bajo.</span>
          <button className="primary-button" disabled={isLoadingAlias || isSavingAlias} type="submit">
            {isLoadingAlias ? "Cargando alias…" : isSavingAlias ? "Guardando…" : "Guardar alias"}
          </button>
        </form>
        {aliasMessage && <p className="profile-success" role="status">{aliasMessage}</p>}
        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
        <Link className="text-link" href="/">Volver al inicio <span aria-hidden="true">→</span></Link>
      </section>
      <p className="session-footnote">Identidad verificada por Firebase Authentication</p>
    </main>
  );
}
