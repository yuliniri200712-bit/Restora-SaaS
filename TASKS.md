# Estado de tareas de Restora

**Actualizado:** 2026-11-06
**Fase actual:** Fase 3 — Sistema multiempresa (Días 15–21); Día 15 implementado, falta validación manual del propietario
**Rama Git:** `main`
**Sincronización:** por instrucción del propietario, crear un commit y hacer push a GitHub al cerrar cada jornada; informar los archivos subidos.

## Estado general

La Fase 1 está cerrada. El Día 8 configuró correo/contraseña en Firebase Authentication para el proyecto `restora-demo`; el Día 9 incorporó registro e inicio/cierre de sesión Next.js, y el propietario validó el flujo en Authentication Emulator. El Día 10 agregó recuperación de contraseña; el Día 11, perfil propio con nombre visible; ambos fueron confirmados manualmente por el propietario. El Día 12 implementó en Functions los verificadores de permisos. El Día 13 configuró reglas Firestore tenant-aware; el Día 14 pasó 12 casos de Rules. El Día 15 implementó `registerRestaurant` con transacción, sede principal, membresía owner, slug reservado e idempotencia, y la ruta `/restaurantes/nuevo`. Seis pruebas de integración y 13 casos de Rules pasan. No hay datos de producto ni despliegues en Firebase real; queda pendiente la validación manual de la pantalla por el propietario.

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
| 15 | Implementar registro de restaurantes y alta inicial de propietario/sede principal. | **IMPLEMENTADO; PENDIENTE VALIDACIÓN MANUAL** | Callable `registerRestaurant` usa UID del token, valida entradas, crea restaurante `setup`, reserva slug, sede principal, membresía `owner`, auditoría y recibos idempotentes en una transacción. El cliente usa capas domain/application/data y `/restaurantes/nuevo`, enlazada desde `/cuenta`; Functions Emulator se conecta en desarrollo y Rules niega acceso cliente a `restaurantSlugs`. Pasaron `npm run lint`, `npm run typecheck`, `npm --prefix functions run build`, `npm run test:restaurant-registration` (6/6) y `npm run test:rules` (13/13). El estado setup no activa FR-006: prueba y acceso comercial quedan para Días 22–28. No se desplegó; el propietario aún debe probar manualmente el flujo web local. |

“Completado y probado” en esta fase significa que se verificaron los entregables documentales, de configuración, de código y los flujos manuales que la tabla describe. En el Día 8 se confirmó la configuración del proveedor mediante un despliegue exitoso; en el Día 9 también se confirmó manualmente registro e inicio de sesión contra Authentication Emulator. Aún no hay pruebas automatizadas de autenticación.

## Siguiente jornada

**Día 15 — Validación manual pendiente:** probar `/restaurantes/nuevo` en local con Auth/Functions/Firestore Emulator. Luego cerrar la jornada. No crear ni desplegar datos de negocio en Firebase real sin instrucción explícita.

## Pendientes y bloqueos conocidos

- La suite automatizada del Día 14 cubre Firestore Security Rules con identidades simuladas; no automatiza registro/inicio de sesión contra Authentication Emulator. El propietario confirmó manualmente registro, inicio/cierre de sesión, recuperación y nombre visible en jornadas anteriores.
- No hay despliegue de Firebase App Hosting ni Cloud Functions y no se crearon datos en Firebase real. La suite aislada del Día 15 crea únicamente datos efímeros en Auth/Firestore Emulator.
- `firestore.rules` pasó 13 casos automatizados. `storage.rules` permanece deny-all hasta su jornada de seguridad. `registerRestaurant` y `getOwnRestaurantAccess` se probaron en Functions Emulator.
- El propietario debe validar manualmente el formulario en `/restaurantes/nuevo` con sesión de Authentication Emulator y Functions/Firestore Emulator activos.
- FR-006 exige prueba gratuita automática de 14 días al registrar. La creación del Día 15 deja el restaurante en `setup`, sin suscripción, hasta la fase de suscripciones (Días 22–28); las operaciones comerciales deben permanecer bloqueadas hasta activar esa fase.
- El alta permite más de un restaurante por usuario autenticado y aún no aplica cupos ni límites por propietario; revisar esta política antes de habilitar autoservicio público.
- Siguen pendientes compra como invitado, política de suscripciones activas y conservación/borrado de datos según `docs/DATABASE_SCHEMA.md` y `docs/PROJECT_REQUIREMENTS.md`.
- No hay suite completa de pruebas del producto todavía. Hay pruebas de Rules y de registro de restaurantes; el build de Next.js no se ejecutó para no interferir con `.next` del propietario.
- El Día 11 pasó lint y TypeScript y quedó validado manualmente por el propietario. No se ejecutó build para evitar interferir con `.next` del servidor local.
- Los Días 12 y 15 pasaron build de Functions; el Día 15 probó callables en runtime con emuladores aislados. Los días 13–15 no se desplegaron Rules ni funciones a Firebase real. No hay datos de producto en proyectos reales.

## Control de cambios

- Se sincronizan los cambios a GitHub al cerrar cada jornada, según la instrucción del propietario; el commit y los archivos subidos se reportan al finalizar.
