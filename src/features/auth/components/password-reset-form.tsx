"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "../application/auth.service";
import { getAuthErrorMessage } from "../domain/auth-errors";

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setRequestSent(true);
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
          <p className="eyebrow">RECUPERA TU ACCESO</p>
          <h1>Volvamos a abrirte la puerta.</h1>
          <p className="story-description">
            Te ayudaremos a recuperar el acceso a tu cuenta de Restora.
          </p>
        </div>
        <div className="story-footnote"><span className="status-dot" />Tu cuenta sigue siendo tuya</div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <Link className="mobile-brand" href="/" aria-label="Restora, inicio">
            <span className="brand-mark" aria-hidden="true">R</span><span>restora</span>
          </Link>

          {requestSent ? (
            <div className="reset-success" role="status">
              <div className="session-icon" aria-hidden="true">✓</div>
              <p className="eyebrow">SOLICITUD PROCESADA</p>
              <h2>Revisa tu correo</h2>
              <p className="auth-intro">
                Si existe una cuenta asociada a ese correo, recibirás instrucciones
                para restablecer tu contraseña.
              </p>
              <div className="reset-local-note">
                <strong>¿Estás probando en local?</strong>
                <span>
                  Authentication Emulator no envía correos reales. Abre la terminal
                  donde lo iniciaste y usa el enlace de restablecimiento que aparece allí.
                </span>
              </div>
              <button
                className="secondary-button reset-again"
                onClick={() => setRequestSent(false)}
                type="button"
              >
                Intentar con otro correo
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow">RECUPERA TU ACCESO</p>
              <h2>Restablece tu contraseña</h2>
              <p className="auth-intro">
                Escribe el correo de tu cuenta y te enviaremos instrucciones para crear una nueva contraseña.
              </p>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="reset-email">Correo electrónico</label>
                <input
                  autoComplete="email"
                  className="text-input"
                  id="reset-email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="nombre@restaurante.com"
                  required
                  type="email"
                  value={email}
                />
                {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Enviando…" : "Enviar instrucciones"}
                  {!isSubmitting && <span aria-hidden="true">→</span>}
                </button>
              </form>
            </>
          )}

          <p className="auth-switch">
            ¿Ya recordaste tu contraseña? <Link href="/login">Volver a iniciar sesión</Link>
          </p>
          <p className="auth-note">
            Por seguridad, mostraremos el mismo mensaje aunque no exista una cuenta con ese correo.
          </p>
        </div>
      </section>
    </main>
  );
}
