"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { subscribeToAuthChanges } from "@/features/auth/application/auth.service";
import { AuthUser } from "@/features/auth/domain/auth-user";
import { registerRestaurant } from "../application/register-restaurant.service";
import {
  RestaurantRegistrationFields,
  RestaurantRegistrationResult,
  RestaurantRegistrationValidationError,
} from "../domain/restaurant-registration";

const REQUEST_STORAGE_KEY = "restora.restaurant-registration.request.v1";

const INITIAL_FIELDS: RestaurantRegistrationFields = {
  restaurantName: "",
  phone: "",
  city: "",
  address: "",
};

function getRequestId(fields: RestaurantRegistrationFields): string {
  const fingerprint = JSON.stringify({
    restaurantName: fields.restaurantName.trim().replace(/\s+/g, " "),
    phone: fields.phone.trim().replace(/[\s().-]/g, ""),
    city: fields.city.trim().replace(/\s+/g, " "),
    address: fields.address.trim().replace(/\s+/g, " "),
  });

  try {
    const stored = sessionStorage.getItem(REQUEST_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "fingerprint" in parsed &&
        parsed.fingerprint === fingerprint &&
        "requestId" in parsed &&
        typeof parsed.requestId === "string"
      ) {
        return parsed.requestId;
      }
    }

    const requestId = crypto.randomUUID();
    sessionStorage.setItem(
      REQUEST_STORAGE_KEY,
      JSON.stringify({ fingerprint, requestId }),
    );
    return requestId;
  } catch {
    return crypto.randomUUID();
  }
}

function getCallableErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return undefined;
}

function getRegistrationErrorMessage(error: unknown): string {
  if (error instanceof RestaurantRegistrationValidationError) {
    return error.message;
  }

  switch (getCallableErrorCode(error)) {
    case "functions/unauthenticated":
      return "Tu sesión terminó. Inicia sesión y vuelve a intentarlo.";
    case "functions/invalid-argument":
      return "Revisa los datos del restaurante e inténtalo de nuevo.";
    case "functions/failed-precondition":
      return "La solicitud cambió durante el envío. Vuelve a intentarlo.";
    case "functions/resource-exhausted":
      return "No fue posible reservar el enlace. Inténtalo de nuevo.";
    case "functions/unavailable":
    case "functions/deadline-exceeded":
      return "El servicio no respondió. Puedes volver a intentarlo sin duplicar el registro.";
    default:
      return "No pudimos registrar el restaurante. Inténtalo de nuevo.";
  }
}

export function RestaurantRegistrationForm() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<RestaurantRegistrationResult | null>(null);

  useEffect(() => {
    return subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsCheckingSession(false);
      if (!currentUser) router.replace("/login");
    });
  }, [router]);

  function updateField(field: keyof RestaurantRegistrationFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrorMessage("");
    setResult(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const requestId = getRequestId(fields);
      const registration = await registerRestaurant(fields, requestId);
      setResult(registration);
      try {
        sessionStorage.removeItem(REQUEST_STORAGE_KEY);
      } catch {
        // Storage can be unavailable in restricted browser contexts.
      }
    } catch (error) {
      setErrorMessage(getRegistrationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession || !user) {
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
        <Link className="brand" href="/cuenta" aria-label="Restora, cuenta">
          <span className="brand-mark" aria-hidden="true">R</span><span>restora</span>
        </Link>
        <Link className="secondary-button secondary-link" href="/cuenta">Volver a mi cuenta</Link>
      </header>
      <section className="session-card restaurant-registration-card">
        {result ? (
          <>
            <div className="session-icon" aria-hidden="true">✓</div>
            <p className="eyebrow">RESTAURANTE REGISTRADO</p>
            <h1>{fields.restaurantName.trim()}</h1>
            <p className="session-description">
              El restaurante y su sede principal quedaron en configuración. La prueba gratuita y la habilitación operativa se conectarán en la fase de suscripciones.
            </p>
            <div className="registration-result" role="status">
              <span>Enlace reservado</span>
              <strong>{result.slug}</strong>
              <span>Estado: configuración pendiente</span>
            </div>
            <Link className="primary-button registration-account-link" href="/cuenta">
              Ir a mi cuenta <span aria-hidden="true">→</span>
            </Link>
          </>
        ) : (
          <>
            <div className="session-icon" aria-hidden="true">R</div>
            <p className="eyebrow">NUEVO RESTAURANTE</p>
            <h1>Registra tu restaurante.</h1>
            <p className="session-description">
              Crea el espacio de tu restaurante y registra su sede principal. La operación comercial se habilitará al configurar la prueba y suscripción.
            </p>
            <form className="auth-form restaurant-registration-form" onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="restaurant-name">Nombre del restaurante</label>
              <input
                autoComplete="organization"
                className="text-input"
                id="restaurant-name"
                maxLength={80}
                minLength={2}
                onChange={(event) => updateField("restaurantName", event.target.value)}
                required
                value={fields.restaurantName}
              />

              <label className="field-label" htmlFor="restaurant-phone">Teléfono de contacto</label>
              <input
                autoComplete="tel"
                className="text-input"
                id="restaurant-phone"
                inputMode="tel"
                maxLength={24}
                onChange={(event) => updateField("phone", event.target.value)}
                pattern="[+0-9() .-]{7,24}"
                required
                value={fields.phone}
              />

              <label className="field-label" htmlFor="main-branch-city">Ciudad de la sede principal</label>
              <input
                autoComplete="address-level2"
                className="text-input"
                id="main-branch-city"
                maxLength={80}
                minLength={2}
                onChange={(event) => updateField("city", event.target.value)}
                required
                value={fields.city}
              />

              <label className="field-label" htmlFor="main-branch-address">Dirección de la sede principal</label>
              <input
                autoComplete="street-address"
                className="text-input"
                id="main-branch-address"
                maxLength={160}
                minLength={5}
                onChange={(event) => updateField("address", event.target.value)}
                required
                value={fields.address}
              />

              {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Registrando…" : "Registrar restaurante"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>
          </>
        )}
      </section>
      <p className="session-footnote">Los datos del restaurante se guardan de forma segura en Firebase.</p>
    </main>
  );
}
