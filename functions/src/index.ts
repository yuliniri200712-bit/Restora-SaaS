import { onCall } from "firebase-functions/v2/https";
import {
  OwnPlatformAccess,
  OwnRestaurantAccess,
  resolveOwnPlatformAccess,
  resolveOwnRestaurantAccess,
} from "./authorization/application/authorization.service";

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
