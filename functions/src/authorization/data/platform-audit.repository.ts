import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "../../admin/firestore";
import { PlatformPermission } from "../domain/access-control";

export type PlatformResourceType =
  | "restaurant"
  | "user"
  | "plan"
  | "subscription"
  | "payment"
  | "notification"
  | "support_case"
  | "configuration";

export type PlatformAuditOutcome = "allowed" | "denied" | "completed" | "failed";

export type PlatformAuditEvent = {
  actorUid: string;
  action: PlatformPermission;
  resourceType: PlatformResourceType;
  resourceId: string;
  outcome: PlatformAuditOutcome;
};

export async function recordPlatformAuditEvent(
  event: PlatformAuditEvent,
): Promise<void> {
  if (
    event.actorUid.length === 0 ||
    event.resourceId.length === 0 ||
    event.resourceId.includes("/")
  ) {
    throw new Error("El evento de auditoría de plataforma no es válido.");
  }

  await firestore.collection("platformAuditEvents").add({
    ...event,
    createdAt: FieldValue.serverTimestamp(),
  });
}
