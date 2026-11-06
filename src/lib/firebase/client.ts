import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
} from "firebase/functions";

type FirebaseRuntime = typeof globalThis & {
  __restoraAuthEmulatorConnections?: WeakSet<Auth>;
  __restoraFunctionsEmulatorConnections?: WeakSet<Functions>;
};

function getFirebaseApp(): FirebaseApp {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const missingValues = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingValues.length > 0) {
    throw new Error(
      `Falta configurar Firebase en el entorno local: ${missingValues.join(", ")}.`,
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    (config.projectId === "restora-demo" ||
      config.projectId?.startsWith("demo-") === true)
  ) {
    throw new Error(
      "Un proyecto Firebase de desarrollo o demostración no puede usarse en producción.",
    );
  }

  return getApps().length > 0 ? getApp() : initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  const useEmulator =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR !== "false";

  if (useEmulator) {
    const runtime = globalThis as FirebaseRuntime;
    const connections =
      runtime.__restoraAuthEmulatorConnections ?? new WeakSet<Auth>();
    runtime.__restoraAuthEmulatorConnections = connections;

    if (!connections.has(auth)) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", {
        disableWarnings: true,
      });
      connections.add(auth);
    }
  }

  return auth;
}

export function getFirebaseFunctions(): Functions {
  const functions = getFunctions(getFirebaseApp(), "us-central1");
  const useEmulator =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR !== "false";

  if (useEmulator) {
    const runtime = globalThis as FirebaseRuntime;
    const connections =
      runtime.__restoraFunctionsEmulatorConnections ?? new WeakSet<Functions>();
    runtime.__restoraFunctionsEmulatorConnections = connections;

    if (!connections.has(functions)) {
      connectFunctionsEmulator(functions, "127.0.0.1", 5001);
      connections.add(functions);
    }
  }

  return functions;
}
