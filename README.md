# Restora SaaS

Plataforma SaaS multiempresa para restaurantes. El producto se construye con Next.js, TypeScript y Firebase; el alojamiento web aprobado es Firebase App Hosting.

## Desarrollo local

Requisitos: Node.js 24.12 o superior, npm, Firebase CLI y Java JDK 11 o superior para Firestore Emulator.

1. Instala dependencias de la app: `npm install`.
2. Instala dependencias backend: `npm --prefix functions install`.
3. Crea `.env.local` a partir de `.env.example` y agrega la API key, dominio Auth y App ID de la Web App Firebase de desarrollo. Conserva `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-restora-saas` para que coincida con los emuladores. El archivo `.env.local` está excluido de Git.
4. Compila Cloud Functions: `npm --prefix functions run build`.
5. Inicia los emuladores en una terminal: `firebase emulators:start --only auth,firestore,functions`.
6. Inicia la aplicación en otra terminal: `npm run dev`.
7. Abre `http://localhost:3000`.

La app usa Authentication Emulator en desarrollo para que los registros de prueba no se creen en el proyecto Firebase real. El alias único se reserva mediante una Cloud Function local y una transacción en Firestore Emulator. No conectes `restora-demo` a un entorno de producción.

## Rutas actuales

- `/`: inicio de Restora y enlaces a registro e inicio de sesión.
- `/registro`: alta con correo y contraseña.
- `/login`: inicio de sesión.
- `/cuenta`: verificación de sesión, cierre de sesión y edición del nombre visible y del alias único del perfil propio.
- `/recuperar-contrasena`: solicitud de enlace para restablecer la contraseña. En local, el enlace aparece en la terminal de Authentication Emulator; no se envía correo real.

Los perfiles completos de usuario en Firestore, perfiles de restaurante, tenants, roles y despliegue de App Hosting aún no están implementados. El nombre visible se guarda en Firebase Authentication; las reservas de alias las administra Cloud Functions.

## Comandos

- `npm run dev`: servidor de desarrollo.
- `npm run lint`: ESLint.
- `npm run typecheck`: comprobación TypeScript.
- `npm run build`: build de Next.js.

Consulta `TASKS.md` y `docs/DEVELOPMENT_ROADMAP.md` para el estado y la siguiente jornada.
