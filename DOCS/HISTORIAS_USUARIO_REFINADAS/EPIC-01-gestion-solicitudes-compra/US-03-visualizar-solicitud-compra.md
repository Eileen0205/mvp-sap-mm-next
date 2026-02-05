## 1. Descripción (Cómo, Quiero, Para)

- **Cómo**: Usuario  
- **Quiero**: Visualizar una solicitud de compra  
- **Para**: Consultar su información y estado  

## 2. DoR (Definition of Ready)

Esta historia debe cumplir el DoR definido para el MVP y la **EPIC-01**. No se considera lista hasta que:

- Están definidas las reglas de visibilidad por rol y usuario.
- Están identificados los estados posibles de la solicitud (`Creada`, `En Revisión`, `Aprobada`, `Rechazada`).
- Se han definido los campos mínimos que debe mostrar la pantalla de detalle.

## 3. Reglas de negocio

- **RN01**: Para visualizar una solicitud el usuario requiere una sesión activa en el sistema.

- **RN02**: Solo los usuarios con rol Solicitante, Aprobador o Administrador Técnico/Funcional pueden visualizar solicitudes de compra.

- **RN03**: El usuario con rol Solicitante solo puede visualizar solicitudes propias.

- **RN04**: El usuario con rol Aprobador puede visualizar las solicitudes que estén dentro de su ámbito de aprobación, al menos aquellas en estado En Revisión que deba gestionar.

- **RN05**: El usuario con rol Administrador Técnico/Funcional puede visualizar cualquier solicitud de compra con fines de soporte, siempre en modo solo lectura.

- **RN06**: El detalle de la solicitud debe mostrar, como mínimo: ID, tipo, descripción, cantidad, centro, almacén, fecha requerida, estado actual y usuario solicitante.

- **RN07**: El estado mostrado debe corresponder fielmente al estado real de la solicitud en el sistema.

- **RN08**: La funcionalidad de visualización es de solo lectura. No permite modificar datos ni ejecutar acciones que cambien el estado.

- **RN09**: El sistema debe bloquear el acceso y mostrar un mensaje de error funcional si un usuario intenta acceder a una solicitud para la que no tiene permisos.

- **RN10**: El sistema debe gestionar de forma controlada los intentos de acceso a solicitudes con identificadores inexistentes o con formato inválido, mostrando un mensaje claro (ej. "Solicitud no encontrada") sin exponer errores técnicos.

## 4. Criterios de Aceptación y Escenarios (Gherkin)

> Nota: el escenario `@sesion_inactiva` redefine el contexto de autenticación/estado fuera del `Background` para cubrir un caso negativo.

```gherkin

Feature: Visualizar una solicitud de compra

Background:
     Given el usuario está autenticado en el sistema
     And el usuario está marcado como "Activo"

        @US-03 @happy @critico
            Scenario: Visualización correcta de una solicitud propia (Solicitante)
            Given el usuario tiene rol "Solicitante"
            And tiene permisos para visualizar solicitudes
            And existe una solicitud propia del usuario
            When accede al detalle de esa solicitud
            Then el sistema muestra la información principal de la solicitud
            And muestra el estado actual de la solicitud
            And no permite acciones de edición desde esta pantalla en el contexto de esta historia

        @US-03 @negative @solicitud_no_propia
            Scenario: Intento de acceso a solicitud de otro usuario (Solicitante)
            Given existe una solicitud creada por otro usuario
            When el usuario intenta acceder al detalle de esa solicitud
            Then el sistema bloquea el acceso al detalle
            And muestra un mensaje indicando que no tiene permisos para visualizar esa solicitud

        @US-03 @happy @aprobador
            Scenario: Visualización por Aprobador
            Given existe una solicitud en estado "En Revisión" asignada a su ámbito de aprobación
            When accede al detalle de esa solicitud
            Then el sistema muestra toda la información necesaria para tomar decisión
            And muestra claramente el estado actual "En Revisión"

        @US-03 @negative @sesion_inactiva
            Scenario: Usuario sin sesión activa
            Given el usuario no tiene sesión activa
            When intenta acceder al detalle de una solicitud (por URL o navegación)
            Then el sistema redirige a la pantalla de login o muestra un mensaje de sesión caducada

```
## 5. Consideraciones de QA

Verificar que:

- Se respete la visibilidad por rol y usuario (solicitudes propias vs ajenas).
- El detalle muestre todos los campos definidos como mínimos, sin inconsistencias.
- No se pueda editar ni cambiar estados desde esta funcionalidad si no está contemplado en la US.

**Casos negativos:**

- Solicitud inexistente (ID no válido) → manejar error de forma controlada.
- ID manipulado en la URL para acceder a otra solicitud.
- Sesión expirada en medio de la navegación (refrescar, volver a acceder).

**Casos de borde:**

- Solicitud recién creada (estado `Creada`).
- Solicitud en `En Revisión`.
- Solicitud en estado final `Aprobada` o `Rechazada` (solo lectura).

**Comprobaciones de consistencia:**

- El estado mostrado en pantalla coincide con el estado en el sistema.
- Los datos del solicitante que se muestran son coherentes con los datos de usuarios definidos en EP-03.

## 6. DoD (Definition of Done)

- La historia cumple el DoD global del MVP y el DoD específico de la EPIC-01.
- Todos los escenarios de aceptación (felices y negativos) han sido ejecutados sin defectos críticos abiertos.

## 7. Dependencias

**Épicas:**

- EP-01 – Gestión de Solicitudes de Compra (Core Funcional).
- EP-02 – Gestión del Ciclo de Vida de las Solicitudes (Estados).
- EP-03 – Gestión de Usuarios y Seguridad.

**Módulos:**

- Gestión de Solicitudes de Compra (detalle).
- Autenticación y Roles.
- Gestión de Usuarios (para mostrar datos del solicitante, si aplica).

**Funcionalidades:**

- Crear Solicitud de Compra (la solicitud debe existir).
- Asignación de Estado Inicial (para mostrar estado `Creada`).
- Cambio de Estado (para visualizar estados distintos según el ciclo de vida).
- Inicio de Sesión.
- Control de Acceso por Rol.

## 8. Metadatos
- **Prioridad**: Alta
- **Labels**: `PRFlow`, `GestionDeSolicitudesDeCompra`, `VisualizarSolicitudDeCompra`