# Estado de tareas de Restora

**Actualizado:** 2026-11-06
**Fase actual:** Fase 2 — Autenticación y permisos (Días 8–14); siguiente: Día 10
**Rama Git:** `main`
**Sincronización:** por instrucción del propietario, crear un commit y hacer push a GitHub al cerrar cada jornada; informar los archivos subidos.

## Estado general

La Fase 1 está cerrada. El Día 8 configuró el proveedor correo/contraseña en Firebase Authentication para el Project ID de desarrollo `restora-demo` usando el alias `dev`; `demo-restora-saas` sigue como predeterminado de los emuladores. Firebase CLI creó una “Default Web App”. El Día 9 incorporó una aplicación Next.js con registro, inicio/cierre de sesión y Firebase Web SDK. El cliente local apunta al proyecto demo del emulador; no se desplegó la web ni se creó un usuario en Firebase real. Todavía no hay Cloud Functions, perfiles de usuario/tenant en Firestore ni suite de pruebas automatizadas.

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
| 9 | Crear la aplicación Next.js y los flujos de registro, inicio/cierre de sesión y estado de sesión, conectados al Authentication Emulator en desarrollo. | **COMPLETADO; VERIFICACIÓN FUNCIONAL PENDIENTE** | `npm run lint`, `npm run typecheck`, `npm ci --dry-run --ignore-scripts --no-audit --no-fund` y `npm run build` finalizaron con código 0. El build se ejecutó con `CIRCLE_NODE_TOTAL=1` para evitar errores `EPERM` al escribir `.next` en OneDrive. `java -version` no terminó en 4 segundos; no se inició Authentication Emulator ni se probaron los flujos en navegador. No se conectó al proyecto real ni se desplegó App Hosting. |

“Completado y probado” en esta fase significa que se verificaron los entregables documentales, de configuración o de código indicados. No implica que se hayan probado flujos contra emuladores si la tabla los registra como pendientes. En el Día 8 se confirmó la configuración del proveedor mediante un despliegue exitoso; en el Día 9 pasaron lint, TypeScript, lockfile y build, pero el flujo cliente aún requiere Authentication Emulator.

## Siguiente jornada

**Día 10 — Implementar recuperación de contraseña.** El Día 9 dejó rutas `/registro`, `/login` y `/cuenta` con Firebase Web SDK modular. Authentication Emulator debe iniciarse para validar registro e inicio/cierre de sesión.

## Pendientes y bloqueos conocidos

- Authentication Emulator y los flujos de Auth no se han probado desde la app: `java -version` no terminó en el límite de 4 segundos. Verificar o instalar un JDK compatible antes de ejecutar el emulador.
- No hay despliegue de Firebase App Hosting, Cloud Functions, perfiles de usuario ni membresías Firestore.
- Las reglas de Firestore y Storage son deny-all temporales. Las reglas multiempresa completas corresponden a la fase de seguridad.
- El Emulator Suite aún no se ejecuta; para iniciarlo se necesita Node.js/npm, Firebase CLI y Java JDK 11 o superior.
- La matriz final de permisos por rol/sede, compra como invitado, política de suscripciones activas y conservación/borrado de datos sigue pendiente según `docs/DATABASE_SCHEMA.md` y `docs/PROJECT_REQUIREMENTS.md`.
- No hay suite de pruebas automatizadas todavía; existen scripts de `lint`, `typecheck` y `build` y los tres pasaron en el Día 9.

## Control de cambios

- Se sincronizan los cambios a GitHub al cerrar cada jornada, según la instrucción del propietario; el commit y los archivos subidos se reportan al finalizar.
