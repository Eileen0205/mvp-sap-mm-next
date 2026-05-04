# EPIC-03 | Gestión de Usuarios y Seguridad

## 1. Descripción

Esta épica agrupa las funcionalidades necesarias para proteger el acceso y uso del sistema, garantizando que únicamente usuarios autenticados y autorizados puedan operar sobre las funcionalidades disponibles.

Incluye una gestión simplificada de usuarios, autenticación básica y control de acceso por roles, suficiente para cubrir los requerimientos de seguridad del MVP

## 2. Objetivo

Establecer los principios fundamentales de seguridad, control de acceso y trazabilidad, alineándose con las buenas prácticas habituales en entornos SAP, donde cada acción relevante está asociada a un usuario autenticado, activo y autorizado.

## 3. Alcance funcional (Scope)

Incluye:

- Alta básica de usuarios.
- Consulta básica de usuarios registrados.
- Inicio de sesión de usuarios.
- Control de acceso por rol a las funcionalidades del sistema.
- Restricción de acceso a funcionalidades basada en sesión activa/inactiva.

Excluye, para mantener el MVP enfocado:

- Recuperación de contraseña.
- Autenticación multifactor (MFA).
- Gestión avanzada de sesiones.
- Auditoría detallada de seguridad.

## 4. Relación con otras épicas

Esta épica complementa directamente:

- **EPIC-01 | Gestión de Solicitudes de Compra (Core Funcional)**  
  Proveyendo autenticación y roles para controlar quién puede crear, modificar, visualizar y listar solicitudes.

- **EPIC-02 | Gestión del Ciclo de Vida de las Solicitudes (Estados)**  
  Proveyendo el concepto de “Usuario Autorizado” para cambios de estado y restricciones según rol.

## 5. DoR (Definition of Ready)

Esta épica hereda el DoR global del MVP.  
Cada Historia de Usuario asociada debe cumplir:

- Las reglas de negocio asociadas a usuarios, autenticación y roles están claramente definidas.
- Los criterios de aceptación cubren accesos permitidos y denegados.
- Se han identificado escenarios negativos (credenciales inválidas, usuario inactivo, rol sin permisos, etc.).
- Las dependencias con otras épicas (por ejemplo, EPIC-01 y EPIC-02) están indicadas cuando corresponda.
- El alcance se limita a la seguridad básica definida para el MVP.

Si alguno de estos puntos no se cumple, la historia permanece en **Refinamiento**.

## 6. DoD (Definition of Done)

Una Historia de Usuario de esta épica se considera **Done** cuando:

- El sistema permite autenticación básica de usuarios.
- Los roles definidos están correctamente asignados y utilizados en el control de acceso.
- El acceso a funcionalidades está restringido según el rol del usuario.
- Se valida que un usuario no pueda ejecutar acciones no autorizadas.
- La gestión de sesión garantiza acceso únicamente a usuarios autenticados con sesión activa.
- Los criterios de aceptación contemplan escenarios de acceso permitido y denegado.
- Existen escenarios funcionales que validan el control de acceso.
- No se implementan reglas de seguridad fuera del alcance del MVP.
- No existen defectos funcionales críticos abiertos relacionados con seguridad o acceso.

## 7. Módulos incluidos en la épica

### 7.1. Autenticación y Roles

**Objetivo**  
Controlar el acceso al sistema y la segregación de funciones mediante autenticación básica y asignación de roles.

**Relación con otras épicas**

- Complementa:
  - EPIC-01 (determinando quién puede operar sobre solicitudes).
  - EPIC-02 (determinando quién puede cambiar estados).

**Roles definidos en el MVP**

- **Solicitante**  
  - Usuario de negocio responsable de crear y gestionar solicitudes de compra.
  - El Solicitante solo puede gestionar solicitudes propias.

- **Aprobador**  
 - Usuario de negocio encargado de aprobar o rechazar solicitudes.
 - El Aprobador solo puede visualizar y gestionar solicitudes de los **Centros asignados** a su usuario.
 - El Aprobador solo puede visualizar solicitudes en estado "En Revisión", "Aprobada" o "Rechazada". No puede visualizar solicitudes en estado "Creada".
 
- **Administrador Técnico/Funcional**  
  - Usuario de soporte, responsable de la gestión básica de usuarios y roles (no participa directamente en el flujo de compras).

**Usuarios principales del módulo**

- Este módulo es gestionado exclusivamente por el rol **Administrador Técnico/Funcional**.
- Los roles **Solicitante** y **Aprobador** no interactúan con las funcionalidades de gestión de usuarios, en línea con buenas prácticas de segregación de funciones.

**Reglas de negocio clave**

- Existen tres roles predefinidos: "Solicitante", "Aprobador", "Administrador Técnico/Funcional".
- La autenticación valida la identidad del usuario (credenciales).
- La autorización valida los permisos del usuario en función de su rol.
- Todas las operaciones deben pasar ambas validaciones (autenticación + autorización).
- Cada rol tiene permisos específicos sobre las funcionalidades:
  - El cambio de estado Creada → En Revisión puede realizarlo un usuario con rol "Solicitante";
  - La aprobación/rechazo está a cargo de un usuario con rol "Aprobador".
- Se requiere sesión activa para realizar cualquier operación en el sistema.
- Los accesos a funcionalidades deben ser evaluados siempre en función del rol y estado de la sesión.
- Todas las validaciones de acceso deben ejecutarse en backend, no solo en frontend.

**Justificación para el MVP**

- Proporciona la seguridad básica del sistema.
- Permite probar escenarios claros de acceso permitido y denegado.
- Es fundamental para mostrar buenas prácticas de QA y control de acceso en un contexto cercano a SAP.

**Posibles funcionalidades críticas / básicas**

- Inicio de sesión de usuario.
- Control de acceso por rol.
- Restricción de acceso a funcionalidades basada en sesión activa.

### 7.2. Gestión de Usuarios (Simplificado)

**Objetivo**  
Gestionar de forma básica los usuarios que interactúan con el sistema, manteniendo información mínima pero válida.

**Principal problema que resuelve**  
Permite mantener datos coherentes de los usuarios (identificación y contacto), garantizando integridad y trazabilidad.

**Usuarios principales del módulo**

- Módulo gestionado exclusivamente por el rol **Administrador Técnico/Funcional**.
- Los roles Solicitante y Aprobador no tienen acceso a la gestión de usuarios.

**Reglas de negocio clave**

- Nombre y correo electrónico son obligatorios.
- Se valida el formato de los datos (ej. correo electrónico válido).
- No se permiten usuarios duplicados (mismo identificador/correo, según definas).

**Justificación para el MVP**

- Es necesario para habilitar la autenticación.
- Ofrece escenarios claros de validación (obligatorios, formato, duplicidad).
- Es fácilmente testeable desde QA (funcional y negativo).

**Posibles funcionalidades críticas / básicas**

- Alta de usuario.
- Consulta de usuarios.
- Edición básica de datos de usuario (nombre, rol).

### 7.3 Reglas de Seguridad del Sistema

- Todas las operaciones requieren:
  - Usuario autenticado
  - Usuario en estado ACTIVO
  - Sesión activa válida

- El control de acceso se basa en:
  - Rol del usuario (RBAC)
  - Ámbito organizacional (Centros asignados)

- El sistema debe prevenir:
  - Acceso a recursos de otros usuarios sin autorización
  - Escalada de privilegios
  - Manipulación directa de requests (API bypass)

- Las validaciones de seguridad deben ejecutarse en backend.


## 8. Funcionalidades seleccionadas (Features)

### 8.1. Inicio de Sesión

**Descripción**  
Permite el acceso al sistema mediante credenciales básicas de usuario.

**Justificación**

- Requisito mínimo de seguridad.
- Facilita pruebas de autenticación y validación de credenciales.
- Indispensable para cualquier sistema empresarial.

**Dependencias**

- Gestión de Usuarios (Simplificado).

### 8.2. Control de Acceso por Rol

**Descripción**  
Define qué acciones puede realizar cada tipo de usuario según su rol.

**Justificación**

- Refuerza la lógica de negocio y las restricciones definidas en EPIC-01 y EPIC-02.
- Permite pruebas de autorización (QA).
- Alineado con roles típicos en entornos SAP (Solicitante / Aprobador / Admin).

**Dependencias**

- Inicio de Sesión.

### 8.3. Restricción de Acceso a Funcionalidades

**Descripción**  
Bloquea la ejecución de acciones no autorizadas según rol y contexto del usuario.

**Justificación**

- Genera escenarios negativos claros y fácilmente testeables.
- Muy valorado desde QA funcional (comportamiento esperado ante falta de permisos).

**Dependencias**

- Control de Acceso por Rol.

### 8.4. Alta de Usuario

**Descripción**  
Registro básico de nuevos usuarios del sistema.

**Justificación**

- Necesario para habilitar la autenticación.
- Genera reglas claras de validación (campos obligatorios, formato, duplicados).
- Muy útil para pruebas positivas y negativas.

**Dependencias**

- Ninguna (módulo base de usuarios).

### 8.5. Consulta de Usuarios

**Descripción**  
Permite visualizar los usuarios registrados en el sistema.

**Justificación**

- Aporta trazabilidad sobre quién tiene acceso.
- Útil para validaciones y pruebas funcionales.

**Dependencias**

- Alta de Usuario.

### 8.6. Edición Básica de Usuario

**Descripción**  
Permite modificar datos simples de un usuario, como nombre o rol.

**Justificación**

- Introduce validaciones adicionales (integridad de datos).
- Permite pruebas sobre actualización y consistencia de información.

**Dependencias**

- Consulta de Usuarios.

## 9. Historias de Usuario asociadas

### US-08 | PR-Flow | AR | Iniciar sesión en el sistema

**Módulo**  
Autenticación y Roles

**Descripción (Cómo, Quiero, Para)**  
Cómo: Usuario  
Quiero: Iniciar sesión en el sistema  
Para: Acceder a las funcionalidades disponibles.

**Criterio de aceptación (escenario principal)**  
Given el usuario está en la pantalla de login  
When ingresa credenciales válidas  
Then el sistema permite el acceso.

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `AutenticacionYRoles`, `InicioDeSesion`

### US-09 | PR-Flow | AR | Controlar el acceso por rol

**Módulo**  
Autenticación y Roles

**Descripción (Cómo, Quiero, Para)**  
Cómo: Sistema  
Quiero: Controlar el acceso por rol  
Para: Restringir funcionalidades según permisos.

**Criterio de aceptación (escenario principal)**  
Given el usuario ha iniciado sesión  
When accede a una funcionalidad  
Then el sistema permite o bloquea el acceso según su rol.

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `AutenticacionYRoles`, `ControlDeAccesoPorRol`

### US-10 | PR-Flow | USER | Dar de alta un usuario

**Módulo**  
Gestión de Usuarios (Simplificado)

**Descripción (Cómo, Quiero, Para)**  
Cómo: Administrador Técnico–Funcional  
Quiero: Dar de alta un usuario  
Para: Permitir el acceso al sistema.

**Criterio de aceptación (escenario principal)**  
Given el administrador accede al formulario de alta de usuario  
And completa los datos obligatorios  
When guarda el registro  
Then el usuario se crea correctamente.

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `UsuariosSimplificado`, `AltaDeUsuario`

### US-11 | PR-Flow | USER | Consultar usuarios registrados

**Módulo**  
Gestión de Usuarios (Simplificado)

**Descripción (Cómo, Quiero, Para)**  
Cómo: Administrador Técnico–Funcional  
Quiero: Consultar usuarios registrados  
Para: Visualizar los usuarios del sistema.

**Criterio de aceptación (escenario principal)**  
Given existen usuarios registrados  
When el administrador accede al listado de usuarios  
Then el sistema muestra los usuarios disponibles.

**Metadatos**  
- Prioridad: Media  
- Labels: `PRFlow`, `UsuariosSimplificado`, `ConsultaDeUsuarios`