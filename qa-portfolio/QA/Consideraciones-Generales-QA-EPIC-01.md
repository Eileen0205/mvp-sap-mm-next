# CONSIDERACIONES GENERALES QA EPIC-01

## Objetivo

Definir un conjunto de criterios y lineamientos de calidad funcional y no funcional básica que sirvan como referencia común para todas las Historias de Usuario pertenecientes a la **EPIC-01: Gestión de Solicitudes de Compra**, con el fin de:
    
* Garantizar consistencia en la validación de reglas de negocio.
* Reducir ambigüedades antes del desarrollo (Shift-Left).
* Facilitar la generación de casos de prueba efectivos.
* Guiar el desarrollo asistido por IA (IA Dev) bajo criterios claros de calidad.
* Evitar defectos funcionales críticos en etapas posteriores.

Este documento actúa como marco transversal de calidad, no como sustituto de las reglas específicas de cada US.
   
## Alcance
   
Estas consideraciones aplican a:
   
 * US-01: Crear Solicitud de Compra
 * US-02: Modificar Solicitud de Compra
 * US-03: Visualizar Solicitudes de Compra
 * US-04: Listar Solicitudes de Compra
   
### Incluye:
   
* Validaciones funcionales comunes.
* Comportamientos esperados del sistema ante errores.
* Lineamientos básicos de UX y usabilidad.
* Criterios mínimos y básicos de performance.
* Principios de integridad y consistencia de datos.
   
### No reemplaza:
   
* Criterios de aceptación específicos.
* Reglas de negocio particulares de una US.
* Definiciones técnicas de implementación.

## Enfoque MVP

- Solo se implementa lo estrictamente necesario para validar el flujo principal.
- Cualquier funcionalidad no explicitada se considera fuera de alcance.

## Consideraciones

**Integridad de la Transacción (Validaciones Backend)**

- Validación Backend: Todas las reglas de negocio deben validarse en el Backend, independientemente de la UI.
- Atomicidad: Las operaciones de creación/modificación deben ejecutarse como una transacción atómica (todo o nada).
- Rollback: Ante cualquier fallo, la operación debe ser completamente revertida (todo o nada).
- Idempotencia / duplicidad: El backend debe evitar la creación de registros duplicados ante reintentos (ej. fallos de red, concurrencia).

**Definición de Datos y Formatos (Casos de Borde)**

- **Cantidad:**

  - El sistema debe rechazar valores <= 0.
  - Formato numérico decimal validado mediante Regex ^\d{1,10}(\.\d{1,3})?$
  - Soporta hasta 10 enteros y 3 decimales.
  - Bloqueo total de caracteres alfabéticos o especiales.

- **Fecha de Entrega:**

  - El formato para la fecha debe ser:
    - Formato de entrada en UI: DD/MM/YYYY.
    - Formato de persistencia y comunicación API: ISO 8601 (YYYY-MM-DD)
  - Hoy: Es un valor válido (se toma como fecha límite el cierre del día del sistema). 
  - Pasado: Cualquier fecha (ej. Ayer) debe ser rechazada. 
  - Las validaciones de fecha deben realizarse siempre tomando como referencia la hora del servidor.
  - Validar tanto formato como lógica de fecha.

- **Descripción:**

  - Longitud entre [10 - 40] caracteres.
  - El campo es obligatorio
  - El sistema debe mostrar un contador de caracteres restante (ej: 15/40) para guiar al usuario.

**Lógica de Duplicidad**

- Para que el sistema considere una solicitud como duplicada, debe existir una coincidencia exacta en la tríada: 
   - ItemComprable + Centro + Fecha de Entrega
   - Solicitudes activas en estados distinto de "Rechazada".
- Una solicitud en estado "Rechazada" no bloquea la creación de una nueva solicitud con la misma combinación de datos

**Comportamiento de la Interfaz (UI/UX)** 

- Las validaciones de obligatoriedad y formato deben ejecutarse preferiblemente on-blur (al salir del campo) para guiar al usuario antes de presionar "Guardar".
- Los estados definidos en el MVP deben mostrarse con un estilo visual (tag/badge) consistente en toda la aplicación.
  - Creada (GRIS/AZUL)
  - En Revisión (NARANJA/AMARILLO)
  - Aprobada (VERDE)
  - Rechazada (ROJO)
    * Forma y Fuente: Todos los estados deben tener el mismo redondeo de esquinas, el mismo tamaño de letra y el mismo espacio interno (padding).
    * Iconografía: Si se usa un icono para estados, debe ser el mismo en todo el sistema.
- Visibilidad Dinámica del Almacén (Dependencia de Tipo)**
    - El campo "Almacén" solo tiene sentido funcional para ítems de tipo **Material**.
    - Formularios (Creación/Modificación/Detalle): Si el ítem es un "Servicio", el campo Almacén debe ocultarse por completo de la interfaz para evitar ruido visual.
    - Listados (Tablas):La columna Almacén debe ser estática por estructura de datos, pero para servicios el valor debe mostrarse **vacío o con un guion ("-")**.
- Deshabilitación de botones de acción y estados: 
    - Los botones que sean deshabilitados en el sistema porque no se cumple una regla para continuar con la funcionalidad deben cambiar a un color "Gris" para que el usuario no realice clics innecesarios.
    - Los botones de estados deben ser visibles teniendo en cuenta los permisos por Rol y estado.

**Gestión de Errores**

Ante un error inesperado o pérdida de conexión:
- Los mensajes deben indicar claramente el campo afectado (Ej: "La fecha de entrega no puede ser anterior a hoy"). 
- Los datos ingresados deben mantenerse en la interfaz (cliente) para permitir reintentos, sin persistirse en backend.

**Seguridad y Acceso**

- Las acciones deben respetar:

    - Autenticación
    - Rol
    - Estado del usuario
    - Autorizaciones por centro

- Las restricciones deben validarse tanto:

    - A nivel de interfaz
    - Como en la lógica de negocio.

- Cualquier cambio de estado de usuario a 'Inactivo' debe invalidar inmediatamente su sesión activa y bloquear cualquier intento de persistencia en curso.

**Fallos de Sistema (fallos inesperados de infraestructura o conectividad)**

- Ante un error inesperado o pérdida de conexión, los datos ingresados deben persistir en los campos para permitir que el usuario reintente el guardado una vez restablecido el servicio.
- En caso de error técnico, se debe evitar el uso de logs técnicos en la interfaz, se deben mostrar mensajes amigables, claros y concisos. 

**Requerimientos No Funcionales (comportamiento esperado del sistema bajo condiciones normales Performance (Rendimiento))**

- Tiempo de Respuesta: Tras pulsar "Guardar", "Visualizar", "Ver Detalle","Listar Solicitudes" la respuesta del sistema (ya sea éxito o error) debe producirse en un tiempo razonable. 
- La asignación del estado y la respuesta del sistema deben ocurrir en un tiempo razonable.
- Métrica: El tiempo objetivo es menor a 2 segundos bajo condiciones normales de red y carga.

**Feedback del usuario**

- Los mensajes de error de validación (ej. fecha inválida) deben aparecer junto al campo que contiene el error.
- Mientras se crea o se guarda la modificación de una solicitud, el sistema deberá mostrar un indicador de carga (ej.un spinner) para informar al usuario que la operación está en proceso.
- Tras una guardado exitoso, se debe mostrar un mensaje de confirmación de éxito.
- En el listado de solicitudes, se debe verificar que si una descripción es muy larga, se trunque correctamente, para no romper el diseño de la tabla, pero que sea legible al 100% en el Detalle.
 