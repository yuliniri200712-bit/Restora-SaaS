# Configuración de Firebase Authentication

**Jornada:** Día 8 — configurar Firebase Authentication
**Estado:** proveedor correo/contraseña desplegado al proyecto de desarrollo; sin aplicación cliente ni flujos implementados.

## Proveedor configurado

`firebase.json` declara `auth.providers.emailPassword: true`. Correo y contraseña cubre el requisito aprobado de registro, inicio de sesión y recuperación de contraseña. No se habilitan proveedores sociales ni autenticación anónima: no están solicitados y la compra como invitado continúa pendiente de decisión.

La configuración como código está respaldada por Firebase CLI. El Project ID real de desarrollo indicado por el propietario es `restora-demo`, registrado como alias `dev`; `demo-restora-saas` se mantiene predeterminado para emuladores. El 5 de noviembre de 2026, `firebase deploy --only auth --project dev` finalizó correctamente y confirmó correo/contraseña habilitado. Al aprovisionar Auth, Firebase CLI creó una “Default Web App” en el proyecto; no se añadió código cliente ni se desplegó Firebase App Hosting.

## Uso local

- Authentication Emulator está configurado en `firebase.json` en `127.0.0.1:9099` y comparte el ID `demo-restora-saas` con el resto de emuladores.
- Inícialo desde la raíz del repositorio con `firebase emulators:start --only auth` o, cuando se necesiten otros servicios, `firebase emulators:start`.
- La interfaz local de Emulator Suite es `http://127.0.0.1:4000`.
- El emulador permite crear usuarios de prueba. No envía correo real; los enlaces de verificación y restablecimiento se muestran localmente en la salida del emulador.
- Cuando exista la app web (Día 9), su SDK debe conectarse al Auth Emulator durante desarrollo, nunca a producción desde el entorno local.

## Límites y siguientes pasos

- Esta jornada configura el proveedor; no implementa pantallas ni lógica de registro, inicio de sesión o recuperación. Eso corresponde a los Días 9–10.
- No se definieron políticas específicas de contraseña, verificación obligatoria de correo, MFA o inicio de sesión social. Deben decidirse antes de habilitar esos flujos.
- No se han creado usuarios reales, claves ni credenciales de servicio; tampoco se ha desplegado App Hosting. La app web predeterminada creada por la CLI es solo un registro/configuración de Firebase, no el código de la tienda Next.js.
- No confíes en que autenticación por sí sola autoriza acceso al tenant. Roles, membresías y permisos se configuran y validan por backend y Security Rules en sus jornadas correspondientes.

## Referencias oficiales

- [Configurar proveedores de Authentication con Firebase CLI](https://firebase.google.com/docs/auth/configure-providers-cli)
- [Conectar una app al Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Autenticación con correo y contraseña en aplicaciones web](https://firebase.google.com/docs/auth/web/password-auth)
