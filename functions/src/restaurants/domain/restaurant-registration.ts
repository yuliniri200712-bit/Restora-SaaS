export type RestaurantRegistrationInput = {
  restaurantName: string;
  phone: string;
  city: string;
  address: string;
  requestId: string;
};

export class RestaurantRegistrationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RestaurantRegistrationValidationError";
  }
}

function normalizeText(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
): string {
  const normalized = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new RestaurantRegistrationValidationError(
      `${label} debe tener entre ${minimum} y ${maximum} caracteres.`,
    );
  }
  return normalized;
}

export function parseRestaurantRegistrationInput(
  value: unknown,
): RestaurantRegistrationInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new RestaurantRegistrationValidationError(
      "Los datos del restaurante no son válidos.",
    );
  }

  const input = value as Record<string, unknown>;
  const restaurantName = normalizeText(input.restaurantName, "El nombre", 2, 80);
  const rawPhone = typeof input.phone === "string" ? input.phone.trim() : "";
  const phone = rawPhone.replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    throw new RestaurantRegistrationValidationError(
      "Ingresa un teléfono válido de 7 a 15 dígitos.",
    );
  }

  const city = normalizeText(input.city, "La ciudad", 2, 80);
  const address = normalizeText(input.address, "La dirección", 5, 160);
  const requestId = typeof input.requestId === "string" ? input.requestId.trim() : "";
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(requestId)) {
    throw new RestaurantRegistrationValidationError(
      "El identificador de solicitud no es válido.",
    );
  }

  return { restaurantName, phone, city, address, requestId };
}

export function createRestaurantSlugBase(restaurantName: string): string {
  const slug = restaurantName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56)
    .replace(/-+$/g, "");

  if (!slug) {
    throw new RestaurantRegistrationValidationError(
      "El nombre debe incluir letras o números para crear el enlace del restaurante.",
    );
  }

  return slug;
}
