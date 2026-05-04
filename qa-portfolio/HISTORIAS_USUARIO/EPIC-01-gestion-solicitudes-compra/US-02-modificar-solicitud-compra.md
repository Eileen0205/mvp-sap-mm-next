# US-02 | PR-Flow | GSC | Modificar una solicitud de compra

## 1. Descripción (Cómo, Quiero, Para)

- **Cómo**: Usuario Solicitante  
- **Quiero**: Modificar una solicitud de compra  
- **Para**: Actualizar la información registrada  

## 2. DoR (Definition of Ready)

- Esta historia debe cumplir el DoR definido para el MVP (ver EPIC-01).
- Para la **US-02 | Modificar una solicitud de compra**, en particular:
  - Están definidas y acordadas las reglas de creación (US-01) sobre las que se apoya la modificación.
  - Están definidos los estados de la solicitud y cuáles permiten o no modificación.
  - Están identificados los campos modificables y los campos clave no modificables.

## 3. Reglas de negocio

- **RN01:** Solo usuarios autenticados y con sesión activa pueden modificar solicitudes de compra.
- **RN02:** Solo usuarios con rol Solicitante pueden acceder a la modificación de solicitudes propias.
- **RN03:** Solo pueden modificarse los siguientes campos en una solicitud: Descripción, Cantidad, Fecha de Entrega, Unidad de Medida (UM).
- **RN04:** Una vez creada la solicitud no puede modificarse: ItemComprableID, Centro, Almacén.
- **RN05:** La solicitud de compra a modificar debe existir en el sistema.
- **RN06:** El usuario solicitante debe estar asignado al Centro asociado a la solicitud.
- **RN07:** No se permiten fechas de entrega anteriores a la fecha del sistema. (US-01)
- **RN08:** La cantidad debe ser un valor numérico, mayor que cero y cumplir el formato definido (US-01).
- **RN09:** Solo se permite la modificación de solicitudes que se encuentren en estado inicial "Creada". Cualquier otro estado (En Revisión, Aprobada, Rechazada) el sistema debe:
  - Deshabilitar la opción "Modificar".
- **RN10:** No se permite que, como resultado de una modificación, dos solicitudes de compra activas en un estado distinto de "Rechazada" queden con la misma combinación de:
  - ItemComprableID
  - Centro
  - Fecha de entrega.
- **RN11:** Los cambios deben guardarse de forma consistente y reflejarse correctamente en:
  - La visualización de la solicitud (detalle).
  - El listado de solicitudes.
- **RN12:** Si ocurre un error durante el guardado, no deben persistir cambios parciales en la solicitud.
- **RN13:** Las validaciones de formato, obligatoriedad y fecha de entrega no pasada aplican conforme a lo definido en US-01.

## 4. Criterios de Aceptación

- AC01: Modificación de solicitud exitosa
- AC02a: Control de modificación por rol
- AC02b: Control de modificación por propiedad de la solicitud (propietario)
- AC02c: Control de modificación por estado de usuario (activo/inactivo)
- AC03a: Validaciones de campos obligatorios
- AC03b: Validación de descripción (mínimo/máximo)
- AC03c: Validación de cantidad (formato, decimales, límite)
- AC03d: Validación de fecha (pasado/formato)
- AC04: Inmutabilidad de campos clave (ítem, centro, almacén)
- AC05: Control de modificación de solicitudes inexistentes
- AC06: Control de duplicidad por modificación
- AC07: Control en concurrencia en la modificación
- AC08: Restricción de edición por estado de sesión (Expirada/No autenticado)
- AC09: Restricción de edición por estados no autorizados para modificación 
- AC10: Manejo de errores inesperados
- AC11: Performance básico de peticiones <2s

## 5. Escenarios (Gherkin)

> Nota: Algunos escenarios redefinen el contexto fuera del Background para cubrir casos negativos específicos.

```gherkin

Feature: Modificar Solicitud de Compra

Background: 
  Given el usuario está autenticado en el sistema y tiene sesión "Activa"
  And tiene el rol "Solicitante"
  And existe al menos una solicitud en estado inicial "Creada"
  And tiene autorización sobre al menos un centro

      @US-02 @ac01 @happy @critico
      Scenario: Modificar solicitud de compra con datos válidos (Happy Path)

            Given el usuario accede al formulario de modificación 
            When el usuario completa los campos permitidos con datos válidos
            And guarda los cambios realizados
            Then el sistema muestra un mensaje notificando que la operación fue exitosa
            And los cambios se reflejan correctamente en la solicitud
            And la data persiste correctamente en la base de datos

      @US-02 @ac02a @negative @rol_no_autorizado
      Scenario Outline: Intentar modificar una solicitud con un rol no autorizado
           
            Given el usuario tiene asignado el rol "<rol>"
            When intenta acceder a la funcionalidad "Modificar Solicitud"
            Then el sistema deshabilita la opción "Modificar"
            And muestra un mensaje "<mensaje>"
            And no se permite la modificación de la solicitud
           
            Examples:
            | rol                             | mensaje                                               |
            | :---                            | :---                                                  |
            | Aprobador                       | Su rol no tiene permisos para realizar modificaciones |
            | Administrador Técnico Funcional | Su rol no tiene permisos para realizar modificaciones |

      @US-02 @ac02b @negative @no_autorizada_usuario  
      Scenario: Intentar modificar solicitud de compra no autorizada para el usuario

            Given existe una solicitud en estado "Creada" no propia
            When el usuario intenta acceder a la modificación directa de esta solicitud
            Then el sistema bloquea la operación
            And no expone información de la solicitud
            And muestra un mensaje funcional "No tiene autorización para acceder a esta solicitud"
      
      @US-02 @ac02c @negative @usuario_inactivo
      Scenario: Intento de modificación por usuario inactivo

            Given el usuario está marcado en el sistema como "Inactivo" 
            When el usuario intenta acceder a la modificación de la solicitud
            Then el sistema bloquea la acción
            And muestra un mensaje indicando que el usuario no está activo
            And no se realiza ninguna acción sobre la solicitud

      @US-02 @ac03a @negative @campos_obligatorios
      Scenario: Intento de modificación de solicitud con campos obligatorios vacíos
       
            Given el usuario accede al formulario de modificación
            And durante la edición deja un campo obligatorio sin completar
            When el usuario intenta guardar la modificación de la solicitud
            Then el sistema muestra un mensaje indicando que existen campos obligatorios vacíos
            And deshabilita el botón "Guardar"
            And no se guarda información parcial en la base datos

       @US-02 @ac03b @ac03c @ac03d @negative @datos_invalidos 
       Scenario Outline: Intentar modificar solicitud de compra con datos inválidos en campos permitidos
                                
            Given el usuario accede al formulario de modificación
            When ingresa el valor "<valor>" en los campos permitidos "<campos>"
            And intenta guardar la modificación de la solicitud
            Then el sistema muestra un mensaje de error "<mensaje_error>" indicando error de formato
            And se deshabilita el botón "Guardar"
            And no persiste información parcial en la base de datos

              Examples:
              | campos        | valor      | mensaje_error                       |
              | :---          | :---       | :---                                |
              | Descripción   | MTTO       | Debe tener entre 10 y 40 caracteres | 
              | Cantidad      | -5         | Cantidad debe ser mayor que 0       |   
              | Fecha Entrega | 32/05/2014 | Formato Inválido                    |
              | Fecha Entrega | 12/01/2025 | Fecha pasada                        |
     
      @US-02 @ac04 @negative @inmutabilidad
      Scenario: Intentar modificar campos clave (ItemComprableID/Centro/Almacén) de una solicitud de compra

            Given el usuario accede al formulario de modificación 
            When el usuario intenta modificar un campo clave (ItemComprableID, Centro o Almacén)
            Then el sistema muestra dichos campos en modo "solo lectura"
            And no permite hacer modificaciones
      
      @US-02 @ac05 @negative @solicitud_inexistente
      Scenario: Intentar modificar solicitud de compra inexistente

            Given el usuario intenta acceder a la modificación de una solicitud con un ID inexistente
            Then el sistema bloquea la operación 
            And muestra un mensaje funcional indicando que la solicitud no existe en el sistema 
      
      @US-02 @ac06 @negative @duplicados
      Scenario: Intentar modificar una solicitud para que quede duplicada de otra existente

            Given existe una solicitud de compra creada previamente con el mismo ItemComprable, centro y fecha de entrega
            When el usuario modifica los campos permitidos de su solicitud
            And  intenta guardar la modificación de forma que la combinación de ItemComprable, centro y fecha de entrega coincida con la de la otra solicitud         
            Then el sistema bloquea la modificación de la solicitud
            And muestra un mensaje indicando que ya existe una solicitud para el mismo ItemComprable, centro y fecha de entrega
            And no se guarda la modificación de la solicitud

      
      @US-02 @ac07 @negative @concurrencia_modificacion
      Scenario: Intento de modificación por dos usuarios simultáneamente a la misma solicitud

            Given dos usuarios tienen el rol "Solicitante"
            And acceden al formulario de modificación 
            And completan los campos permitidos con datos válidos
            And guardan la solicitud casi simultaneamente
            When se realizan las peticiones de guardado
            Then el sistema procesa la primera solicitud de forma exitosa
            And evita incosistencias en los datos
            And muestra un mensaje funcional al segundo usuario que los datos han sido actualizados por un tercero
            And no le permite guardar sus cambios
            And los datos de la primera petición persisten correctamente en la base de datos
      
      @US-02 @ac08 @negative @usuario_no_autenticado
      Scenario: Intento de modificación por usuario no autenticado

            Given el usuario tiene el rol "Solicitante" 
            And no está autenticado en el sistema
            When intenta acceder a la modificación de la solicitud
            Then el sistema lo redirige al formulario de autenticación
            And no se presenta el formulario de modificación
            And no se realiza ninguna acción sobre la solicitud
          
      @US-02 @ac09 @seguridad @gestion_estados
      Scenario Outline: El sistema no permite el acceso desde esta pantalla a la funcionalidad de modificación en estados inválidos desde la UI
                           
            Given existe una solicitud propia del usuario en estado inválido "<estado>"
            And está situado en la pantalla de visualización de dicha solicitud
            When el sistema visualiza la solicitud 
            Then el botón de Modificar está deshabilitado
              
                Examples:
                | estado      |
                | :---        |
                | En Revisión |
                | Aprobada    |
                | Rechazada   |
                
        @US-02 @ac09 @seguridad @gestion_estados   
        Scenario Outline: El sistema bloquea el acceso directo a la modificación de solicitudes en estados inválidos
                     
              Given existe una solicitud propia con ID "<ID>" en estado <estado>
              When el usuario intenta navegar directamente a la URL de modificación para la solicitud "<ID>"
              Then el sistema muestra una página o mensaje de error indicando "<mensaje_error>"
              And no se presenta el formulario de modificación
   
             Examples:
                | ID           | estado      | mensaje_error                            |
                | :---         | :---        | :---                                     |
                | PR-2026-0001 | En Revisión | No puede modificarse en el estado actual |
                | PR-2026-0002 | Aprobada    | No puede modificarse en el estado actual |
                | PR-2026-0003 | Rechazada   | No puede modificarse en el estado actual |


       @US-02 @ac10 @manejo_errores
       Scenario: Manejo de interrupción durante el guardado
        
              Given el usuario intenta guardar la modificación de la solicitud
              When ocurre un error inesperado
              Then el sistema notifica que intente más tarde y que los cambios no fueron guardados
              And no persisten cambios en el sistema
```
## 6. Consideraciones de QA

> Nota: Aplican las Consideraciones Generales QA definidas para EPIC-01
> Los formatos y límites específicos de cada campo se detallan en Consideraciones Generales QA EPIC-01.

**Comportamiento de la Interfaz (UI/UX)**

- Los campos claves (Centro/ItemComprableID/Almacén) en el momento de la modificación deben permanecer en Modo Lectura.
- Cuando una solicitud se encuentre en estado En Revisión, Aprobada, Rechazada el sistema debe mostrar el botón “Modificar Solicitud” deshabilitado.

**Seguridad y Acceso**

- Usuarios sin el rol Solicitante o en estado Inactivo no deben visualizar el botón "Modificar Solicitud". Si intentan acceder por URL directa, el sistema debe bloquear el acceso y mostrar un mensaje de acceso denegado.

## 7. DoD (Definition of Done)

- Esta historia debe cumplir el DoD definido para el MVP (ver EPIC-01) y US-01 (Creación).

Además específicamente para la US:
- Los cambios se reflejan correctamente en la visualización de la solicitud y en el listado de solicitudes.
- Verificación que la modificación es realizada por rol autorizado según reglas definidas.
- Confirmación que tras un fallo en la modificación no queden registros basuras (datos parciales) en la BD.
- Verificación de que los campos no modificables permanezcan en modo "Solo Lectura".
- Verificación de la no duplicidad luego de una modificación según reglas definidas.

## 8. Dependencias

- **EPIC-01 / US-01**: Debe existir una solicitud válida creada.
- **EPIC-02**: La solicitud debe estar en estado `Creada` para poder modificarse.
- **EPIC-03**: Autenticación, rol **Solicitante** y permisos sobre el centro.

## 9. Metadatos

- **Prioridad**: Alta
- **Labels**: `PRFlow`, `GestionDeSolicitudesDeCompra`, `ModificarSolicitudDeCompra`
