# Entorno de desarrollo Firebase

**Jornada:** Día 6 — configuración local de Firebase y del entorno de desarrollo
**Estado:** Emulator Suite configurada; correo/contraseña de Auth desplegado al proyecto de desarrollo; sin web de producto ni App Hosting.

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
| Cloud Storage | http://127.0.0.1:9199 |

Detén el proceso con `Ctrl+C`. La configuración está en `firebase.json`; el alias de proyecto está en `.firebaserc`.

## Estado de la configuración

- Firestore y Storage cargan reglas temporales de denegación total (`firestore.rules` y `storage.rules`). Así, el entorno no queda abierto mientras se diseña la autorización multiempresa. Estas reglas no implementan todavía el acceso de clientes, miembros, sedes ni administradores y deben sustituirse antes de integrar flujos funcionales.
- `firebase.json` declara el proveedor de correo y contraseña; se aplicó correctamente al proyecto `restora-demo` mediante el alias `dev`. Firebase CLI creó una “Default Web App” al aprovisionar Auth. Authentication Emulator está configurado en el puerto 9099, pero aún no se ha iniciado. El emulador no envía correos reales: para verificar correo o restablecer contraseña genera enlaces locales en la salida del emulador.
- Si se modifica la configuración de Auth, se puede volver a aplicar con `firebase deploy --only auth --project dev`. Mantén el alias predeterminado demo para emuladores.
- Functions Emulator aún no está configurado porque no existe el directorio `functions/` ni código backend.
- No se crean secretos ni archivos `.env`: todavía no hay aplicación cliente. Cuando se introduzcan, los valores locales deben mantenerse fuera de Git.
- Firebase App Hosting sigue siendo el destino de alojamiento aprobado para la web. Esta configuración solo prepara desarrollo local; no crea un proyecto Firebase, no vincula una cuenta y no despliega servicios.

## Próximo paso de Firebase

Al comenzar la app y las funciones, conectar sus SDKs a estos emuladores en desarrollo y completar reglas tenant-aware antes de habilitar lecturas/escrituras. Firebase App Hosting se configurará cuando el producto esté listo para el despliegue correspondiente.

## Referencias

- [Configurar Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Configurar proveedores de Auth con Firebase CLI](https://firebase.google.com/docs/auth/configure-providers-cli)
- [Conectar la app al Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Elegir proyecto real o de demostración para los emuladores](https://firebase.google.com/docs/emulator-suite/use_hosting#choose_a_firebase_project)
- [Probar reglas de Firestore con Emulator Suite](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
