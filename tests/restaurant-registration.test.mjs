import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { randomUUID } from "node:crypto";
import { deleteApp, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";

const projectId = "demo-restora-day15";
let app;
let auth;
let firestore;
let functions;

before(async () => {
  app = initializeApp(
    {
      apiKey: "demo-api-key",
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      appId: "1:123456789:web:day15test",
    },
    `restora-day15-${randomUUID()}`,
  );
  auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9299", {
    disableWarnings: true,
  });
  firestore = getFirestore(app);
  connectFirestoreEmulator(firestore, "127.0.0.1", 8280);
  functions = getFunctions(app, "us-central1");
  connectFunctionsEmulator(functions, "127.0.0.1", 5101);
});

beforeEach(async () => {
  if (auth.currentUser) await signOut(auth);
  const response = await fetch(
    `http://127.0.0.1:8280/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: "DELETE" },
  );
  assert.equal(response.ok, true, "Firestore Emulator debe poder limpiar la base de prueba");
});

after(async () => {
  if (app) await deleteApp(app);
});

function sampleInput(overrides = {}) {
  return {
    restaurantName: "Café Andino",
    phone: "+57 (300) 123-4567",
    city: "Cúcuta",
    address: "Avenida 0 # 10-20",
    requestId: `request-${randomUUID()}`,
    ...overrides,
  };
}

async function createAuthenticatedUser() {
  const email = `day15-${randomUUID()}@example.test`;
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    "RestoraTest123!",
  );
  return credential.user;
}

async function call(name, data) {
  const callable = httpsCallable(functions, name);
  const result = await callable(data);
  return result.data;
}

async function expectCallableError(promise, code) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

test("rechaza el registro cuando no hay una sesión autenticada", async () => {
  await expectCallableError(
    call("registerRestaurant", sampleInput()),
    "functions/unauthenticated",
  );
});

test("crea restaurante, sede principal y membresía owner legible por autorización", async () => {
  const user = await createAuthenticatedUser();
  const input = sampleInput();
  const result = await call("registerRestaurant", input);

  assert.equal(result.status, "setup");
  assert.equal(result.replayed, false);
  assert.match(result.restaurantId, /^[A-Za-z0-9]+$/);
  assert.match(result.branchId, /^[A-Za-z0-9]+$/);
  assert.equal(result.slug, "cafe-andino");

  const restaurantSnapshot = await getDoc(
    doc(firestore, `restaurants/${result.restaurantId}`),
  );
  assert.equal(restaurantSnapshot.exists(), true);
  assert.equal(restaurantSnapshot.data().ownerUid, user.uid);
  assert.equal(restaurantSnapshot.data().status, "setup");
  assert.equal(restaurantSnapshot.data().currentSubscriptionId, null);
  assert.equal(restaurantSnapshot.data().mainBranchId, result.branchId);

  const branchSnapshot = await getDoc(
    doc(firestore, `restaurants/${result.restaurantId}/branches/${result.branchId}`),
  );
  assert.equal(branchSnapshot.exists(), true);
  assert.equal(branchSnapshot.data().city, "Cúcuta");
  assert.equal(branchSnapshot.data().address, "Avenida 0 # 10-20");
  assert.equal(branchSnapshot.data().code, "MAIN");

  const membershipSnapshot = await getDoc(
    doc(firestore, `restaurants/${result.restaurantId}/memberships/${user.uid}`),
  );
  assert.equal(membershipSnapshot.exists(), true);
  assert.equal(membershipSnapshot.data().uid, user.uid);
  assert.equal(membershipSnapshot.data().role, "owner");
  assert.equal(membershipSnapshot.data().status, "active");

  const access = await call("getOwnRestaurantAccess", {
    restaurantId: result.restaurantId,
  });
  assert.equal(access.restaurantId, result.restaurantId);
  assert.equal(access.role, "owner");
  assert.equal(access.branchAccess, "all");
});

test("un reintento con los mismos datos y requestId devuelve el mismo restaurante", async () => {
  await createAuthenticatedUser();
  const input = sampleInput();
  const [first, replay] = await Promise.all([
    call("registerRestaurant", input),
    call("registerRestaurant", input),
  ]);

  assert.equal(replay.restaurantId, first.restaurantId);
  assert.equal(replay.branchId, first.branchId);
  assert.equal(replay.slug, first.slug);
  assert.notEqual(first.replayed, replay.replayed);
});

test("rechaza reutilizar un requestId con datos diferentes", async () => {
  await createAuthenticatedUser();
  const input = sampleInput();
  await call("registerRestaurant", input);

  await expectCallableError(
    call("registerRestaurant", {
      ...input,
      restaurantName: "Otro restaurante",
    }),
    "functions/failed-precondition",
  );
});

test("reserva un slug único cuando el nombre ya está registrado", async () => {
  await createAuthenticatedUser();
  const [first, second] = await Promise.all([
    call("registerRestaurant", sampleInput()),
    call("registerRestaurant", sampleInput()),
  ]);

  const slugs = [first.slug, second.slug];
  assert.equal(slugs.filter((slug) => slug === "cafe-andino").length, 1);
  assert.match(
    slugs.find((slug) => slug !== "cafe-andino"),
    /^cafe-andino-[a-z0-9]+$/,
  );
  assert.notEqual(second.restaurantId, first.restaurantId);
});

test("rechaza entradas inválidas antes de crear datos", async () => {
  await createAuthenticatedUser();

  await expectCallableError(
    call("registerRestaurant", sampleInput({ restaurantName: "x" })),
    "functions/invalid-argument",
  );
  await expectCallableError(
    call("registerRestaurant", sampleInput({ phone: "no es teléfono" })),
    "functions/invalid-argument",
  );
  await expectCallableError(
    call("registerRestaurant", sampleInput({ address: "cal" })),
    "functions/invalid-argument",
  );
});
