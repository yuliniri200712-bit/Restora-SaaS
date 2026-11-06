# Instrucciones del proyecto para agentes

## Propósito y fuente de trabajo

Restora es una plataforma SaaS multiempresa para restaurantes, inicialmente dirigida a Cúcuta, Colombia. La ruta oficial es de 120 días y se ejecuta una jornada a la vez, únicamente cuando el propietario la solicita. Antes de cada cambio, inspecciona el estado real del repositorio y consulta `TASKS.md` y los documentos de `docs/`.

En caso de contradicción, respeta las decisiones explícitas posteriores del propietario. En particular, la web se alojará en **Firebase App Hosting**; Vercel no forma parte del plan aprobado.

## Estado conocido al Día 9

- La fase actual es autenticación y permisos. El Día 9 creó una app Next.js App Router con TypeScript, Tailwind, ESLint, Firebase Web SDK y rutas `/registro`, `/login` y `/cuenta`. Lint, TypeScript, lockfile y build pasaron; el build se comprobó con un worker en OneDrive. No existe código de Cloud Functions ni suite de pruebas automatizadas.
- `docs/PROJECT_REQUIREMENTS.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/FIREBASE_STRUCTURE.md` y `docs/DEVELOPMENT_ENVIRONMENT.md` describen las decisiones y el alcance aprobados hasta el Día 6.
- `firebase.json` configura emuladores locales de Auth, Firestore y Storage. `.firebaserc` mantiene `demo-restora-saas` como predeterminado y el alias `dev` apunta al Project ID `restora-demo`, indicado por el propietario. No hay datos de producto ni despliegues de la web.
- `firebase.json` declara correo/contraseña como proveedor de Firebase Authentication y se desplegó correctamente al proyecto `dev`. La CLI creó una “Default Web App”. El Día 9 agregó los flujos cliente y el propietario confirmó que inició Authentication Emulator, vio la cuenta registrada y pudo iniciar sesión desde `/login`.
- `.env.local` contiene la configuración local de la Web App y está excluida de Git. No muestres ni agregues su contenido al commit. Para desarrollo, el Project ID del cliente se fija en `demo-restora-saas` para coincidir con el proyecto predeterminado del Emulator Suite; el alias `dev` sigue apuntando a `restora-demo`.
- No se desplegó la aplicación en Firebase App Hosting ni se creó un usuario en el proyecto Firebase real.
- `firestore.rules` y `storage.rules` son reglas temporales de denegación total. No las relajes para que una función “parezca funcionar”; sustitúyelas por reglas revisadas y tenant-aware en la jornada de seguridad correspondiente.
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
