import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "@/lib/firebase/client";
import {
  RestaurantRegistrationInput,
  RestaurantRegistrationResult,
} from "../domain/restaurant-registration";

export class FirebaseRestaurantsRepository {
  async registerRestaurant(
    input: RestaurantRegistrationInput,
  ): Promise<RestaurantRegistrationResult> {
    const register = httpsCallable<
      RestaurantRegistrationInput,
      RestaurantRegistrationResult
    >(getFirebaseFunctions(), "registerRestaurant");
    const response = await register(input);
    return response.data;
  }
}
