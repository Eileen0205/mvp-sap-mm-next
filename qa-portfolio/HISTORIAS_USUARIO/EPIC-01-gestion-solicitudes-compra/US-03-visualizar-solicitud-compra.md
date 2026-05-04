# US-03 | PR-Flow | GSC | Visualizar una solicitud de compra

## 1. Descripción (Cómo, Quiero, Para)

- **Cómo**: Usuario  
- **Quiero**: Visualizar una solicitud de compra  
- **Para**: Consultar su información y estado  

## 2. DoR (Definition of Ready)

Esta historia debe cumplir el DoR definido para el MVP y la **EPIC-01**. No se considera lista hasta que:

- Están definidas las reglas de visibilidad por rol y usuario.
- Están identificados los estados posibles de la solicitud ("Creada", "En Revisión", "Aprobada", "Rechazada").
- Se han definido los campos mínimos que debe mostrar la pantalla de detalle.

## 3. Reglas de negocio

- **RN01**: Para visualizar una solicitud el usuario requiere una sesión activa en el sistema.
- **RN02**: Solo los usuarios "Activos" y con rol Solicitante, Aprobador o Administrador Técnico/Funcional pueden visualizar solicitudes de compra.
- **RN03**: El usuario con rol Solicitante solo puede visualizar solicitudes propias.
- **RN04**: El usuario con rol Aprobador puede visualizar únicamente las solicitudes dentro de su ámbito de aprobación (ver definición en EPIC-03) y únicamente cuando la solicitud pertenezca a un Centro asignado a él.
- **RN05**: El usuario con rol Administrador Técnico/Funcional puede visualizar cualquier solicitud de compra con fines de soporte, siempre en modo solo lectura.
- **RN06**: El detalle de la solicitud debe mostrar, como mínimo: ID de solicitud, ItemComprableID, descripción, cantidad, centro, almacén (si aplica), fecha de entrega, estado actual y usuario solicitante.
- **RN07**: El estado mostrado debe corresponder fielmente al estado real de la solicitud en el sistema.
- **RN08**: La funcionalidad de visualización es de solo lectura respecto a los atributos de la solicitud. Desde esta pantalla no se permite la edición directa de campos.
- **RN09**: Desde la pantalla de visualización el acceso a la funcionalidad de "Modificar Solicitud", así como a las acciones disponibles (Enviar a Revisión, Aprobar, Rechazar) dependerán del rol del usuario y del estado actual de la solicitud. 
- **RN10**: Una solicitud recién creada y que se mantenga en el estado inicial, debe permitir al usuario con rol "Solicitante" acceder desde esta pantalla a la función "Modificar Solicitud" y editar campos según reglas de US-02. 
- **RN11**: El sistema debe bloquear el acceso y mostrar un mensaje de error funcional si un usuario intenta acceder a una solicitud para la que no tiene permisos.
- **RN12**: El sistema debe gestionar de forma controlada los intentos de acceso a solicitudes con identificadores inexistentes o con formato inválido, mostrando un mensaje claro (ej.: "Solicitud no encontrada") sin exponer errores técnicos.

## 4. Criterios de Aceptación 

- AC01a: Visibilidad de solicitud propia según estado
- AC01b: Visibilidad de solicitud en ámbito Aprobador según estado
- AC01c: Visibilidad de solicitud en ámbito Administrador según estado
- AC02: Integridad de datos y visualización de campos mínimos (Material/Servicio)
- AC03a: Control de acceso a la visualización por estado de sesión (Expirada/No autenticado)
- AC03b: Control de acceso por estado del usuario en el sistema (Inactivo)
- AC04: Control de acceso a recursos no autorizados
- AC05: Control de visualización sobre solicitudes inexistente o con formatos inválidos
- AC06: Restricción de acciones según estado final y rol (UI: botones de acción)
- AC07: Manejo de solicitudes con datos inconsistentes o solicitante inexistente
- AC08: Performance básico (< 2s)
- AC09: Consistencia de datos Backend vs UI


## 5. Escenarios (Gherkin)

```gherkin

Feature: Visualizar una solicitud de compra

Background: 

Given el usuario está autenticado en el sistema
And está marcado como "Activo"
And existen solicitudes en estados Creada, En Revisión, Aprobada y Rechazada
And tiene autorización a al menos un centro
          
      @US-03 @ac01a @ac01b @ac01c @happy 
      Scenario Outline: Visualizar solicitud con acciones habilitadas según rol y estado
      
          Given el usuario tiene rol "<rol>"
          And existe una solicitud "<tipo_acceso>" en estado "<estado>"
          When accede al detalle de la solicitud
          Then el sistema muestra la vista de detalle con los datos de la solicitud en modo solo lectura
          And habilita las acciones "<acciones>" según el rol y estado
          And no muestra o deshabilita las acciones no permitidas
          

          @Solicitante_solicitud_propia 
          Examples:
          | rol         | tipo_acceso | estado      | acciones           |
          | Solicitante | Propia      | Creada      | Enviar a Revisión  |
          | Solicitante | Propia      | En Revisión | Ninguna            |
          | Solicitante | Propia      | Aprobada    | Ninguna            |
          | Solicitante | Propia      | Rechazada   | Ninguna            |
        
          @Aprobador_solicitud_su_ambito
          Examples:
          | rol       | tipo_acceso | estado      | acciones           |
          | Aprobador | En su ámbito| En Revisión | Aprobar, Rechazar  |
          | Aprobador | En su ámbito| Aprobada    | Ninguna            |
          | Aprobador | En su ámbito| Rechazada   | Ninguna            |
        
          @Administrador_Tecnico/Funcional_solo_lectura_estados
          Examples:
          | rol                             | tipo_acceso              | estado     | acciones|
          | Administrador Técnico/Funcional | sin restricción de ámbito| Creada     | Ninguna |
          | Administrador Técnico/Funcional | sin restricción de ámbito| En Revisión| Ninguna |
          | Administrador Técnico/Funcional | sin restricción de ámbito| Aprobada   | Ninguna |
          | Administrador Técnico/Funcional | sin restricción de ámbito| Rechazada  | Ninguna |
                    
      @US-03 @ac02 @happy @visualizacion_campos_minimos
      Scenario Outline: Visualizar detalle de solicitud con campos mínimos y visibilidad dinámica para el campo Almacén
      
            Given que existe una solicitud de compra con ID "<ID>" de tipo "<ItemComprableID>" en el sistema
            And el usuario tiene rol "<rol>" con permisos para ver solicitudes
            When accede al detalle de la solicitud "<ID>"
            Then el sistema muestra en la vista de detalle los campos comunes: ID, Descripción, Cantidad, Centro, Fecha Entrega, Estado Actual y Usuario Solicitante
            And el campo "Almacén" se habilita <visibilidad_almacen> según el tipo de ItemComprable

            @Material
            Examples:
            | rol          | ID           | ItemComprableID     | visibilidad_almacen | 
            | Solicitante  | PR-2026-0001 | Material            | muestra             |
            | Aprobador    | PR-2026-0001 | Material            | muestra             |

            @Servicio
            Examples:
            | rol          | ID           | ItemComprableID     | visibilidad_almacen |
            | Solicitante  | PR-2026-0002 | Servicio            | oculta              | 
            | Aprobador    | PR-2026-0002 | Servicio            | oculta              |      
     
     
      @US-03 @ac03a @seguridad @usuario_no_autenticado
       Scenario: Intento de visualización de un usuario no autenticado

           Given el usuario no está autenticado en el sistema
           When intenta acceder al detalle de la solicitud
           Then el sistema lo redirige al formulario de autenticación
           And no se muestran detalles de la solicitud
     
      @US-03 @ac03b @seguridad @usuario_inactivo
      Scenario: Intento de visualización de un usuario "Inactivo"

           Given el usuario está autenticado en el sistema
           And está marcado como "Inactivo"
           When intenta acceder al detalle de la solicitud
           Then el sistema muestra un mensaje indicando que el usuario no está activo
           And no se muestran detalles de la solicitud
      
      @US-03 @ac04 @negative @acceso_no_autorizado
      Scenario Outline: Intento de acceso a solicitud no autorizada
      
            Given el usuario tiene rol "<rol>"
            When intenta acceder al detalle de la solicitud con ID "<ID>"
            And no tiene permisos sobre la solicitud que desea visualizar
            Then el sistema bloquea el acceso a la solicitud
            And muestra un mensaje genérico de error <error>
            And no muestra información de la solicitud
            And no expone detalles técnicos del sistema
            
            Examples:
            | rol         | ID           | error        |
            | :---        | :---         |:-----        |
            | Solicitante | PR-2026-9999 | No Autorizado|
            | Aprobador   | PR-2026-01   | No Autorizado|    
      
      
      @US-03 @ac05 @negative @solicitud_inválida @solicitud_inexistente
      Scenario Outline: Intento de acceso a solicitud inexistente o con formato inválido
      
            Given el usuario tiene rol "<rol>"
            When intenta acceder al detalle de la solicitud con ID "<ID>"
            And la solicitud no existe o el formato es inválido
            Then el sistema bloquea el acceso a la solicitud
            And muestra un mensaje genérico de error <error>
            And no muestra información de la solicitud
            And no expone detalles técnicos del sistema
            
            Examples:
            | rol         | ID           | error                  |
            | :---        | :---         |:-----                  |
            | Solicitante | PR-2026-9999 | Solicitud Inexistente  |
            | Aprobador   | PR-2026-01   | Formato Inválido       |                                                                               
      
      @US-03 @ac06 @edge_case @solicitud_estado_final
      Scenario Outline: Visualización de una solicitud en estado final
      
            Given el usuario tiene rol "<rol>" con permisos para ver solicitudes
            And la solicitud con ID "<ID>" se encuentra en estado "<estado_final>"
            When accede al detalle de esa solicitud
            Then el sistema muestra la información completa de la solicitud
            And el estado mostrado es "<estado_final>" de forma clara
            And el botón "Modificar Solicitud" no está disponible
            And se bloquea el acceso directo a la URL de modificación
         
            Examples:
            | ID           | rol                             | estado_final |
            | :---         | :---                            | :---         |
            | PR-2026-0001 | Solicitante                     | Aprobada     |
            | PR-2026-0002 | Aprobador                       | Rechazada    |
            | PR-2026-0003 | Administrador Técnico/Funcional | Aprobada     |
            | PR-2026-0004 | Administrador Técnico/Funcional | Rechazada    |

      
      @US-03 @ac07 @edge_case @usuario_solicitante_inexistente
      Scenario: Visualización de solicitud con datos de usuario inexistente
      
            Given existe una solicitud creada en el sistema
            And el usuario que creó la solicitud ya no existe en el sistema
            And el usuario actual tiene permisos para visualizar solicitudes
            When accede al detalle de la solicitud
            Then el sistema muestra la información de la solicitud sin errores
            And todos los campos disponibles se muestran correctamente
            And en el campo del "Usuario Solicitante" se muestra el ID del usuario
            And no debe exponer errores técnicos del sistema

```
## 6. Consideraciones de QA

Además de las Consideraciones Generales QA definidas para EPIC-01, se deberá tener en cuenta:
- La validación de permisos por rol y Centro asignado debe realizarse en backend, no solo en la interfaz.
- Las acciones visibles en la pantalla deben corresponder estrictamente al rol del usuario y al estado real de la solicitud.
- El detalle mostrado debe reflejar fielmente los datos persistidos.
- El sistema debe manejar correctamente accesos no autorizados o IDs inexistentes sin exponer información técnica.

## 7. DoD (Definition of Done)

- Esta historia debe cumplir el DoD definido para el MVP (ver EPIC-01) y US-01 (Creación).

Además específicamente para la US:
- La funcionalidad permite la visualización respetando las reglas de visibilidad por rol, ámbito y centro.
- Confirmación de que el estado mostrado corresponde con el registrado en la BD.
- Confirmación de que desde la pantalla de visualización no se podrán editar campos y que el acceso a las distintas acciones sobre la solicitud (Modificar Solicitud, Enviar a Revisión, Aprobar y Rechazar) serán visibles respetando roles y estado de la solicitud.

## 8. Dependencias

**Épicas:**

- EPIC-01 – Gestión de Solicitudes de Compra (Core Funcional).
- EPIC-02 – Gestión del Ciclo de Vida de las Solicitudes (Estados).
- EPIC-03 – Gestión de Usuarios y Seguridad.

**Funcionalidades:**

- Crear Solicitud de Compra (la solicitud debe existir).
- Asignación de Estado Inicial (para mostrar estado "Creada").
- Cambio de Estado (para visualizar estados distintos según el ciclo de vida).
- Inicio de Sesión.
- Control de Acceso por Rol.

## 9. Metadatos
- **Prioridad**: Alta
- **Labels**: `PRFlow`, `GestionDeSolicitudesDeCompra`, `VisualizarSolicitudDeCompra`
