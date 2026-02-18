# EPIC-01 | Gestión de Solicitud de Compra (Core Funcional)

## 1. Descripción
Esta épica cubre el proceso central del MVP, permitiendo a los usuarios Crear, Modificar, Listar y Visualizar Solicitudes de Compra de materiales o servicios de forma controlada y trazable.

## 2. Objetivo
Representar el inicio del proceso de compras, alineado con el concepto de Purchase Requisition en SAP MM, garantizando que toda solicitud cuente con información mínima válida y esté correctamente registrada en el sistema.

Esta épica sienta las bases funcionales del sistema, sobre las cuales se apoyan los flujos de estado (EPIC-02) y las reglas de autorización (EPIC-03).

## 3. Alcance funcional (In Scope)

 - Crear solicitudes de compra por parte del usuario con rol Solicitante.
 - Modificar solicitudes existentes, solo:
  - La solicitud que se encuentre en estado "Creada".
  - Si la solicitud es propia del usuario.
 - Visualizar solicitudes.
 - Listar solicitudes registradas:
  - En el MVP: solo puede visualizar sus propias solicitudes.
 - Validar campos obligatorios definidos para la solicitud de compra.
 - Detectar solicitudes duplicadas de forma básica, considerando:
  - Mismo material o servicio.
  - Mismo centro.
  - Misma fecha de entrega.

## 4. Out of Scope (Excluye explícitamente para este MVP)

- Creación de solicitudes de compra asociadas a:
  - Licitaciones.
  - Pedidos de oferta o procesos de cotización.
- Flujos avanzados de aprobación o liberación de solicitudes.
- Integraciones con:
 - Proveedores.
 - Pedidos de compra.
 - Sistemas externos.
- Gestión de adjuntos o documentación asociada a la solicitud de compra.
- Gestión de inventarios, stock o movimientos de mercancía.

> Nota: Cualquier funcionalidad no mencionada explícitamente en este alcance se considera fuera del MVP.

## 5. Relación con otras épicas
- Depende de:
  - **EPIC-03 | Gestión de Usuarios y Seguridad** (autenticación, roles y sesión).
- Es soportada por:
  - **EPIC-02 | Gestión del Ciclo de Vida de la Solicitud (Estados)** para el control de estados y transiciones.

## 6. DoR (Definition of Ready) 

Deberán existir:
- Reglas de negocio asociadas claramente definidas y documentadas.
- Todas las Historias de Usuario necesarias para cubrir el alcance del MVP han sido identificadas.
- Criterios de aceptación completos y verificables (incluyendo escenarios negativos).
- Dependencias funcionales definidas (por ejemplo, con estados o seguridad).
- Alcance alineado con el MVP (sin funcionalidades futuras o avanzadas).

Si alguno de estos puntos no se cumple, la historias permanecen en estado **Refinamiento**.

## 7. DoD (Definition of Done)

Una Historia de Usuario de esta épica se considera **Done** cuando:

- La funcionalidad permite crear, modificar, visualizar o listar solicitudes de compra según lo definido.
- Las reglas de negocio asociadas están documentadas y aplicadas.
- Los campos obligatorios se validan correctamente.
- Los criterios de aceptación están implementados y cubiertos.
- Existen escenarios funcionales en Gherkin (mínimo: un escenario exitoso y uno negativo).
- Se respeta el flujo funcional inspirado en SAP MM (creación, modificación y visualización de solicitudes), sin requerir el uso de transacciones reales.
- No se introduce funcionalidad fuera del alcance del MVP.
- La historia puede ser probada funcionalmente sin dependencias externas no resueltas.
- No existen defectos funcionales críticos abiertos.

## 8. Módulo incluido en la épica

### 8.1. Gestión de Solicitudes de Compra (Core del MVP)

**Objetivo**  
Permitir la gestión controlada de Solicitudes de Compra, asegurando que cada solicitud sea creada, modificada y visualizada bajo reglas de negocio claras y estados válidos.

**Principal problema que resuelve**  
Centraliza y estandariza las solicitudes de compra, evitando errores de duplicidad, solapamiento de pedidos o solicitudes fuera de tiempo.

**Usuarios principales**

> Nota: Los roles y responsabilidades descritos se implementan de forma progresiva y coordinada con EPIC-02 (Gestión del Ciclo de Vida de la Solicitud).

### Rol Solicitante: Usuario que origina y gestiona la solicitud de compra

**Responsabilidades** 
- Modificar solicitud solo en estado “Creada”
- Visualizar solicitudes propias
- Listar solicitudes propias
- Enviar solicitud a revisión (disparando el cambio de estado inicial definido en EPIC-02)

**Restricciones**
- No aprueba
- No modifica solicitudes en estados finales
- No gestiona usuarios

### Rol Aprobador: Usuario encargado del control y cierre del proceso. Decide sobre la solicitud (en combinación con EPIC-02)

**Responsabilidades**
- Visualizar solicitudes pendientes
- Cambiar estado de solicitud:
  - En revisión → Aprobada
  - En revisión → Rechazada
- Visualizar detalle completo
**Restricciones**
- No crea solicitudes
- No modifica datos funcionales de la solicitud
- No gestiona usuarios

### Rol: Administrador Técnico/Funcional: Soporte básico al sistema, no parte directa del proceso de compra

**Responsabilidades** 
- Alta de usuarios
- Asignación de roles
- Activar / desactivar usuarios

**Restricciones**
- No participa del flujo de solicitud
- No aprueba ni crea solicitudes

**Reglas de negocio clave**

- Toda solicitud de compra debe estar asociada a un usuario activo y autenticado.
- La fecha de la solicitud no puede ser anterior a la fecha actual del sistema.
- La detección de duplicados para el MVP se limita a mismo:
  - Material/servicio
  - Mismo centro
  - Misma fecha de entrega.
- Las acciones (crear, modificar, listar, visualizar) solo pueden ser realizadas por usuarios con rol y permisos correspondientes. (se conecta con EPIC-03).
- Las restricciones por rol deben validarse tanto a nivel de interfaz como de lógica de negocio, evitando accesos no autorizados por manipulación directa.

**Justificación para el MVP**

- Representa el núcleo funcional de cualquier sistema de compras.
- Permite demostrar validaciones de negocio, control de datos y trazabilidad.
- Ideal para generar:
  - Historias de Usuario claras.
  - Criterios de aceptación sólidos.
  - Escenarios de testing funcional y negativo.
- Refleja procesos reales de SAP MM (ME51N – Purchase Requisition).

## 9. Funcionalidades seleccionadas (Features)

### 9.1. Crear Solicitud de Compra

**Descripción**  

- Permite registrar una nueva solicitud de material o servicio, con datos mínimos: tipo, descripción, cantidad, unidad de medida(UM), fecha de entrega, centro.
- El campo Almacéen solo se requerirá si el Tipo es "Material".
- Cuando se crea, EPIC-02 asigna el estado inicial `Creada`.

**Justificación**

- Es el punto de entrada del proceso.
- Genera reglas de negocio claras (campos obligatorios, validaciones).
- Ideal para pruebas positivas, negativas y de borde.
- Refleja el proceso estándar SAP MM (ME51N – concepto).

**Dependencias**

- Autenticación y Roles (EPIC-03).
- Usuarios (simplificado) (EPIC-03).
- Gestión de Estados (estado inicial `Creada`, EPIC-02).

---

### 9.2. Modificar Solicitud de Compra

**Descripción**  

- En el MVP solo se permite modificar solicitudes de compra que se encuentren en estado "Creada".
- La modificación solo puede ser realizada por el usuario Solicitante que creó la solicitud.
- Una vez creada la solicitud, no se permite la modificación de los siguientes campos:
  - Tipo
  - Centro
  - Almacén

**Justificación**

- Introduce reglas de negocio condicionales (por estado y rol).
- Permite validar permisos y control de estados.
- Muy valiosa para escenarios de testing funcional.

**Dependencias**

- Gestión de Estados (EPIC-02).
- Autenticación y Roles (EPIC-03).

---

### 9.3. Visualizar Solicitud de Compra

**Descripción**  
Permite la consulta detallada de una solicitud específica.

**Justificación**

- Funcionalidad esencial para el usuario.
- Facilita pruebas de consistencia y visualización de datos.
- Necesaria para validar transiciones de estado y reglas de negocio.

**Dependencias**

- Autenticación y Roles (EPIC-03).

---

### 9.4. Listar Solicitudes de Compra

**Descripción**  
Muestra un listado básico de las solicitudes creadas por el usuario (en el MVP, solo las propias).

**Justificación**

- Aporta valor operativo inmediato.
- Permite validar filtros simples (por estado o fecha).
- Muy útil para pruebas de regresión.

**Dependencias**

- Autenticación y Roles (EPIC-03).

## 10. Historias de Usuario asociadas

### US-01 | PR-Flow | GSC | Crear una solicitud de compra

**Descripción (Cómo, Quiero, Para)**  
Cómo: Usuario Solicitante  
Quiero: Crear una solicitud de compra  
Para: Registrar una necesidad de material o servicio.

**Criterio de aceptación (escenario principal V1)**  
Given el usuario está autenticado  
And accede al formulario de creación  
When completa los campos obligatorios con datos válidos  
Then la solicitud se registra correctamente  
And se asigna el estado inicial `Creada`.

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `GestionDeSolicitudesDeCompra`, `CrearSolicitudDeCompra`

---

### US-02 | PR-Flow | GSC | Modificar una solicitud de compra

**Descripción (Cómo, Quiero, Para)**  
Cómo: Usuario Solicitante 
Quiero: Modificar una solicitud de compra 
Para: Actualizar la información registrada

**Criterio de aceptación (escenario principal V1)**
Given Existe una solicitud en estado "Creada" 
And El usuario tiene permisos 
When Modifica los datos permitidos 
Then Los cambios se guardan correctamente

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `GestionDeSolicitudesDeCompra`, `ModificarSolicitudDeCompra`

---

### US-03 | PR-Flow | GSC | Visualizar una solicitud de compra

**Descripción (Cómo, Quiero, Para)** 
Cómo: Usuario 
Quiero: Visualizar una solicitud de compra 
Para: Consultar su información y estado

**Criterio de aceptación (escenario principal V1)**
Given Existe una solicitud registrada 
When El usuario accede al detalle 
Then El sistema muestra toda la información asociada

**Metadatos**
- Prioridad: Alta    
- Labels: `PRFlow`, `GestionDeSolicitudesDeCompra`, `VisualizarSolicitudDeCompra`

---

### US-04 | PR-Flow | GSC | Listar solicitudes propias de compra

**Descripción (Cómo, Quiero, Para)** 
Cómo: Usuario
Quiero: Listar solicitudes propias de compra 
Para: Tener una visión general de las solicitudes registradas

**Criterio de aceptación (escenario principal V1)**
Given El usuario está autenticado 
When Accede al listado de solicitudes 
Then El sistema muestra las solicitudes propias disponibles

**Metadatos** 
- Prioridad: Alta    
- Labels: `PRFlow`, `GestionDeSolicitudesDeCompra`, `ListarSolicitudesDeCompra`