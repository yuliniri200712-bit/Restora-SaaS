# Instrucciones del proyecto para agentes

## Propósito y fuente de trabajo

Restora es una plataforma SaaS multiempresa para restaurantes, inicialmente dirigida a Cúcuta, Colombia. La ruta oficial es de 120 días y se ejecuta una jornada a la vez, únicamente cuando el propietario la solicita. Antes de cada cambio, inspecciona el estado real del repositorio y consulta `TASKS.md` y los documentos de `docs/`.

En caso de contradicción, respeta las decisiones explícitas posteriores del propietario. En particular, la web se alojará en **Firebase App Hosting**; Vercel no forma parte del plan aprobado.

## Estado conocido durante el cierre del Día 15

- La Fase 2 (autenticación y permisos, Días 8–14) está cerrada. El Día 15 implementó el registro de restaurantes por `registerRestaurant`, la ruta `/restaurantes/nuevo`, sede principal, membresía owner y slug único. Las seis pruebas de integración con emuladores y los 13 casos de Rules pasan; lint, TypeScript y build de Functions pasan. Queda pendiente que el propietario pruebe manualmente el formulario en su navegador. No hay datos de producto ni despliegues de Functions, reglas o web en Firebase real.
- `docs/PROJECT_REQUIREMENTS.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/FIREBASE_STRUCTURE.md` y `docs/DEVELOPMENT_ENVIRONMENT.md` describen las decisiones de producto, arquitectura, datos y pruebas locales hasta el Día 15. FR-006 (prueba gratuita) sigue pendiente para la fase de suscripciones.
- `firebase.json` configura emuladores locales de Auth, Firestore, Storage y Functions (puerto 5001). `.firebaserc` mantiene `demo-restora-saas` como predeterminado y el alias `dev` apunta al Project ID `restora-demo`, indicado por el propietario. No hay datos de producto ni despliegues de la web o Functions.
- `firebase.json` declara correo/contraseña como proveedor de Firebase Authentication y se desplegó correctamente al proyecto `dev`. La CLI creó una “Default Web App”. El Día 9 agregó los flujos cliente y el propietario confirmó que inició Authentication Emulator, vio la cuenta registrada y pudo iniciar sesión desde `/login`.
- En Authentication Emulator, los correos de recuperación no se envían realmente: su enlace de acción se muestra en la terminal del emulador. No solicites enlaces ni crees cuentas en el emulador del propietario sin que él lo pida.
- `.env.local` contiene la configuración local de la Web App y está excluida de Git. No muestres ni agregues su contenido al commit. Para desarrollo, el Project ID del cliente se fija en `demo-restora-saas` para coincidir con el proyecto predeterminado del Emulator Suite; el alias `dev` sigue apuntando a `restora-demo`.
- No se desplegó la aplicación en Firebase App Hosting ni se creó un usuario en el proyecto Firebase real.
- El perfil propio del Día 11 usa `displayName` en Firebase Authentication. El propietario validó manualmente el registro y la edición desde `/cuenta`. No crea documentos `users/{uid}` en Firestore; las reglas del Día 13 permiten un documento mínimo de perfil, pero la app aún no lo crea.
- El Día 12 define roles `owner`, `administrator`, `employee`, `kitchen` y `delivery` bajo `restaurants/{restaurantId}/memberships/{uid}`; clientes tienen permisos propios y `superadmin` se almacena aparte en `platformRoles/{uid}`. Functions deriva el UID del token y carga permisos desde Firestore; no confía en rol/UID enviados por el cliente. Admin/empleado solo reciben permisos delegables; kitchen/delivery requieren comprobación de asignación al recurso. Los resolutores de acceso propios son solo para UI; cada acción del servidor debe llamar al verificador de permisos. La matriz está en `docs/PROJECT_REQUIREMENTS.md` y `docs/FIREBASE_STRUCTURE.md`. Roles todavía no están asignados a usuarios.
- `firestore.rules` contiene reglas tenant-aware locales; 13 casos automatizados pasan en el proyecto demo aislado `demo-restora-day14` y puerto 8180. Los slugs quedan denegados para clientes. No se han desplegado. `storage.rules` continúa con denegación total hasta su jornada de seguridad. No relajes estas reglas para que una función “parezca funcionar”.
- `npm run test:rules` usa `@firebase/rules-unit-testing` 6.0.0 y Firestore Emulator con el Project ID demo `demo-restora-day14`; requiere Node.js 24.12 o superior para la suite. Las identidades de Rules son simuladas, no se ejecuta el flujo de credenciales Auth ni callables de Functions.
- `npm run test:restaurant-registration` compila Functions y prueba `registerRestaurant`, `getOwnRestaurantAccess`, Auth, Firestore y Functions con emuladores aislados y Project ID demo `demo-restora-day15`. La suite comprueba autenticación, entradas, idempotencia concurrente, slugs duplicados y la membresía resultante. No crea datos fuera de esos emuladores.
- Los restaurantes del Día 15 comienzan con `status: "setup"` y `currentSubscriptionId: null`; la membresía owner está activa para acceder al tenant, pero la operación comercial y la prueba gratuita quedan pendientes de la fase de suscripciones. No marcar el tenant como operativo mientras no se implemente esa habilitación.
- El propietario aprobó una sede principal por restaurante, sedes adicionales condicionadas al plan Empresarial, inventario independiente por sede y el ciclo de reserva/consumo/liberación/reposición documentado en requisitos y esquema.

## Stack y límites arquitectónicos

- Frontend: Next.js, React, TypeScript estricto y Tailwind CSS.
- Backend: Node.js y TypeScript con Cloud Functions y Firebase Admin SDK.
- Plataforma: Firebase Authentication, Cloud Firestore, Firebase Storage, Cloud Messaging, Security Rules, App Check y Emulator Suite.
- Firebase será la persistencia principal. No introduzcas PostgreSQL, MySQL, MongoDB, Prisma o Supabase como sustituto de Firestore.
- Mantén la separación entre presentación, componentes, casos de uso/servicios, repositorios, modelos, validaciones y configuración. Los componentes visuales no consultan Firestore directamente.

## Reglas para cambios futuros

1. Trabaja únicamente en el día solicitado. No adelantes fases ni agregues funcionalidades de otras jornadas.
2. Antes de editar, inspecciona archivos, estado Git, dependencias y cambios preexistentes. No sobrescribas ni reviertas trabajo sin autorización.
3. Presenta un plan breve antes de implementar. Pide decisión solo si falta una decisión de producto o arquitectura que impida una implementación correcta.
4. Valida tenant, sede, rol e identidad en el backend y en las reglas que correspondan. Nunca confíes solo en la interfaz ni en IDs recibidos del cliente.
5. Las escrituras sensibles (roles, precios, suscripciones, pagos, estados e inventario) se validan en servidor. Usa timestamps de servidor, dinero como enteros COP e idempotencia para operaciones reintentables.
6. Evita `any` sin justificación, duplicación, dependencias circulares y archivos con responsabilidades mezcladas. Añade validación y manejo de errores.
7. No conectes ni despliegues recursos reales de Firebase sin una instrucción explícita para esa operación y la configuración necesaria. Nunca uses el proyecto demo como destino de producción.
8. Ejecuta las verificaciones disponibles y pertinentes al alcance. Registra exactamente qué se ejecutó; no afirmes que una prueba, build, emulador o despliegue pasó si no se ejecutó.
9. Actualiza `TASKS.md`, `docs/DEVELOPMENT_ROADMAP.md` y los documentos de dominio afectados. Registra bloqueos, decisiones pendientes y pruebas reales.
10. No marques una jornada completa si faltan entregables o criterios de aceptación. Por instrucción del propietario, al cerrar cada jornada crea un commit descriptivo y súbelo al remoto Git configurado. Inspecciona el diff y los archivos antes de agregarlos; no incluyas secretos. Nunca uses `push --force`. Si la rama remota tiene cambios que no están en local, consérvalos y reconcilia sin sobrescribirlos. Al terminar, informa el commit y la lista exacta de archivos subidos; si el push falla, indícalo claramente.

## Documentos de referencia

- `TASKS.md`: estado real y siguiente jornada.
- `docs/DEVELOPMENT_ROADMAP.md`: secuencia oficial de 120 días.
- `docs/PROJECT_REQUIREMENTS.md`: alcance funcional y no funcional.
- `docs/SYSTEM_ARCHITECTURE.md`: componentes y decisiones arquitectónicas.
- `docs/DATABASE_SCHEMA.md`: modelo conceptual de datos.
- `docs/FIREBASE_STRUCTURE.md`: estructura propuesta de Firestore.
- `docs/DEVELOPMENT_ENVIRONMENT.md`: emuladores y entorno local.
- `docs/AUTHENTICATION_SETUP.md`: proveedor configurado y límites de Auth local/producción.
