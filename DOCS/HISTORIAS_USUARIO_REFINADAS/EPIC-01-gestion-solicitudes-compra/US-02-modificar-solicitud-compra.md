## 1. Descripción (Cómo, Quiero, Para)

- **Cómo**: Usuario Solicitante  
- **Quiero**: Modificar una solicitud de compra  
- **Para**: Actualizar la información registrada  

## 2. DoR (Definition of Ready)

- Esta historia debe cumplir el DoR definido para el MVP (ver EPIC-01).
- Para la **EPIC-01 | Gestión de Solicitud de Compra**, en particular:
  - Están definidas y acordadas las reglas de creación (US-01) sobre las que se apoya la modificación.
  - Están definidos los estados de la solicitud y cuáles permiten o no modificación.
  - Están identificados los campos modificables y los campos clave no modificables.

## 3. Reglas de negocio

- **RN01 – Solo usuarios autenticados y con sesión activa pueden modificar solicitudes de compra.**
- **RN02 – Solo usuarios con rol _Solicitante_ pueden modificar sus propias solicitudes de compra.**
- **RN03 – El usuario debe tener autorización sobre el centro asignado a la solicitud que se desea modificar.**
- **RN04 – No se permiten fechas requeridas anteriores a la fecha del sistema.**
- **RN05 – La cantidad debe ser un valor mayor que cero y cumplir el formato definido.**
- **RN06 – La solicitud de compra a modificar debe existir en el sistema.**
- **RN07 – Si la solicitud no existe o no es accesible para el usuario, el sistema debe:**
  - Bloquear la operación.
  - Mostrar un mensaje de error funcional adecuado.
- **RN08 – Solo se permite la modificación de solicitudes que se encuentren en estado inicial `Creada`.**
- **RN09 – No se permite la modificación de solicitudes en los estados `En Revisión`, `Rechazada` o `Aprobada`.**
- **RN10 – Las modificaciones deben mantener la coherencia con las reglas definidas en la creación de solicitudes (US-01).**
- **RN11 – No se permite que, como resultado de una modificación, dos solicitudes de compra queden con la misma combinación de material/servicio + centro + fecha requerida.**
- **RN12 – Solo pueden modificarse los siguientes campos: Descripción, Cantidad, Fecha Requerida.**
- **RN13 – Una vez creada la solicitud no puede modificarse el tipo (Material / Servicio) ni el centro asignado.**
- **RN14 – Los cambios deben guardarse de forma consistente y reflejarse correctamente en:**
  - La visualización de la solicitud (detalle).
  - El listado de solicitudes.
- **RN15 – Si ocurre un error durante el guardado, no deben persistir cambios parciales en la solicitud.**

## 4. Escenarios y Criterios de Aceptación (AC)

```gherkin

Feature: Modificar Solicitud de Compra

Background: 
Given el usuario está autenticado en el sistema
And el usuario está marcado como "Activo"

      @US-02 @happy @crítico
      Scenario: Modificar solicitud de compra con datos válidos (Happy Path)

            Given el usuario tiene rol de "Solicitante"
            And existe una solicitud propia en estado inicial "Creada"
            And tiene autorización sobre el centro
            When el usuario completa los campos permitidos con datos válidos
            And guarda los cambios realizados
            Then el sistema guarda las modificaciones exitosamente
            And los cambios se reflejan correctamente en la solicitud 

      @US-02 @negative @datos_invalidos
      Scenario: Intentar modificar solicitud de compra con datos inválidos ( No se incluye Campo "Cantidad")

            Given el usuario tiene rol de "Solicitante"
            And existe una solicitud propia en estado inicial "Creada"
            And tiene autorización sobre el centro
            When el usuario introduce valores con formato inválido en uno o más campos permitidos (distintos de la cantidad)
            And intenta guardar la modificación de la solicitud 
            Then el sistema muestra un mensaje de error de validación de datos
            And no se guarda la modificación de la solicitud

       @US-02 @negative @cantidad
       Scenario Outline: Intento de modificación con cantidad no permitida
                                
            Given el usuario tiene rol de "Solicitante"
            And existe una solicitud propia en estado inicial "Creada"
            And tiene autorización sobre el centro
            When modifica los campos permitidos con datos válidos excepto la cantidad
            And ingresa una cantidad <cantidad_invalida>
            And intenta guardar la modificación de la solicitud
            Then el sistema muestra un mensaje indicando que la cantidad debe ser mayor que cero y con formato válido
            And no se guarda la modificación de la solicitud

              Examples:
                    | cantidad_invalida |
                    | 0                 | 
                    | -5                |

       @US-02 @negative @fecha
       Scenario: Intento de modificación de solicitud con una fecha en el pasado
       
            Given el usuario tiene rol de "Solicitante"
            And existe una solicitud propia en estado inicial "Creada"
            And tiene permisos al centro y al material o servicio
            And accede al formulario de modificación de solicitud de compra
            When completa los campos permitidos con datos válidos
            And ingresa una fecha requerida anterior a la fecha del sistema
            And intenta guardar la modificación de la solicitud
            Then el sistema muestra un mensaje indicando que la fecha requerida no puede ser pasada                
            And no se guarda la modificación de la solicitud
      
       @US-02 @negative @solicitud_inexistente
       Scenario: Intentar modificar solicitud de compra inexistente

            Given el usuario tiene rol de "Solicitante"
            When el usuario intenta modificar los datos de una solicitud 
            And la solicitud no existe en el sistema
            Then el sistema bloquea la operación 
            And muestra un mensaje funcional indicando que la solicitud no existe en el sistema

       @US-02 @negative @no_accesible_usuario    
       Scenario: Intentar modificar solicitud de compra no accesible para el usuario

            Given el usuario tiene rol de "Solicitante"
            And existe una solicitud en un estado válido "Creada" 
            When el usuario intenta modificar los datos de la solicitud 
            And no tiene privilegios para acceder a la misma
            Then el sistema bloquea la operación 
            And muestra un mensaje funcional indicando que el usuario no tiene privilegios para acceder a la solicitud

       @US-02 @negative @autorizacion_centro
       Scenario: Intentar modificar solicitud de compra sin autorización al nuevo centro de asignación a la solicitud

            Given el usuario tiene rol de "Solicitante"
            And tiene una solicitud propia en un estado válido "Creada"            
            And no tiene autorización al nuevo centro
            When el usuario intenta modificar el centro en la solicitud existente
            Then el sistema bloquea la operación
            And muestra un mensaje de centro no autorizado
            And no se guarda la modificación de la solicitud

       @US-02 @negative @campos_claves
       Scenario: Intentar modificar campos clave (Centro/Material/Servicio) de una solicitud de compra

            Given el usuario tiene rol de "Solicitante"
            And tiene una solicitud propia en un estado válido "Creada"    
            And tiene autorización al centro que corresponde a la solicitud
            When el usuario intenta modificar un campo clave
            Then el sistema muestra dichos campos en modo ‘solo lectura’
            And no permite hacer modificaciones

       @US-02 @negative @duplicados
       Scenario: Intentar modificar una solicitud para que quede duplicada de otra existente

            Given el usuario tiene rol de "Solicitante"
            And tiene autorización al centro que corresponde a la solicitud
            And tiene una solicitud propia en un estado válido "Creada" 
            And existe una solicitud de compra creada previamente con el mismo material o servicio, centro y fecha requerida
            When el usuario modifica los campos permitidos de su solicitud
            And  intenta guardar la modificación de forma que la combinación de material o servicio, centro y fecha requerida coincida con la de la otra solicitud         
            Then el sistema bloquea la modificación de la solicitud
            And muestra un mensaje indicando que ya existe una solicitud para el mismo material o servicio, centro y fecha requerida
            And no se guarda la modificación de la solicitud

        @US-02 @Seguridad @Gestion_Estados
        Scenario Outline: El sistema no permite la modificación de solicitudes en estados inválidos desde la UI
                           
              Given el usuario tiene rol de "Solicitante"
              And tiene autorización al centro que corresponde a la solicitud
              And existe una solicitud propia en estado inválido "<estado>"
              And está situado en la pantalla de visualización de dicha solicitud
              When el sistema visualiza la solicitud 
              Then el botón de Modificar está deshabilitado
              
                Examples:
                |estado|
                |En Revisión|
                |Aprobada|
                |Rechazada|
                
        @US-02 @Seguridad @Gestion_Estados   
        Scenario Outline: El sistema bloquea el acceso directo a la modificación de solicitudes en estados inválidos
                     
              Given existe una solicitud propia con ID <ID_Solicitud> en estado <Estado>
              When el usuario intenta navegar directamente a la URL de modificación para la solicitud <ID_Solicitud>
              Then el sistema muestra una página o mensaje de error indicando <mensaje_error>
              And no se presenta el formulario de modificación
   
               Examples:
                |  ID_Solicitud     |Estado              | mensaje_error
                |  123              |  En Revisión       | La solicitud está "En Revisión", no se puede modificar.| 
                |  452              |  Aprobada          | La solicitud está "Aprobada", no se puede modificar.   |
                |  789              |  Rechazada         | La solicitud está "Rechazada", no se puede modificar.  |

```
## 5. Consideraciones de QA

- Validaciones antes de modificar (sin cambios parciales).
- Coherencia entre creación (US-01) y modificación (US-02).
- Restricciones por rol y estado aplicadas tanto en UI como en backend.
- Mensajes de error claros, específicos y consistentes.
- Integridad de datos entre modificación, visualización y listado.
- Campos no modificables siempre en solo lectura y no modificables vía URL/API.
- No debe ser posible eludir las restricciones de estado de la solicitud.
- Duplicados: detección correcta, mensaje funcional adecuado y mantenimiento de los datos originales.

## 6. DoD (Definition of Done)

- La historia cumple el DoD global del MVP y el DoD específico de la EPIC-01.
- Todos los escenarios de aceptación (felices y negativos) han sido ejecutados sin defectos críticos abiertos.
- Los cambios se reflejan correctamente en la visualización de la solicitud y en el listado de solicitudes.

## 7. Dependencias

- **EP-01 / US-01**: Debe existir una solicitud válida creada.
- **EP-02**: La solicitud debe estar en estado `Creada` para poder modificarse.
- **EP-03**: Autenticación, rol **Solicitante** y permisos sobre el centro.