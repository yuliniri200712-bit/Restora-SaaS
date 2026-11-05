# Estado de tareas de Restora

**Actualizado:** 2026-11-05
**Fase actual:** Fase 2 — Autenticación y permisos (Días 8–14)
**Rama Git:** `main`
**Sincronización:** por instrucción del propietario, crear un commit y hacer push a GitHub al cerrar cada jornada; informar los archivos subidos.

## Estado general

La Fase 1 está cerrada y el Día 8 dejó versionada la configuración de proveedor correo/contraseña para Firebase Authentication. El repositorio aún no contiene aplicación web, backend, dependencias de proyecto ni pruebas automatizadas. No existe un proyecto Firebase real conectado; los emuladores están configurados pero no se han iniciado, y el proveedor no se ha desplegado a producción.

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
| 8 | Configurar Firebase Authentication: `auth.providers.emailPassword` en `firebase.json` y guía en `docs/AUTHENTICATION_SETUP.md`. | **IMPLEMENTADO PARCIALMENTE** | Configuración JSON y documentación revisadas. La autenticación no se activó en Firebase real ni se inició el emulador; hace falta verificar el runtime Java y disponer de un proyecto real para desplegar el proveedor. |

“Completado y probado” en esta fase significa que se verificaron los entregables documentales o de configuración descritos. No significa que se hayan probado flujos de aplicación, emuladores o servicios productivos. Para el Día 7 se ejecutó una validación documental; no existe aún una suite de pruebas de aplicación.

## Siguiente jornada

**Día 9 — Implementar registro e inicio de sesión en local.** Los flujos se dirigirán al Authentication Emulator cuando el runtime esté disponible. La activación del proveedor en un proyecto real puede esperar hasta contar con su ID y acceso autorizado.

## Pendientes y bloqueos conocidos

- No hay proyecto Firebase real, credenciales, aplicación cliente ni despliegue de Firebase App Hosting. El proveedor correo/contraseña está definido en archivos, pero no está desplegado en un proyecto real.
- No se verificó el arranque de Authentication Emulator: el comando para consultar la versión de Java no terminó dentro del tiempo disponible. Se requiere comprobar un JDK compatible antes de ejecutar el emulador.
- Las reglas de Firestore y Storage son deny-all temporales. Las reglas multiempresa completas corresponden a la fase de seguridad.
- El Emulator Suite aún no se ejecuta; para iniciarlo se necesita Node.js/npm, Firebase CLI y Java JDK 11 o superior.
- La matriz final de permisos por rol/sede, compra como invitado, política de suscripciones activas y conservación/borrado de datos sigue pendiente según `docs/DATABASE_SCHEMA.md` y `docs/PROJECT_REQUIREMENTS.md`.
- No hay scripts de build, lint o test porque todavía no existe `package.json` ni código fuente.

## Control de cambios

- Se sincronizan los cambios a GitHub al cerrar cada jornada, según la instrucción del propietario; el commit y los archivos subidos se reportan al finalizar.
