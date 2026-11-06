# Firebase Authentication

**Jornadas:** Día 8 — configuración; Día 9 — registro e inicio de sesión; Día 10 — recuperación de contraseña.
**Estado:** proveedor correo/contraseña habilitado en `restora-demo`; flujos cliente implementados para desarrollo local con Authentication Emulator. El propietario confirmó manualmente la recuperación de contraseña con un enlace del emulador.

## Proveedor y proyecto

`firebase.json` declara `auth.providers.emailPassword: true`. El Project ID de desarrollo indicado por el propietario es `restora-demo`, registrado con el alias `dev`; `demo-restora-saas` continúa como destino predeterminado de los emuladores. El 5 de noviembre de 2026, `firebase deploy --only auth --project dev` terminó correctamente y Firebase CLI creó una “Default Web App” al aprovisionar Authentication. Ese despliegue solo configuró el proveedor; no desplegó la aplicación web.

La aplicación usa el Firebase Web SDK modular. El cliente inicializa Firebase de forma diferida y envía las operaciones de registro, inicio, cierre y observación de sesión al Authentication Emulator en `127.0.0.1:9099` durante el desarrollo. En producción se rechazan `restora-demo` y los IDs con prefijo `demo-` para evitar usar accidentalmente un proyecto de desarrollo o demostración.

## Variables locales

- `.env.local` contiene la API key, dominio Auth y App ID entregados por Firebase CLI para la app de desarrollo. Es local y está excluida de Git. Su `NEXT_PUBLIC_FIREBASE_PROJECT_ID` se fija en `demo-restora-saas` para coincidir con el proyecto predeterminado de los emuladores.
- `.env.example` enumera las variables y establece ese mismo ID demo para desarrollo; no contiene credenciales reales.
- `NEXT_PUBLIC_USE_AUTH_EMULATOR=true` conecta el cliente local al emulador. En desarrollo el emulador se usa por defecto; la aplicación nunca debe conectarse al proyecto `restora-demo` en un entorno de producción.

Si se clona el repositorio en otra máquina, copia `.env.example` como `.env.local` y completa la API key, el dominio Auth y el App ID de la Web App de desarrollo autorizada. Mantén `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-restora-saas` mientras uses los emuladores locales.

## Ejecutar localmente

Se necesitan Node.js, npm, Firebase CLI y Java JDK 11 o superior para ejecutar el Authentication Emulator.

1. Instala dependencias con `npm install`.
2. En una terminal inicia Authentication Emulator desde la raíz: `firebase emulators:start --only auth`.
3. En otra terminal inicia Next.js: `npm run dev`.
4. Abre `http://localhost:3000`, crea una cuenta de prueba y verifica el inicio/cierre de sesión. El usuario se crea solo en el emulador; no se crea en el Firebase real.
5. La interfaz de Emulator Suite está en `http://127.0.0.1:4000`.
6. Para comprobar recuperación, abre `/recuperar-contrasena`, solicita el enlace usando un correo registrado en el emulador y copia la URL de acción que aparece en la terminal donde ejecutaste `firebase emulators:start --only auth`. Abre esa URL para asignar una contraseña nueva. El emulador no envía correos reales.

El emulador no envía correos reales. La cuenta y sus datos de prueba se guardan en el emulador, no en Firestore.

## Flujos implementados en el Día 9

- `/registro`: crea cuenta con correo y contraseña, confirma que las contraseñas coincidan y valida campos básicos. Firebase inicia sesión automáticamente tras crear la cuenta.
- `/login`: inicia sesión con correo y contraseña.
- `/cuenta`: muestra el correo autenticado, observa cambios de sesión y permite cerrar sesión. Si no hay una sesión local, vuelve a `/login`.
- Los errores comunes de Firebase se presentan en español. El mínimo de contraseña es 6 caracteres, conforme al proveedor de Firebase.
- La inicialización de Firebase queda en `src/lib/firebase`; el repositorio y el servicio de Auth separan el SDK y la lógica del formulario.

## Recuperación de contraseña — Día 10

- `/login` ofrece el enlace “¿Olvidaste tu contraseña?” hacia `/recuperar-contrasena`.
- El formulario valida el correo, lo normaliza y solicita el enlace mediante `sendPasswordResetEmail` del Firebase Web SDK, configurando el idioma de correo como español.
- La respuesta de la interfaz es genérica para que un correo inexistente no se pueda distinguir del existente. Los errores de validación o de servicio se muestran en español.
- En Authentication Emulator no se manda correo real: toma el enlace de acción de la salida de la terminal del emulador y úsalo para completar el cambio de contraseña.
- La implementación pasó `npm run lint` y `npm run typecheck`. El propietario confirmó que abrió el enlace del emulador con una contraseña nueva y completó el flujo. No se ejecutó build para evitar interferir con el servidor local y `.next`.

## Límites de esta jornada

No se implementaron perfiles en Firestore, tenant, membresías, roles, autorización en backend ni reglas de seguridad. `/cuenta` sirve para comprobar el estado cliente; no constituye una ruta protegida por autorización de servidor. No se desplegó Firebase App Hosting ni se creó un usuario de prueba en el proyecto real.

El propietario confirmó la prueba manual: inició Authentication Emulator, vio la cuenta en su interfaz y pudo completar el inicio de sesión desde `/login`. No hay pruebas automatizadas de autenticación todavía; el historial de verificaciones está en `TASKS.md`.

## Referencias oficiales

- [Configurar proveedores de Authentication con Firebase CLI](https://firebase.google.com/docs/auth/configure-providers-cli)
- [Conectar una app al Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Autenticación con correo y contraseña en aplicaciones web](https://firebase.google.com/docs/auth/web/password-auth)
- [Referencia Web SDK: `sendPasswordResetEmail`](https://firebase.google.com/docs/reference/js/auth#sendpasswordresetemail)
