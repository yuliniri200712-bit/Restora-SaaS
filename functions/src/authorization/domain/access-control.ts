export const RESTAURANT_ROLES = [
  "owner",
  "administrator",
  "employee",
  "kitchen",
  "delivery",
] as const;

export type RestaurantRole = (typeof RESTAURANT_ROLES)[number];
export type PlatformRole = "superadmin";
export type BranchAccess = "all" | "selected";
export type MembershipStatus = "active" | "pending" | "suspended" | "removed";

export const TENANT_PERMISSIONS = [
  "restaurant.read",
  "restaurant.update",
  "members.read",
  "members.manage",
  "branches.list",
  "branches.read",
  "branches.manage",
  "catalog.read",
  "catalog.manage",
  "orders.read",
  "orders.manage",
  "kitchen.orders.readAssigned",
  "kitchen.orders.updateAssigned",
  "inventory.read",
  "inventory.manage",
  "delivery.orders.readAssigned",
  "delivery.orders.updateAssigned",
  "customers.read",
  "reports.read",
  "settings.manage",
  "subscription.read",
  "subscription.manage",
] as const;

export type TenantPermission = (typeof TENANT_PERMISSIONS)[number];

export const SELF_PERMISSIONS = [
  "profile.readOwn",
  "profile.updateOwn",
  "addresses.manageOwn",
  "orders.readOwn",
] as const;

export type SelfPermission = (typeof SELF_PERMISSIONS)[number];

export const PLATFORM_PERMISSIONS = [
  "platform.restaurants.read",
  "platform.restaurants.manage",
  "platform.users.read",
  "platform.users.manage",
  "platform.plans.manage",
  "platform.subscriptions.manage",
  "platform.payments.read",
  "platform.notifications.manage",
  "platform.support.manage",
  "platform.audit.read",
  "platform.config.manage",
  "platform.metrics.read",
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];

export type RestaurantMembership = {
  uid: string;
  role: RestaurantRole;
  status: MembershipStatus;
  branchAccess: BranchAccess;
  branchIds: readonly string[];
  permissions: readonly TenantPermission[];
};

export type PlatformRoleAssignment = {
  uid: string;
  role: PlatformRole;
  status: MembershipStatus;
  permissions: readonly PlatformPermission[];
};

const DELEGABLE_TENANT_PERMISSIONS: ReadonlySet<TenantPermission> = new Set([
  "restaurant.read",
  "restaurant.update",
  "members.read",
  "branches.list",
  "branches.read",
  "branches.manage",
  "catalog.read",
  "catalog.manage",
  "orders.read",
  "orders.manage",
  "inventory.read",
  "inventory.manage",
  "customers.read",
  "reports.read",
  "settings.manage",
]);

const KITCHEN_PERMISSIONS: readonly TenantPermission[] = [
  "kitchen.orders.readAssigned",
  "kitchen.orders.updateAssigned",
];

const DELIVERY_PERMISSIONS: readonly TenantPermission[] = [
  "delivery.orders.readAssigned",
  "delivery.orders.updateAssigned",
];

const BRANCH_SCOPED_PERMISSIONS: ReadonlySet<TenantPermission> = new Set([
  "branches.read",
  "branches.manage",
  "catalog.read",
  "catalog.manage",
  "orders.read",
  "orders.manage",
  "kitchen.orders.readAssigned",
  "kitchen.orders.updateAssigned",
  "inventory.read",
  "inventory.manage",
  "delivery.orders.readAssigned",
  "delivery.orders.updateAssigned",
  "customers.read",
  "reports.read",
]);

const OWNER_PERMISSIONS: readonly TenantPermission[] = TENANT_PERMISSIONS.filter(
  (permission) =>
    !KITCHEN_PERMISSIONS.includes(permission) &&
    !DELIVERY_PERMISSIONS.includes(permission),
);

export function isRestaurantRole(value: unknown): value is RestaurantRole {
  return RESTAURANT_ROLES.some((role) => role === value);
}

export function isTenantPermission(value: unknown): value is TenantPermission {
  return TENANT_PERMISSIONS.some((permission) => permission === value);
}

export function isPlatformPermission(
  value: unknown,
): value is PlatformPermission {
  return PLATFORM_PERMISSIONS.some((permission) => permission === value);
}

export function isBranchScopedPermission(
  permission: TenantPermission,
): boolean {
  return BRANCH_SCOPED_PERMISSIONS.has(permission);
}

export function getTenantPermissions(
  membership: RestaurantMembership,
): readonly TenantPermission[] {
  switch (membership.role) {
    case "owner":
      return OWNER_PERMISSIONS;
    case "administrator":
    case "employee":
      return membership.permissions.filter((permission) =>
        DELEGABLE_TENANT_PERMISSIONS.has(permission),
      );
    case "kitchen":
      return KITCHEN_PERMISSIONS;
    case "delivery":
      return DELIVERY_PERMISSIONS;
  }
}

export function hasBranchAccess(
  membership: RestaurantMembership,
  branchId: string,
): boolean {
  return (
    membership.branchAccess === "all" ||
    membership.branchIds.includes(branchId)
  );
}

export function canPerformTenantAction(
  membership: RestaurantMembership,
  permission: TenantPermission,
  branchId?: string,
): boolean {
  if (
    membership.status !== "active" ||
    !getTenantPermissions(membership).includes(permission)
  ) {
    return false;
  }

  if (isBranchScopedPermission(permission) && !branchId) return false;
  if (branchId && !hasBranchAccess(membership, branchId)) return false;

  return true;
}

export function canPerformSelfAction(
  authenticatedUid: string,
  resourceUid: string,
  permission: SelfPermission,
): boolean {
  return (
    authenticatedUid.length > 0 &&
    authenticatedUid === resourceUid &&
    SELF_PERMISSIONS.includes(permission)
  );
}

export function canPerformPlatformAction(
  assignment: PlatformRoleAssignment,
  permission: PlatformPermission,
): boolean {
  return (
    assignment.role === "superadmin" &&
    assignment.status === "active" &&
    assignment.permissions.includes(permission)
  );
}

export function isAssignedToUser(
  authenticatedUid: string,
  assignedUid: string | null | undefined,
): boolean {
  return typeof assignedUid === "string" && assignedUid === authenticatedUid;
}
