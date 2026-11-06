# Entorno de desarrollo Firebase

**Jornada:** Día 6 — configuración local de Firebase y del entorno de desarrollo; Día 11 — Functions Emulator para reservar alias únicos.
**Estado:** Auth, Firestore y Functions están configurados para pruebas locales; no se desplegaron funciones ni App Hosting.

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
| Cloud Functions | http://127.0.0.1:5001 |
| Cloud Firestore | http://127.0.0.1:8080 |
| Cloud Storage | http://127.0.0.1:9199 |

Detén el proceso con `Ctrl+C`. La configuración está en `firebase.json`; el alias de proyecto está en `.firebaserc`.

## Estado de la configuración

- Firestore y Storage cargan reglas temporales de denegación total (`firestore.rules` y `storage.rules`). Así, el entorno no queda abierto mientras se diseña la autorización multiempresa. Estas reglas no implementan todavía el acceso de clientes, miembros, sedes ni administradores y deben sustituirse antes de integrar flujos funcionales.
- `firebase.json` declara el proveedor de correo y contraseña; se aplicó correctamente al proyecto `restora-demo` mediante el alias `dev`. Firebase CLI creó una “Default Web App” al aprovisionar Auth. Authentication Emulator está configurado en el puerto 9099 y el propietario lo inició para validar registro e inicio de sesión. El emulador no envía correos reales: para verificar correo o restablecer contraseña genera enlaces locales en la salida del emulador.
- Si se modifica la configuración de Auth, se puede volver a aplicar con `firebase deploy --only auth --project dev`. Mantén el alias predeterminado demo para emuladores.
- El Día 11 añadió `functions/` con callables de alias. El Functions Emulator usa el Admin SDK y, cuando los tres emuladores están activos con el mismo Project ID `demo-restora-saas`, sus operaciones Auth/Firestore se quedan en los emuladores.
- La aplicación cliente está en `src/`. `.env.local` contiene la configuración de la Web App de desarrollo y está excluida de Git; `.env.example` tiene solo marcadores de posición. No añadas archivos locales `.env` al repositorio.
- Instala dependencias cliente con `npm install` y backend con `npm --prefix functions install`. Compila funciones con `npm --prefix functions run build`; luego inicia `firebase emulators:start --only auth,firestore,functions` y, en otra terminal, `npm run dev`. El cliente conecta Auth al puerto 9099 y Functions al 5001; la función usa Firestore Emulator en el puerto 8080.
- Firebase App Hosting sigue siendo el destino de alojamiento aprobado para la web. Esta configuración solo prepara desarrollo local; no crea un proyecto Firebase, no vincula una cuenta y no despliega servicios.

## Próximo paso de Firebase

Las reglas de Firestore siguen en denegación total. Las reservas de alias se realizan solo en Functions con Admin SDK; antes de habilitar lecturas/escrituras directas desde el cliente, configurar y probar reglas tenant-aware. Firebase App Hosting se configurará cuando el producto esté listo para el despliegue correspondiente.

## Referencias

- [Configurar Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Configurar proveedores de Auth con Firebase CLI](https://firebase.google.com/docs/auth/configure-providers-cli)
- [Conectar la app al Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Conectar la app al Functions Emulator](https://firebase.google.com/docs/emulator-suite/connect_functions)
- [Probar Functions localmente](https://firebase.google.com/docs/functions/local-emulator)
- [Elegir proyecto real o de demostración para los emuladores](https://firebase.google.com/docs/emulator-suite/use_hosting#choose_a_firebase_project)
- [Probar reglas de Firestore con Emulator Suite](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
