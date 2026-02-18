# US-03 | PR-Flow | GSC | Visualizar una solicitud de compra

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
- **RN04**: El usuario con rol Aprobador puede visualizar únicamente las solicitudes dentro de su ámbito de aprobación (ver definición en EPIC-03). Esto incluye solicitudes en estado “En Revisión”, “Aprobada” o “Rechazada”. No puede visualizar solicitudes en estado “Creada”.
- **RN05**: El usuario con rol Administrador Técnico/Funcional puede visualizar cualquier solicitud de compra con fines de soporte, siempre en modo solo lectura.
- **RN06**: El detalle de la solicitud debe mostrar, como mínimo: ID, tipo, descripción, cantidad, centro, almacén(si aplica), fecha de entrega, estado actual y usuario solicitante.
- **RN07**: El estado mostrado debe corresponder fielmente al estado real de la solicitud en el sistema.
- **RN08**: La funcionalidad de visualización es de solo lectura respecto a los atributos de la solicitud. Desde esta pantalla No se permite la edición directa de campos. Las acciones disponibles (Enviar a Revisión, Aprobar, Rechazar) dependerán del rol del usuario y del estado actual de la solicitud.
- **RN09**: Una solicitud recién creada y que se mantenga en el estado inicial, debe permitir al usuario con rol“Solicitante” acceder desde esta pantalla a la función Modificar Solicitud y editar campos según reglas de US-02. 
- **RN10**: El sistema debe bloquear el acceso y mostrar un mensaje de error funcional si un usuario intenta acceder a una solicitud para la que no tiene permisos.
- **RN11**: El sistema debe gestionar de forma controlada los intentos de acceso a solicitudes con identificadores inexistentes o con formato inválido, mostrando un mensaje claro (ej. "Solicitud no encontrada") sin exponer errores técnicos.

## 4. Criterios de Aceptación y Escenarios (Gherkin)

```gherkin

Feature: Visualizar una solicitud de compra

Background: 
Given el usuario está autenticado en el sistema
And el usuario está marcado como "Activo"

      @US-03 @happy @caminos_críticos
      Scenario Outline: Visualizar solicitud con acciones habilitadas según rol y estado
      
            Given el usuario tiene rol "<rol>"
            And existe una solicitud en estado "<estado>"
            When accede al detalle de la solicitud
            Then el sistema muestra los datos de la solicitud en modo solo lectura
            And habilita las acciones "<acciones>" según el rol y estado
            
            @Solicitante_solicitud_propia 
            Examples:
            | rol         | estado      | acciones           |
            | Solicitante | Creada      | Enviar a Revisión  |
            | Solicitante | En Revisión | Ninguna            |
            | Solicitante | Aprobada    | Ninguna            |
            | Solicitante | Rechazada   | Ninguna            |
            
            @Aprobador_solicitud_su_ámbito
            Examples:
            | rol       | estado      | acciones           |
            | Aprobador | En Revisión | Aprobar, Rechazar  |
            | Aprobador | Aprobada    | Ninguna            |
            | Aprobador | Rechazada   | Ninguna            |
            
            @Administrador_Técnico/Funcional_solo_lectura_estados
            Examples:
            | rol                             | estado      | acciones           |
            | Administrador Técnico/Funcional | Creada      | Ninguna            |
            | Administrador Técnico/Funcional | En Revisión | Ninguna            |
            | Administrador Técnico/Funcional | Aprobada    | Ninguna            |
            | Administrador Técnico/Funcional | Rechazada   | Ninguna            |
                        
      @US-03 @negative @accesos
      Scenario Outline: Intento de visualización bloqueada por estado, ámbito, sesión o rol
                
            Given el usuario tiene rol "<rol>"
            And la solicitud se encuentra en estado "<estado>"
            And la sesión del usuario está "<sesion>"
            And la solicitud está "<ámbito>" del ámbito de aprobación del usuario
            When intenta acceder al detalle
            Then el sistema bloquea el acceso
            And muestra el mensaje "<mensaje>"
            And no se visualiza la información de la solicitud

            @Aprobador_estado_prohibido
            Examples:
            | rol       | estado      | sesion  | ambito  | mensaje                                                      |
            | Aprobador | Creada      | Activa  | Dentro  | No tiene permisos para visualizar solicitudes en este estado |
          
            @Aprobador_fuera_ambito
            Examples:
            | rol       | estado      | sesion  | ambito  | mensaje                                                             |
            | Aprobador | En Revisión | Activa  | Fuera   | No tiene permisos para visualizar esta solicitud fuera de su ámbito |
            | Aprobador | Aprobada    | Activa  | Fuera   | No tiene permisos para visualizar esta solicitud fuera de su ámbito |
            | Aprobador | Rechazada   | Activa  | Fuera   | No tiene permisos para visualizar esta solicitud fuera de su ámbito |

            @Usuario_sesión_inactiva
            Examples:
            | rol                               | estado      | sesion   | ambito  | mensaje                                              |
            | Solicitante                       | Creada      | Inactiva | N/A     | Debe iniciar sesión para visualizar la solicitud     |
            | Aprobador                         | En Revisión | Inactiva | Dentro  | Debe iniciar sesión para visualizar la solicitud     |
            | Administrador Técnico/Funcional   | Rechazada   | Inactivo | N/A     | Debe iniciar sesión para visualizar la solicitud     |
            | Invitado                          | En Revisión | Activa   | N/A     | Su rol no tiene permisos para visualizar solicitudes |    
     
      @US-03 @negative @solicitud_no_propia
      Scenario: Intento de visualización de una solicitud de otro usuario
      
            Given el usuario tiene rol "Solicitante"
            And existe una solicitud creada por otro usuario  
            When el usuario intenta acceder al detalle de esa solicitud  
            Then el sistema bloquea el acceso al detalle  
            And muestra un mensaje indicando que no tiene permisos para visualizar esa solicitud
      
     @US-03 @happy @visualizacion_campos_minimos
      Scenario Outline: Visualizar detalle de solicitud con campos mínimos
      
            Given que existe una solicitud de compra con ID "<ID>" en el sistema
            And el usuario tiene rol "<rol>" con permisos para ver solicitudes
            When accede al detalle de la solicitud "<ID>"
            Then el sistema debe mostrar el campo "ID" con valor "<ID>"
            And el sistema debe mostrar el campo "Tipo" con valor "<Tipo>"
            And el sistema debe mostrar el campo "Descripción" con valor "<Descripción>"
            And el sistema debe mostrar el campo "Cantidad" con valor "<Cantidad>"
            And el sistema debe mostrar el campo "Centro" con valor "<Centro>"
            And el sistema debe mostrar el campo "Almacén" con valor "<Almacén>"
            And el sistema debe mostrar el campo "Fecha de entrega" con valor "<Fecha_Entrega>"
            And el sistema debe mostrar el campo "Estado Actual" con valor "<Estado_Actual>"
            And el sistema debe mostrar el campo "Usuario Solicitante" con valor "<Usuario_Solicitante>"

            @Material
            Examples:
            | rol        | ID  | Tipo    | Descripción                     | Cantidad| Centro| Almacén| Fecha_Entrega| Estado_Actual|Usuario_Solicitante |
            | Solicitante| 4587| Material| Paquete Papel A4 80g (500 hojas)| 250     | 1011  | 210A   | 05/02/2026   | En Revisión  |jperez              |
            | Aprobador  | 4587| Material| Paquete Papel A4 80g (500 hojas)| 250     | 1011  | 210A   | 05/02/2026   | En Revisión  |jperez              |

            @Servicio
            Examples:
            | rol        | ID   | Tipo       | Descripción              | Cantidad| Centro| Almacén| Fecha_Entrega| Estado_Actual |Usuario_Solicitante |
            | Solicitante| 4587 | Servicio   | Mentenimiento Industrial | 1       | 1011  | N/A    | 05/02/2026   | En Revisión   |jperez              |
            | Aprobador  | 4587 | Servicio   | Mentenimiento Industrial | 1       | 1011  | N/A    | 05/02/2026   | Aprobada      |jperez              |
                                    
     
      @US-03 @negative @solicitud_no_disponible
      Scenario Outline: Intento de visualización de una solicitud no disponible
      

              Given el usuario tiene rol "<rol>" con permisos para visualizar solicitudes
              And la solicitud con ID "<ID>" se encuentra en condición "<condicion>"
              When intenta acceder al detalle de la solicitud con ID "<ID>"
              Then el sistema muestra el mensaje "Solicitud No Encontrada"
              And no muestra información de la solicitud
              And no expone errores técnicos del sistema
              
              Examples:
              | rol                            | ID    | condicion   |
              | Solicitante                    | 7547  | Inexistente |
              | Aprobador                      | AB1   | ID inválido |
              | Administrador Técnico/Funcional| -1    | ID inválido |
              | Solicitante                    | 4587  | Sin permisos|         
            
      @US-03 @edge_case @solicitud_estado_final
      Scenario Outline: Visualización de una solicitud en estado final
      
            Given el usuario tiene rol "<rol>" con permisos para ver solicitudes
            And la solicitud con ID "<ID>" se encuentra en estado "<estado_final>"
            When accede al detalle de esa solicitud
            Then el sistema muestra la información completa de la solicitud
            And el estado mostrado es "<estado_final>" de forma clara
            And todos los campos deben estar en modo solo lectura
            And no debe mostrar opciones de modificación o acciones sobre el estado de la solicitud
  
            Examples:
            |ID  |rol                            | estado_final |
            |4587|Solicitante                    | Aprobada     |
            |4588|Aprobador                      | Rechazada    |
            |4589|Administrador Técnico/Funcional| Aprobada     |
            |4590|Administrador Técnico/Funcional| Rechazada    |

      @US-03 @edge_case @usuario_solicitante_inexistente
      Scenario: Visualización de solicitud con datos de usuario inconsistentes
      
            Given existe una solicitud creada en el sistema
            And el usuario que creo la solicitud ya no existe en el sistema
            And el usuario actual tiene permisos para visualizar solicitudes
            When accede al detalle de la solicitud
            Then el sistema muestra la información de la solicitud sin errores
            And todos los campos disponibles deben mostrarse correctamente
            And en el campo del "Usuario Solicitante" debe mostrar el ID del usuario
            And no debe exponer errores técnicos del sistema
       
      @US-03 @edge_case @fecha_vencida
      Scenario: Visualización de solicitud con fecha de entrega vencida
      
              Given el usuario tiene rol "Aprobador"
              And la solicitud está en estado "En Revisión"
              And la fecha de entrega es anterior a la fecha actual
              When accede al detalle
              Then el sistema muestra la información de la solicitud
              And muestra una advertencia: "La fecha de entrega ha vencido"
              And mantiene habilitadas las acciones Aprobar y Rechazar
      
      
      @US-03 @negative @seguridad_url_manipulada
      Scenario Outline: Intento de acceso a solicitud con ID manipulado en la URL
      
            Given el usuario tiene rol "<rol>"
            And tiene permisos para visualizar solicitudes
            When intenta acceder a una URL con un ID "<id_solicitud>" y condición "<condición>"
            Then el sistema bloquea el acceso
            And redirige a una página de error genérica "<error>" 
            And no expone información sensible ni errores técnicos

            Examples:
            |rol                            | id_solicitud| condición  | error        |
            |Solicitante                    | 4578        | Sin acceso | 403 Forbidden|
            |Aprobador                      | 4579        | Sin acceso | 403 Forbidden|
            |Administrador Técnico/Funcional| 4658        | Inexistente| 404 Not Found|

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
- Los datos del solicitante que se muestran son coherentes con los datos de usuarios definidos en EPIC-03.

## 6. DoD (Definition of Done)

- La historia cumple el DoD global del MVP y el DoD específico de la EPIC-01.
- Todos los escenarios de aceptación (felices y negativos) han sido ejecutados sin defectos críticos abiertos.

## 7. Dependencias

**Épicas:**

- EPIC-01 – Gestión de Solicitudes de Compra (Core Funcional).
- EPIC-02 – Gestión del Ciclo de Vida de las Solicitudes (Estados).
- EPIC-03 – Gestión de Usuarios y Seguridad.

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