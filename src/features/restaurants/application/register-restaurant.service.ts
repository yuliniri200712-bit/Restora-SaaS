import { FirebaseRestaurantsRepository } from "../data/firebase-restaurants.repository";
import {
  normalizeRestaurantRegistrationInput,
  RestaurantRegistrationFields,
  RestaurantRegistrationResult,
} from "../domain/restaurant-registration";

const repository = new FirebaseRestaurantsRepository();

export function registerRestaurant(
  fields: RestaurantRegistrationFields,
  requestId: string,
): Promise<RestaurantRegistrationResult> {
  const input = normalizeRestaurantRegistrationInput(fields, requestId);
  return repository.registerRestaurant(input);
}
