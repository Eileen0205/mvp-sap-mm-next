# US-01 | PR-Flow | GSC | Crear una solicitud de compra

## 1. Descripción (Cómo, Quiero, Para)
- **Cómo**: Usuario Solicitante
- **Quiero**: Crear una nueva solicitud de compra
- **Para**: Dejar registrada y trazable la necesidad de adquisición en el sistema

## 2. DoR (Definition of Ready)

- Esta historia debe cumplir el DoR definido para el MVP (ver EPIC-01).

## 3. Reglas de negocio

- **RN01:** Solo usuarios autenticados y activos pueden crear solicitudes de compra.
- **RN02:** Solo usuarios con rol "Solicitante" pueden crear solicitudes de compra.
- **RN03:** No se permiten fechas pasadas (anteriores a la fecha del sistema).
- **RN04:** La cantidad debe ser numérica, mayor que cero y cumplir el formato definido para el MVP.
- **RN05:** Al crear la solicitud, el sistema asigna automáticamente el estado inicial `Creada`.
- **RN06:** El usuario debe estar autorizado al Centro seleccionado según catálogo precargado.
- **RN07:** Los campos mínimos obligatorios de la solicitud son:
  - ItemComprableId (Material o Servicio) seleccionado desde catálogo
  - Descripción
  - Cantidad
  - Unidad de medida (UM)
  - Fecha de creación
  - Fecha de entrega
  - Centro (Seleccionado de catálogo preexistente [seed] autorizado)
- **RN08:** El campo Almacén es:
  - Obligatorio cuando el Ítem es "Material".
  - No Aplica cuando el Ítem es "Servicio".
  - Seleccionable desde catálogo.
- **RN09:** El almacén seleccionado debe pertenecer al centro seleccionado.
- **RN10:** No se permite que, como resultado de una creación, dos solicitudes de compra activas en un estado distinto de "Rechazada" queden con la misma combinación de:
  - Mismo ItemComprableId (Material/Servicio)
  - Mismo centro
  - Misma fecha de entrega

## 4. Escenarios y Criterios de Aceptación (Gherkin)

> Nota: Algunos escenarios redefinen el contexto de autenticación/estado fuera del BACKGROUND para cubrir casos negativos. 

```gherkin

Feature: Crear Solicitud de Compra 

Background:

  Given el usuario está autenticado en el sistema
  And está marcado como "Activo"
  And tiene el rol "Solicitante"
  And tiene autorización a al menos un centro 
 
          @US-01 @happy @critico
          Scenario 1: Crear Solicitud de Compra con datos válidos

                Given el usuario accede al formulario de creación de solicitud de compra
                When selecciona el ItemComprableId "Material"  
                And completa los campos obligatorios
                And selecciona el Centro y el Almacén (si corresponde) del catálogo
                And guarda la solicitud
                Then el sistema crea la solicitud de compra exitosamente
                And asigna automáticamente el estado inicial "Creada"

          @US-01 @happy @almacen @servicio 
          Scenario: Creación de una solicitud de servicio
            
                Given el usuario accede al formulario de creación de solicitud de compra
                When selecciona el ItemComprableId "Servicio"
                And completa los datos obligatorios y selecciona el Centro
                Then el sistema no muestra el catálogo de almacenes
                And permite crear la solicitud de compra exitosamente
                And asigna automáticamente el estado inicial "Creada"

          @US-01 @happy @almacen @material
          Scenario: Crear solicitud de material con almacén informado

                Given el usuario accede al formulario de creación de solicitud de compra
                When selecciona el ItemComprableId "Material" del catálogo
                And completa todos los campos obligatorios 
                And selecciona el Ítem "Almacén" del catálogo 
                And guarda la solicitud
                Then el sistema crea la solicitud de compra exitosamente
                And asigna automáticamente el estado inicial "Creada"

          @US-01 @negative @almacen @material
          Scenario: Intento de creación de una solicitud de material sin almacén informado
          
                Given el usuario accede al formulario de creación de solicitud de compra
                When selecciona el ItemComprableId "Material" del catálogo
                And completa los datos obligatorios sin seleccionar el Ítem "Almacén" del catálogo
                And intenta guardar la solicitud
                Then el sistema muestra un mensaje indicando que el Ítem "Almacén" es obligatorio para solicitudes de material
                And no se crea la solicitud
	
         @US-01 @negative @campos_obligatorio
          Scenario: Intento de creación con campos obligatorios vacíos
                       
                Given el usuario accede al formulario de creación de solicitud de compra
                When el usuario deja uno o más campos obligatorios vacíos
                And intenta guardar la solicitud de compra
                Then el sistema muestra un mensaje de validación de campos obligatorios
                And no se crea la solicitud de compra
                  
         @US-01 @negative @formato_invalido
         Scenario Outline: Intento de creación de solicitud con formato inválido en los campos
		  
                Given el usuario accede al formulario de creación de solicitud de compra
                When el usuario ingresa un valor "<valor>" con formato inválido en los campos "<campos>" de la solicitud 
                And intenta guardar la solicitud de compra
                Then el sistema muestra un mensaje de validación de formato de campo "<mensaje_error>"
                And no se crea la solicitud de compra

                  Examples:
                  | campos        | valor           | mensaje_error                        |
                  | :---          | :---            | :---                                 |
                  | Descripción   | MTTO            | Debe tener entre 10 y 40 caracteres  | 
                  | Descripción   | Serv..[+40]     | Debe tener entre 10 y 40 caracteres  | 
                  | Cantidad      | -5              | Cantidad debe ser mayor que 0        |   
                  | Cantidad      | 0               | Cantidad debe ser mayor que 0        |
                  | Cantidad      | 10.1234         | Máximo 3 decimales permitidos        |
                  | Cantidad      | "abc1"          | No se permiten valores alfanuméricos |
                  | Fecha Entrega | 32/13/2025      | Fecha Inexistente                    |
                  | Fecha Entrega | "abbc"          | Formato Inválido                     |

          @US-01 @negative @fecha
          Scenario: Intento de creación con fecha de entrega en el pasado
          
                Given el usuario accede al formulario de creación de solicitud de compra
                When completa los campos obligatorios con datos válidos
                And ingresa una fecha anterior a la fecha del sistema
                And intenta guardar la solicitud de compra
                Then el sistema muestra un mensaje indicando que la fecha no puede ser pasada
                And no se crea la solicitud de compra
      
          @US-01 @negative @rol
          Scenario: Usuario sin rol "Solicitante" intenta crear una solicitud
                        
                Given el usuario no tiene asignado el rol “Solicitante”
                When intenta acceder al formulario de solicitud de compra 
                Then el sistema bloquea el acceso a la funcionalidad
                And muestra un mensaje de acceso no autorizado
                And no se crea la solicitud de compra

          @US-01 @negative @centro
          Scenario: Usuario sin autorización para el centro intenta crear una solicitud
                      
                Given el usuario no posee autorización a un centro específico
                When intenta seleccionar el centro en el catálogo
                Then el sistema bloquea la creación de la solicitud
                And muestra un mensaje de permisos insuficientes para el centro
                And no se crea la solicitud de compra


          @US-01 @negative @almacen_invalido @centro
          Scenario: Almacén no corresponde al Centro seleccionado

                Given el usuario accede al formulario de solicitud de compra
                When selecciona un Centro del catálogo
                And selecciona un Almacén del catálogo que no pertenece a ese Centro
                And intenta guardar
                Then el sistema bloquea la creación de la solicitud
                And muestra un mensaje indicando inconsistencia Centro-Almacén
                And no se crea la solicitud

          @US-01 @negative @duplicado
          Scenario: Intento de crear una Solicitud de Compra duplicada

                Given el usuario accede al formulario de solicitud de compra
                And existe una solicitud de compra creada previamente con el mismo material o servicio, centro y fecha de entrega
                And dicha solicitud se encuentra en estado distinto de "Rechazada"
                When el usuario intenta crear una nueva solicitud de compra con los mismos datos
                Then el sistema bloquea la creación de la nueva solicitud
                And muestra un mensaje indicando que ya existe una solicitud para el mismo material o servicio, centro y fecha de entrega
                And no se crea la nueva solicitud de compra

          @US-01 @negative @concurrencia
          Scenario: Doble intento de guardado de la misma solicitud
          
                Given accede al formulario de solicitud de compra
                When el usuario completa el formulario con datos válidos
                And presiona el botón "Guardar" dos veces rápidamente
                Then el sistema crea una única solicitud de compra
                And no se generan registros duplicados  

            @US-01 @negative @estado_usuario
            Scenario: Usuario con rol "Solicitante" pero inactivo intenta crear una solicitud
            
                Given el usuario está marcado como "Inactivo"
                When intenta acceder al formulario de creación de solicitud de compra
                Then el sistema bloquea el acceso a la funcionalidad
                And muestra un mensaje indicando que el usuario no está activo
                And no se crea la solicitud de compra

            @US-01 @negative @autenticacion
            Scenario: Usuario no autenticado intenta acceder al formulario de creación
            
                Given el usuario no está autenticado en el sistema
                When intenta acceder al formulario de creación de solicitud de compra
                Then el sistema redirige a la pantalla de autenticación
                And no se muestra el formulario de creación de solicitud de compra
                And no se crea la solicitud de compra

            @US-01 @negative @sesion_expirada
            Scenario: Intento de creación de la solicitud cuando expira la sesión 
                
                Given completa el formulario de solicitud con datos válidos
                And la sesión expira con el formulario cubierto
                When intenta guardar la solicitud
                Then el sistema solicita al usuario su reautenticación
                And no se crea la solicitud de compra

            @US-01 @error @tecnico
            Scenario: Manejo de interrupción durante la creación de la solicitud de compra
            
                Given el usuario completa el formulario con datos válidos
                When ocurre un error inesperado al guardar la solicitud
                Then el sistema muestra un mensaje genérico de error
                And no se crea la solicitud
                And no persisten cambios en el sistema
```
## 5. Consideraciones de QA

> Nota: Aplican las Consideraciones Generales QA definidas para EPIC-01
> Los formatos y límites específicos de cada campo se detallan en Consideraciones Generales QA EPIC-01.

**Tener en cuenta además qué:**

- Usuarios sin el rol Solicitante o en estado Inactivo no deben visualizar el botón "Crear Solicitud". Si intentan acceder por URL directa, el sistema debe redirigir a la página de error 403 (Acceso Denegado).
- Si el usuario selecciona el ItemComprableId "Servicio" el catálogo de almacenes no deberá mostrarse en el formulario.

## 6. DoD (Definition of Done)

- Esta historia debe cumplir el DoD definido para el MVP (ver EPIC-01)

Además especificamente en la US:
- La solicitud creada es visible en el listado/bandeja del solicitante (flujo completo).
- Se verificó que los tipos de datos guardados en BD coincidan con lo definido en el dominio.
- Se verificó que los campos de texto no permitan inyección de scripts básicos (XSS) o caracteres que rompan la BD.
- Verificación de la no duplicidad luego de una creación según reglas definidas.
- Confirmación que tras un fallo en la creación no queden registros basuras (datos parciales) en la BD. 
- Los errores de servidor no rompen la interfaz y muestran un mensaje amigable al usuario.
- Código revisado enfocado en la atomaticidad de la transacción.
- Los criterios de Usabilidad (UX) definidos están implementados (Feedback y Confirmación).

## 7. Dependencias

- **EPIC-03 – Gestión de Usuarios y Seguridad**
  - Autenticación básica de usuarios.
  - Asignación y gestión del rol **Solicitante**.
  - Control del estado **activo/inactivo** del usuario, que condiciona la posibilidad de crear solicitudes.

- **EPIC-02 – Gestión del Ciclo de Vida de las Solicitudes**
  - Asignación automática del estado inicial `Creada` al crear la solicitud (US-05).

## 8. Metadatos
- **Prioridad**: Alta
- **Labels**: `PRFlow`, `GestionDeSolicitudesDeCompra`, `CrearSolicitudDeCompra`
