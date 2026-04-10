
# Introducción

En este documento se describe el **Modelo de Dominio** del módulo Gestión de Solicitudes de Compra, correspondiente a la **EPIC-01**. Enfocado en la representación de los conceptos clave del negocio, sus relaciones y reglas fundamentales, sirviendo como base común para análisis funcional, QA, desarrollo (Guiado por IA) y diseño.

# Objetivo

- Definir las entidades principales involucradas en el proceso de solicitud de compra.
- Establecer las relaciones entre dichas entidades.
- Identificar las reglas de negocio que gobiernan el comportamiento del dominio.
- Asegurar coherencia entre User Stories, Reglas de Negocio y Ciclo de Vida de la solicitud.

# Alcance

- Este modelo cubre:

  - Creación y modificación de solicitudes de compra.
  - Visualización y listado de solicitudes.
  - Roles funcionales involucrados (Solicitante, Aprobador, Administradror Técnico/Funcional).
  - Estados y transiciones de la solicitud.
  - Integridad de Datos: Validación de la Tríada de Duplicidad (ItemComprable + Centro + Fecha), de solicitudes en estados distintas de "Rechazada" a nivel de base de datos.
  - Gestión de Catálogos (Seed): Disponibilidad de datos maestros pre-cargados (Materiales, Servicios, Centros, Almacenes, UM).

- Quedan fuera del alcance:

  - Detalles técnicos de implementación.
  - Interfaces de usuario y aspectos visuales.

# Entidades del Dominio

## Solicitud de Compra

Representa la necesidad formal de un usuario de adquirir un material o servicio.

### Atributos principales:

- Identificador de solicitud
- Descripción
- Cantidad
- Unidad de Medida
- Fecha de creación
- Fecha de entrega
- Estado de la solicitud
- ItemComprable (Material o Servicio)
- Centro (Entidad Centro)
- Almacén (Entidad Almacén)
- Id Usuario Solicitante

## ItemComprable (Entidad Abstracta)

   - Material
   - Servicio

## Material

- Representa un bien físico que puede ser solicitado.
- Cuando es solicitado, requiere la asignación de un Almacén en la Solicitud de Compra.
- Dato Maestro del Sistema.

### Atributos principales:

- Identificador de material
- Nombre
- Descripción

## Servicio

- Representa un servicio que puede ser solicitado.
- Dato Maestro del Sistema.

### Atributos principales:

- Identificador de servicio
- Nombre
- Descripción
    
## Usuario

Representa a una persona que interactúa con el sistema.

### Atributos principales:

- Identificador de usuario
- Nombre
- Email
- Estado (Activo / Inactivo)

## Rol

Define las responsabilidades y permisos del usuario dentro del sistema.

### Tipos de rol (MVP):

*   **Solicitante**
    *   **Responsabilidades:**
        *   Originar y gestionar la solicitud de compra propia.
        *   Crear solicitudes de compra.
        *   Modificar solicitudes propias únicamente en estado **"Creada"**.
        *   Visualizar y listar solicitudes propias.
        *   Enviar solicitud a estado **"En Revisión"**.
    *   **Restricciones:**
        *   No puede aprobar solicitudes.
        *   No puede modificar solicitudes en estados finales ("Aprobada", "Rechazada").
        *   No tiene permisos de gestión de usuarios.

*   **Aprobador**
    *   **Responsabilidades:**
        *   Decidir sobre la aprobación o rechazo de solicitudes.
        *   Visualizar únicamente solicitudes dentro de su ámbito de aprobación (estados **"En Revisión"**, **"Aprobada"** o **"Rechazada"**).
        *   Gestionar y visualizar solicitudes exclusivamente de los **Centros asignados** a su perfil.
        *   Ejecutar las transiciones permitidas:
            *   "En Revisión" → "Aprobada"
            *   "En Revisión" → "Rechazada"
    *   **Restricciones:**
        *   No puede crear solicitudes de compra.
        *   No puede visualizar solicitudes en estado **"Creada"**.
        *   No puede modificar los datos maestros de la solicitud (Cantidad, Descripción, etc.).
        *   No tiene permisos de gestión de usuarios.

*   **Administrador Técnico / Funcional (ATF)**
      *   **Responsabilidades:**
        *   Dar de alta y gestionar usuarios en el sistema.
        *   Asignar y modificar roles de usuario.
        *   Activar o desactivar usuarios según sea necesario.
        *   Visualizar cualquier solicitud con fines de soporte (modo solo lectura).
    *   **Restricciones:**
        *   No participa en el flujo de creación de solicitudes.
        *   No tiene permisos para aprobar o rechazar solicitudes.
        *   No gestiona el catálogo de Centros y Almacenes.

## Centro

- Entidad organizacional a la cual se imputa la solicitud de compra.
- Dato Maestro del Sistema

### Atributos principales:

- Identificador de centro
- Nombre

## Almacén

- Ubicación asociada a la gestión de materiales.
- Dato Maestro del Sistema dependiente de Centro.

### Atributos principales:

- Identificador de almacén
- Nombre

## Estado de Solicitud

Representa el estado actual de una solicitud dentro de su ciclo de vida.

### Estados posibles (MVP):

- Creada
- En Revisión
- Aprobada
- Rechazada

# Relaciones entre Entidades

- Un Usuario puede crear una o varias Solicitudes de Compra.
- Cada Solicitud de Compra es creada por un único usuario.
- Un Usuario puede tener uno o varios Roles.
- Un Rol puede asociarse a diferentes usuarios.
- Un Usuario puede estar asignado a uno, ninguno o varios Centros.
- Un centro puede tener asignados varios usuarios.
- Un centro puede tener varias Solicitudes de Compra.
- Una Solicitud de Compra pertenece a un único Centro.
- Una Solicitud de Compra se asocia a uno de los siguientes: Material o Servicio (relación exclusiva).
- Un material o un servicio pueden estar asociadas a varias Solicitudes de Compra.
- Una Solicitud de Compra puede requerir un Almacén cuando el tipo es Material.
- Un Almacén puede estar asociado a múltiples Solicitudes de Compra de tipo Material.
- Cada almacén debe pertenecer a un único centro, y un centro puede contener múltiples almacenes.
- Una Solicitud de Compra puede transicionar entre múltiples Estados a lo largo de su ciclo de vida, manteniendo un único estado activo en cada momento.

# Reglas de Negocio del Dominio

- Solo usuarios activos y autenticados pueden crear o modificar solicitudes.
- Solo usuarios con rol Solicitante pueden crear y modificar solicitudes propias.
- Una solicitud solo puede modificarse mientras esté en estado Creada.
- Solo un usuario con rol Solicitante puede enviar una solicitud de compra de estado Creada a En Revisión.
- Solo usuarios con rol Aprobador pueden cambiar el estado de En Revisión a Aprobada o Rechazada.
- Un usuario solo puede crear, modificar o aprobar solicitudes dentro de los Centros asignados a su perfil.
- No se permiten solicitudes activas duplicadas para la misma combinación de:
  - Material o Servicio
  - Centro
  - Fecha de entrega
  - En estado distinto de Rechazada (Si una solicitud fue rechazada,el usuario debería poder crear una nueva con los mismos datos sin que el sistema lo bloquee).
- Solo se permite la modificación de los atributos:
    - Descripción
    - Cantidad
    - Fecha de entrega
    - Unidad de Medida (UM)
- El tipo de solicitud, centro y almacén no pueden modificarse una vez creada la solicitud.

# Definición de Formatos de Solicitud de Compras
 
 - **Identificador de solicitud:** String, obligatorio, único
    - Convención sugerida: prefijo identificador del tipo (ej: PR-2026-####)
 - **Descripción:** String, obligatorio, 10-40 caracteres
 - **Cantidad:** obligatorio
      * Decimal(13, 3). El sistema debe garantizar la precisión de hasta 3 decimales sin redondeos automáticos no autorizados.
      * Soporta hasta 10 enteros y 3 decimales
      * Mayor que 0
      * No acepta valores no numéricos.
 - **Unidad de Medida:** VarChar, obligatorio (ej: KG, MTR, LB, LT, HR)
 - **Fecha de creación:** ISO 8601, obligatoria
 - **Fecha de entrega:** 
       * Capa de Persistencia (DB): ISO 8601 (YYYY-MM-DDTHH:mm:ssZ). 
       * Capa de Negocio/UI: DD/MM/YYYY.
 - **Id Usuario Solicitante**: UUID / String (Relación obligatoria con entidad Usuario)
 - **Nombre Usuario Solicitante**: String, obligatorio, 10-40 caracteres alfabéticos.
 
> Nota: Los IDs de Usuario, Centro, Almacen, Material y Servicio son Llaves Primarias (PK) inmutables.

# Definición de Formatos de Datos Maestros

## Material

  - **id:** String, obligatorio, único, máx 10 caracteres
    - Convención sugerida: prefijo identificador del tipo (ej: MAT-####)
  - **nombre:** String, obligatorio, máx 100
  - **descripción:** String, opcional, máx 255

## Servicio

  - **id:** String, obligatorio, único, máx 10 caracteres
    - Convención sugerida: prefijo identificador del tipo (ej: SRV-####)
  - **nombre:** String, obligatorio, máx 100
  - **descripción:** String, opcional, máx 255

## Centro

  - **id:** String, 4 caracteres numéricos, obligatorio. (Ej: 1000, 2000, 3000)

## Almacén

  - **id:** String, 3–5 caracteres alfanuméricos, obligatorio si ItemComprable es Material (Ej: ALM1, ALM2)

# Ciclo de Vida de la Solicitud de Compra

La Solicitud de Compra sigue un ciclo de vida controlado por su estado:

- Creada → editable solo por el Solicitante.
- En Revisión → no editable; próxima transición a decisión del Aprobador.
- Aprobada → estado final.
- Rechazada → estado final.

> Las transiciones permitidas y restricciones se describen en el diagrama de estados asociado.

# Suposiciones y Exclusiones del MVP

- **Suposiciones**

  - Catálogos Preexistentes del MVP (No gestionados en esta EPIC)
    - Centros
    - Almacenes
    - Materiales
    - Servicios
    - Asignaciones Usuario–Centro

- **Exclusiones**
  - No se contemplan flujos de cancelación de solicitudes.
  - No existe reapertura de solicitudes rechazadas.
  - No se consideran múltiples aprobadores ni aprobaciones parciales.
  - El modelo no contempla versionado de solicitudes

# Referencias

- EPIC-01 – Gestión de Solicitudes de Compra
- US-01 – Crear Solicitud de Compra
- US-02 – Modificar Solicitud de Compra
- US-03 - Visualizar Solicitud de Compra
- US-04 - Listar Solicitudes de Compra
- Diagrama de Estados de Solicitud de Compra