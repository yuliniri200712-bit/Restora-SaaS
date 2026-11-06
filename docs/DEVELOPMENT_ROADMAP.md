# Ruta oficial de desarrollo — Restora

**Duración:** 120 días
**Fuente:** ruta aprobada del prompt maestro del proyecto
**Estado al 2026-11-06:** Días 1–12 cerrados. El Día 11 implementó el perfil propio básico y el propietario confirmó el registro con nombre y edición desde `/cuenta`. El Día 12 implementó en Cloud Functions el núcleo de permisos aprobado para los siete actores, con alcance por sede y plataforma separada; pasaron lint, TypeScript, build de Functions y validación JSON. Firestore Rules siguen deny-all. Siguiente jornada: Día 13
**Destino aprobado para la web:** Firebase App Hosting. Vercel queda excluido por decisión del propietario.

Esta ruta se ejecuta una jornada por vez, a solicitud del propietario. El avance y las verificaciones reales se registran en `TASKS.md`. `[x]` indica jornada cerrada, `[~]` trabajo parcial y `[ ]` pendiente. Una marca no implica pruebas automatizadas si `TASKS.md` indica que no se ejecutaron.

## Fase 1 — Preparación y arquitectura (Días 1–7)

- [x] **Día 1:** Inspeccionar el repositorio, estructura, dependencias, código existente y estado real del proyecto.
- [x] **Día 2:** Definir requisitos funcionales y no funcionales.
- [x] **Día 3:** Diseñar la arquitectura general del sistema.
- [x] **Día 4:** Diseñar el modelo de datos multiempresa.
- [x] **Día 5:** Definir la estructura de colecciones de Firestore.
- [x] **Día 6:** Configurar Firebase y los entornos de desarrollo.
- [x] **Día 7:** Crear documentación inicial, `AGENTS.md` y `TASKS.md`.

## Fase 2 — Autenticación y permisos (Días 8–14)

- [x] **Día 8:** Configurar Firebase Authentication y habilitar correo/contraseña en el proyecto de desarrollo `restora-demo`. La CLI creó una “Default Web App”; no se implementó ni desplegó la web de producto.
- [x] **Día 9:** Implementar registro e inicio/cierre de sesión con Firebase Web SDK y cliente Next.js. Lint, TypeScript, lockfile y build pasan; el build usó un worker para evitar `EPERM` al escribir `.next` en OneDrive. El propietario confirmó manualmente que el registro aparece en Authentication Emulator y que puede iniciar sesión desde la app. No se conectó al Firebase real.
- [x] **Día 10:** Implementar recuperación de contraseña desde `/login` y `/recuperar-contrasena`, usando Firebase Authentication. Pasaron lint y TypeScript; el propietario confirmó que completó manualmente el restablecimiento con el enlace del emulador. El build no se ejecutó para evitar interferir con `.next` del servidor local.
- [x] **Día 11:** Crear la gestión básica del perfil propio. El registro solicita el nombre visible y `/cuenta` permite editarlo en Firebase Authentication. Pasaron lint y TypeScript; el propietario confirmó manualmente ambos flujos. No se crearon documentos Firestore ni se modificaron sus reglas deny-all.
- [x] **Día 12:** Implementar roles y permisos. La matriz base aprobada define propietario, administrador y empleado con permisos tenant; cocina y domiciliario limitados a recursos asignados; cliente con acceso propio; superadministrador separado con permisos globales explícitos. Se implementaron resolutores/verificadores autenticados en Cloud Functions y Functions Emulator (puerto 5001). Lint, TypeScript, build de Functions y JSON pasaron. No se cambiaron Security Rules ni se desplegó a Firebase real; faltan datos de restaurantes/membresías para pruebas runtime, previstas en la jornada de validación.
- [ ] **Día 13:** Configurar Firestore Security Rules.
- [ ] **Día 14:** Probar autenticación, permisos y accesos no autorizados.

## Fase 3 — Sistema multiempresa (Días 15–21)

- [ ] **Día 15:** Implementar registro de restaurantes.
- [ ] **Día 16:** Crear perfiles de restaurantes y propietarios.
- [ ] **Día 17:** Implementar identificación y asociación de tenant.
- [ ] **Día 18:** Garantizar aislamiento de datos.
- [ ] **Día 19:** Implementar gestión de empleados.
- [ ] **Día 20:** Probar accesos entre diferentes restaurantes.
- [ ] **Día 21:** Corregir fallos y documentar el módulo.

## Fase 4 — Prueba gratuita y suscripciones (Días 22–28)

- [ ] **Día 22:** Crear estructura de suscripciones.
- [ ] **Día 23:** Implementar prueba gratuita de 14 días.
- [ ] **Día 24:** Implementar cálculo de fechas en servidor.
- [ ] **Día 25:** Crear recordatorios de vencimiento.
- [ ] **Día 26:** Implementar expiración de prueba.
- [ ] **Día 27:** Crear administración de planes y precios.
- [ ] **Día 28:** Probar los diferentes escenarios de suscripción.

## Fase 5 — Contratación y notificaciones (Días 29–35)

- [ ] **Día 29:** Crear pantalla de planes comerciales.
- [ ] **Día 30:** Implementar solicitud de contratación.
- [ ] **Día 31:** Guardar solicitudes en Firestore.
- [ ] **Día 32:** Crear sistema de notificaciones.
- [ ] **Día 33:** Implementar notificaciones al superadministrador.
- [ ] **Día 34:** Crear panel de revisión de solicitudes.
- [ ] **Día 35:** Implementar aprobación, rechazo y pruebas.

## Fase 6 — Panel de superadministrador (Días 36–42)

- [ ] **Día 36:** Diseñar dashboard general.
- [ ] **Día 37:** Implementar gestión de restaurantes.
- [ ] **Día 38:** Implementar gestión de usuarios.
- [ ] **Día 39:** Implementar administración de suscripciones.
- [ ] **Día 40:** Implementar administración de planes.
- [ ] **Día 41:** Implementar gestión de pagos y solicitudes.
- [ ] **Día 42:** Probar el panel y sus permisos.

## Fase 7 — Panel del restaurante y catálogo (Días 43–49)

- [ ] **Día 43:** Crear estructura del panel del restaurante.
- [ ] **Día 44:** Implementar gestión de productos.
- [ ] **Día 45:** Implementar categorías.
- [ ] **Día 46:** Implementar carga de imágenes con Firebase Storage.
- [ ] **Día 47:** Implementar variantes y adicionales.
- [ ] **Día 48:** Implementar inventario.
- [ ] **Día 49:** Probar el módulo completo.

## Fase 8 — Marketplace público (Días 50–56)

- [ ] **Día 50:** Crear estructura pública del marketplace.
- [ ] **Día 51:** Mostrar restaurantes disponibles.
- [ ] **Día 52:** Implementar tiendas individuales.
- [ ] **Día 53:** Implementar catálogo público.
- [ ] **Día 54:** Implementar búsqueda y filtros.
- [ ] **Día 55:** Implementar personalización visual de cada restaurante.
- [ ] **Día 56:** Probar responsive y navegación.

## Fase 9 — Carrito y checkout (Días 57–63)

- [ ] **Día 57:** Implementar carrito.
- [ ] **Día 58:** Implementar variantes y adicionales en el carrito.
- [ ] **Día 59:** Implementar registro de direcciones.
- [ ] **Día 60:** Implementar cálculo de domicilios.
- [ ] **Día 61:** Implementar checkout.
- [ ] **Día 62:** Implementar confirmación de pedidos.
- [ ] **Día 63:** Probar el flujo completo de compra.

## Fase 10 — Pedidos y cocina (Días 64–70)

- [ ] **Día 64:** Implementar recepción de pedidos en tiempo real.
- [ ] **Día 65:** Implementar estados de pedidos.
- [ ] **Día 66:** Implementar aceptación y rechazo.
- [ ] **Día 67:** Crear panel de cocina.
- [ ] **Día 68:** Implementar comandas.
- [ ] **Día 69:** Probar actualizaciones simultáneas.
- [ ] **Día 70:** Corregir errores y documentar.

## Fase 11 — Domicilios y pagos (Días 71–77)

- [ ] **Día 71:** Implementar gestión de domiciliarios.
- [ ] **Día 72:** Implementar asignación de pedidos.
- [ ] **Día 73:** Configurar zonas y tarifas.
- [ ] **Día 74:** Implementar seguimiento de entregas.
- [ ] **Día 75:** Integrar la pasarela de pago seleccionada.
- [ ] **Día 76:** Implementar webhooks y validación de pagos.
- [ ] **Día 77:** Probar los flujos de pago y domicilio.

## Fase 12 — Notificaciones e integraciones (Días 78–84)

- [ ] **Día 78:** Implementar notificaciones push.
- [ ] **Día 79:** Implementar notificaciones de pedidos.
- [ ] **Día 80:** Integrar funcionalidades de mapas.
- [ ] **Día 81:** Implementar reportes.
- [ ] **Día 82:** Implementar estadísticas.
- [ ] **Día 83:** Preparar soporte para múltiples sucursales.
- [ ] **Día 84:** Revisar integraciones y estabilidad.

## Fase 13 — Seguridad y optimización (Días 85–91)

- [ ] **Día 85:** Auditar autenticación y permisos.
- [ ] **Día 86:** Auditar aislamiento multiempresa.
- [ ] **Día 87:** Auditar reglas de Firestore y Storage.
- [ ] **Día 88:** Optimizar consultas e índices.
- [ ] **Día 89:** Optimizar rendimiento frontend y backend.
- [ ] **Día 90:** Realizar pruebas de carga.
- [ ] **Día 91:** Ejecutar pruebas de regresión.

## Fase 14 — Pruebas integrales (Días 92–98)

- [ ] **Día 92:** Probar autenticación y registro.
- [ ] **Día 93:** Probar prueba gratuita y vencimiento.
- [ ] **Día 94:** Probar contratación y activación.
- [ ] **Día 95:** Probar marketplace y pedidos.
- [ ] **Día 96:** Probar cocina y domicilios.
- [ ] **Día 97:** Probar pagos y paneles.
- [ ] **Día 98:** Corregir errores y repetir pruebas.

## Fase 15 — Preparación para producción (Días 99–100)

- [ ] **Día 99:** Preparar despliegue, variables, backups y monitoreo.
- [ ] **Día 100:** Documentar, verificar requisitos y preparar el piloto.

## Fase 16 — Contingencia y piloto comercial (Días 101–120)

Estos días se reservan para estabilidad y validación en condiciones reales, sin añadir funcionalidades innecesarias.

- [ ] **Día 101:** Revisar el estado general del sistema.
- [ ] **Día 102:** Preparar el primer restaurante piloto.
- [ ] **Día 103:** Configurar su cuenta, catálogo y personal.
- [ ] **Día 104:** Capacitar al propietario y empleados.
- [ ] **Día 105:** Realizar pedidos de prueba.
- [ ] **Día 106:** Corregir problemas detectados.
- [ ] **Día 107:** Probar pedidos simultáneos.
- [ ] **Día 108:** Probar notificaciones.
- [ ] **Día 109:** Verificar pagos y domicilios.
- [ ] **Día 110:** Verificar aislamiento de datos.
- [ ] **Día 111:** Comprobar backups y restauración.
- [ ] **Día 112:** Revisar costos de Firebase e infraestructura.
- [ ] **Día 113:** Revisar suscripciones y contratación.
- [ ] **Día 114:** Revisar aspectos legales y operativos pendientes.
- [ ] **Día 115:** Mejorar documentación.
- [ ] **Día 116:** Capacitar nuevamente si es necesario.
- [ ] **Día 117:** Corregir errores pendientes.
- [ ] **Día 118:** Ejecutar pruebas finales.
- [ ] **Día 119:** Evaluar estabilidad y aceptación del piloto.
- [ ] **Día 120:** Elaborar informe final y decidir si el sistema está listo para comercializarse.
