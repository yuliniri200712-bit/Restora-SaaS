import {
  CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import {
  canPerformPlatformAction,
  canPerformTenantAction,
  getTenantPermissions,
  isAssignedToUser,
  PlatformPermission,
  RestaurantRole,
  SelfPermission,
  TenantPermission,
  canPerformSelfAction,
} from "../domain/access-control";
import {
  getPlatformRoleAssignment,
  getRestaurantMembership,
} from "../data/firestore-access.repository";

export type OwnRestaurantAccess = {
  restaurantId: string;
  branchId?: string;
  role: RestaurantRole;
  branchAccess: "all" | "selected";
  branchIds: string[];
  permissions: readonly TenantPermission[];
};

export type OwnPlatformAccess = {
  role: "superadmin" | null;
  permissions: readonly PlatformPermission[];
};

export type TenantAuthorizationContext = {
  uid: string;
  restaurantId: string;
  role: RestaurantRole;
  branchAccess: "all" | "selected";
  branchIds: readonly string[];
  branchId?: string;
};

type AssignedTenantPermission =
  | "kitchen.orders.readAssigned"
  | "kitchen.orders.updateAssigned"
  | "delivery.orders.readAssigned"
  | "delivery.orders.updateAssigned";

const ASSIGNED_TENANT_PERMISSIONS: ReadonlySet<TenantPermission> = new Set([
  "kitchen.orders.readAssigned",
  "kitchen.orders.updateAssigned",
  "delivery.orders.readAssigned",
  "delivery.orders.updateAssigned",
]);

function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Inicia sesión para continuar.");
  }
  return uid;
}

function parseDocumentId(value: unknown, label: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (
    normalized.length === 0 ||
    normalized.includes("/") ||
    normalized.length > 128
  ) {
    throw new HttpsError("invalid-argument", `El identificador de ${label} no es válido.`);
  }
  return normalized;
}

/** Returns permission hints for the UI; mutations must call requireTenantPermission. */
export async function resolveOwnRestaurantAccess(
  request: CallableRequest<{ restaurantId?: unknown; branchId?: unknown }>,
): Promise<OwnRestaurantAccess> {
  const uid = requireUid(request);
  const restaurantId = parseDocumentId(request.data?.restaurantId, "restaurante");
  const branchId =
    request.data?.branchId === undefined || request.data?.branchId === null
      ? undefined
      : parseDocumentId(request.data.branchId, "sede");
  const membership = await getRestaurantMembership(restaurantId, uid);

  if (!membership || membership.status !== "active") {
    throw new HttpsError("permission-denied", "No tienes acceso a este restaurante.");
  }

  if (
    branchId &&
    membership.branchAccess === "selected" &&
    !membership.branchIds.includes(branchId)
  ) {
    throw new HttpsError("permission-denied", "No tienes acceso a esta sede.");
  }

  return {
    restaurantId,
    ...(branchId ? { branchId } : {}),
    role: membership.role,
    branchAccess: membership.branchAccess,
    branchIds: membership.branchAccess === "selected" ? [...membership.branchIds] : [],
    permissions: getTenantPermissions(membership),
  };
}

export async function resolveOwnPlatformAccess(
  request: CallableRequest<Record<string, never>>,
): Promise<OwnPlatformAccess> {
  const uid = requireUid(request);
  const assignment = await getPlatformRoleAssignment(uid);

  if (!assignment || assignment.status !== "active") {
    return { role: null, permissions: [] };
  }

  return { role: assignment.role, permissions: assignment.permissions };
}

async function authorizeTenantPermission(
  request: CallableRequest<unknown>,
  restaurantIdValue: unknown,
  permission: TenantPermission,
  branchIdValue?: unknown,
  assignedUid?: unknown,
): Promise<TenantAuthorizationContext> {
  const uid = requireUid(request);
  const restaurantId = parseDocumentId(restaurantIdValue, "restaurante");
  const branchId =
    branchIdValue === undefined || branchIdValue === null
      ? undefined
      : parseDocumentId(branchIdValue, "sede");
  const membership = await getRestaurantMembership(restaurantId, uid);
  if (
    !membership ||
    !canPerformTenantAction(membership, permission, branchId)
  ) {
    throw new HttpsError("permission-denied", "No tienes permiso para esta acción.");
  }

  if (
    ASSIGNED_TENANT_PERMISSIONS.has(permission) &&
    !isAssignedToUser(uid, typeof assignedUid === "string" ? assignedUid : null)
  ) {
    throw new HttpsError("permission-denied", "El recurso no está asignado a tu usuario.");
  }

  return {
    uid,
    restaurantId,
    role: membership.role,
    branchAccess: membership.branchAccess,
    branchIds: membership.branchAccess === "selected" ? membership.branchIds : [],
    ...(branchId ? { branchId } : {}),
  };
}

export function requireTenantPermission(
  request: CallableRequest<unknown>,
  restaurantId: unknown,
  permission: TenantPermission,
  branchId?: unknown,
): Promise<TenantAuthorizationContext> {
  return authorizeTenantPermission(request, restaurantId, permission, branchId);
}

export function requireAssignedTenantPermission(
  request: CallableRequest<unknown>,
  restaurantId: unknown,
  permission: AssignedTenantPermission,
  assignedUid: unknown,
  branchId?: unknown,
): Promise<TenantAuthorizationContext> {
  return authorizeTenantPermission(
    request,
    restaurantId,
    permission,
    branchId,
    assignedUid,
  );
}

export async function requirePlatformPermission(
  request: CallableRequest<unknown>,
  permission: PlatformPermission,
): Promise<{ uid: string; role: "superadmin" }> {
  const uid = requireUid(request);
  const assignment = await getPlatformRoleAssignment(uid);
  if (!assignment || !canPerformPlatformAction(assignment, permission)) {
    throw new HttpsError("permission-denied", "No tienes permiso de plataforma para esta acción.");
  }

  return { uid, role: assignment.role };
}

export function requireSelfPermission(
  request: CallableRequest<unknown>,
  resourceUidValue: unknown,
  permission: SelfPermission,
): { uid: string } {
  const uid = requireUid(request);
  const resourceUid = parseDocumentId(resourceUidValue, "usuario");
  if (!canPerformSelfAction(uid, resourceUid, permission)) {
    throw new HttpsError("permission-denied", "Solo puedes acceder a tus propios datos.");
  }

  return { uid };
}
