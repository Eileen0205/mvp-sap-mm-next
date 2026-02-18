# US-01 | PR-Flow | GSC | Crear una solicitud de compra

## 1. Descripción (Cómo, Quiero, Para)
- **Cómo**: Usuario Solicitante
- **Quiero**: Crear una nueva solicitud de compra
- **Para**: Dejar registrada y trazable la necesidad de adquisición en el sistema

## 2. DoR (Definition of Ready)

- Esta historia debe cumplir el DoR definido para el MVP (ver EPIC-01).

## 3. Reglas de negocio

- **RN01** Solo usuarios autenticados y activos pueden crear solicitudes de compra.
- **RN02** Solo usuarios con rol "Solicitante" pueden crear solicitudes de compra.
- **RN03** No se permiten fechas pasadas (anteriores a la fecha del sistema).
- **RN04** El usuario debe tener autorización sobre el centro y el material o servicio solicitado.
- **RN05** La cantidad debe ser un valor mayor que cero y cumplir el formato definido.
- **RN06** Al crear la solicitud, el sistema asigna automáticamente el estado inicial `Creada`.
- **RN07** Los campos mínimos obligatorios de la solicitud son:
  - Tipo de solicitud (Material / Servicio)
  - Descripción
  - Cantidad
  - Unidad de medida (UM)
  - Fecha de Entrega
  - Centro
- **RN08** RN08: El campo Almacén es:
  - Obligatorio cuando el tipo de solicitud es "Material".
  - No Aplica cuando el tipo de solicitud es "Servicio".
- **RN09** No se permiten solicitudes duplicadas cuando coinciden simultáneamente:
  - Mismo material/servicio
  - Mismo centro
  - Misma fecha de entrega

## 4. Escenarios y Criterios de Aceptación (Gherkin)

> Nota: Algunos escenarios redefinen el contexto de autenticación/estado fuera del BACKGROUND para cubrir casos negativos. 

```gherkin

Feature: Crear Solicitud de Compra 

Background:

  Given el usuario está autenticado en el sistema
  And está marcado como "Activo"
 
          @US-01 @happy @critico
          Scenario 1: Crear Solicitud de Compra con datos válidos

                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And tiene permisos al servicio y/o material que se solicitará 
                And accede al formulario de creación de solicitud de compra
                When el usuario completa los campos obligatorios y el campo opcional "Almacén" con datos válidos
                And ingresa una fecha válida (hoy o futura)
                And guarda la solicitud
                Then el sistema crea la solicitud de compra exitosamente
                And asigna automáticamente el estado inicial "Creada"

          @US-01 @happy @almacén @servicio 
          Scenario: Creación de una solicitud de servicio
            
                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And tiene permisos al servicio que se solicitará 
                And accede al formulario de creación de solicitud de compra
                When el usuario selecciona un tipo de solicitud "Servicio"
                And completa los datos obligatorios
                Then el sistema no debe mostrar el campo "Almacén" en el formulario
                And permite crear la solicitud de compra exitosamente
                And asigna automáticamente el estado inicial "Creada"

          @US-01 @happy @almacen @material
          Scenario: Crear solicitud de material con almacén informado

                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And accede al formulario de creación de solicitud de compra
                When el usuario selecciona el tipo de solicitud "Material"
                And completa todos los campos obligatorios incluyendo el campo "Almacén"
                And guarda la solicitud
                Then el sistema crea la solicitud de compra exitosamente
                And asigna automáticamente el estado inicial "Creada"

          @US-01 @negative @almacen @material
          Scenario: Intento de creación de una solicitud de material sin almacén informado
                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And accede al formulario de creación de solicitud de compra
                When el usuario selecciona un tipo de solicitud "Material"
                And completa los datos obligatorios sin informar el campo "Almacén"
                And intenta guardar la solicitud
                Then el sistema muestra un mensaje indicando que el campo "Almacén" es obligatorio para solicitudes de material
                And no se crea la solicitud
	
          @US-01 @negative @campos_obligatorio
          Scenario: Intento de creación con campos obligatorios vacíos
                       
                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And tiene permisos al servicio y/o material que se solicitará 
                And accede al formulario de creación de solicitud de compra
                When el usuario deja uno o más campos obligatorios vacíos
                And intenta guardar la solicitud de compra
                Then el sistema muestra un mensaje de validación de campos obligatorios
                And no se crea la solicitud de compra
                  
          @US-01 @negative @formato
          Scenario: Intento de creación con formato inválidos en los campos (Distintos de Cantidad)
		  
                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And tiene permisos al servicio y/o material que se solicitará 
                And accede al formulario de creación de solicitud de compra
                When el usuario ingresa un valor con formato inválido en un campo distinto de la cantidad
                And intenta guardar la solicitud de compra
                Then el sistema muestra un mensaje de validación de formato de campo
                And no se crea la solicitud de compra

          @US-01 @negative @fecha
          Scenario: Intento de creación con fecha de entrega en el pasado
          
                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro y al material o servicio
                And accede al formulario de creación de solicitud de compra
                When completa los campos obligatorios con datos válidos
                And ingresa una fecha anterior a la fecha del sistema
                And intenta guardar la solicitud de compra
                Then el sistema muestra un mensaje indicando que la fecha no puede ser pasada
                And no se crea la solicitud de compra

          @US-01 @negative @cantidad
          Scenario Outline: Intento de creación con cantidad no permitida
                
                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro y al material o servicio
                And accede al formulario de creación de solicitud de compra
                When ingresa una cantidad <cantidad_invalida> en el campo correspondiente
                And completa los demás campos obligatorios con datos válidos
                And intenta guardar la solicitud de compra
                Then el sistema muestra un mensaje indicando que la cantidad debe ser mayor que cero y con formato válido
                And no se crea la solicitud de compra

                Examples:
                    | cantidad_invalida |
                    | 0                 | 
                    | -5                |
                    | "abc"             |
	
          @US-01 @negative @rol
          Scenario: Usuario sin rol "Solicitante" intenta crear una solicitud
                        
                Given el usuario no tiene asignado el rol “Solicitante”
                When intenta acceder al formulario de solicitud de compra 
                Then el sistema bloquea el acceso a la funcionalidad
                And muestra un mensaje de acceso no autorizado
                And no se crea la solicitud de compra

          @US-01 @negative @centro
          Scenario: Usuario sin autorización para el centro intenta crear una solicitud
                      
                Given el usuario tiene asignado el rol “Solicitante”
                And no posee autorización a un centro específico
                When intenta guardar la solicitud de compra
                Then el sistema bloquea la creación de la solicitud
                And muestra un mensaje de permisos insuficientes para el centro
                And no se crea la solicitud de compra

          @US-01 @negative @duplicado
          Scenario: Intento de crear una Solicitud de Compra duplicada

                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And tiene permisos al servicio y/o material que se solicitará 
                And accede al formulario de solicitud de compra
                And existe una solicitud de compra creada previamente con el mismo material o servicio, centro y fecha de entrega 
                When el usuario intenta crear una nueva solicitud de compra con los mismos datos
                Then el sistema bloquea la creación de la nueva solicitud
                And muestra un mensaje indicando que ya existe una solicitud para el mismo material o servicio, centro y fecha de entrega
                And no se crea la nueva solicitud de compra

            @US-01 @negative @concurrencia
            Scenario: Doble intento de guardado de la misma solicitud

                Given el usuario tiene asignado el rol “Solicitante”
                And tiene permisos al centro al cual se realizará la solicitud
                And tiene permisos al servicio y/o material que se solicitará 
                And accede al formulario de solicitud de compra
                When el usuario completa el formulario con datos válidos
                And presiona el botón "Guardar" dos veces rápidamente
                Then el sistema crea una única solicitud de compra
                And no se generan registros duplicados


            @US-01 @negative @estado_usuario
            Scenario: Usuario con rol "Solicitante" pero inactivo intenta crear una solicitud
            
                Given el usuario tiene asignado el rol "Solicitante"
                And el usuario está marcado como "Inactivo"
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
            Scenario: Error técnico al guardar la solicitud de compra

                Given el usuario completa el formulario con datos válidos
                When ocurre un error técnico al guardar la solicitud
                Then el sistema muestra un mensaje genérico de error
                And no se crea la solicitud
                And no se guarda información parcial
```
## Criterios de Usabilidad (UX)

```gherkin

@UX @preventivo
Scenario: Prevención de pérdida de datos no guardados

  Given que el formulario contiene datos no guardados
  When el usuario intenta cancelar o navegar fuera del formulario
  Then el sistema muestra un mensaje de confirmación
  And el usuario puede decidir continuar o permanecer en el formulario

@UX @feedback
Scenario: Feedback visual tras creación exitosa de la solicitud

  Given la solicitud se ha guardado correctamente
  When el sistema redirige al usuario al listado de solicitudes
  Then el sistema muestra una notificación operación exitosa
  And la notificación incluye el número de documento generado
  And desaparece automáticamente después de un tiempo razonable

```
 
## 5. Consideraciones de QA

> Nota: Aplican las Consideraciones Generales QA definidas para EPIC-01
> Los formatos y límites específicos de cada campo se detallan en Consideraciones Generales QA EPIC-01.

**Tener en cuenta además qué:**

- Usuarios sin el rol Solicitante o en estado Inactivo no deben visualizar el botón "Crear Solicitud". Si intentan acceder por URL directa, el sistema debe redirigir a la página de error 403 (Acceso Denegado).
- Si el usuario selecciona tipo “Servicio“ el campo "Almacén" no deberá mostrarse en el formulario.

## 6. DoD (Definition of Done)

- Esta historia debe cumplir el DoD definido para el MVP (ver EPIC-01).
- Los criterios de Usabilidad (UX) definidos están implementados (Feedback y Confirmación)

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
