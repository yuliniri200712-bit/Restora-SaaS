import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { requireUid } from "../../shared/auth/callable-request";
import {
  parseRestaurantRegistrationInput,
  RestaurantRegistrationValidationError,
} from "../domain/restaurant-registration";
import {
  createRestaurantRegistration,
  RegisterRestaurantResult,
} from "../data/restaurant-registration.repository";

export async function registerRestaurant(
  request: CallableRequest<unknown>,
): Promise<RegisterRestaurantResult> {
  const ownerUid = requireUid(request);

  try {
    const input = parseRestaurantRegistrationInput(request.data);
    return await createRestaurantRegistration(ownerUid, input);
  } catch (error) {
    if (error instanceof RestaurantRegistrationValidationError) {
      throw new HttpsError("invalid-argument", error.message);
    }
    throw error;
  }
}
