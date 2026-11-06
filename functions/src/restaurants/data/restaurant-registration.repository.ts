import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { firestore } from "../../admin/firestore";
import {
  createRestaurantSlugBase,
  RestaurantRegistrationInput,
} from "../domain/restaurant-registration";

export type RegisterRestaurantResult = {
  restaurantId: string;
  branchId: string;
  slug: string;
  status: "setup";
  replayed: boolean;
};

function createInputHash(input: RestaurantRegistrationInput): string {
  const canonicalInput = JSON.stringify({
    restaurantName: input.restaurantName,
    phone: input.phone,
    city: input.city,
    address: input.address,
  });
  return createHash("sha256").update(canonicalInput).digest("hex");
}

async function findAvailableSlug(
  transaction: FirebaseFirestore.Transaction,
  baseSlug: string,
  restaurantId: string,
): Promise<string> {
  const candidates = [baseSlug];
  for (let length = 6; length <= restaurantId.length; length += 2) {
    const suffix = restaurantId.slice(0, length).toLowerCase();
    const prefix = baseSlug.slice(0, 63 - suffix.length);
    candidates.push(`${prefix.replace(/-+$/g, "")}-${suffix}`);
  }

  for (const candidate of candidates) {
    const reservation = await transaction.get(
      firestore.collection("restaurantSlugs").doc(candidate),
    );
    if (!reservation.exists) return candidate;
  }

  throw new HttpsError(
    "resource-exhausted",
    "No fue posible reservar un enlace único. Inténtalo de nuevo.",
  );
}

function readReplayResult(
  data: FirebaseFirestore.DocumentData,
): RegisterRestaurantResult {
  const restaurantId = data.restaurantId;
  const branchId = data.branchId;
  const slug = data.slug;
  if (
    typeof restaurantId !== "string" ||
    typeof branchId !== "string" ||
    typeof slug !== "string"
  ) {
    throw new HttpsError(
      "internal",
      "No se pudo recuperar el resultado de la solicitud anterior.",
    );
  }

  return { restaurantId, branchId, slug, status: "setup", replayed: true };
}

export async function createRestaurantRegistration(
  ownerUid: string,
  input: RestaurantRegistrationInput,
): Promise<RegisterRestaurantResult> {
  const inputHash = createInputHash(input);
  const restaurantRef = firestore.collection("restaurants").doc();
  const branchRef = restaurantRef.collection("branches").doc();
  const userRequestRef = firestore
    .collection("users")
    .doc(ownerUid)
    .collection("restaurantRegistrationRequests")
    .doc(input.requestId);
  const receiptRef = restaurantRef
    .collection("operationReceipts")
    .doc(input.requestId);
  const auditEventRef = restaurantRef.collection("auditEvents").doc();
  const baseSlug = createRestaurantSlugBase(input.restaurantName);

  return firestore.runTransaction(async (transaction) => {
    const previousRequest = await transaction.get(userRequestRef);
    if (previousRequest.exists) {
      const previousData = previousRequest.data() ?? {};
      if (previousData.inputHash !== inputHash) {
        throw new HttpsError(
          "failed-precondition",
          "Este identificador ya se usó con datos diferentes. Inicia una nueva solicitud.",
        );
      }
      return readReplayResult(previousData);
    }

    const slug = await findAvailableSlug(transaction, baseSlug, restaurantRef.id);
    const timestamp = FieldValue.serverTimestamp();

    transaction.create(firestore.collection("restaurantSlugs").doc(slug), {
      restaurantId: restaurantRef.id,
      ownerUid,
      createdAt: timestamp,
    });
    transaction.create(restaurantRef, {
      name: input.restaurantName,
      slug,
      ownerUid,
      contactPhone: input.phone,
      status: "setup",
      mainBranchId: branchRef.id,
      currentSubscriptionId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    transaction.create(branchRef, {
      restaurantId: restaurantRef.id,
      name: "Sede principal",
      code: "MAIN",
      city: input.city,
      address: input.address,
      phone: input.phone,
      status: "active",
      reservationTimeoutMinutes: 15,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    transaction.create(
      restaurantRef.collection("memberships").doc(ownerUid),
      {
        uid: ownerUid,
        role: "owner",
        status: "active",
        branchAccess: "all",
        branchIds: [],
        permissions: [],
        createdByUid: ownerUid,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    );
    transaction.create(auditEventRef, {
      actorUid: ownerUid,
      action: "restaurant.registered",
      resourceType: "restaurant",
      resourceId: restaurantRef.id,
      outcome: "completed",
      branchId: branchRef.id,
      slug,
      createdAt: timestamp,
    });
    transaction.create(receiptRef, {
      uid: ownerUid,
      operation: "restaurant.register",
      requestId: input.requestId,
      inputHash,
      restaurantId: restaurantRef.id,
      branchId: branchRef.id,
      slug,
      status: "setup",
      createdAt: timestamp,
    });
    transaction.create(userRequestRef, {
      uid: ownerUid,
      requestId: input.requestId,
      inputHash,
      restaurantId: restaurantRef.id,
      branchId: branchRef.id,
      slug,
      createdAt: timestamp,
    });

    return {
      restaurantId: restaurantRef.id,
      branchId: branchRef.id,
      slug,
      status: "setup",
      replayed: false,
    };
  });
}
