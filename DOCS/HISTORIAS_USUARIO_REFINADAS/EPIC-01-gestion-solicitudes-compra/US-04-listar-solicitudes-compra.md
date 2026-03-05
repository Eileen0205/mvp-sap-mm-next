# US-04 | PR-Flow | GSC | Listar solicitudes de compra

## 1. Descripción (Cómo, Quiero, Para)
 
 **Cómo**: Usuario
 **Quiero**: Listar solicitudes de compras
 **Para**: Tener una visión general de las solicitudes registradas
    
## 2. DoR (Definition of Ready)

- Esta historia debe cumplir el DoR definido para el MVP y la **EPIC-01**. No se considera lista hasta que:
    - Estén definidas las reglas de visibilidad por rol (Solicitante/Aprobador/Administrador Técnico/Funcional).
    - Esté definido el conjunto mínimo de columnas del listado.

## 3. Reglas de negocio
- **RN01**: El acceso al listado de solicitudes de compra requiere que el usuario se encuentre autenticado y activo en el sistema.
- **RN02**: Solo los usuarios con rol Solicitante, Aprobador o Administrador Técnico/Funcional pueden acceder al lista de solicitudes.
- **RN03**: El usuario con rol Solicitante solo puede ver en el listado las solicitudes que haya creado él mismo.
- **RN04**: El usuario con rol Aprobador debe ver las solicitudes que se encuentren dentro de su ámbito según se define en EPIC-03.
- **RN05**: El usuario con rol Administrador Técnico/Funcional puede listar todas las solicitudes de compra con fines supervisión y soporte, siempre en modo solo lectura desde esta historia.
- **RN06**: Cada fila del listado debe mostrar al menos: identificador de la solicitud, descripción, fecha de creación, estado actual, centro, almacén y usuario solicitante. 
  - Para ítems de tipo "Material": Se muestra el ID del almacén.
  - Para ítems de tipo "Servicio": La celda de almacén se muestra vacía o con un guion ("-").
- **RN07**: El listado de solicitudes debe ordenarse por defecto por fecha de creación en orden descendente (las solicitudes más recientes primero).
- **RN08**: Desde el listado el usuario debe poder acceder al detalle de una solicitud específica mediante una acción (por ejemplo, clic sobre la fila o un enlace), aplicándose las reglas de visibilidad definidas en la US-03.
- **RN09**: Si no existen solicitudes que cumplan los criterios para el usuario (por ejemplo, un Solicitante sin solicitudes propias), el sistema debe mostrar un listado vacío acompañado de un mensaje que indique que no hay solicitudes disponibles.
-  **RN10**: Si un usuario autenticado intenta acceder al listado y su rol no tiene permisos para esta funcionalidad, el sistema debe bloquear el acceso y mostrar un mensaje de falta de autorización.
- **RN11**: El estado mostrado en cada fila del listado debe corresponder exactamente al estado actual de la solicitud según el modelo de estados definido en la épica de ciclo de vida.

## 3. Escenarios y Criterios de Aceptación

```gherkin

Feature: Listar solicitudes de compra

Background:
Given el usuario se encuentra autenticado
And está "Activo" en el sistema

      @US-04 @happy @solicitante  
      Scenario: Listar solicitudes propias del usuario con rol "Solicitante"
            
            Given el usuario tiene el rol de "Solicitante"
            And existen varias solicitudes propias del usuario 
            And existen solicitudes creadas por otros usuarios  
            When accede al listado de solicitudes  
            Then el sistema muestra únicamente las solicitudes creadas por ese usuario ordenadas descendientemente 
            And para cada solicitud muestra al menos identificador, descripción, estado, fecha de creación, centro y usuario solicitante
            And permite el acceso al detalle de las mismas
            
      @US-04 @happy @aprobador 
      Scenario: Listar solicitudes en el ámbito del usuario con rol "Aprobador"
            
            Given el usuario tiene el rol de "Aprobador"
            And existen solicitudes en diferentes centros asignados a él y en estados bajo su ámbito de aprobación 
            When accede al listado de solicitudes  
            Then el sistema muestra las solicitudes que solamente corresponden a su ámbito ordenadas descendientemente  
            And para cada solicitud muestra al menos identificador, descripción, estado, fecha de creación, centro y usuario solicitante
            And permite el acceso al detalle de las mismas

      @US-04 @happy @administrador_tecnico_funcional 
      Scenario: Listar solicitudes del usuario con rol "Administrador Técnico/Funcional"  

            Given el usuario tiene el rol "Administrador Técnico/Funcional"
            And existen solicitudes en distintos estados, centros, almacenes y de distintos usuarios solicitantes
            When el usuario accede al listado de solicitudes
            Then el sistema muestra todas las solicitudes que existen en el sistema ordenadas descendientemente
            And para cada solicitud muestra al menos identificador, descripción, estado, fecha de creación, centro y usuario solicitante 
            And permite el acceso al detalle de las solicitudes en modo solo lectura
     
      @US-04 @happy @listado_vacío  
      Scenario: Listado vacío para usuario sin solicitudes  
            
            Given el usuario tiene rol "Solicitante"
            And no existen solicitudes creadas por él 
            When accede al listado de solicitudes  
            Then el sistema muestra un listado vacío  
            And muestra un mensaje indicando que no existen solicitudes registradas para ese usuario  
              
      @US-04 @negative @acceso_no_valido
      Scenario Outline: Usuario no puede acceder al listado por condición de sesión o estado inválido
          
            Given el usuario tiene un rol que le permitiría listar solicitudes
            And su condición es "<condicion>"
            When intenta acceder al listado de solicitudes
            Then el sistema bloquea el acceso
            And muestra un mensaje indicando "<mensaje>"
            And no muestra el listado de solicitudes
            
            Examples:
            | condicion          | mensaje                  |
            | No autenticado     | Debe iniciar sesión      |
            | Inactivo           | Usuario inactivo         |
            | Sesión expirada    | Sesión expirada          |
      
       @US-04 @negative @usuario_sin_autorizacion 
       Scenario: Intento de listar solicitudes por usuario con rol sin permisos

          Given el usuario tiene rol "Invitado"
          When intenta acceder al listado de solicitudes
          Then el sistema bloquea el acceso
          And muestra un mensaje notificándole que no tiene permisos para listar solicitudes 
          And no muestra el listado de solicitudes 
```
 ## Consideraciones QA

- El filtrado por rol y ámbito debe validarse en backend, no solo en la interfaz.
- El orden descendente por fecha debe mantenerse consistente tras actualizaciones de estado.
- El acceso al detalle desde el listado debe respetar las reglas definidas en US-03.
- El listado no debe exponer solicitudes fuera del ámbito del usuario.

## DoD (Definition of Done)

- Esta historia debe cumplir el DoD definido para el MVP (ver EPIC-01) y US-01 (Creación)..

Además específicamente para la US:
- El ordenamiento por defecto (fecha descendente) está implementado.
- La funcionalidad permite listar solicitudes según las reglas de visibilidad por rol.
- Confirmación de que el estado mostrado corresponde fielmente al estado en la BD.

## Dependencias

- Épicas:
  - EPIC-01 – Gestión de Solicitudes de Compra (Core Funcional).
  - EPIC-02 – Gestión del Ciclo de Vida de las Solicitudes (para mostrar estados).
  - EPIC-03 – Gestión de Usuarios y Seguridad.

- Funcionalidades:
  - Crear Solicitud de Compra (sin solicitudes no hay resultados).
  - Cambio de Estado (para mostrar solicitudes en diferentes estados, especialmente para Aprobador).
  - Validación de Transiciones (asegura que los estados mostrados sean coherentes).
  - Inicio de Sesión.
  - Control de Acceso por Rol.
  - (Integración) Visualizar Solicitud de Compra (para el enlace al detalle).

## 8. Metadatos
- **Prioridad**: Alta
- **Labels**: `PRFlow`, `GestionDeSolicitudesDeCompra`, `ListarSolicitudDeCompra`