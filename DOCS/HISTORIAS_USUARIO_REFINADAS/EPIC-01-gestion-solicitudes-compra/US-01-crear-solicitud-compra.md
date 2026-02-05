# US-01 | PR-Flow | GSC | Crear una solicitud de compra

## 1. Descripción (Cómo, Quiero, Para)
- **Cómo**: Usuario Solicitante
- **Quiero**: Crear una nueva solicitud de compra
- **Para**: Dejar registrada y trazable la necesidad de adquisición en el sistema

## 2. DoR (Definition of Ready)

- Esta historia debe cumplir el DoR definido para el MVP (ver EPIC-01).

## 3. Reglas de negocio

- **RN01**: Solo usuarios autenticados y activos pueden crear solicitudes de compra.
- **RN02**: Solo usuarios con rol _Solicitante_ pueden crear solicitudes de compra.
- **RN03**: No se permiten fechas pasadas (anteriores a la fecha del sistema).
- **RN04**: El usuario debe tener autorización sobre el centro asignado a la solicitud.
- **RN05**: La cantidad debe ser un valor mayor que cero y cumplir el formato definido.
- **RN06**: Al crear la solicitud, el sistema asigna automáticamente el estado inicial `Creada`.
- **RN07**: Los campos mínimos obligatorios de la solicitud son:
  - Tipo de solicitud (Material / Servicio)
  - Descripción
  - Cantidad
  - Fecha
  - Centro
- **RN08**:No se permiten solicitudes duplicadas cuando coinciden simultáneamente:
  - Mismo material/servicio
  - Mismo centro
  - Mismo almacén
  - Misma fecha

## 4. Escenarios y Criterios de Aceptación (Gherkin)

- Algunos escenarios redefinen el contexto de autenticación/estado fuera del BACKGROUND para cubrir casos negativos. 

```gherkin

Feature: Crear Solicitud de Compra 

Background:
Given El usuario está autenticado
And Está “Activo”


          @US-01 @happy @critico
          Scenario 1: Crear Solicitud de Compra con datos válidos (Happy Path)

                Given El usuario tiene asignado el rol “Solicitante”
                And Tiene permisos al centro al cual se realizará la solicitud
                And Tiene permisos al servicio y/o material que se solicitará 
                And Accede al formulario de creación de solicitud de compra
                When El usuario completa los campos obligatorios con datos válidos
                And Guarda la solicitud
                Then El sistema crea la solicitud de compra exitosamente
                And Asigna automáticamente el estado inicial "Creada"
	
          @US-01 @negative @campos_obligatorio
          Scenario: Intento de creación con campos obligatorios vacíos
                       
                Given El usuario tiene asignado el rol “Solicitante”
                And Tiene permisos al centro al cual se realizará la solicitud
                And Tiene permisos al servicio y/o material que se solicitará 
                And Accede al formulario de creación de solicitud de compra
                When El usuario deja uno o más campos obligatorios vacíos
                And Intenta guardar la solicitud de compra
                Then El sistema muestra un mensaje de validación de campos obligatorios
                And No se crea la solicitud de compra

          @US-01 @negative @formato
          Scenario: Intento de creación con formato inválidos en los campos
		  
                Given El usuario tiene asignado el rol “Solicitante”
                And Tiene permisos al centro al cual se realizará la solicitud
                And Tiene permisos al servicio y/o material que se solicitará 
                And Accede al formulario de creación de solicitud de compra
                When El usuario ingresa un valor con formato inválido en un campo distinto de la cantidad
                And Intenta guardar la solicitud de compra
                Then El sistema muestra un mensaje de validación de formato de campo
                And No se crea la solicitud de compra

          @US-01 @negative @fecha
          Scenario: Intento de creación con fecha requerida en el pasado
          
                Given El usuario tiene asignado el rol "Solicitante"
                And Tiene permisos al centro y al material o servicio
                And Accede al formulario de creación de solicitud de compra
                When Completa los campos obligatorios con datos válidos
                And Ingresa una fecha anterior a la fecha del sistema
                And Intenta guardar la solicitud de compra
                Then El sistema muestra un mensaje indicando que la fecha no puede ser pasada
                And No se crea la solicitud de compra

          @US-01 @negative @cantidad
          Scenario Outline: Intento de creación con cantidad no permitida
                
                Given El usuario tiene asignado el rol "Solicitante"
                And Tiene permisos al centro y al material o servicio
                And Accede al formulario de creación de solicitud de compra
                When Completa los campos obligatorios con datos válidos excepto la cantidad
                And Ingresa una cantidad <cantidad_invalida>
                And Intenta guardar la solicitud de compra
                Then El sistema muestra un mensaje indicando que la cantidad debe ser mayor que cero y con formato válido
                And No se crea la solicitud de compra

                Examples:
                    | cantidad_invalida |
                    | 0                 | 
                    | -5                |
	
          @US-01 @negative @rol
          Scenario: Usuario sin rol "Solicitante" intenta crear una solicitud
                        
                Given El usuario no tiene asignado el rol “Solicitante”
                When Intenta acceder al formulario de solicitud de compra 
                Then El sistema bloquea el acceso a la funcionalidad
                And Muestra un mensaje de acceso no autorizado
                And No se crea la solicitud de compra

          @US-01 @negative @centro
          Scenario: Usuario sin autorización para el centro intenta crear una solicitud
                      
                Given El usuario tiene asignado el rol “Solicitante”
                And No posee autorización a un centro específico
                When Intenta guardar la solicitud de compra
                Then El sistema bloquea la creación de la solicitud
                And Muestra un mensaje de permisos insuficientes para el centro
                And No se crea la solicitud de compra

          @US-01 @negative @duplicado
          Scenario: Intento de crear una Solicitud de Compra duplicada

                Given El usuario tiene asignado el rol “Solicitante”
                And Tiene permisos al centro al cual se realizará la solicitud
                And Tiene permisos al servicio y/o material que se solicitará 
                And Accede al formulario de solicitud de compra
                And Existe una solicitud de compra creada previamente con el mismo material o servicio, centro y fecha 
                When El usuario intenta crear una nueva solicitud de compra con los mismos datos
                Then El sistema bloquea la creación de la nueva solicitud
                And Muestra un mensaje indicando que ya existe una solicitud para el mismo material o servicio, centro y fecha
                And No se crea la nueva solicitud de compra

            @US-01 @negative @estado_usuario
            Scenario: Usuario con rol "Solicitante" pero inactivo intenta crear una solicitud
            
                Given El usuario tiene asignado el rol "Solicitante"
                And El usuario está marcado como "Inactivo"
                When Intenta acceder al formulario de creación de solicitud de compra
                Then El sistema bloquea el acceso a la funcionalidad
                And Muestra un mensaje indicando que el usuario no está activo
                And No se crea la solicitud de compra

            @US-01 @negative @autenticacion
            Scenario: Usuario no autenticado intenta acceder al formulario de creación
                Given El usuario no está autenticado en el sistema
                When Intenta acceder al formulario de creación de solicitud de compra
                Then El sistema redirige a la pantalla de autenticación
                And No se muestra el formulario de creación de solicitud de compra
                And No se crea la solicitud de compra
```

## 5. Consideraciones de QA

- Verificar cobertura de reglas de negocio:
  - Cada regla RN01–RN08 debe tener al menos un escenario de prueba asociado (feliz o negativo).

- Validación previa al guardado:
  - Todas las validaciones de negocio deben ejecutarse **antes** de persistir la solicitud.
  - No se debe crear ningún registro parcial si falla alguna validación.

- Revisión de mensajes de error:
  - Deben ser claros y específicos (indicar qué campo y qué regla se incumple).
  - Deben ser consistentes en tono y formato en toda la aplicación.

- Casos de borde para cantidad (RN05):
  - Cantidad = 0 → rechazo.
  - Cantidad negativa → rechazo.
  - Cantidad con demasiados decimales → comportamiento definido (rechazo o redondeo, según se diseñe).

- Casos de borde para fecha (RN03):
  - Fecha = hoy → válida.
  - Fecha = ayer → inválida (fecha pasada).
  - Fecha muy lejana en el futuro → definir si se permite o si se limita (criterio a acordar).

- Escenarios de duplicados (RN08):
  - Mismo material/servicio + mismo centro + misma fecha requerida → debe bloquear la creación por duplicado.
  - Si cambia al menos uno de los tres (por ejemplo, fecha distinta) → la creación debe permitirse.

- Roles y estado de usuario:
  - Usuario autenticado pero sin rol **Solicitante** → no debe poder crear solicitudes.
  - Usuario con rol **Solicitante** pero inactivo → no debe poder crear solicitudes.

## 6. DoD (Definition of Done)

- Esta historia debe cumplir el DoD definido para el MVP (ver EPIC-01).

## 7. Dependencias


- **EP-03 – Gestión de Usuarios y Seguridad**
  - Autenticación básica de usuarios.
  - Asignación y gestión del rol **Solicitante**.
  - Control del estado **activo/inactivo** del usuario, que condiciona la posibilidad de crear solicitudes.

- **EP-02 – Gestión del Ciclo de Vida de las Solicitudes**
  - Asignación automática del estado inicial `Creada` al crear la solicitud (US-05).

## 8. Metadatos
- **Prioridad**: Alta
- **Labels**: `PRFlow`, `GestionDeSolicitudesDeCompra`, `CrearSolicitudDeCompra`
