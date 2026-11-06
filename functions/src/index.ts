import { onCall } from "firebase-functions/v2/https";
import {
  OwnPlatformAccess,
  OwnRestaurantAccess,
  resolveOwnPlatformAccess,
  resolveOwnRestaurantAccess,
} from "./authorization/application/authorization.service";
import { registerRestaurant as registerRestaurantService } from "./restaurants/application/register-restaurant.service";

type RestaurantAccessRequest = {
  restaurantId?: unknown;
  branchId?: unknown;
};

export const getOwnRestaurantAccess = onCall<
  RestaurantAccessRequest,
  Promise<OwnRestaurantAccess>
>({ region: "us-central1" }, async (request) =>
  resolveOwnRestaurantAccess(request),
);

export const getOwnPlatformAccess = onCall<
  Record<string, never>,
  Promise<OwnPlatformAccess>
>({ region: "us-central1" }, async (request) =>
  resolveOwnPlatformAccess(request),
);

export const registerRestaurant = onCall<unknown, Promise<{
  restaurantId: string;
  branchId: string;
  slug: string;
  status: "setup";
  replayed: boolean;
}>>({ region: "us-central1" }, (request) =>
  registerRestaurantService(request),
);
