# Estado de tareas de Restora

**Actualizado:** 2026-11-06
**Fase actual:** Fase 3 — Sistema multiempresa (Días 15–21); siguiente jornada: Día 15
**Rama Git:** `main`
**Sincronización:** por instrucción del propietario, crear un commit y hacer push a GitHub al cerrar cada jornada; informar los archivos subidos.

## Estado general

La Fase 1 está cerrada. El Día 8 configuró el proveedor correo/contraseña en Firebase Authentication para el Project ID de desarrollo `restora-demo` usando el alias `dev`; `demo-restora-saas` sigue como predeterminado de los emuladores. Firebase CLI creó una “Default Web App”. El Día 9 incorporó una aplicación Next.js con registro, inicio/cierre de sesión y Firebase Web SDK. El propietario confirmó que pudo registrar la cuenta en Authentication Emulator y luego iniciar sesión en la app. El Día 10 implementó recuperación de contraseña en `/recuperar-contrasena`, confirmada manualmente por el propietario. El Día 11 implementó nombre visible al registrarse y edición del perfil propio en `/cuenta`, guardados en Firebase Authentication; el propietario confirmó que revisó ambos flujos y funcionan correctamente. El Día 12 definió la matriz base aprobada de roles e implementó resolución de acceso y verificadores reutilizables en Cloud Functions; no hay aún restaurantes ni membresías asignadas. El Día 13 reemplazó el deny-all de Firestore por reglas locales con lecturas por UID, tenant, permisos, sede y asignaciones; las mutaciones de datos de negocio siguen reservadas a Functions. El Día 14 agregó y ejecutó 12 casos automatizados de Security Rules en Firestore Emulator: todos pasaron. No se desplegaron Functions, reglas ni web a Firebase real.

## Progreso por jornada

| Día | Objetivo y evidencia | Estado | Verificación registrada |
|---:|---|---|---|
| 1 | Diagnóstico del repositorio y su estado inicial; repositorio sin implementación de producto. | **COMPLETADO Y PROBADO** | Inspección del repositorio, tecnologías y configuración existentes. No había pruebas de aplicación que ejecutar. |
| 2 | Requisitos funcionales y no funcionales en `docs/PROJECT_REQUIREMENTS.md`. | **COMPLETADO Y PROBADO** | Revisión documental contra el prompt maestro y los requisitos aprobados; sin pruebas de software. |
| 3 | Arquitectura en `docs/SYSTEM_ARCHITECTURE.md`. Destino web aprobado: Firebase App Hosting; Vercel descartado. | **COMPLETADO Y PROBADO** | Revisión y aprobación del propietario; sin pruebas de software. |
| 4 | Modelo conceptual multiempresa en `docs/DATABASE_SCHEMA.md`, incluido inventario por sede y decisiones aprobadas. | **COMPLETADO Y PROBADO** | Revisión y aprobación del propietario; sin pruebas de software. |
| 5 | Estructura propuesta de Firestore en `docs/FIREBASE_STRUCTURE.md`. | **COMPLETADO Y PROBADO** | Revisión del esquema, rutas, reservas e invariantes documentados; no se crearon colecciones en un proyecto real. |
| 6 | Configuración local de Firebase: `firebase.json`, `.firebaserc`, `firestore.rules`, `storage.rules`, `.gitignore` y `docs/DEVELOPMENT_ENVIRONMENT.md`. | **COMPLETADO Y PROBADO** | Se validó la sintaxis JSON de `firebase.json` y `.firebaserc`. Los emuladores no se iniciaron y no se descargaron binarios. |
| 7 | Documentación inicial, este `TASKS.md`, `AGENTS.md` y la ruta de desarrollo. | **COMPLETADO Y PROBADO** | Validación documental: 120 días consecutivos, 7 cerrados y 113 pendientes; archivos sin espacios finales. No hay suite de pruebas de aplicación. |
| 8 | Configurar Firebase Authentication: `auth.providers.emailPassword` en `firebase.json` y guía en `docs/AUTHENTICATION_SETUP.md`. | **COMPLETADO Y PROBADO** | `firebase deploy --only auth --project dev` finalizó correctamente y confirmó correo/contraseña habilitado en `restora-demo`. Firebase CLI creó una “Default Web App”. No se probaron flujos cliente ni se inició el emulador; corresponden a jornadas posteriores. |
| 9 | Crear la aplicación Next.js y los flujos de registro, inicio/cierre de sesión y estado de sesión, conectados al Authentication Emulator en desarrollo. | **COMPLETADO Y PROBADO MANUALMENTE** | Pasaron `npm run lint`, `npm run typecheck`, `npm ci --dry-run --ignore-scripts --no-audit --no-fund` y `npm run build` (con `CIRCLE_NODE_TOTAL=1` para evitar `EPERM` al escribir `.next` en OneDrive). El propietario confirmó que la cuenta aparece en Authentication Emulator, el registro abre `/cuenta` y el inicio de sesión desde `/login` funciona. No se conectó al proyecto real ni se desplegó App Hosting. |
| 10 | Implementar recuperación de contraseña con Firebase Authentication y mostrar instrucciones para obtener el enlace local del emulador. | **COMPLETADO Y PROBADO MANUALMENTE** | Pasaron `npm run lint` y `npm run typecheck`. El propietario confirmó que abrió el enlace de recuperación del Authentication Emulator con una contraseña nueva y el flujo funcionó. No se ejecutó build para evitar interferir con el servidor local y `.next`. No se conectó al Firebase real. |
| 11 | Crear gestión básica del perfil propio: solicitar nombre al registrarse y permitir editarlo desde la cuenta. | **COMPLETADO Y PROBADO MANUALMENTE** | Pasaron `npm run lint` y `npm run typecheck`. El propietario confirmó que revisó el registro con nombre visible y la edición desde `/cuenta`; ambos funcionan. El nombre se guarda como `displayName` en Firebase Authentication. No se ejecutó build ni se modificaron reglas deny-all; roles, membresías y perfiles Firestore quedan en jornadas posteriores. |
| 12 | Definir e implementar autorización base por rol, tenant y sede; separar superadministración. | **COMPLETADO; VERIFICACIÓN ESTÁTICA** | La matriz de siete actores fue aprobada por el propietario. Pasaron `npm run lint`, `npm run typecheck`, `npm --prefix functions run build`, validación JSON y `git diff --check`. Se agregaron resolución de permisos y verificadores autenticados en Cloud Functions. Firestore Rules siguen deny-all; no existen aún datos de restaurantes/membresías para un flujo runtime. No se desplegó a Firebase real. |
| 13 | Configurar Firestore Security Rules tenant-aware. | **COMPLETADO; PRUEBAS EN DÍA 14** | `firestore.rules` limita lecturas por UID, membresía activa, permisos, sede y asignación; permite lectura pública solo de proyecciones publicadas; las escrituras de negocio quedan denegadas al cliente. Se especificó `kitchenTasks` sin PII porque Rules no oculta campos de un documento. `git diff --check` pasó. No se desplegaron reglas. |
| 14 | Probar autenticación, permisos y accesos no autorizados. | **COMPLETADO; PRUEBAS DE REGLAS PASARON** | `npm run test:rules` ejecutó 12 casos sobre `firestore.rules` mediante Firestore Emulator, proyecto aislado `demo-restora-day14`, puerto 8180; 12 pasaron, 0 fallaron. Los casos cubren identidad autenticada/no autenticada, aislamiento tenant/sede, permisos delegados, membresía suspendida, recursos propios, cocina/domicilio asignados, proyección pública, auditoría, consultas y escrituras sensibles. También pasaron `npm run lint`, `npm run typecheck` y `git diff --check`. No se desplegó a Firebase real; los flujos de credenciales se habían validado manualmente en jornadas anteriores y las callables de Functions no se probaron en runtime. |

“Completado y probado” en esta fase significa que se verificaron los entregables documentales, de configuración, de código y los flujos manuales que la tabla describe. En el Día 8 se confirmó la configuración del proveedor mediante un despliegue exitoso; en el Día 9 también se confirmó manualmente registro e inicio de sesión contra Authentication Emulator. Aún no hay pruebas automatizadas de autenticación.

## Siguiente jornada

**Día 15 — Implementar registro de restaurantes.** No crear ni desplegar datos de negocio en Firebase real sin instrucción explícita.

## Pendientes y bloqueos conocidos

- La suite automatizada del Día 14 cubre Firestore Security Rules con identidades simuladas; no automatiza registro/inicio de sesión contra Authentication Emulator. El propietario confirmó manualmente registro, inicio/cierre de sesión, recuperación y nombre visible en jornadas anteriores.
- No hay despliegue de Firebase App Hosting ni Cloud Functions; todavía no se crean perfiles completos, restaurantes o membresías en Firestore.
- `firestore.rules` pasó 12 casos automatizados en Firestore Emulator. `storage.rules` permanece deny-all hasta su jornada de seguridad; las callables de autorización aún no tienen pruebas runtime.
- Authentication Emulator ya se inició y se probó manualmente. Firestore y Storage emulators todavía no se han iniciado; se requiere Node.js/npm, Firebase CLI y Java JDK compatible.
- Siguen pendientes compra como invitado, política de suscripciones activas y conservación/borrado de datos según `docs/DATABASE_SCHEMA.md` y `docs/PROJECT_REQUIREMENTS.md`.
- No hay suite completa de pruebas del producto todavía. La suite actual cubre solo Firestore Rules. En el Día 10 pasaron `npm run lint` y `npm run typecheck`; `npm run build` no se ejecutó para evitar interferir con el servidor local y `.next` del propietario. Los tres scripts habían pasado en el Día 9.
- El Día 11 pasó lint y TypeScript y quedó validado manualmente por el propietario. No se ejecutó build para evitar interferir con `.next` del servidor local.
- El Día 12 pasó lint, TypeScript, compilación de Functions y validación JSON; no se ejecutaron funciones en runtime. El Día 13 configuró Rules y el Día 14 pasó 12 casos en el emulador. Todavía no hay datos reales de restaurantes/membresías ni despliegues.

## Control de cambios

- Se sincronizan los cambios a GitHub al cerrar cada jornada, según la instrucción del propietario; el commit y los archivos subidos se reportan al finalizar.
