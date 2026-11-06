# Estructura de Firebase y Cloud Firestore

**Producto:** plataforma SaaS multiempresa para restaurantes

**Estado:** estructura propuesta del Día 5; reglas tenant-aware implementadas en el Día 13 y verificadas con 12 casos en el Firestore Emulator del Día 14

**Base:** `docs/DATABASE_SCHEMA.md` y arquitectura aprobada
**Alcance:** nombres lógicos de colecciones, documentos, subcolecciones, consultas y límites de acceso. `firestore.rules` materializa una primera capa de lectura y protección; no crea recursos Firebase ni reemplaza autorización en Cloud Functions.

## 1. Convenciones

- IDs de usuario corresponden al UID de Firebase Authentication. Los IDs de restaurantes, sedes, productos y pedidos son IDs opacos generados por servidor.
- Documentos propiedad de un restaurante se guardan bajo `restaurants/{restaurantId}`. Documentos pertenecientes a una sede se guardan bajo `restaurants/{restaurantId}/branches/{branchId}`.
- Para consultas de grupo de colecciones, los documentos tenant-scoped guardan `restaurantId`; los documentos de sede guardan además `branchId`. El backend verifica que esos campos coincidan con la ruta.
- El backend asigna `createdAt`, `updatedAt`, `expiresAt` y marcas de transición con timestamps de servidor. La interfaz presenta las fechas en la zona horaria configurada para Colombia.
- Importes se guardan como enteros `amountCop` y moneda `COP`. No usar `float`/`double` para dinero.
- Los estados son valores controlados por el backend. Los clientes no escriben estados de pedidos, pagos, inventario o suscripciones.
- Los arrays se reservan para listas cortas y acotadas. Historiales, listas que crecen y relaciones con acceso propio van en subcolecciones.
- Precios y características vigentes de plan son configurables. Solicitudes, pedidos y pagos guardan snapshots de los importes y datos usados al confirmar.
- La estructura de colecciones sigue siendo una propuesta documental: no crea colecciones ni índices en Firebase. Las reglas directas iniciales se mantienen en `firestore.rules`.

## 2. Árbol propuesto de colecciones

```text
/users/{uid}
  /addresses/{addressId}
  /devices/{deviceId}
  /notifications/{notificationId}

/platformRoles/{uid}
/platformAuditEvents/{eventId}
/appConfig/{configId}
/plans/{planId}
  /versions/{versionId}
/paymentWebhookEvents/{eventHash}

/restaurants/{restaurantId}
  /branches/{branchId}
    /productStates/{productId}
    /deliveryZones/{zoneId}
    /inventoryItems/{inventoryItemId}
      /movements/{movementId}
  /memberships/{uid}
  /categories/{categoryId}
  /products/{productId}
    /variantGroups/{groupId}
      /options/{optionId}
    /addOnGroups/{groupId}
      /options/{optionId}
  /promotions/{promotionId}
  /customers/{uid}
  /orders/{orderId}
    /items/{lineId}
    /events/{eventId}
    /reservations/{reservationId}
  /kitchenTasks/{taskId}
  /deliveryAssignments/{assignmentId}
    /events/{eventId}
  /subscriptions/{subscriptionId}
    /reminderReceipts/{reminderKey}
  /planRequests/{requestId}
  /paymentTransactions/{transactionId}
  /notifications/{notificationId}
  /auditEvents/{eventId}
  /supportCases/{caseId}
  /operationReceipts/{idempotencyKey}

/publicRestaurants/{restaurantId}
  /products/{productId}
    /variantGroups/{groupId}
      /options/{optionId}
    /addOnGroups/{groupId}
      /options/{optionId}
```

### 2.1 Datos globales de plataforma

| Ruta | Uso y campos principales | Acceso esperado |
|---|---|---|
| `users/{uid}` | Perfil mínimo de usuario: `displayName`, `email` (si se necesita), `status`, `createdAt`, `updatedAt`. No guarda contraseña ni rol de restaurante. | El usuario lee y actualiza campos de perfil permitidos; Admin SDK gestiona cuentas y campos protegidos. |
| `users/{uid}/addresses/{addressId}` | Direcciones guardadas por el cliente: etiqueta, dirección, notas, coordenadas y fechas. | Solo el usuario dueño y backend autorizado. Las copias usadas en pedidos van en snapshots del pedido. |
| `users/{uid}/devices/{deviceId}` | Token FCM y metadatos mínimos del dispositivo. | El usuario puede registrar/eliminar su token mediante servicio; no es visible para otros usuarios. |
| `users/{uid}/notifications/{notificationId}` | Avisos personales y estado de lectura. | Solo el usuario destinatario y backend. |
| `platformRoles/{uid}` | `uid`, rol global `superadmin`, estado, permisos explícitos, actor y fechas de asignación/cambio. | Solo Functions accede; ninguna asignación desde cliente; cambios sensibles registran evento de auditoría. |
| `platformAuditEvents/{eventId}` | Acciones globales sensibles, actor, recurso, resultado y fecha. | Solo backend escribe; superadministradores autorizados leen. |
| `appConfig/{configId}` | Configuración global versionada, sin secretos en documentos públicos. | Solo superadministrador autorizado y backend. |
| `plans/{planId}` | Nombre, estado, `currentVersionId`, código estable. | Lectura pública limitada a planes visibles; cambios solo por backend administrativo. |
| `plans/{planId}/versions/{versionId}` | Precio COP, límites, capacidades, vigencia y snapshot de características. | Backend crea versiones; solicitudes y suscripciones guardan el ID de versión aplicado. |
| `paymentWebhookEvents/{eventHash}` | Dedupe de webhooks por proveedor y evento; resultado de procesamiento y timestamps. | Solo Cloud Functions. `eventHash` se deriva de proveedor + ID de evento, sin incluir secretos. |

### 2.2 Raíz del restaurante y sedes

| Ruta | Uso y campos principales | Acceso esperado |
|---|---|---|
| `restaurants/{restaurantId}` | Tenant: `name`, `slug`, `ownerUid`, `status`, datos públicos/privados separados, `mainBranchId`, `currentSubscriptionId`, `createdAt`, `updatedAt`. | Solo miembros autorizados y backend. No es la fuente de lectura pública del marketplace. |
| `restaurants/{restaurantId}/memberships/{uid}` | `uid`, `role` (`owner`, `administrator`, `employee`, `kitchen`, `delivery`), `status`, `branchAccess` (`all` o `selected`), `branchIds`, permisos delegados y actor/fechas de cambios. | Solo backend administra membresías. Functions valida UID autenticado, rol, permiso, estado y alcance antes de una acción; Rules aplica lectura propia como segunda barrera. |
| `restaurants/{restaurantId}/branches/{branchId}` | Sede: nombre, código, dirección, ubicación, estado, horario y configuración local; `reservationTimeoutMinutes` (15 por defecto). | Miembros con acceso a esa sede y backend. Los cambios sensibles se auditan. |
| `restaurants/{restaurantId}/branches/{branchId}/productStates/{productId}` | Disponibilidad, publicación local y precio opcional de un producto en esa sede. Solo existe cuando hay una excepción respecto al catálogo base. | Miembros con acceso a sede; cambios comerciales privilegiados por backend. |
| `restaurants/{restaurantId}/branches/{branchId}/deliveryZones/{zoneId}` | Zona de cobertura, tarifa COP, regla de cobertura/geometría, estado y vigencia. Se mantiene por sede. | Lectura de personal autorizado; cambios por backend según permisos. Solo se publica la información necesaria para calcular o mostrar el domicilio. |

**Decisiones confirmadas por el propietario:** crear una sede principal al registrar cada restaurante; `mainBranchId` referencia esa sede. El plan Empresarial habilita sedes adicionales y sus límites se administran desde superadministración. La membresía usa `branchAccess: all|selected`. El Día 12 fijó la matriz base de permisos descrita abajo.

### 2.3 Catálogo e inventario

| Ruta | Uso y campos principales | Acceso esperado |
|---|---|---|
| `restaurants/{restaurantId}/categories/{categoryId}` | Categorías tenant-scoped: nombre, orden, estado, `publishedAt` opcional. | Lectura por miembros autorizados; escritura por roles de catálogo mediante Functions. |
| `restaurants/{restaurantId}/products/{productId}` | Catálogo base: nombre, descripción, `categoryId`, precio COP, estado, imagen, indicador de publicación y fechas. | Funciones de negocio escriben; miembros autorizados leen. El marketplace usa proyección pública aparte. |
| `.../products/{productId}/variantGroups/{groupId}/options/{optionId}` | Opciones de variante, incremento de precio y reglas de selección. No contienen stock propio por defecto. | Backend valida opción y pertenencia al mismo producto/tenant. |
| `.../products/{productId}/addOnGroups/{groupId}/options/{optionId}` | Adicionales y precios; `inventoryItemId` opcional solo si se configura stock propio. | Backend valida selección, precio y tenant. |
| `restaurants/{restaurantId}/branches/{branchId}/inventoryItems/{inventoryItemId}` | Existencia por sede: `sourceType`, `sourceId`, `quantityOnHand`, `quantityReserved`, unidad y estado. `availableQuantity` se calcula como `onHand - reserved`. | Lectura según permiso de inventario; toda mutación se hace mediante Functions transaccionales. |
| `.../inventoryItems/{inventoryItemId}/movements/{movementId}` | Ledger append-only: `type` (`reserve`, `consume`, `release`, `restock`, `waste`), cantidad, pedido/reserva origen, actor, motivo y timestamp. | Solo backend escribe. Roles autorizados leen. No se editan movimientos históricos. |
| `restaurants/{restaurantId}/orders/{orderId}/reservations/{reservationId}` | Sede e inventario reservados; línea/artículo; cantidad; estado; `expiresAt`; claves idempotentes y timestamps. | Solo Functions escribe. La consulta de vencimientos es server-side. |

Los productos mantienen el catálogo base a nivel de restaurante. Las existencias siempre se separan por sede. Una variante o adicional usa stock independiente solo si tiene `inventoryItemId`; de lo contrario consume el stock configurado para el producto base.

### 2.4 Pedidos, domicilios y clientes

| Ruta | Uso y campos principales | Acceso esperado |
|---|---|---|
| `restaurants/{restaurantId}/orders/{orderId}` | Pedido: `restaurantId`, `branchId`, `customerUid` opcional, `kitchenUid` opcional y `currentDeliveryAssignmentId` opcional; snapshots de contacto/dirección, importes COP, método/estado de pago, estado de pedido, fechas y claves idempotentes. | Creación y cambios de estado por Functions; lectura limitada a cliente dueño, miembros con alcance y domiciliario asignado. Cocina no lee este documento completo porque incluye datos de contacto. |
| `.../orders/{orderId}/items/{lineId}` | Una línea por documento: `productId`, nombre/precio snapshot, cantidad, opciones/adicionales snapshot y total de línea. | Solo se crea con el pedido por backend; lectura según el pedido. |
| `.../orders/{orderId}/events/{eventId}` | Historial append-only de estados, actor, momento, origen y motivo. | Solo backend escribe; lectura autorizada al cliente y personal según campos permitidos. |
| `restaurants/{restaurantId}/kitchenTasks/{taskId}` | Proyección de preparación con `restaurantId`, `branchId`, `orderId`, `kitchenUid`, estado y detalles de preparación sin UID/datos de contacto/dirección/pago del cliente. | Functions crea y actualiza la proyección. Cocina lee únicamente tareas asignadas y dentro de su sede; personal con `orders.read` puede leer por sede. Escrituras solo por Functions. |
| `restaurants/{restaurantId}/deliveryAssignments/{assignmentId}` | `orderId`, `branchId`, `courierUid`, estado y fechas de asignación/entrega. El pedido guarda `currentDeliveryAssignmentId` para apuntar a la asignación vigente. | Backend escribe; Functions comprueba el courier asignado y la sede. El cambio de asignación y del puntero del pedido debe ser atómico. |
| `.../deliveryAssignments/{assignmentId}/events/{eventId}` | Historial append-only de asignación, aceptación, recogida y entrega con actor y timestamp. | Solo backend escribe; el domiciliario y personal autorizado leen según asignación/sede. |
| `restaurants/{restaurantId}/customers/{uid}` | Relación tenant-cliente con datos operativos mínimos, sin copiar perfil global innecesariamente. | Solo cliente participante y personal autorizado. Sin acceso al historial de otros restaurantes. |

Las direcciones reutilizables de clientes autenticados residen bajo `users/{uid}/addresses`. Un pedido siempre conserva un snapshot de entrega para que cambios posteriores en la libreta no alteren pedidos existentes. `customerUid` opcional y snapshot de contacto permiten decidir compra como invitado sin guardar direcciones de invitado como perfiles permanentes.

### 2.5 Suscripciones, pagos y notificaciones

| Ruta | Uso y campos principales | Acceso esperado |
|---|---|---|
| `restaurants/{restaurantId}/subscriptions/{subscriptionId}` | Historial de suscripción: `planId`, `planVersionId`, estado, prueba y ciclo, importes snapshot, origen de activación y timestamps. El restaurante apunta al registro vigente mediante `currentSubscriptionId`. | Backend y superadmin; el dueño ve su estado e historial permitido. |
| `.../subscriptions/{subscriptionId}/reminderReceipts/{reminderKey}` | Dedupe de recordatorios por tipo y día de prueba. | Solo backend. |
| `restaurants/{restaurantId}/planRequests/{requestId}` | Solicitud con solicitante, versión/precio snapshot, estado, revisión administrativa y timestamps. | Tenant lee solicitudes propias; backend administra estados. Superadmin consulta por colección de grupo. |
| `restaurants/{restaurantId}/paymentTransactions/{transactionId}` | Pago asociado a un pedido, solicitud o suscripción; `subjectType`, `subjectId`, proveedor, referencia, monto/moneda, estado, verificación e idempotencia. | Solo backend escribe; lectura acotada por el recurso al que pertenece. |
| `restaurants/{restaurantId}/notifications/{notificationId}` | Notificaciones internas para restaurante: destinatarios/roles, evento origen, estado y lectura. | Usuarios del tenant leen solo las destinadas a su rol/sede; backend escribe. |
| `restaurants/{restaurantId}/auditEvents/{eventId}` | Auditoría tenant-scoped append-only con actor, acción, recurso, sede y timestamp. | Solo Functions escribe; administradores autorizados leen. |
| `restaurants/{restaurantId}/supportCases/{caseId}` | Caso de soporte vinculado a tenant y solicitante, estado, asignado y eventos. | Participantes autorizados y soporte de plataforma. |
| `restaurants/{restaurantId}/operationReceipts/{idempotencyKey}` | Resultado de comandos reintentables: creación del pedido, transición de inventario u operación crítica. | Solo Functions. Evitar duplicación por doble clic/reintento. |

Se propone una sola suscripción vigente por restaurante. El documento `restaurant.currentSubscriptionId` apunta a la suscripción actual; las anteriores se conservan para historial. Las solicitudes y transacciones mantienen sus propios snapshots.

## 3. Proyección pública del marketplace

El marketplace no leerá documentos privados de `restaurants`. Cloud Functions mantendrá:

- `publicRestaurants/{restaurantId}`: solo nombre público, slug, ciudad/zona publicable, categorías, logo/imagen, estado de publicación y campos de búsqueda.
- `publicRestaurants/{restaurantId}/products/{productId}`: nombre, descripción, imagen, categoría, precio público, disponibilidad y estado de publicación.
- `.../products/{productId}/variantGroups/{groupId}/options/{optionId}` y `.../addOnGroups/{groupId}/options/{optionId}`: opciones públicas y cambios de precio permitidos, replicados por backend.

La proyección se actualiza al publicar/editar restaurante o catálogo y se elimina o marca no publicable al suspender/despublicar. Security Rules permiten lectura anónima solo de documentos publicados y deniegan escritura de cliente. Datos de contacto privados, pedidos, configuración interna y datos de clientes no se replican en estas rutas.

La búsqueda inicial usará filtros indexables, categoría, ciudad y campos normalizados de nombre/slug. Firestore no se usará como motor de búsqueda de texto completo; añadir un proveedor de búsqueda aparte requeriría revisar arquitectura y costos.

## 4. Reglas de autorización esperadas por ruta

La matriz base aprobada se materializa parcialmente en las Security Rules descritas abajo; nunca reemplaza la autorización obligatoria de Cloud Functions.

### 4.1 Matriz base aprobada para el Día 12

| Actor/rol | Permisos base | Límites |
|---|---|---|
| `owner` | Administración del tenant, membresías y suscripción; permisos de operación en todas las sedes. | Solo su restaurante; no concede permisos de plataforma. |
| `administrator` | Solo permisos de tenant delegados explícitamente por módulo. | No recibe `members.manage` ni `subscription.manage`; alcance `all` o `selected`. |
| `employee` | Solo permisos de tenant delegados explícitamente. | Alcance `all` o `selected`; ningún permiso no incluido en la lista delegable. |
| `kitchen` | Leer y actualizar preparación de pedidos asignados. | Debe comprobarse asignación del pedido y sede autorizada. |
| `delivery` | Leer y actualizar progreso de entregas asignadas. | Debe comprobarse asignación de la entrega y sede autorizada. |
| `customer` | Perfil, direcciones y pedidos propios. | El UID del recurso debe coincidir con el UID autenticado. |
| `superadmin` | Permisos globales explícitos desde `platformRoles/{uid}`. | Separado de membresías de restaurante; asignaciones y acciones administrativas se auditan. |

Los IDs de permisos son explícitos y están centralizados en `functions/src/authorization/domain/access-control.ts`. `owner` recibe todas las capacidades tenant, excepto las capacidades exclusivas de asignación de cocina/domicilio; `administrator` y `employee` reciben únicamente permisos delegables: `restaurant.read`, `restaurant.update`, `members.read`, `branches.list`, `branches.read`, `branches.manage`, `catalog.read`, `catalog.manage`, `orders.read`, `orders.manage`, `inventory.read`, `inventory.manage`, `customers.read`, `reports.read` y `settings.manage`. No se delegan `members.manage` ni `subscription.manage`. Cocina recibe `kitchen.orders.readAssigned` y `kitchen.orders.updateAssigned`; domiciliario recibe `delivery.orders.readAssigned` y `delivery.orders.updateAssigned`. Las capacidades propias del cliente son `profile.readOwn`, `profile.updateOwn`, `addresses.manageOwn` y `orders.readOwn`. Las capacidades globales de superadministración son explícitas y se asignan en `platformRoles/{uid}`; asignación vacía o desactivada equivale a no tener acceso.

`getOwnRestaurantAccess` y `getOwnPlatformAccess` devuelven permisos para representar la interfaz, no para autorizar mutaciones. Toda callable que ejecute una acción debe usar los verificadores de backend `requireTenantPermission`, `requireAssignedTenantPermission`, `requireSelfPermission` o `requirePlatformPermission`, según corresponda. El verificador de recursos asignados comprueba además el UID asignado. Toda acción privilegiada de plataforma debe escribir su resultado con `recordPlatformAuditEvent`. La pertenencia y el rol se leen del documento de Firestore con el UID autenticado; el cliente no envía rol ni permisos efectivos. Cuando el alcance es `selected`, una consulta que liste sedes debe limitar resultados a `branchIds` del contexto autorizado. El Día 12 deja el núcleo listo; todavía no existen comandos de asignación de membresías ni acciones administrativas que lo consuman.

### 4.2 Alcance aplicado en Security Rules (Día 13)

`firestore.rules` permite lecturas directas solo donde los documentos y campos de alcance están definidos. La identidad y el estado activo se cargan desde `restaurants/{restaurantId}/memberships/{auth.uid}`; administrador/empleado requieren un permiso delegable almacenado allí; cocina y domicilio requieren permisos de asignación; la membresía se intersecta con `branchAccess` y `branchIds`. Ningún cliente puede escribir membresías, permisos, catálogo, pedidos, estados, inventario, movimientos, reservas, asignaciones, pagos, suscripciones, auditoría o recibos idempotentes. Esas operaciones corresponden a Functions que deben repetir las verificaciones con Admin SDK.

| Ruta | Lectura cliente permitida | Escritura cliente |
|---|---|---|
| `users/{uid}` | `get` del documento propio; perfil con campos/timestamps acotados. | Crear/editar solo `displayName`; borrar denegado. |
| `users/{uid}/addresses`, `devices`, `notifications` | Solo el usuario dueño. | Denegada hasta definir allowlist/flujo de servicio por cada dato. |
| `publicRestaurants/**` | Solo proyecciones con `published == true`; productos y opciones requieren padre publicado. | Denegada. |
| `restaurants/{rid}` | Documento propio del tenant según `restaurant.read`. | Denegada. |
| `memberships/{uid}` | Solo documento de membresía cuyo ID coincide con el UID autenticado; sin listar equipo. | Denegada. |
| `branches/{bid}` y datos locales | Permiso de módulo y sede `all` o incluida en `branchIds`. | Denegada. |
| categorías/productos/opciones/promociones | `catalog.read` en membresía activa con acceso a una o más sedes; los estados de producto requieren acceso a la sede del path. | Denegada. |
| pedidos, líneas e historial | Cliente autenticado solo si `customerUid` coincide; miembro con `orders.read` y sede; domiciliario solo con asignación vigente; cocina lee líneas asignadas y la proyección `kitchenTasks`, no el pedido completo. | Denegada. |
| `inventoryItems` y `movements` | `inventory.read` y sede autorizada. | Denegada. |
| `subscriptions` y `planRequests` | `subscription.read` (solo propietario con la matriz vigente). | Denegada. |
| `platformAuditEvents` | Superadministrador activo con `platform.audit.read`. | Denegada. |
| demás rutas | Denegada por ausencia de una regla permisiva. | Denegada. |

Firestore Rules autoriza documentos completos, no oculta campos de un documento. Por eso cocina no recibe el pedido que contiene snapshot de dirección/contacto: Functions debe crear `kitchenTasks` como proyección de preparación sin PII. Functions también debe mantener `kitchenUid` en los pedidos y `currentDeliveryAssignmentId` apuntando a la asignación vigente; ningún cliente puede cambiarlos. La asignación del domiciliario se invalida si se reemplaza esa referencia. [Control de acceso a campos](https://firebase.google.com/docs/firestore/security/rules-fields)

Las consultas cliente tienen que cumplir las mismas restricciones que la regla; Rules no filtra resultados, y un query potencialmente demasiado amplio se rechaza completo. En el Día 14 pasaron 12 casos automatizados con `npm run test:rules`, usando `firebase.rules-test.json`, el Project ID aislado `demo-restora-day14` y el puerto 8180. El emulador cargó `firestore.rules`; no se inició Authentication Emulator para esta suite: la librería de reglas simuló los UID/estados de autenticación. No se desplegaron reglas en `restora-demo` ni en otro proyecto. [Consultas seguras](https://firebase.google.com/docs/firestore/security/rules-query), [pruebas con Emulator Suite](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

| Datos | Anónimo | Cliente autenticado | Miembro tenant | Superadministrador |
|---|---|---|---|---|
| `publicRestaurants/**` publicados | Lectura | Lectura | Lectura | Lectura |
| `users/{uid}` y sus subcolecciones | Denegado | Solo su UID | No por pertenecer al tenant | Acceso limitado por herramienta administrativa y auditoría |
| `restaurants/{rid}` y datos privados | Denegado | Solo pedidos propios por flujo autorizado | Solo tenant y sedes autorizadas | Acceso de plataforma autorizado y auditado |
| membresías, suscripciones y solicitudes | Denegado | Solo su documento de membresía | Solo resumen propio; suscripción según permiso | Lectura/gestión administrativa por backend |
| pedidos, inventario, reservas, pagos y auditoría | Denegado | Solo pedidos propios y campos permitidos | Lectura según rol/sede; escrituras privilegiadas por Functions | Acceso administrativo auditado |
| `platformRoles`, `plans` editables, eventos webhook | Denegado | Denegado | Denegado | Backend y roles de plataforma autorizados |

Las consultas cliente deben incluir restricciones que garanticen que todos los resultados cumplen las reglas; Firestore Security Rules no filtran resultados. El Admin SDK utilizado por Functions omite Security Rules, así que cada función debe validar identidad, tenant, sede y rol antes de consultar o escribir. Las consultas de grupo de colecciones usadas por backend requerirán índices de grupo y reglas de grupo solo si algún cliente las ejecuta. [Consultas seguras y reglas](https://firebase.google.com/docs/firestore/security/rules-query)

## 5. Consultas previstas e índices candidatos

Índices exactos se comprobarán con consultas reales al implementar y se optimizarán en la fase de índices. Estos patrones deben orientar los primeros índices compuestos:

| Flujo | Ruta/consulta prevista | Índice candidato |
|---|---|---|
| Marketplace | restaurantes publicados por ciudad/categoría, ordenados por nombre/visibilidad | `publicRestaurants`: `published`, `city`, `categoryIds`, orden |
| Catálogo público | productos publicados de un restaurante por `categoryId` y orden de menú | `publicRestaurants/{rid}/products`: `published`, `categoryId`, `sortOrder` |
| Panel de pedidos | pedidos por `branchId`, estado y `createdAt` descendente | `orders`: `branchId`, `status`, `createdAt` |
| Historial del cliente | pedidos por `customerUid`, `createdAt` descendente | `orders`: `customerUid`, `createdAt` |
| Domicilios | asignaciones por `courierUid`, estado y fecha | `deliveryAssignments`: `courierUid`, `status`, `createdAt` |
| Reservas vencidas | colección de reservas por `state == active` y `expiresAt <= now` | colección de grupo `reservations`: `state`, `expiresAt` |
| Recordatorios de prueba | suscripciones en prueba por estado y `trial.expiresAt` | colección de grupo `subscriptions`: estado, vencimiento |
| Revisión de contratación | solicitudes por estado y fecha descendente | colección de grupo `planRequests`: `status`, `requestedAt` |
| Auditoría | eventos por actor/fecha, tenant/fecha o sede/fecha | índices según pantalla y filtros administrativos usados |

Las consultas de grupo para vencimientos y administración se ejecutarán en backend con Admin SDK. Una colección de grupo mezcla rutas con el mismo ID de colección; todos los documentos consultados incluyen los campos de alcance requeridos. Firestore requiere índices de alcance collection-group para consultas filtradas/ordenadas sobre collection groups. [Descripción de índices](https://firebase.google.com/docs/firestore/query-data/index-overview)

## 6. Operaciones atómicas e idempotencia

### 6.1 Reserva y consumo de inventario

Cuando el plan tiene inventario habilitado, registrar `Recibido` debe realizar en una transacción backend:

1. Leer balances de la sede y comprobar disponibilidad para cada artículo.
2. Incrementar `quantityReserved` por las cantidades pedidas.
3. Crear el pedido y sus documentos de reserva con vencimiento por defecto a 15 minutos.
4. Crear movimientos `reserve` y una `operationReceipt` con clave idempotente.

Al enviar a cocina, otra operación transaccional reduce `quantityOnHand`, disminuye `quantityReserved`, cambia las reservas a consumidas y registra movimiento `consume`. Cancelación antes de cocina libera la reserva (`release`); cancelación en cocina restituye lo consumido (`restock`). Después de cocina no se restituye automáticamente; el registro manual de reposición o merma requiere permiso, motivo y referencia al pedido.

La expiración de reservas consulta documentos activos vencidos, bloquea/cancela una sola vez el pedido, libera stock y crea notificaciones. La expiración repetida no vuelve a modificar balance. Las funciones de transacción deben ser idempotentes y no realizar llamadas externas dentro de la transacción; Firestore puede reintentar el callback cuando hay contención. [Transacciones y escrituras atómicas](https://firebase.google.com/docs/firestore/manage-data/transactions)

### 6.2 Pagos

El webhook verifica firma, proveedor, importe, moneda, referencia y estado antes de actualizar `paymentTransactions` y guardar el evento deduplicado en `paymentWebhookEvents`. Si un pago se confirma tras expirar/cancelarse el pedido, no reactiva el pedido: se intenta iniciar un reembolso cuando el proveedor lo permita; si no, se crea tarea de revisión administrativa.

## 7. Decisiones y propuestas de estructura

1. **Sede principal al crear tenant — confirmada:** se crea `branches/{branchId}` principal desde el alta y cada pedido contiene `branchId`. Sedes adicionales dependen del plan Empresarial.
2. **Disponibilidad/precio:** catálogo y precio base residen a nivel restaurante; horarios, cobertura e inventario residen en sede; `productStates` guarda solo excepciones de disponibilidad/precio por sede.
3. **Membresías por sede:** `branchAccess` admite `all` o `selected` con `branchIds`; la matriz de acciones y permisos se concretará en la fase de roles.
4. **Cliente invitado:** el campo `customerUid` es opcional; un pedido conserva snapshot de contacto y dirección. Solo usuarios autenticados tienen libreta de direcciones persistente. Un flujo de compra invitada debe aprobarse antes de exponerlo al público.
5. **Suscripción vigente:** un solo `currentSubscriptionId` por restaurante; los registros pasados permanecen en `subscriptions`.
6. **Retención:** no se elimina historial al expirar prueba. Retención legal, anonimización y borrado por solicitud quedan para la política de privacidad y la fase del piloto.

La estructura de colecciones sigue siendo un diseño documental y todavía no se materializa en un proyecto Firebase real. El Día 6 agregó configuración local de emuladores y reglas base deny-all; el Día 13 implementó reglas tenant-aware; en el Día 14 pasaron 12 casos con datos efímeros en Firestore Emulator. No se desplegaron estas reglas ni existen datos de producto en Firebase real.

## 8. Límite de la jornada

El Día 5 deja documentada la estructura propuesta de Firestore. La configuración local de emuladores y las reglas temporales se preparan en el Día 6; aún no existen colecciones, índices ejecutables, proyecto Firebase real, credenciales ni datos semilla. Las reglas tenant-aware, los índices concretos y la configuración de producción se implementarán en las jornadas correspondientes.
