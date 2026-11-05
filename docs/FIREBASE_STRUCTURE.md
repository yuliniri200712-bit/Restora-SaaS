# Estructura de Firebase y Cloud Firestore

**Producto:** plataforma SaaS multiempresa para restaurantes

**Estado:** propuesta de estructura elaborada en el Día 5

**Base:** `docs/DATABASE_SCHEMA.md` y arquitectura aprobada
**Alcance:** nombres lógicos de colecciones, documentos, subcolecciones, consultas y límites de acceso. Este documento no crea recursos Firebase ni contiene reglas ejecutables.

## 1. Convenciones

- IDs de usuario corresponden al UID de Firebase Authentication. Los IDs de restaurantes, sedes, productos y pedidos son IDs opacos generados por servidor.
- Documentos propiedad de un restaurante se guardan bajo `restaurants/{restaurantId}`. Documentos pertenecientes a una sede se guardan bajo `restaurants/{restaurantId}/branches/{branchId}`.
- Para consultas de grupo de colecciones, los documentos tenant-scoped guardan `restaurantId`; los documentos de sede guardan además `branchId`. El backend verifica que esos campos coincidan con la ruta.
- El backend asigna `createdAt`, `updatedAt`, `expiresAt` y marcas de transición con timestamps de servidor. La interfaz presenta las fechas en la zona horaria configurada para Colombia.
- Importes se guardan como enteros `amountCop` y moneda `COP`. No usar `float`/`double` para dinero.
- Los estados son valores controlados por el backend. Los clientes no escriben estados de pedidos, pagos, inventario o suscripciones.
- Los arrays se reservan para listas cortas y acotadas. Historiales, listas que crecen y relaciones con acceso propio van en subcolecciones.
- Precios y características vigentes de plan son configurables. Solicitudes, pedidos y pagos guardan snapshots de los importes y datos usados al confirmar.
- El esquema es una propuesta documental. Todavía no existen colecciones, reglas, índices ni configuración Firebase en el repositorio.

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
| `platformRoles/{uid}` | Rol global y estado de superadministrador, asignados por un proceso de servidor autorizado. | Lectura y cambio protegidos; ninguna asignación desde cliente. |
| `platformAuditEvents/{eventId}` | Acciones globales sensibles, actor, recurso, resultado y fecha. | Solo backend escribe; superadministradores autorizados leen. |
| `appConfig/{configId}` | Configuración global versionada, sin secretos en documentos públicos. | Solo superadministrador autorizado y backend. |
| `plans/{planId}` | Nombre, estado, `currentVersionId`, código estable. | Lectura pública limitada a planes visibles; cambios solo por backend administrativo. |
| `plans/{planId}/versions/{versionId}` | Precio COP, límites, capacidades, vigencia y snapshot de características. | Backend crea versiones; solicitudes y suscripciones guardan el ID de versión aplicado. |
| `paymentWebhookEvents/{eventHash}` | Dedupe de webhooks por proveedor y evento; resultado de procesamiento y timestamps. | Solo Cloud Functions. `eventHash` se deriva de proveedor + ID de evento, sin incluir secretos. |

### 2.2 Raíz del restaurante y sedes

| Ruta | Uso y campos principales | Acceso esperado |
|---|---|---|
| `restaurants/{restaurantId}` | Tenant: `name`, `slug`, `ownerUid`, `status`, datos públicos/privados separados, `mainBranchId`, `currentSubscriptionId`, `createdAt`, `updatedAt`. | Solo miembros autorizados y backend. No es la fuente de lectura pública del marketplace. |
| `restaurants/{restaurantId}/memberships/{uid}` | `uid`, `role`, `status`, `branchAccess` (`all` o `selected`), `branchIds`, permisos delegados y actor de cambios. | Backend administra membresías. Rules/Functions validan membresía vigente y alcance. |
| `restaurants/{restaurantId}/branches/{branchId}` | Sede: nombre, código, dirección, ubicación, estado, horario y configuración local; `reservationTimeoutMinutes` (15 por defecto). | Miembros con acceso a esa sede y backend. Los cambios sensibles se auditan. |
| `restaurants/{restaurantId}/branches/{branchId}/productStates/{productId}` | Disponibilidad, publicación local y precio opcional de un producto en esa sede. Solo existe cuando hay una excepción respecto al catálogo base. | Miembros con acceso a sede; cambios comerciales privilegiados por backend. |
| `restaurants/{restaurantId}/branches/{branchId}/deliveryZones/{zoneId}` | Zona de cobertura, tarifa COP, regla de cobertura/geometría, estado y vigencia. Se mantiene por sede. | Lectura de personal autorizado; cambios por backend según permisos. Solo se publica la información necesaria para calcular o mostrar el domicilio. |

**Decisión confirmada por el propietario el 5 de noviembre de 2026:** crear una sede principal al registrar cada restaurante; `mainBranchId` referencia esa sede. El plan Empresarial habilita sedes adicionales y sus límites se administran desde superadministración. El acceso de membresía usa `branchAccess: all|selected`; los detalles del permiso por acción se definen posteriormente.

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
| `restaurants/{restaurantId}/orders/{orderId}` | Pedido: `restaurantId`, `branchId`, `customerUid` opcional, snapshots de contacto/dirección, importes COP, método/estado de pago, estado de pedido, fechas y claves idempotentes. | Creación y cambios de estado por Functions; lectura limitada a cliente dueño, miembros con alcance y superadmin autorizado. |
| `.../orders/{orderId}/items/{lineId}` | Una línea por documento: `productId`, nombre/precio snapshot, cantidad, opciones/adicionales snapshot y total de línea. | Solo se crea con el pedido por backend; lectura según el pedido. |
| `.../orders/{orderId}/events/{eventId}` | Historial append-only de estados, actor, momento, origen y motivo. | Solo backend escribe; lectura autorizada al cliente y personal según campos permitidos. |
| `restaurants/{restaurantId}/deliveryAssignments/{assignmentId}` | `orderId`, `branchId`, `courierUid`, estado y fechas de asignación/entrega. Campos para consultar asignaciones del domiciliario. | Backend escribe; Functions comprueba el courier asignado y la sede. |
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

Este cuadro guía el diseño futuro de Security Rules; no reemplaza las reglas ejecutables del Día 13 ni la autorización de Functions.

| Datos | Anónimo | Cliente autenticado | Miembro tenant | Superadministrador |
|---|---|---|---|---|
| `publicRestaurants/**` publicados | Lectura | Lectura | Lectura | Lectura |
| `users/{uid}` y sus subcolecciones | Denegado | Solo su UID | No por pertenecer al tenant | Acceso limitado por herramienta administrativa y auditoría |
| `restaurants/{rid}` y datos privados | Denegado | Solo pedidos propios por flujo autorizado | Solo tenant y sedes autorizadas | Acceso de plataforma autorizado y auditado |
| membresías, suscripciones y solicitudes | Denegado | Denegado | Solo resumen propio según rol | Lectura/gestión administrativa por backend |
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

La estructura de colecciones sigue siendo un diseño documental y todavía no se materializa en un proyecto Firebase real. El Día 6 agrega configuración únicamente local para Emulator Suite y reglas base de denegación total; no implementa el modelo de autorización descrito aquí. Los cambios posteriores a la estructura deben actualizar reglas, consultas e índices junto con ella.

## 8. Límite de la jornada

El Día 5 deja documentada la estructura propuesta de Firestore. La configuración local de emuladores y las reglas temporales se preparan en el Día 6; aún no existen colecciones, índices ejecutables, proyecto Firebase real, credenciales ni datos semilla. Las reglas tenant-aware, los índices concretos y la configuración de producción se implementarán en las jornadas correspondientes.
