# Configuración de Firebase Authentication

**Jornada:** Día 8 — configurar Firebase Authentication
**Estado:** configuración versionada; todavía sin aplicación cliente ni proyecto Firebase real.

## Proveedor configurado

`firebase.json` declara `auth.providers.emailPassword: true`. Correo y contraseña cubre el requisito aprobado de registro, inicio de sesión y recuperación de contraseña. No se habilitan proveedores sociales ni autenticación anónima: no están solicitados y la compra como invitado continúa pendiente de decisión.

La configuración como código está respaldada por Firebase CLI. Para aplicarla a un proyecto Firebase real, Firebase documenta `firebase deploy --only auth`. No se ejecutó: el alias actual `demo-restora-saas` es solo para emuladores y no hay proyecto real vinculado.

## Uso local

- Authentication Emulator está configurado en `firebase.json` en `127.0.0.1:9099` y comparte el ID `demo-restora-saas` con el resto de emuladores.
- Inícialo desde la raíz del repositorio con `firebase emulators:start --only auth` o, cuando se necesiten otros servicios, `firebase emulators:start`.
- La interfaz local de Emulator Suite es `http://127.0.0.1:4000`.
- El emulador permite crear usuarios de prueba. No envía correo real; los enlaces de verificación y restablecimiento se muestran localmente en la salida del emulador.
- Cuando exista la app web (Día 9), su SDK debe conectarse al Auth Emulator durante desarrollo, nunca a producción desde el entorno local.

## Límites y siguientes pasos

- Esta jornada declara el proveedor para su aplicación posterior; no implementa pantallas ni lógica de registro, inicio de sesión o recuperación. Eso corresponde a los Días 9–10.
- No se definieron políticas específicas de contraseña, verificación obligatoria de correo, MFA o inicio de sesión social. Deben decidirse antes de habilitar esos flujos.
- No se han creado usuarios reales, claves, credenciales de servicio ni proyecto productivo.
- No confíes en que autenticación por sí sola autoriza acceso al tenant. Roles, membresías y permisos se configuran y validan por backend y Security Rules en sus jornadas correspondientes.

## Referencias oficiales

- [Configurar proveedores de Authentication con Firebase CLI](https://firebase.google.com/docs/auth/configure-providers-cli)
- [Conectar una app al Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Autenticación con correo y contraseña en aplicaciones web](https://firebase.google.com/docs/auth/web/password-auth)
