# Requisitos del producto

**Producto:** plataforma SaaS multiempresa para restaurantes

**Mercado inicial:** Cúcuta, Colombia

**Estado:** borrador de requisitos, elaborado en el Día 2
**Fuente:** prompt maestro y ruta oficial de desarrollo de 120 días

## 1. Propósito

Definir los requisitos funcionales y de calidad que guiarán el desarrollo de una plataforma en la que restaurantes independientes administran su tienda digital y los clientes descubren restaurantes, hacen pedidos y consultan su estado.

Este documento establece el alcance y los criterios que se podrán verificar. No describe todavía la arquitectura detallada, el esquema de Firestore ni una implementación.

## 2. Alcance y restricciones

- La plataforma tendrá un marketplace público y espacios de administración para la plataforma y para cada restaurante.
- El aislamiento entre restaurantes es obligatorio. Los datos de un restaurante no serán accesibles ni modificables por otro.
- Para la primera versión, cada pedido pertenecerá a un solo restaurante.
- La infraestructura principal de persistencia será Cloud Firestore. No se sustituirá por PostgreSQL, MySQL, MongoDB, Prisma o Supabase.
- El stack previsto es Next.js, React, TypeScript estricto, Tailwind CSS, Firebase Authentication, Firestore, Cloud Functions, Storage, Cloud Messaging, Security Rules, App Check y Emulator Suite.
- La aplicación web Next.js se alojará en Firebase App Hosting. El despliegue no utilizará Vercel. Google Maps API podrá usarse para funciones geográficas. Wompi o Mercado Pago podrá usarse para pagos, según disponibilidad y configuración.
- Idioma y mercado inicial: español de Colombia y precios en COP. Los formatos y la zona horaria visibles deben ser adecuados para el mercado; los detalles de almacenamiento temporal se definirán en arquitectura.
- Cada restaurante inicia con una sede principal. Las sedes adicionales pertenecen al plan Empresarial y se implementarán según la ruta, que las contempla en la fase de integraciones y soporte para sucursales.

## 3. Actores y alcance de acceso

| Actor | Requisito de acceso |
|---|---|
| Superadministrador | Rol global separado de las membresías de restaurante. Solo ejecuta acciones de plataforma con permisos globales asignados y auditados por el servidor. |
| Propietario del restaurante | Tiene permisos de administración del propio restaurante, membresías y suscripción, limitados a ese tenant y a su alcance de sedes. |
| Administrador | Recibe permisos delegables por módulo. No obtiene administración de membresías, propiedad ni suscripción por el solo hecho de tener este rol. |
| Empleado | Recibe permisos delegables explícitos y limitados a su membresía y alcance de sedes. |
| Personal de cocina | Consulta y actualiza la preparación solo de pedidos que le hayan sido asignados y dentro de sus sedes autorizadas. |
| Domiciliario | Consulta y actualiza el progreso de entregas que le hayan sido asignadas y dentro de sus sedes autorizadas. |
| Cliente | Consulta el marketplace y gestiona únicamente su perfil, direcciones y pedidos asociados a su UID. |

**Matriz base aprobada por el propietario el 6 de noviembre de 2026:** el propietario administra su tenant, usuarios y suscripción; administrador y empleado solo reciben permisos delegables, con membresías y suscripción reservadas al propietario; cocina y domiciliario conservan acceso a sus tareas asignadas; cliente solo accede a recursos propios. La membresía define alcance `all` o `selected` para sedes. Los permisos de superadministración se asignan aparte y las acciones de plataforma quedan auditadas. El servidor comprueba identidad, estado de membresía, permiso, tenant, sede y asignación del recurso; la interfaz no constituye control de acceso.

## 4. Requisitos funcionales

### 4.1 Identidad, acceso y aislamiento

**FR-001 — Autenticación.** El sistema permitirá registro, inicio de sesión y recuperación de contraseña mediante Firebase Authentication.

**Aceptación:** un usuario puede autenticarse y recuperar el acceso; las operaciones protegidas requieren una identidad válida; el servidor comprueba la autorización antes de acceder a datos o ejecutar cambios.

**FR-002 — Restaurantes y tenants.** Cada restaurante tendrá identificador único, propietario, usuarios asociados, configuración y datos comerciales propios.

**Aceptación:** las lecturas y escrituras de un usuario de restaurante quedan limitadas a su tenant; las pruebas de seguridad demuestran que un usuario de un tenant no puede leer ni alterar registros de otro.

**FR-003 — Roles.** El sistema reconocerá los siete actores descritos en la sección 3 y aplicará sus permisos en el servidor. Los roles de restaurante se resuelven desde la membresía activa; superadministración se resuelve de forma separada.

**Aceptación:** una acción no autorizada se rechaza aunque se invoque fuera de la interfaz; el servidor deriva el UID del token autenticado, valida el rol y alcance vigentes, y no acepta permisos enviados por el cliente. Los permisos efectivos se pueden comprobar mediante pruebas de reglas y backend.

### 4.2 Administración de plataforma

**FR-004 — Panel de superadministración.** Permitirá consultar, crear, editar y suspender restaurantes; consultar propietarios y usuarios; administrar planes y precios; revisar solicitudes y suscripciones; registrar pagos; activar o suspender suscripciones de forma autorizada; consultar estadísticas y auditoría; gestionar notificaciones, soporte y configuración general.

**Aceptación:** cada acción administrativa requiere permiso; los cambios sensibles quedan atribuibles a un actor y registrados para auditoría.

**FR-005 — Planes configurables.** El superadministrador podrá configurar precios, límites y características de los planes sin cambiar código de negocio.

**Aceptación:** las pantallas y validaciones usan la configuración vigente del plan; al cambiarla, una solicitud nueva registra el precio aplicable al momento de solicitarla.

La configuración inicial de planes será la siguiente; precios, límites y características deberán seguir siendo administrables:

| Plan inicial | Precio inicial | Límites y características iniciales |
|---|---:|---|
| Básico | $79.900 COP/mes | Hasta 30 productos; catálogo digital; gestión de pedidos; panel administrativo; personalización básica; integración con WhatsApp. |
| Profesional | $149.900 COP/mes | Productos ilimitados; inventario; estadísticas; promociones; gestión de domicilios; notificaciones; zonas de cobertura. |
| Premium | $249.900 COP/mes | Todo lo del Profesional; panel de cocina; empleados y permisos avanzados; integración con pasarelas de pago; reportes; asignación de domiciliarios; comandas; dominio personalizado. |
| Empresarial | Desde $399.900 COP/mes | Todo lo del Premium; múltiples sedes; panel centralizado; reportes por sede; integraciones; personalización avanzada. |

### 4.3 Prueba gratuita, suscripciones y contratación

**FR-006 — Prueba gratuita.** Al registrar un restaurante se iniciará automáticamente una prueba de 14 días. El inicio y vencimiento se calcularán con timestamps del servidor. Se mostrarán los días restantes y se programarán recordatorios para los días 1, 7, 11, 13 y 14.

**Aceptación:** cambiar la fecha del dispositivo cliente no altera inicio, vencimiento ni días restantes; los recordatorios se originan en el calendario del periodo guardado en el servidor y no se duplican por reintentos.

**FR-007 — Vencimiento de la prueba.** Al expirar la prueba, el restaurante conservará acceso de inicio de sesión y consulta de sus datos para contratar. Se bloquearán nuevas operaciones comerciales hasta que una suscripción válida se active.

**Aceptación:** la expiración se aplica en backend; productos, pedidos, usuarios y configuración permanecen disponibles para consulta; operaciones comerciales posteriores al vencimiento se rechazan; la expiración no elimina datos.

**FR-008 — Solicitud de contratación.** El restaurante podrá consultar los planes y seleccionar uno. La selección generará una solicitud en Firestore con restaurante, propietario, plan, precio registrado, fecha de solicitud, estado y datos de seguimiento.

**Aceptación:** una selección crea o actualiza una solicitud identificable; por sí sola no activa una suscripción; el precio y el plan solicitado quedan registrados para revisión.

**FR-009 — Revisión y activación.** El superadministrador podrá revisar, aprobar o rechazar solicitudes, registrar información de pago y activar una suscripción cuando exista un pago verificado o una autorización administrativa válida.

**Aceptación:** cada cambio de estado exige autorización y queda auditado; la activación rechaza pagos no confirmados y solicitudes duplicadas no producen activaciones repetidas.

**FR-010 — Notificaciones de contratación.** Una solicitud notificará al superadministrador por el canal interno. El sistema permitirá añadir correo electrónico y notificación push cuando estén configurados.

**Aceptación:** cada solicitud genera una notificación interna trazable; el fallo de un canal externo no altera el estado de la solicitud y los reintentos no crean notificaciones duplicadas.

### 4.4 Administración del restaurante

**FR-011 — Panel del restaurante.** Incluirá dashboard, pedidos e historial de ventas, catálogo, categorías, variantes y adicionales, inventario, empleados y roles, estadísticas, horarios, zonas y tarifas de domicilio, promociones, identidad visual y configuración del restaurante.

**Aceptación:** las operaciones de cada módulo guardan y recuperan datos persistidos del tenant correcto; los permisos del usuario limitan las acciones disponibles tanto en servidor como en interfaz.

**FR-012 — Catálogo e imágenes.** El restaurante podrá crear y mantener categorías y productos, con descripciones, precios, disponibilidad, variantes, adicionales e imágenes almacenadas en Firebase Storage.

**Aceptación:** productos y recursos multimedia quedan asociados al restaurante; las reglas de Storage impiden a usuarios de otros tenants modificar archivos privados; solo se publica en el catálogo lo habilitado para venta.

**FR-013 — Inventario.** Los planes que lo incluyan permitirán mantener existencias de productos y consultar cambios relacionados con ventas.

**Aceptación:** en restaurantes con inventario habilitado, cuando el backend registra el pedido como Recibido reserva sus cantidades del inventario de la sede correspondiente. Si no se confirma y envía a cocina dentro de 15 minutos, el pedido se cancela automáticamente, se libera la reserva y se notifica a cliente y restaurante. El plazo puede configurarlo por sede el propietario o un administrador autorizado, y los cambios quedan auditados. Al confirmar y enviar a cocina, las cantidades reservadas se descuentan de las existencias. Si se cancela antes de cocina, se libera la reserva; si se cancela durante la preparación, se restituye la cantidad descontada. Después de que el pedido sale de cocina no se repone stock automáticamente; un administrador podrá registrar una reposición manual solo si el artículo sigue siendo seguro y vendible, de lo contrario se registra como merma. Los pagos verificados de una orden ya cancelada no la reactivan: se inicia un reembolso si el proveedor lo permite; de lo contrario, queda una tarea de revisión administrativa. Cada transición se aplica una sola vez, incluso con reintentos o pedidos simultáneos, y no permite existencias negativas. El stock de una variante o adicional se gestiona por separado solo cuando está configurado explícitamente como artículo inventariable; en otro caso se descuenta el producto base. Los restaurantes sin el módulo de inventario no crean reservas ni cancelan pedidos por vencimiento de reserva.

**FR-014 — Empleados.** Propietarios y administradores autorizados podrán gestionar empleados del restaurante y asignar roles y permisos.

**Aceptación:** un empleado no puede incorporarse a otro tenant sin autorización; los cambios de membresía y rol quedan registrados.

### 4.5 Marketplace, carrito y pedidos

**FR-015 — Descubrimiento público.** El marketplace mostrará restaurantes disponibles y permitirá buscar, filtrar por categorías, consultar una tienda, ver su catálogo, descripciones, precios e imágenes y usar su identidad visual.

**Aceptación:** solo se publican restaurantes y productos habilitados; los filtros y búsqueda presentan resultados acordes a sus criterios en escritorio y móvil.

**FR-016 — Carrito y checkout.** El cliente podrá elegir productos, variantes y adicionales, registrar una dirección, consultar el costo de domicilio y confirmar una compra de un único restaurante.

**Aceptación:** el backend vuelve a validar precios, disponibilidad, opciones, restaurante y costo aplicable antes de crear el pedido; un pedido no mezcla artículos de restaurantes diferentes.

**FR-017 — Clientes y seguimiento.** El sistema permitirá consultar pedidos anteriores y el estado de pedidos propios; el método para identificar clientes y el soporte a compra como invitado quedan pendientes de decisión.

**Aceptación:** un cliente no puede consultar pedidos de otra persona; cada pedido muestra su estado y los cambios autorizados se reflejan oportunamente.

**FR-018 — Estados del pedido.** Se reconocerán los estados Recibido, Confirmado, En preparación, Listo, En camino, Entregado y Cancelado.

**Aceptación:** las transiciones se validan en backend, registran quién las realizó y permiten actualización en tiempo real cuando corresponda. Las transiciones válidas por rol, el rechazo y los efectos de cancelaciones sobre los pagos deben detallarse antes de implementar el flujo.

### 4.6 Cocina, domicilios, pagos y notificaciones

**FR-019 — Cocina.** El panel de cocina mostrará comandas y permitirá actualizar el avance de preparación según permisos.

**Aceptación:** cocina solo ve los pedidos autorizados de su restaurante; los cambios se reflejan en el pedido y en las vistas suscritas.

**FR-020 — Domicilios.** El sistema gestionará domiciliarios, asignación manual de pedidos, zonas, tarifas, seguimiento y registro de entrega.

**Aceptación:** un domiciliario solo consulta sus asignaciones; cada entrega registra sus cambios de estado; el cálculo de zona y tarifa se puede comprobar a partir de la configuración vigente.

**FR-021 — Métodos de pago.** El sistema permitirá configurar efectivo, transferencia y, cuando estén integradas, Wompi o Mercado Pago.

**Aceptación:** efectivo y transferencia tienen un proceso de registro y verificación definido; el estado pagado no se establece por una respuesta del navegador ni por un evento no verificado de la pasarela.

**FR-022 — Webhooks de pago.** Las notificaciones de pago de pasarela se verificarán en backend, con firma/autenticidad, idempotencia y validación de monto, moneda, referencia y estado.

**Aceptación:** una firma inválida se rechaza; un webhook repetido no duplica efectos; un pago no confirmado no activa suscripciones ni se presenta como exitoso.

**FR-023 — Notificaciones.** El sistema podrá enviar notificaciones de pedidos y suscripciones por canales internos, push y correo cuando estén configurados, usando Firebase Cloud Messaging para push.

**Aceptación:** la entrega o reintento de una notificación no modifica por sí solo el estado comercial que la originó; los errores de envío quedan registrados y no se silencian.

### 4.7 Estadísticas, auditoría y sedes

**FR-024 — Estadísticas y reportes.** Los dashboards y reportes mostrarán datos persistidos de operaciones reales y respetarán el alcance del tenant y del rol.

**Aceptación:** los agregados pueden rastrearse a registros de origen; no se presentan datos de demostración como datos reales.

**FR-025 — Auditoría y soporte.** La plataforma permitirá consultar registros de auditoría y gestionar soporte y configuraciones generales con acceso autorizado.

**Aceptación:** acciones sensibles identifican actor, momento y recurso afectado; los registros de auditoría no pueden ser alterados por roles operativos.

**FR-026 — Sucursales.** El plan Empresarial soportará múltiples sedes, panel centralizado y reportes por sede.

**Aceptación:** los datos de cada sede se pueden identificar y agregar según el permiso; el acceso y reportes respetan tanto el tenant como el alcance de sede asignado.

## 5. Requisitos no funcionales

**NFR-001 — Seguridad y aislamiento.** La autorización se aplicará en backend y en Firestore/Storage Security Rules; App Check se habilitará donde aplique.

**Verificación:** pruebas con Firebase Emulator Suite incluyen accesos válidos, inválidos y cruzados entre tenants y roles.

**NFR-002 — Protección de operaciones sensibles.** El cliente no podrá fijar permisos, precios oficiales, fechas de vencimiento, estados de suscripción ni estados de pago.

**Verificación:** peticiones que alteren esos campos desde el cliente son rechazadas o ignoradas por el backend.

**NFR-003 — Integridad e idempotencia.** Creación de pedidos, solicitudes, notificaciones y procesamiento de webhooks debe tolerar reintentos y dobles envíos sin duplicar efectos comerciales.

**Verificación:** pruebas de concurrencia y reintentos confirman una sola operación lógica.

**NFR-004 — Privacidad y minimización.** El sistema limitará el acceso a datos personales y de negocio por rol y tenant. Consentimiento, retención, eliminación y obligaciones legales deberán definirse antes del piloto con asesoría apropiada.

**Verificación:** revisión de permisos, exportación/retención y flujos de datos antes de producción.

**NFR-005 — Disponibilidad y resiliencia.** Los errores de red o de servicios externos se manejarán sin confirmar operaciones que no persistieron; los reintentos no duplicarán cambios.

**Verificación:** pruebas de desconexión, fallos de proveedor y reintentos en el alcance de los flujos críticos.

**NFR-006 — Rendimiento y capacidad.** Consultas, índices, frontend y backend se optimizarán y el sistema se someterá a pruebas de carga antes de comercialización. Aún no hay metas numéricas de latencia, concurrencia o disponibilidad.

**Verificación:** acordar objetivos medibles antes de la fase de carga y reportar resultados contra ellos.

**NFR-007 — Recuperación de datos.** Deben existir backups y un procedimiento de restauración verificado antes del piloto comercial.

**Verificación:** restauración controlada y documentada, sin usar datos de producción de forma destructiva.

**NFR-008 — Mantenibilidad.** El código usará TypeScript estricto, módulos por dominio, separación entre presentación, lógica, servicios y repositorios, validación frontend/backend y componentes reutilizables; se evitará `any` sin justificación. La interfaz no consultará Firestore directamente.

**Verificación:** revisión de estructura, tipado, límites entre capas y dependencias.

**NFR-009 — Usabilidad y adaptación.** Los flujos de propietario, empleado, cocina, domiciliario y cliente deben funcionar en tamaños de pantalla de escritorio y móvil.

**Verificación:** revisión responsive y recorrido de flujos principales; navegadores objetivo y criterio formal de accesibilidad se definirán antes de producción.

**NFR-010 — Localización.** Textos y formatos para el mercado inicial estarán en español de Colombia y mostrarán importes en COP de forma consistente.

**Verificación:** revisar precios, resúmenes de compra, reportes y comunicaciones en los flujos completos.

**NFR-011 — Observabilidad y auditoría.** Los errores, fallos de integración y acciones sensibles deben poder diagnosticarse sin exponer secretos ni datos de pago innecesarios.

**Verificación:** revisar registros, alertas y trazabilidad durante la preparación para producción.

**NFR-012 — Gestión segura de integraciones.** Credenciales externas se guardarán en configuración de servidor adecuada; las integraciones desconfiguradas deberán comunicar el fallo y no simular éxito.

**Verificación:** probar ausencia, invalidez y rotación de configuración en entornos no productivos.

## 6. Reglas de negocio e invariantes

1. Todo dato comercial privado pertenece a un tenant; las validaciones de interfaz no reemplazan controles del servidor y las reglas.
2. Cada pedido de la primera versión corresponde a un restaurante.
3. La prueba empieza y vence según timestamps del servidor, dura 14 días y no se modifica con el reloj del navegador.
4. Vencer la prueba bloquea nuevas operaciones comerciales sin eliminar información ni impedir la consulta necesaria para contratar.
5. Elegir un plan crea una solicitud; no activa una suscripción.
6. Los precios, límites y características de planes se administran desde configuración de plataforma.
7. La activación requiere pago verificado o autorización administrativa válida, registrada y auditable.
8. Los pagos se confirman con evidencia verificada del proveedor o verificación administrativa autorizada; no se simula éxito.
9. Los estados de pedidos se limitan al conjunto definido y sus cambios se validan por rol en backend.
10. Reportes, métricas y estadísticas se calculan a partir de datos persistidos reales y con alcance autorizado.

## 7. Trazabilidad con la ruta oficial

| Fase | Días | Requisitos cubiertos principalmente |
|---|---:|---|
| 1. Preparación y arquitectura | 1–7 | Alcance, actores, requisitos, arquitectura y modelo de datos derivados de este documento |
| 2. Autenticación y permisos | 8–14 | FR-001, FR-003; NFR-001, NFR-002 |
| 3. Sistema multiempresa | 15–21 | FR-002, FR-014; NFR-001 |
| 4. Prueba y suscripciones | 22–28 | FR-006, FR-007, FR-005 |
| 5. Contratación y notificaciones | 29–35 | FR-008, FR-009, FR-010 |
| 6. Panel de superadministrador | 36–42 | FR-004, FR-005, FR-009, FR-025 |
| 7. Panel del restaurante y catálogo | 43–49 | FR-011–FR-014 |
| 8. Marketplace público | 50–56 | FR-015 |
| 9. Carrito y checkout | 57–63 | FR-016, FR-017, FR-021 |
| 10. Pedidos y cocina | 64–70 | FR-018, FR-019 |
| 11. Domicilios y pagos | 71–77 | FR-020–FR-022 |
| 12. Notificaciones e integraciones | 78–84 | FR-023, FR-024, FR-026 |
| 13. Seguridad y optimización | 85–91 | NFR-001–NFR-012 |
| 14. Pruebas integrales | 92–98 | Verificación integrada de FR y NFR |
| 15. Preparación para producción | 99–100 | NFR-004, NFR-006–NFR-012 |
| 16. Contingencia y piloto | 101–120 | Validación operativa de los requisitos antes de comercialización |

## 8. Decisiones pendientes de definición

Estas decisiones no se presuponen en este documento y deben resolverse antes de implementar el flujo afectado:

1. Matriz detallada de permisos por rol, acción y sede.
2. Si el cliente puede comprar como invitado, y qué mecanismo permite consultar pedidos propios.
3. Transiciones permitidas de cada estado de pedido, quién puede cancelar/rechazar y los efectos de cancelación sobre los pagos; el ciclo de inventario está definido en FR-013.
4. Método y reglas de cálculo de zonas, distancias, tarifas y cobertura.
5. Pasarela de pago a integrar primero (Wompi o Mercado Pago), métodos de verificación de transferencia y proveedor de correo.
6. Momento exacto de activación, renovación, cancelación y reembolso de suscripciones.
7. Canales, horarios, preferencias del usuario y política de reintentos para recordatorios de prueba y notificaciones.
8. Objetivos numéricos de rendimiento, disponibilidad, concurrencia y navegadores/dispositivos soportados.
9. Política de privacidad, consentimiento, retención y eliminación de datos para operar en Colombia.
10. Alcance y secuencia de sucursales frente al lanzamiento inicial.

## 9. Criterio de salida de esta jornada

El Día 2 entrega una base trazable de requisitos para continuar con la arquitectura del Día 3. Este documento no certifica que exista una implementación. Cada requisito deberá convertirse en decisiones de diseño y, posteriormente, en pruebas apropiadas antes de marcar funciones como completas.
