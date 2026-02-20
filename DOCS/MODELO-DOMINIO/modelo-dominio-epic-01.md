# Introducción

En este documento se describe el **Modelo de Dominio** del módulo Gestión de Solicitudes de Compra, correspondiente a la **EPIC-01**. Tiene como objetivo representar los conceptos clave del negocio, sus relaciones y reglas fundamentales, sirviendo como base común para análisis funcional, QA, desarrollo (Guiado por IA) y diseño.

# Objetivo

- Definir las entidades principales involucradas en el proceso de solicitud de compra.
- Establecer las relaciones entre dichas entidades.
- Identificar las reglas de negocio que gobiernan el comportamiento del dominio.
- Asegurar coherencia entre User Stories, Reglas de Negocio y Ciclo de Vida de la solicitud.

# Alcance

- Este modelo cubre:

  - Creación y modificación de solicitudes de compra.
  - Roles funcionales involucrados (Solicitante, Aprobador).
  - Estados y transiciones de la solicitud.

- Quedan fuera del alcance:

  - Detalles técnicos de implementación.
  - Persistencia de datos y diseño de base de datos.
  - Interfaces de usuario y aspectos visuales.

# Entidades del Dominio

## Solicitud de Compra

Representa la necesidad formal de un usuario de adquirir un material o servicio.

### Atributos principales:

- Identificador de solicitud
- Tipo de solicitud (Material o Servicio)
- Descripción
- Cantidad
- Unidad de Medida
- Fecha de creación
- Fecha de entrega
- Estado de la solicitud
- Centro
- Almacén

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

- Solicitante
  - **Responsabilidades:**
    - Origina y gestiona la solicitud de compra.
    - Crea solicitudes de compra.
    - Modificas solicitudes solo en estado **"Creada"**.
    - Visualiza solicitudes propias.
    - Lista solicitudes propias.
    - Envia solicitud **"A Revisión"**. 

  - **Restricciones:**
    - No aprueba solicitudes
    - No modifica solicitudes en estados finales
    - No gestiona usuarios

- Aprobador
   - **Responsabilidades:**
    - Decide sobre la solicitud.
    - Visualiza únicamente las solicitudes dentro de su ámbito de aprobación. Esto incluye solicitudes en estado **"En Revisión"**,**"Aprobada"** o **"Rechazada"**.
    - No puede visualizar solicitudes en estado **"Creada"**.
    - Solo puede visualizar y gestionar solicitudes de los **Centros asignados** a su usuario.
    - Cambiar el estado de la solicitud:
        - En Revisión → Aprobada
        - En Revisión → Rechazada
    
   - **Restricciones:**
    - No crea solicitudes.
    - No modifica datos de la solicitud.
    - No gestiona usuarios.

- Administrador Técnico / Funcional (ATF)
  - Soporte básico al sistema, no forma parte del proceso de compra.
  - **Responsabilidades:**
    - Alta de usuarios.
    - Asignación de roles.
    - Activar / desactivar usuarios.

  - **Restricciones:** No participa del flujo de solicitud
   - No crea solicitudes .
   - No aprueba.
   - No modifica.
   - No gestiona catálogo de Centros y Almacenes.

## Centro

- Entidad organizacional a la cual se imputa la solicitud de compra.
- Dato Maestro del Sistema

### Atributos principales:

- Identificador de centro
- Nombre

## Almacén

- Ubicación asociada a la gestión de materiales.
- Dato Maestro del Sistema dependiente de Centro

### Atributos principales:

- Identificador de almacén
- Nombre

## Material

- Representa un bien físico que puede ser solicitado.
- Requiere un Almacén
- Dato Maestro del Sistema

### Atributos principales:

- Identificador de material
- Descripción

## Servicio

- Representa un servicio que puede ser solicitado.
- Dato Maestro del Sistema

### Atributos principales:

- Identificador de servicio
- Descripción

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
- No se permiten solicitudes duplicadas para la misma combinación de:
  - Material o Servicio
  - Centro
  - Fecha de entrega
- Solo se permite la modificación de los atributos:
    - Descripción
    - Cantidad
    - Fecha de entrega
    - Unidad de Medida (UM)
- El tipo de solicitud, centro y almacén no pueden modificarse una vez creada la solicitud.

# Ciclo de Vida de la Solicitud de Compra

La Solicitud de Compra sigue un ciclo de vida controlado por su estado:

- Creada → editable solo por el Solicitante.
- En Revisión → no editable; decisión del Aprobador.
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
- Diagrama de Estados de Solicitud de Compra