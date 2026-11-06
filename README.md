# Restora SaaS

Plataforma SaaS multiempresa para restaurantes. El producto se construye con Next.js, TypeScript y Firebase; el alojamiento web aprobado es Firebase App Hosting.

## Desarrollo local

Requisitos: Node.js 24.12 o superior, npm, Firebase CLI y Java JDK 11 o superior para Firestore Emulator. Cloud Functions usa Node.js 22 en despliegues.

1. Instala dependencias: `npm install`.
2. Crea `.env.local` a partir de `.env.example` y agrega la API key, dominio Auth y App ID de la Web App Firebase de desarrollo. Conserva `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-restora-saas` para que coincida con los emuladores. El archivo `.env.local` está excluido de Git.
3. Instala las dependencias backend: `npm --prefix functions install`.
4. Compila las funciones: `npm --prefix functions run build`.
5. Inicia Auth, Firestore y Functions Emulator en una terminal: `firebase emulators:start --only auth,firestore,functions`.
6. Inicia la aplicación en otra terminal: `npm run dev`.
7. Abre `http://localhost:3000`.

La app usa Authentication Emulator en desarrollo para que los registros de prueba no se creen en el proyecto Firebase real. La autorización del Día 12 lee membresías desde Firestore por el UID autenticado; no se han creado roles ni datos de restaurantes en Firebase. No conectes `restora-demo` a un entorno de producción.

## Rutas actuales

- `/`: inicio de Restora y enlaces a registro e inicio de sesión.
- `/registro`: alta con correo y contraseña.
- `/login`: inicio de sesión.
- `/cuenta`: verificación de sesión, cierre de sesión y edición del nombre visible del perfil propio.
- `/recuperar-contrasena`: solicitud de enlace para restablecer la contraseña. En local, el enlace aparece en la terminal de Authentication Emulator; no se envía correo real.

Los perfiles completos de usuario en Firestore, perfiles de restaurante, tenants, asignación de membresías y despliegue de App Hosting aún no están implementados. El Día 12 agregó el núcleo backend de permisos; las reglas Firestore permanecen deny-all hasta el Día 13. El nombre visible del perfil propio se guarda por ahora en Firebase Authentication.

## Comandos

- `npm run dev`: servidor de desarrollo.
- `npm run lint`: ESLint.
- `npm run typecheck`: comprobación TypeScript.
- `npm run build`: build de Next.js.
- `npm --prefix functions run build`: compilación TypeScript de Cloud Functions.

Consulta `TASKS.md` y `docs/DEVELOPMENT_ROADMAP.md` para el estado y la siguiente jornada.
