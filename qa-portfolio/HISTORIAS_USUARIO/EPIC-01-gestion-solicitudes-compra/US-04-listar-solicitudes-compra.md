# US-04 | PR-Flow | GSC | Listar solicitudes de compra

## 1. Descripción (Cómo, Quiero, Para)
 
 - **Cómo**: Usuario
 - **Quiero**: Listar solicitudes de compra
 - **Para**: Tener una visión general de las solicitudes registradas
    
## 2. DoR (Definition of Ready)

- Esta historia debe cumplir el DoR definido para el MVP y la **EPIC-01**. No se considera lista hasta que:
    - Estén definidas las reglas de visibilidad por rol (Solicitante/Aprobador/Administrador Técnico/Funcional).
    - Esté definido el conjunto mínimo de columnas del listado.

## 3. Reglas de negocio
- **RN01**: El acceso al listado de solicitudes de compra requiere que el usuario se encuentre autenticado y activo en el sistema.
- **RN02**: Solo los usuarios con rol Solicitante, Aprobador o Administrador Técnico/Funcional pueden acceder al listado de solicitudes.
- **RN03**: El usuario con rol Solicitante solo puede ver en el listado las solicitudes propias.
- **RN04**: El usuario con rol Aprobador debe ver las solicitudes que se encuentren dentro de su ámbito según se define en EPIC-03.
- **RN05**: El usuario con rol Administrador Técnico/Funcional puede listar todas las solicitudes de compra con fines de supervisión y soporte, siempre en modo solo lectura desde esta historia.
- **RN06**: Cada fila del listado debe mostrar al menos: ID de la solicitud, descripción, fecha de creación, estado actual, centro, almacén y usuario solicitante. 
  - Para Ítems de tipo "Material": Se muestra el ID del almacén.
  - Para Ítems de tipo "Servicio": La celda de almacén se muestra vacía o con un guion ("-").
- **RN07**: El listado de solicitudes debe ordenarse por defecto por ID en orden descendente (las solicitudes con el ID mayor primero).
- **RN08**: Desde el listado el usuario debe poder acceder al detalle de una solicitud específica mediante una acción (por ejemplo, clic sobre la fila o un enlace), aplicándose las reglas de visibilidad definidas en la US-03.
- **RN09**: Si no existen solicitudes que cumplan los criterios para el usuario (por ejemplo, un Solicitante sin solicitudes propias), el sistema debe mostrar un listado vacío acompañado de un mensaje que indique que no hay solicitudes disponibles.
-  **RN10**: Si un usuario autenticado intenta acceder al listado y su rol no tiene permisos para esta funcionalidad, el sistema debe bloquear el acceso y mostrar un mensaje de falta de autorización.
- **RN11**: El estado mostrado en cada fila del listado debe corresponder exactamente al estado actual de la solicitud según el modelo de estados definido en la épica de ciclo de vida.

## 4. Criterios de Aceptación

- AC01a: Visibilidad de solicitudes propias según rol Solicitante
- AC01b: Visibilidad de solicitudes en ámbito Aprobador según rol
- AC01c: Visibilidad de todas las solicitudes según rol Administrador Técnico/Funcional
- AC02: Manejo de listados vacíos (mensaje informativo)
- AC03: Paginación y ordenamiento del listado
- AC04: Navegación al detalle de una solicitud desde el listado
- AC05: Visualización de campos mínimos en el listado
- AC06: Control de acceso (usuario no autorizado, inactivo, no autenticado, sesión expirada)
- AC07: Performance básico (tiempo de respuesta < 2s)
- AC08: Calidad visual y consistencia del listado (truncamiento, estado mostrado)

## 5. Escenarios (Gherkin)

```gherkin

Feature: Listar solicitudes de compra

Background:
Given el usuario está "Autenticado" y "Activo" en el sistema
And tiene un rol que le permite listar solicitudes de compra
And el usuario tiene permisos a al menos un centro

      @US-04 @happy @ac01a @solicitante  
      Scenario: Listar solicitudes propias del usuario con rol "Solicitante"
            
            Given el usuario tiene el rol de "Solicitante"
            And existen varias solicitudes propias del usuario 
            And existen solicitudes creadas por otros usuarios  
            When accede al listado de solicitudes  
            Then el sistema muestra únicamente las solicitudes creadas por ese usuario.
            
      @US-04 @happy @ac01b @aprobador 
      Scenario: Listar solicitudes en el ámbito del usuario con rol "Aprobador"
            
            Given el usuario tiene el rol de "Aprobador"
            And existen solicitudes en diferentes centros asignados a él y en estados bajo su ámbito de aprobación 
            When accede al listado de solicitudes  
            Then el sistema muestra las solicitudes que solamente corresponden a su ámbito 

      @US-04 @happy @ac01c @administrador_tecnico_funcional 
      Scenario: Listar solicitudes del usuario con rol "Administrador Técnico/Funcional"  

            Given el usuario tiene el rol "Administrador Técnico/Funcional"
            And existen solicitudes en distintos estados, centros y de distintos usuarios solicitantes
            When el usuario accede al listado de solicitudes
            Then el sistema muestra todas las solicitudes que existen en el sistema
           
      @US-04 @ac02 @listado_vacio  
      Scenario: Listado vacío para usuario sin solicitudes  
            
            Given no existen solicitudes creadas por el usuario o en su ámbito de aprobación
            When accede al listado de solicitudes  
            Then el sistema muestra un listado vacío  
            And muestra un mensaje indicando que no existen solicitudes registradas o en el ámbito del usuario autenticado 
            
      @US-04 @ac03 @ordenamiento
      Scenario: Listar solicitudes en orden descendente por ID

            Given el usuario tiene un rol que le permite listar solicitudes
            And existen solicitudes creadas por él o en su ámbito de aprobación
            When accede al listado de solicitudes
            Then el sistema muestra las solicitudes ordenadas por defecto descendentemente por ID
            And el primer registro del listado posee el ID más alto
      
      @US-04 @ac03 @paginacion
      Scenario: Paginacion en el listado de solicitudes

            Given el usuario tiene un rol que le permite listar solicitudes
            And existen solicitudes creadas por él o en su ámbito de aprobación
            When accede al listado de solicitudes
            Then el sistema muestra los primeros 25 registros 
            And el sistema permite navegar a la siguiente página mediante la opción "Siguiente" y a la anterior mediante la opción "Anterior"
            And los registros de la nueva página son distintos a los de la página anterior.
            And el botón "Siguiente" se deshabilita al alcanzar la última página del listado.

      @US-04 @ac04 @navegacion_detalle
      Scenario: Navegación al detalle desde el listado de solicitudes

            Given el usuario tiene un rol que le permite listar solicitudes
            And existen solicitudes creadas por él o en su ámbito de aprobación
            When selecciona el icono de "Ver detalle" de una solicitud de su listado
            Then el sistema muestra la vista de detalle con la información detallada
                    
      @US-04 @ac05 @campos_mínimos_ui
      Scenario: Listado de solicitudes con campos mínimos

            Given el usuario tiene un rol que le permite listar solicitudes
            And existen solicitudes creadas por él o en su ámbito de aprobación
            When accede al listado de solicitudes
            Then el sistema muestra por cada solicitud ID, ítem, descripción, cantidad, UM, centro, almacén (si es material) y usuario solicitante
                                         
      @US-04 @ac08 @truncamiento
      Scenario: Listado de solicitudes con descripciones truncadas

            Given el usuario tiene un rol que le permite listar solicitudes
            And existen solicitudes creadas por él o en su ámbito de aprobación
            When accede al listado de solicitudes
            And existe una descripción que excede el ancho de la columna
            Then el sistema debe mostrar el campo "Descripción" truncado con puntos suspensivos
            And la tabla debe mantener su alineación original sin deformación
            And al pasar el cursor sobre el texto debe mostrarse un tooltip con la descripción completa
     
    @US-04 @negative @ac06 @usuario_sin_autorizacion 
    Scenario: Intento de listar solicitudes por usuario no autorizado

          Given el usuario tiene rol "Invitado"
          When intenta acceder al listado de solicitudes
          Then el sistema bloquea el acceso
          And muestra un mensaje notificándole que no tiene permisos para listar solicitudes 
          And no muestra el listado de solicitudes 
    
     @US-04 @negative @ac06 @acceso_no_valido
     Scenario Outline: Usuario no puede acceder al listado por condición de sesión o estado inválido
          
            Given el usuario tiene un rol que le permite listar solicitudes
            And su condición es "<condicion>"
            When intenta acceder al listado de solicitudes
            Then el sistema bloquea el acceso
            And muestra un mensaje "<mensaje>"  indicando la acción correspondiente para poder acceder al listado
            And realiza la acción esperada "<accion_esperada>" a la condición del usuario
            And no muestra el listado de solicitudes
            
            Examples:
            | condicion          | mensaje                  | accion_esperada                 |
            | No autenticado     | Debe iniciar sesión      | Redirige al Login               |
            | Inactivo           | Usuario inactivo         | Bloquea vista actual            | 
            | Sesión expirada    | Sesión expirada          | Limpia caché y redirige a Login |

```
 ## 6. Consideraciones QA

- El filtrado por rol y ámbito debe validarse en backend, no solo en la interfaz.
- El orden descendente por fecha debe mantenerse consistente tras actualizaciones de estado.
- El acceso al detalle desde el listado debe respetar las reglas definidas en US-03.
- El listado no debe exponer solicitudes fuera del ámbito del usuario.

## 7. DoD (Definition of Done)

- Esta historia debe cumplir el DoD definido para el MVP (ver EPIC-01) y US-01 (Creación).

Además específicamente para la US:
- El ordenamiento por defecto (fecha descendente) está implementado.
- La funcionalidad permite listar solicitudes según las reglas de visibilidad por rol.
- Confirmación de que el estado mostrado corresponde fielmente al estado en la BD.

## 8. Dependencias

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

## 9. Metadatos
- **Prioridad**: Alta
- **Labels**: `PRFlow`, `GestionDeSolicitudesDeCompra`, `ListarSolicitudesDeCompra`
