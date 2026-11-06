import { HttpsError } from "firebase-functions/v2/https";
import { firestore } from "../../admin/firestore";
import {
  BranchAccess,
  isPlatformPermission,
  isRestaurantRole,
  isTenantPermission,
  MembershipStatus,
  PlatformRoleAssignment,
  RestaurantMembership,
} from "../domain/access-control";

function parseMembershipStatus(value: unknown): MembershipStatus {
  if (
    value === "active" ||
    value === "pending" ||
    value === "suspended" ||
    value === "removed"
  ) {
    return value;
  }

  throw new HttpsError("permission-denied", "La membresía no es válida.");
}

function parseStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.length > 0 && !item.includes("/"),
  );
}

function parseMembership(
  uid: string,
  data: FirebaseFirestore.DocumentData,
): RestaurantMembership {
  if (data.uid !== uid || !isRestaurantRole(data.role)) {
    throw new HttpsError("permission-denied", "La membresía no es válida.");
  }

  const branchAccess: BranchAccess = data.branchAccess;
  if (branchAccess !== "all" && branchAccess !== "selected") {
    throw new HttpsError("permission-denied", "El alcance de sede no es válido.");
  }

  const permissions = Array.isArray(data.permissions)
    ? data.permissions.filter(isTenantPermission)
    : [];

  return {
    uid,
    role: data.role,
    status: parseMembershipStatus(data.status),
    branchAccess,
    branchIds: parseStringList(data.branchIds),
    permissions,
  };
}

export async function getRestaurantMembership(
  restaurantId: string,
  uid: string,
): Promise<RestaurantMembership | null> {
  const snapshot = await firestore
    .collection("restaurants")
    .doc(restaurantId)
    .collection("memberships")
    .doc(uid)
    .get();

  if (!snapshot.exists) return null;
  return parseMembership(uid, snapshot.data() ?? {});
}

export async function getPlatformRoleAssignment(
  uid: string,
): Promise<PlatformRoleAssignment | null> {
  const snapshot = await firestore.collection("platformRoles").doc(uid).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() ?? {};
  if (data.uid !== uid || data.role !== "superadmin") return null;

  const permissions = Array.isArray(data.permissions)
    ? data.permissions.filter(isPlatformPermission)
    : [];

  return {
    uid,
    role: "superadmin",
    status: parseMembershipStatus(data.status),
    permissions,
  };
}
