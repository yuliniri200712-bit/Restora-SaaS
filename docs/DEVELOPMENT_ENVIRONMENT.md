# Entorno de desarrollo Firebase

**Jornadas:** Día 6 — configuración local; Día 12 — Functions Emulator y autorización backend; Día 14 — pruebas de Firestore Rules
**Estado:** Emulator Suite configurada para Auth, Firestore, Storage y Functions; 12 casos de Firestore Rules pasan en el emulador local. No hay despliegue de App Hosting, reglas ni Functions.

## Iniciar los emuladores

Requisitos: Node.js/npm, Java JDK 11 o superior y Firebase CLI (`firebase-tools`). Desde la raíz del repositorio:

```powershell
firebase emulators:start
```

El alias predeterminado es `demo-restora-saas`. Firebase reconoce el prefijo `demo-` como un proyecto de demostración: la aplicación solo puede comunicarse con emuladores y las llamadas a productos no iniciados fallan, en vez de modificar datos o generar consumo en un proyecto real. El alias `dev` apunta al Project ID real `restora-demo`, indicado por el propietario. Mantén el demo como predeterminado para los emuladores.

| Servicio | Dirección local |
|---|---|
| Emulator Suite UI | http://127.0.0.1:4000 |
| Authentication | http://127.0.0.1:9099 |
| Cloud Firestore | http://127.0.0.1:8080 |
| Cloud Functions | http://127.0.0.1:5001 |
| Cloud Storage | http://127.0.0.1:9199 |

Detén el proceso con `Ctrl+C`. La configuración está en `firebase.json`; el alias de proyecto está en `.firebaserc`.

## Estado de la configuración

- `firestore.rules` implementa lecturas directas tenant-aware por UID, membresía, permiso, sede y asignación; los casos de prueba del Día 14 pasaron. `storage.rules` sigue en denegación total hasta su jornada de seguridad.
- `firebase.json` declara el proveedor de correo y contraseña; se aplicó correctamente al proyecto `restora-demo` mediante el alias `dev`. Firebase CLI creó una “Default Web App” al aprovisionar Auth. Authentication Emulator está configurado en el puerto 9099 y el propietario lo inició para validar registro e inicio de sesión. El emulador no envía correos reales: para verificar correo o restablecer contraseña genera enlaces locales en la salida del emulador.
- Si se modifica la configuración de Auth, se puede volver a aplicar con `firebase deploy --only auth --project dev`. Mantén el alias predeterminado demo para emuladores.
- Cloud Functions usa runtime Node.js 22. El Día 12 agregó `functions/` con verificadores de permisos y las callables `getOwnRestaurantAccess` y `getOwnPlatformAccess`; Functions Emulator usa el puerto 5001. No se desplegaron funciones al proyecto real.
- Para ejecutar Auth, Firestore y Functions Emulator, instala las dependencias de la app y backend, ejecuta `npm --prefix functions run build` y arranca `firebase emulators:start --only auth,firestore,functions`. En otra terminal ejecuta `npm run dev`.
- Para probar Security Rules ejecuta `npm run test:rules`. `firebase.rules-test.json` configura solo Firestore Emulator en `127.0.0.1:8180`, desactiva Emulator UI para ese proceso y carga `firestore.rules`. La suite usa el Project ID demo aislado `demo-restora-day14`, siembra datos efímeros con reglas desactivadas solo en el emulador y limpia Firestore antes de cada caso. No usa el alias `dev` ni el proyecto real `restora-demo`.
- Las pruebas requieren Node.js 24.12.0 o superior por `@firebase/rules-unit-testing` 6.0.0. El runtime objetivo de Cloud Functions continúa en Node.js 22.
- Los 12 casos de Rules cubren UID autenticado/no autenticado, aislamiento de tenant/sede, permisos delegados, estados suspendidos, pedidos propios, acceso asignado de cocina/domicilio, lectura pública publicada, auditoría, consultas y rechazo de escrituras sensibles. Las pruebas usan contextos de autenticación simulados; no ejercitan registro/inicio de sesión con credenciales ni callables de Functions.
- La aplicación cliente está en `src/`. `.env.local` contiene la configuración de la Web App de desarrollo y está excluida de Git; `.env.example` tiene solo marcadores de posición. No añadas archivos locales `.env` al repositorio.
- El cliente de esta jornada se conecta al emulador de Auth en `127.0.0.1:9099`; las callables se conectarán desde sus repositorios cliente cuando haya flujos de restaurante. Ningún flujo de permisos se conecta al Firebase real.
- Firebase App Hosting sigue siendo el destino de alojamiento aprobado para la web. Esta configuración solo prepara desarrollo local; no crea un proyecto Firebase, no vincula una cuenta y no despliega servicios.

## Próximo paso de Firebase

Al implementar flujos de negocio, conectar sus SDKs a estos emuladores y repetir las pruebas de Rules con cada cambio. Las callables deberán validarse por separado. Firebase App Hosting se configurará cuando el producto esté listo para el despliegue correspondiente.

## Referencias

- [Configurar Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Configurar proveedores de Auth con Firebase CLI](https://firebase.google.com/docs/auth/configure-providers-cli)
- [Conectar la app al Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Elegir proyecto real o de demostración para los emuladores](https://firebase.google.com/docs/emulator-suite/use_hosting#choose_a_firebase_project)
- [Probar reglas de Firestore con Emulator Suite](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
