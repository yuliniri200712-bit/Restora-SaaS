import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

const projectId = "demo-restora-day14";
let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8"),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    const documents = [
      ["users/customer-1", { displayName: "Cliente uno" }],
      ["users/customer-2", { displayName: "Cliente dos" }],
      ["restaurants/tenant-a", { name: "Restaurante A" }],
      ["restaurants/tenant-b", { name: "Restaurante B" }],
      ["restaurants/tenant-a/memberships/owner-a", {
        uid: "owner-a",
        role: "owner",
        status: "active",
        branchAccess: "all",
        branchIds: [],
        permissions: [],
      }],
      ["restaurants/tenant-a/memberships/admin-a", {
        uid: "admin-a",
        role: "administrator",
        status: "active",
        branchAccess: "selected",
        branchIds: ["branch-a"],
        permissions: [
          "restaurant.read",
          "branches.list",
          "branches.read",
          "catalog.read",
          "orders.read",
        ],
      }],
      ["restaurants/tenant-a/memberships/employee-a", {
        uid: "employee-a",
        role: "employee",
        status: "active",
        branchAccess: "all",
        branchIds: [],
        permissions: ["catalog.read", "subscription.read", "members.manage"],
      }],
      ["restaurants/tenant-a/memberships/kitchen-a", {
        uid: "kitchen-a",
        role: "kitchen",
        status: "active",
        branchAccess: "selected",
        branchIds: ["branch-a"],
        permissions: [],
      }],
      ["restaurants/tenant-a/memberships/courier-a", {
        uid: "courier-a",
        role: "delivery",
        status: "active",
        branchAccess: "selected",
        branchIds: ["branch-a"],
        permissions: [],
      }],
      ["restaurants/tenant-a/memberships/courier-b", {
        uid: "courier-b",
        role: "delivery",
        status: "active",
        branchAccess: "all",
        branchIds: [],
        permissions: [],
      }],
      ["restaurants/tenant-a/memberships/suspended-a", {
        uid: "suspended-a",
        role: "owner",
        status: "suspended",
        branchAccess: "all",
        branchIds: [],
        permissions: [],
      }],
      ["restaurants/tenant-b/memberships/owner-b", {
        uid: "owner-b",
        role: "owner",
        status: "active",
        branchAccess: "all",
        branchIds: [],
        permissions: [],
      }],
      ["restaurants/tenant-a/branches/branch-a", { name: "Sede A" }],
      ["restaurants/tenant-a/branches/branch-b", { name: "Sede B" }],
      ["restaurants/tenant-a/branches/branch-a/inventoryItems/item-a", {
        branchId: "branch-a",
        quantityOnHand: 20,
        quantityReserved: 2,
      }],
      ["restaurants/tenant-a/branches/branch-b/inventoryItems/item-b", {
        branchId: "branch-b",
        quantityOnHand: 30,
        quantityReserved: 0,
      }],
      ["restaurants/tenant-a/categories/category-a", { name: "Comidas" }],
      ["restaurants/tenant-a/products/product-a", { name: "Producto A", priceCop: 12000 }],
      ["restaurants/tenant-b/products/product-b", { name: "Producto B", priceCop: 15000 }],
      ["restaurants/tenant-a/subscriptions/subscription-a", { status: "trial" }],
      ["restaurants/tenant-a/orders/order-customer", {
        restaurantId: "tenant-a",
        branchId: "branch-a",
        customerUid: "customer-1",
        status: "received",
        contactSnapshot: { phone: "555-0101" },
        addressSnapshot: { address: "Calle de prueba" },
      }],
      ["restaurants/tenant-a/orders/order-other-customer", {
        restaurantId: "tenant-a",
        branchId: "branch-a",
        customerUid: "customer-2",
        status: "received",
      }],
      ["restaurants/tenant-a/orders/order-kitchen", {
        restaurantId: "tenant-a",
        branchId: "branch-a",
        customerUid: "customer-2",
        kitchenUid: "kitchen-a",
        status: "preparing",
        contactSnapshot: { phone: "555-0102" },
        addressSnapshot: { address: "Otra calle" },
      }],
      ["restaurants/tenant-a/orders/order-delivery", {
        restaurantId: "tenant-a",
        branchId: "branch-a",
        customerUid: "customer-2",
        currentDeliveryAssignmentId: "assignment-a",
        status: "outForDelivery",
      }],
      ["restaurants/tenant-a/orders/order-delivery-other", {
        restaurantId: "tenant-a",
        branchId: "branch-a",
        customerUid: "customer-2",
        currentDeliveryAssignmentId: "assignment-b",
        status: "outForDelivery",
      }],
      ["restaurants/tenant-a/orders/order-branch-b", {
        restaurantId: "tenant-a",
        branchId: "branch-b",
        customerUid: "customer-2",
        status: "received",
      }],
      ["restaurants/tenant-a/orders/order-kitchen/items/line-a", {
        productId: "product-a",
        name: "Producto A",
        quantity: 1,
        unitPriceCop: 12000,
      }],
      ["restaurants/tenant-a/orders/order-other-customer/items/line-b", {
        productId: "product-a",
        name: "Producto A",
        quantity: 1,
        unitPriceCop: 12000,
      }],
      ["restaurants/tenant-a/kitchenTasks/task-assigned", {
        restaurantId: "tenant-a",
        branchId: "branch-a",
        orderId: "order-kitchen",
        kitchenUid: "kitchen-a",
        status: "queued",
        preparationSummary: ["Producto A x1"],
      }],
      ["restaurants/tenant-a/kitchenTasks/task-other", {
        restaurantId: "tenant-a",
        branchId: "branch-a",
        orderId: "order-other-customer",
        kitchenUid: "someone-else",
        status: "queued",
        preparationSummary: ["Producto A x1"],
      }],
      ["restaurants/tenant-a/deliveryAssignments/assignment-a", {
        orderId: "order-delivery",
        branchId: "branch-a",
        courierUid: "courier-a",
        status: "assigned",
      }],
      ["restaurants/tenant-a/deliveryAssignments/assignment-b", {
        orderId: "order-delivery-other",
        branchId: "branch-a",
        courierUid: "courier-b",
        status: "assigned",
      }],
      ["publicRestaurants/public-a", { published: true, name: "Público" }],
      ["publicRestaurants/public-a/products/product-live", { published: true, name: "Visible" }],
      ["publicRestaurants/public-a/products/product-hidden", { published: false, name: "Oculto" }],
      ["publicRestaurants/private-a", { published: false, name: "Privado" }],
      ["publicRestaurants/private-a/products/product-private", { published: true, name: "No publicar" }],
      ["platformRoles/superadmin-a", {
        uid: "superadmin-a",
        role: "superadmin",
        status: "active",
        permissions: ["platform.audit.read"],
      }],
      ["platformAuditEvents/event-a", { actorUid: "superadmin-a", action: "review" }],
    ];

    for (const [path, data] of documents) {
      await setDoc(doc(firestore, path), data);
    }
  });
});

after(async () => {
  await testEnvironment?.cleanup();
});

function client(uid) {
  return testEnvironment.authenticatedContext(uid).firestore();
}

test("requiere autenticación para datos privados", async () => {
  const guest = testEnvironment.unauthenticatedContext().firestore();

  await assertFails(getDoc(doc(guest, "restaurants/tenant-a")));
  await assertFails(getDoc(doc(guest, "users/customer-1")));
  await assertFails(getDoc(doc(guest, "restaurants/tenant-a/orders/order-customer")));
});

test("aísla tenant y permite al propietario leer su restaurante y sedes", async () => {
  const owner = client("owner-a");

  await assertSucceeds(getDoc(doc(owner, "restaurants/tenant-a")));
  await assertSucceeds(getDoc(doc(owner, "restaurants/tenant-a/branches/branch-b")));
  await assertFails(getDoc(doc(owner, "restaurants/tenant-b")));
  await assertFails(getDoc(doc(owner, "restaurants/tenant-b/products/product-b")));
  await assertFails(getDoc(doc(owner, "restaurants/tenant-a/memberships/admin-a")));
});

test("limita administrador delegado a sus permisos y sedes seleccionadas", async () => {
  const admin = client("admin-a");

  await assertSucceeds(getDoc(doc(admin, "restaurants/tenant-a/products/product-a")));
  await assertSucceeds(getDoc(doc(admin, "restaurants/tenant-a/branches/branch-a")));
  await assertFails(getDoc(doc(admin, "restaurants/tenant-a/branches/branch-b")));
  await assertFails(getDoc(doc(admin, "restaurants/tenant-a/branches/branch-a/inventoryItems/item-a")));
  await assertFails(getDoc(doc(admin, "restaurants/tenant-b/products/product-b")));
});

test("no permite que empleado use permisos no delegables aunque estén en el documento", async () => {
  const employee = client("employee-a");

  await assertSucceeds(getDoc(doc(employee, "restaurants/tenant-a/products/product-a")));
  await assertFails(getDoc(doc(employee, "restaurants/tenant-a/subscriptions/subscription-a")));
  await assertFails(getDoc(doc(employee, "restaurants/tenant-a/memberships/owner-a")));
});

test("deniega miembros suspendidos", async () => {
  const suspended = client("suspended-a");

  await assertFails(getDoc(doc(suspended, "restaurants/tenant-a")));
  await assertFails(getDoc(doc(suspended, "restaurants/tenant-a/products/product-a")));
});

test("permite perfil y pedido propios, pero no recursos de otro UID", async () => {
  const customer = client("customer-1");

  await assertSucceeds(getDoc(doc(customer, "users/customer-1")));
  await assertFails(getDoc(doc(customer, "users/customer-2")));
  await assertSucceeds(getDoc(doc(customer, "restaurants/tenant-a/orders/order-customer")));
  await assertFails(getDoc(doc(customer, "restaurants/tenant-a/orders/order-other-customer")));
  await assertSucceeds(updateDoc(doc(customer, "users/customer-1"), {
    displayName: "Nombre actualizado",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(customer, "users/customer-1"), {
    status: "superadmin",
    updatedAt: serverTimestamp(),
  }));
});

test("cocina lee tareas y líneas asignadas sin acceder al pedido con PII", async () => {
  const kitchen = client("kitchen-a");

  await assertSucceeds(getDoc(doc(kitchen, "restaurants/tenant-a/kitchenTasks/task-assigned")));
  await assertFails(getDoc(doc(kitchen, "restaurants/tenant-a/kitchenTasks/task-other")));
  await assertSucceeds(getDoc(doc(kitchen, "restaurants/tenant-a/orders/order-kitchen/items/line-a")));
  await assertFails(getDoc(doc(kitchen, "restaurants/tenant-a/orders/order-other-customer/items/line-b")));
  await assertFails(getDoc(doc(kitchen, "restaurants/tenant-a/orders/order-kitchen")));
  await assertFails(updateDoc(doc(kitchen, "restaurants/tenant-a/orders/order-kitchen"), {
    status: "ready",
  }));
});

test("domiciliario solo lee el pedido y asignación vigentes a su UID", async () => {
  const courier = client("courier-a");
  const otherCourier = client("courier-b");

  await assertSucceeds(getDoc(doc(courier, "restaurants/tenant-a/orders/order-delivery")));
  await assertSucceeds(getDoc(doc(courier, "restaurants/tenant-a/deliveryAssignments/assignment-a")));
  await assertFails(getDoc(doc(courier, "restaurants/tenant-a/orders/order-delivery-other")));
  await assertFails(getDoc(doc(courier, "restaurants/tenant-a/deliveryAssignments/assignment-b")));
  await assertSucceeds(getDoc(doc(otherCourier, "restaurants/tenant-a/orders/order-delivery-other")));
});

test("solo expone proyecciones públicas publicadas", async () => {
  const guest = testEnvironment.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(guest, "publicRestaurants/public-a")));
  await assertSucceeds(getDoc(doc(guest, "publicRestaurants/public-a/products/product-live")));
  await assertFails(getDoc(doc(guest, "publicRestaurants/public-a/products/product-hidden")));
  await assertFails(getDoc(doc(guest, "publicRestaurants/private-a")));
  await assertFails(getDoc(doc(guest, "publicRestaurants/private-a/products/product-private")));
  await assertFails(setDoc(doc(guest, "publicRestaurants/new-restaurant"), { published: true }));
});

test("rechaza escrituras directas a pedidos, inventario, membresías y pagos", async () => {
  const owner = client("owner-a");

  await assertFails(updateDoc(doc(owner, "restaurants/tenant-a/orders/order-customer"), {
    status: "cancelled",
  }));
  await assertFails(updateDoc(doc(owner, "restaurants/tenant-a/branches/branch-a/inventoryItems/item-a"), {
    quantityOnHand: 999,
  }));
  await assertFails(setDoc(doc(owner, "restaurants/tenant-a/memberships/new-user"), {
    uid: "new-user",
    role: "owner",
    status: "active",
  }));
  await assertFails(setDoc(doc(owner, "restaurants/tenant-a/paymentTransactions/payment-a"), {
    status: "verified",
    amountCop: 100,
  }));
});

test("lectura de auditoría global requiere permiso explícito de plataforma", async () => {
  const superadmin = client("superadmin-a");
  const ordinaryUser = client("owner-a");

  await assertSucceeds(getDoc(doc(superadmin, "platformAuditEvents/event-a")));
  await assertFails(getDoc(doc(superadmin, "platformRoles/superadmin-a")));
  await assertFails(getDoc(doc(ordinaryUser, "platformAuditEvents/event-a")));
});

test("las consultas incluyen filtros compatibles con las reglas", async () => {
  const customer = client("customer-1");
  const admin = client("admin-a");
  const guest = testEnvironment.unauthenticatedContext().firestore();

  await assertSucceeds(getDocs(query(
    collection(customer, "restaurants/tenant-a/orders"),
    where("customerUid", "==", "customer-1"),
  )));
  await assertFails(getDocs(collection(customer, "restaurants/tenant-a/orders")));
  await assertSucceeds(getDocs(query(
    collection(admin, "restaurants/tenant-a/orders"),
    where("branchId", "==", "branch-a"),
  )));
  await assertFails(getDocs(collection(admin, "restaurants/tenant-a/orders")));
  await assertSucceeds(getDocs(query(
    collection(guest, "publicRestaurants"),
    where("published", "==", true),
  )));
  await assertFails(getDocs(collection(guest, "publicRestaurants")));
  await assertSucceeds(getDocs(query(
    collection(admin, "restaurants/tenant-a/branches"),
    where(documentId(), "==", "branch-a"),
  )));
  await assertFails(getDocs(collection(admin, "restaurants/tenant-a/branches")));
});
