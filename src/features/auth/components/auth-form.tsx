"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerAccount, signInAccount } from "../application/auth.service";
import { getAuthErrorMessage } from "../domain/auth-errors";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (isRegister && password !== confirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) await registerAccount(email, password, displayName);
      else await signInAccount(email, password);
      router.replace("/cuenta");
      router.refresh();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="Acerca de Restora">
        <Link className="brand" href="/" aria-label="Restora, inicio">
          <span className="brand-mark" aria-hidden="true">R</span><span>restora</span>
        </Link>
        <div className="auth-story-copy">
          <p className="eyebrow">TU NEGOCIO, EN ORDEN</p>
          <h1>Más claridad para cada servicio.</h1>
          <p className="story-description">
            El espacio de trabajo para restaurantes que quieren atender bien y crecer con confianza.
          </p>
        </div>
        <div className="story-footnote"><span className="status-dot" />Hecho para restaurantes independientes</div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <Link className="mobile-brand" href="/" aria-label="Restora, inicio">
            <span className="brand-mark" aria-hidden="true">R</span><span>restora</span>
          </Link>
          <p className="eyebrow">{isRegister ? "EMPIEZA AQUÍ" : "QUÉ BUENO VERTE"}</p>
          <h2>{isRegister ? "Crea tu cuenta" : "Inicia sesión"}</h2>
          <p className="auth-intro">
            {isRegister
              ? "Registra tu acceso para continuar con Restora."
              : "Ingresa tus datos para acceder a tu cuenta."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label className="field-label" htmlFor="register-name">Nombre completo</label>
                <input
                  autoComplete="name"
                  className="text-input"
                  id="register-name"
                  maxLength={80}
                  minLength={2}
                  name="displayName"
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Tu nombre"
                  required
                  type="text"
                  value={displayName}
                />
              </>
            )}
            <label className="field-label" htmlFor={`${mode}-email`}>Correo electrónico</label>
            <input
              autoComplete="email"
              className="text-input"
              id={`${mode}-email`}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nombre@restaurante.com"
              required
              type="email"
              value={email}
            />
            <div className="password-label-row">
              <label className="field-label" htmlFor={`${mode}-password`}>Contraseña</label>
              {!isRegister && <span className="field-hint">Mínimo 6 caracteres</span>}
            </div>
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="text-input"
              id={`${mode}-password`}
              minLength={6}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
            {!isRegister && (
              <div className="forgot-row">
                <Link href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
              </div>
            )}
            {isRegister && (
              <>
                <label className="field-label" htmlFor="register-confirmation">Confirma tu contraseña</label>
                <input
                  autoComplete="new-password"
                  className="text-input"
                  id="register-confirmation"
                  minLength={6}
                  name="passwordConfirmation"
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={confirmation}
                />
              </>
            )}
            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Un momento…" : isRegister ? "Crear cuenta" : "Entrar a Restora"}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? "¿Ya tienes una cuenta?" : "¿Aún no tienes una cuenta?"}{" "}
            <Link href={isRegister ? "/login" : "/registro"}>
              {isRegister ? "Inicia sesión" : "Regístrate"}
            </Link>
          </p>
          <p className="auth-note">
            {isRegister
              ? "Al crear una cuenta, confirmas que usarás Restora para gestionar tu negocio."
              : "Tu acceso se valida de forma segura con Firebase Authentication."}
          </p>
        </div>
      </section>
    </main>
  );
}
