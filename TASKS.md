# Estado de tareas de Restora

**Actualizado:** 2026-11-05
**Fase actual:** Fase 1 — Preparación y arquitectura (Días 1–7)
**Rama Git:** `main`
**Sincronización:** por instrucción del propietario, crear un commit y hacer push a GitHub al cerrar cada jornada; informar los archivos subidos.

## Estado general

La preparación documental de la Fase 1 está cerrada. El repositorio contiene requisitos, arquitectura, modelos y configuración local de Firebase. Aún no contiene aplicación web, backend, dependencias de proyecto ni pruebas automatizadas. No existe un proyecto Firebase real conectado; los emuladores están configurados pero no se han iniciado.

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

“Completado y probado” en esta fase significa que se verificaron los entregables documentales o de configuración descritos. No significa que se hayan probado flujos de aplicación, emuladores o servicios productivos. Para el Día 7 se ejecutó una validación documental; no existe aún una suite de pruebas de aplicación.

## Siguiente jornada

**Día 8 — Configurar Firebase Authentication.** Antes de conectar servicios reales, confirmar el alcance de la tarea y mantener el trabajo local en el proyecto demo mientras no exista una instrucción y configuración para usar un proyecto real.

## Pendientes y bloqueos conocidos

- No hay proyecto Firebase real, credenciales, configuración de proveedores de Auth, aplicación cliente ni despliegue de Firebase App Hosting.
- Las reglas de Firestore y Storage son deny-all temporales. Las reglas multiempresa completas corresponden a la fase de seguridad.
- El Emulator Suite aún no se ejecuta; para iniciarlo se necesita Node.js/npm, Firebase CLI y Java JDK 11 o superior.
- La matriz final de permisos por rol/sede, compra como invitado, política de suscripciones activas y conservación/borrado de datos sigue pendiente según `docs/DATABASE_SCHEMA.md` y `docs/PROJECT_REQUIREMENTS.md`.
- No hay scripts de build, lint o test porque todavía no existe `package.json` ni código fuente.

## Control de cambios

- Este checkpoint incluirá los entregables de las jornadas 2–7 que hasta ahora estaban sin seguimiento en la rama `main`. Revisar el diff, confirmar ausencia de secretos y subirlo al remoto antes de iniciar el Día 8.
