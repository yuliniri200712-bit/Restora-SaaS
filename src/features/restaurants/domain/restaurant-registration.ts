export type RestaurantRegistrationFields = {
  restaurantName: string;
  phone: string;
  city: string;
  address: string;
};

export type RestaurantRegistrationInput = RestaurantRegistrationFields & {
  requestId: string;
};

export type RestaurantRegistrationResult = {
  restaurantId: string;
  branchId: string;
  slug: string;
  status: "setup";
  replayed: boolean;
};

export class RestaurantRegistrationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RestaurantRegistrationValidationError";
  }
}

function normalizeText(
  value: string,
  label: string,
  minimum: number,
  maximum: number,
): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new RestaurantRegistrationValidationError(
      `${label} debe tener entre ${minimum} y ${maximum} caracteres.`,
    );
  }
  return normalized;
}

export function normalizeRestaurantRegistrationInput(
  fields: RestaurantRegistrationFields,
  requestId: string,
): RestaurantRegistrationInput {
  const restaurantName = normalizeText(fields.restaurantName, "El nombre", 2, 80);
  const phone = fields.phone.trim().replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    throw new RestaurantRegistrationValidationError(
      "Ingresa un teléfono válido de 7 a 15 dígitos.",
    );
  }

  const city = normalizeText(fields.city, "La ciudad", 2, 80);
  const address = normalizeText(fields.address, "La dirección", 5, 160);
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(requestId)) {
    throw new RestaurantRegistrationValidationError(
      "No se pudo preparar una solicitud segura. Inténtalo de nuevo.",
    );
  }

  return { restaurantName, phone, city, address, requestId };
}
