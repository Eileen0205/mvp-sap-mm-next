# REPORTE DE DEFECTOS EPIC-01 

## Objetivo

Documentar los hallazgos obtenidos en esta primera iteración de pruebas en el MVP PR Flow, específicamente en el Módulo Core: Gestión de Solicitudes de Compra, evaluando la calidad del sistema bajo criterios funcionales y no funcionales básicos, y determinando su nivel de aceptación para un entorno controlado.

## Alcance

- EPIC-01: Gestión de Solicitudes de Compra
- US-01: Crear solicitud
- US-02: Modificar solicitud
- US-03: Visualizar solicitud
- US-04: Listar solicitudes

## Resumen de Ejecución

Los resultados obtenidos reflejan una alta densidad de defectos, que comprometen la integridad y seguridad del sistema.

**Cobertura de criterios de aceptación:** 100%

| Historia de Usuario (HU)        | TCs Ejecutados | TCs Pass | TCs Fail |TCs BLOCKED | % Éxito (Yield) |                    
| :------------------------------ | :------------: | :------: | :------: |:---------- | :-------------: |                    
| US-01 | Crear Solicitud         | 21             | 13       | 8        | 1          | 62%             |  
| US-02 | Modificar Solicitud     | 20             | 12       | 8        | 1          | 60%             |      
| US-03 | Visualizar Solicitud    | 14             | 10       | 4        | 1          | 71%             |                    
| US-04 | Listar Solicitudes      | 16             | 14       | 2        | 2          | 88%             |                    
| **TOTALES**                     | **71**         | **49**   | **22**   | **5**      | **69%**         | 

**Distribución de Defectos (Severidad):**

- 6 críticos (Seguridad y Privacidad)
- 13 mayores (Robustez e Integridad)
- 3 menores (Usabilidad)

## 2. Listado de defectos

> **Para el caso de estudio** Se documentaron 10 bugs de los 22 detectados como muestra de un trabajo en entorno real.

| ID | Título | Severidad | Estado |
| :--- | :--- | :--- | :--- |
| BUG-US-01-01 | Ausencia de feedback de éxito en creación | Menor | Abierto |
| BUG-US-01-02 | Bloqueo de duplicidad sobre solicitudes Rechazadas | Mayor | Abierto |
| BUG-US-01-03 | Corrupción de fechas por Timezone Shift (UI vs DB) | Mayor | Abierto |
| BUG-US-01-04 | Truncamiento silencioso de cantidades alfanuméricas | Mayor | Abierto |
| BUG-US-01-05 | Redondeo automático no autorizado de cantidades | Mayor | Abierto |
| BUG-US-02-06 | Permite fechas pasadas en modificación (Regresión) | Mayor | Abierto |
| BUG-US-02-07 | Inconsistencia de métodos PATCH/PUT en API | Menor | Abierto |
| BUG-US-02-08 | Modificación permitida con usuarios INACTIVOS | Crítica | Abierto |
| BUG-US-03-09 | Acceso IDOR: Aprobador visualiza centros no autorizados | Crítica | Abierto |
| BUG-US-04-10 | Falta de controles de paginación en el listado | Menor | Abierto |

Los niveles de severidad han sido asignados en base a los criterios definidos en el Plan de Pruebas (impacto en negocio, seguridad e integridad de datos).

## 3. Detalle de bugs

**ID**: BUG-US-01-01
**Módulo**: US-01 – Crear Solicitud
**Título**: No se muestra mensaje de "Éxito" al finalizar la creación, simplemente se redirige al listado automáticamente.
**Severidad**: Menor 
**Prioridad**: Alta
**Tipo**: UX
**Estado**: Abierto

**Pasos para reproducir**

1. Crear una solicitud de compra con datos válidos
2. Presionar Guardar

**Resultado Esperado**

UI:
1. Se debe mostrar un spinner en el botón "Crear Solicitud" mientras se procesa la transacción.
2. Se debe mostrar un mensaje de éxito "Solicitud creada exitosamente" antes de redireccionar al usuario a una nueva pantalla.

API:
3. El Status Code debe ser 201 Created.

**Resultado Obtenido**

UI:
1. Se crea la solicitud exitosamamente sin mostrar feedback al usuario.
2. Se redirige al usuario automáticamente al listado de solicitudes.

API:
1. Status Code 201 en el response.

**Evidencia**

- Se adjuntan captura y video de la UI

**Impacto**

- Sensación de transacción no completada.
- Riesgo de Duplicidad por UX deficiente.

**ID**: BUG-US-01-02
**Módulo**: US-01 – Crear Solicitud
**Título**: Bloqueo incorrecto de duplicidad cuando la solicitud previa está en estado Rechazada
**Severidad**: Mayor
**Prioridad**: Alta
**Tipo**: Funcional
**Estado**: Abierto
**Regla de Negocio afectada**: RN10-Lógica de duplicidad

**Pasos para reproducir**

1. Crear una solicitud de compra con los datos:
    - ItemComprable: MAT-0001
    - Centro: 2000
    - Fecha: 07/06/2026
2. Cambiar el estado de la solicitud a "Rechazada" mediante la API correspondiente
3. Crear una nueva solicitud con los mismos datos
4. Presionar Guardar

**Resultado Esperado**

UI:
1. Se debe permitir la creación de la solicitud.
2. Se debe mostrar un mensaje de éxito "Solicitud creada exitosamente".
3. No debe considerar duplicadas solicitudes en estado "Rechazada".

API:
1. Status Code 201

**Resultado Obtenido**

UI:
1. No se crea la solicitud.
2. Mensaje al usuario: "Ya existe una solicitud activa para el mismo ítem, centro y fecha de entrega."

API:
1. Status Code 400
2. Mensaje de error: "Ya existe una solicitud activa para el mismo ítem, centro y fecha de entrega."

**Evidencia**

- Se adjuntan capturas de la UI.
- (Postman / API):

**Request** 
{
 "tipo": "MATERIAL",
 "itemComprableId": "MAT-0001",
 "descripcion": "Test de Duplicidad",
 "cantidad": "12",
 "unidadMedida": "HRS",
 "fechaEntrega": "07/06/2026",
 "centro": "2000",
 "almacen": "ALM3"
}

**Response**
{
    "success": false,
    "error": "Ya existe una solicitud activa para el mismo ítem, centro y fecha de entrega."
}

**Impacto**

- Incumple regla de negocio crítica.
- Interrupción del flujo de reabastecimiento.
- Degradación en la experiencia de usuario (UX).

**ID**: BUG-US-01-03
**Módulo**: US-01 – Crear Solicitud
**Título**: Corrupción silenciosa de fechas: Discrepancia entre Respuesta de API y Persistencia en BD
**Severidad**: Mayor 
**Prioridad**: Alta
**Tipo**: Datos/Integridad
**Estado**: Abierto

**Pasos para reproducir**

1. Crear una solicitud de compra con fecha: 08/06/2026.
2. Abre DevTools y luego presiona "Crear Solicitud".

**Resultado Esperado**

1. El valor persistido en la base de datos debe reflejar la fecha seleccionada por el usuario en la UI en formato UTC, sin sufrir desfases por la zona horaria del servidor.

**Resultado Obtenido**

1. Observa que la fecha en el response se corresponde con la fecha en la UI (Resultado: 8/6/2026)
2. Consultar directamente el registro en la base de datos (Prisma/SQL). (Resultado: 2026-06-07T22:00:00.000Z)
3. El sistema enmascara en el frontend un error de persistencia. Mientras que la API confirma la fecha del frontend, en la base de datos se almacena la fecha del día anterior debido a una conversión incorrecta de zona horaria local a UTC.

**Evidencia**

- Se adjuntan capturas correspondientes

**Impacto**

- Impacta directamente en la lógica de negocio de Duplicidad.
- Errores en la planificación de compras.
- Incosistencias en auditorías.

**ID**: BUG-US-01-04
**Módulo**: US-01 – Crear Solicitud
**Título**: Procesamiento incorrecto del campo cantidad: el sistema trunca valores alfanuméricos en lugar de validarlos
**Severidad**: Mayor 
**Prioridad**: Alta
**Tipo**: Datos/Integridad
**Estado**: Abierto
**Regla de Negocio afectada**: RN04: Validación de campo cantidad

**Pasos para reproducir**

1. Crear una solicitud de compra en Postman, con cantidad = 18AB5
2. Envía la solicitud

**Resultado Esperado**

1. En el campo cantidad debe aparecer el mensaje de validación correspondiente a la regla y formato definido en el negocio:
   - No se permiten caracteres alfanuméricos
2. Se debe deshabilitar el botón "Crear solicitud"

**Resultado Obtenido**

1. El sistema acepta letras y símbolos combinados con números al inicio.
2. La solicitud se crea con el valor numérico inicial truncando el resto de caracteres de manera silenciosa y sin notificar al usuario.
3. No se dispara la validación correspondiente OnBlur.
4. La solicitud persiste en base de datos con un valor parcial y rompiendo la integridad del dato.(Ej.10AB1 -> 10).

**Evidencia**

- (Postman / API)

**Request** 

{
 "tipo": "MATERIAL",
 "itemComprableId": "{{mat_id_seed}}",
 "descripcion": "{{descripcion_material}}",
 "cantidad": "10AB1",
 "unidadMedida": "{{unidad_medida_mat_seed}}",
 "fechaEntrega": "{{fecha_futura_aleatoria}}",
 "centro": "{{centro_seed}}",
 "almacen": "{{almacen_seed}}"
 }

**Response**

{
    "success": true,
    "data": {
        "id": "PR-2026-0099",
        "tipo": "MATERIAL",
        "descripcion": "Solicitud de MATERIAL desde API jp1p2s",
        "cantidad": "10",
        "fechaCreacion": "2026-04-16T17:11:23.582Z",
        "fechaEntrega": "2026-04-28T00:00:00.000Z",
        "estado": "Creada",
        "usuarioId": "b7641ae3-52db-4ac6-abe1-ccc3e09c9b0b",
        "centroId": "2000",
        "almacenId": "ALM3",
        "materialId": "MAT-0001",
        "servicioId": null,
        "unidadMedidaId": "KG"
    },
    "error": null
}

**ID**: BUG-US-01-05
**Módulo**: US-01 – Crear Solicitud
**Título**: Redondeo automático no autorizado de cantidades con exceso de decimales permitidos
**Severidad**: Mayor 
**Prioridad**: Alta
**Tipo**: Datos/Integridad
**Estado**: Abierto
**Regla de Negocio afectada**: RN04: Validación de campo cantidad

**Pasos para reproducir**

1. Crear una solicitud de compra en Postman, con cantidad = 145.3549
2. Envía la solicitud

**Resultado esperado**

UI:
1. El sistema debe mostrar validación OnBlur 
2. El sistema debe rechazar el dato por exceso de precisión o solicitar confirmación de redondeo.

API:

1. Status Code 400
2. Mensaje de error correspondiente

**Resultado Obtenido**

UI:

1. El sistema no muestra validación OnBlur en el campo correspondiente. 
2. El sistema guarda el valor redondeado (145.355) silenciosamente en la base de datos sin autorización y notificación del usuario.
3. Consultar directamente el registro en la base de datos (Prisma/SQL):
    - Resultado: 145.355

API:

1. Status Code 201
2. Solicitud persiste en la base de datos 

**Evidencias**

**Request**
{
 "tipo": "MATERIAL",
 "itemComprableId": "{{mat_id_seed}}",
 "descripcion": "{{descripcion_material}}",
 "cantidad": "145.3549",
 "unidadMedida": "{{unidad_medida_mat_seed}}",
 "fechaEntrega": "{{fecha_futura_aleatoria}}",
 "centro": "{{centro_seed}}",
 "almacen": "{{almacen_seed}}"
 }

**Response**
{
    "success": true,
    "data": {
        "id": "PR-2026-0100",
        "tipo": "MATERIAL",
        "descripcion": "Solicitud de MATERIAL desde API 0rpepm",
        "cantidad": "145.355",
        "fechaCreacion": "2026-04-16T18:09:21.483Z",
        "fechaEntrega": "2026-05-12T00:00:00.000Z",
        "estado": "Creada",
        "usuarioId": "b7641ae3-52db-4ac6-abe1-ccc3e09c9b0b",
        "centroId": "2000",
        "almacenId": "ALM3",
        "materialId": "MAT-0001",
        "servicioId": null,
        "unidadMedidaId": "KG"
    },
    "error": null
}

**Impacto para BUG-04 y BUG-05**

- Incumple regla crítica de negocio.
- Afectaciones en los stocks derivados de las cantidades solicitadas.
- Afectaciones en cálculos para formalizar pedidos de ofertas, realizar licitaciones y para la facturación en el negocio.
- Decisiones de compras basadas en datos corruptos.

**ID**: BUG-US-02-06
**Módulo**: US-02 – Modificar Solicitud
**Título**: Permite modificar solicitudes con valores de fechas pasadas (Regresión)
**Severidad**: Mayor 
**Prioridad**: Alta
**Tipo**: Datos/Integridad
**Estado**: Abierto
**Regla de Negocio afectada**: RN07: Validación de fecha en el pasado


**Pasos para reproducir**

1. Seleccionar una solicitud en estado "Creada"
2. Enviar una petición PUT en Postman, con fecha de entrega = 12/02/2026

**Resultado Esperado**

1. No se debe permitir la modificación. 
2. El response debe incluir un Status Code: 400 con un mensaje de error: "No se permiten fechas pasadas".

**Resultado Obtenido**

1. Status Code 201, lo que evidencia la transacción exitosa.
2. La solicitud persiste en base de datos con valores no permitidos.

**Evidencia**

- (Postman / API)

**Request** 
{
    "descripcion": "Fecha Pasada",
    "cantidad": "500",
    "unidadMedida": "KG",
    "fechaEntrega": "12/02/2026"
}

**Response**

{
    "success": true,
    "data": {
        "id": "PR-2026-0092",
        "tipo": "MATERIAL",
        "descripcion": "Fecha Pasada",
        "cantidad": "500",
        "fechaCreacion": "2026-04-16T15:20:17.710Z",
        "fechaEntrega": "2026-02-12T00:00:00.000Z",
        "estado": "Creada",
        "usuarioId": "b7641ae3-52db-4ac6-abe1-ccc3e09c9b0b",
        "centroId": "2000",
        "almacenId": "ALM3",
        "materialId": "MAT-0001",
        "servicioId": null,
        "unidadMedidaId": "KG"
    }
}

**Impacto**

- Sensación de incumplimiento de las entregas de proveedores.
- Riesgos de transiciones de estados no permitidas o erróneas.
- Inconsistencias en auditorías y reportes futuros.

**ID**: BUG-US-02-07
**Módulo**: US-02 – Modificar Solicitud
**Título**: El endpoint de modificación con el método PATCH solo permite edición de estados, se implementó para la modificación el método PUT
**Severidad**: Baja 
**Prioridad**: Media
**Tipo**: Funcional/Arquitectura
**Estado**: Abierto

**Pasos para reproducir**

1. Envía una petición con el método PATCH para modificar la descripción y la cantidad de una solicitud. 
   - Descripción: Validar Modificación
   - Cantidad: 500

**Resultado Esperado**

1. Status Code 201

**Resultado Obtenido**

1. Status code 400
2. Mensaje de error: "Transición de estado no permitida: EnRevision -> undefined"

**Evidencia**

**Request**
{
   "descripcion" : " Validar Modificación",
   "cantidad": "500"
}

**Response**
{
    "success": false,
    "error": "Transición de estado no permitida: EnRevision -> undefined"
}
**Impacto**

- Inconsistencia en el uso, pues es frontend está utilizando dos métodos para una misma función.
- Se rompe flexibilidad al definir el método PATCH exclusivamente para modificar estados, cuando la modificación definida para las solicitudes es reducida a un número mínimo de campos.

**ID**: BUG-US-02-08
**Módulo**: US-02 – Modificar Solicitud
**Título**: El endpoint de modificación (PUT) permite edición con usuarios en estado "INACTIVO"
**Severidad**: Crítica 
**Prioridad**: Alta
**Tipo**: Seguridad
**Estado**: Abierto

**Pasos para reproducir**

1. Envía una petición PUT y utiliza en el header el x-user-id del usuario "Inactivo" en la base de datos 
   - Descripción: Validar Modificación con Usuario Inactivo
   - Cantidad: 500
   - Unidad de Medida: KG
   - Fecha de Entrega: 20/06/2026

**Resultado Esperado**

1. Status Code 403
2. Mensaje de error: "Cuenta inhabilitada, contacte con Soporte"

**Resultado Obtenido**

1. Status Code 200

**Evidencia**

**Request**

{
    "descripcion": "Validar con Usuario Inactivo",
    "cantidad": "500",
    "unidadMedida": "KG",
    "fechaEntrega": "20/06/2026"
}

**Response**

{
    "success": true,
    "data": {
        "id": "PR-2026-0058",
        "tipo": "MATERIAL",
        "descripcion": "Validar con Usuario Inactivo",
        "cantidad": "500",
        "fechaCreacion": "2026-04-13T13:27:20.204Z",
        "fechaEntrega": "2026-06-20T00:00:00.000Z",
        "estado": "Creada",
        "usuarioId": "5757e0fb-0201-4023-aefd-cc6f613e74b3",
        "centroId": "1000",
        "almacenId": "ALM1",
        "materialId": "MAT-0001",
        "servicioId": null,
        "unidadMedidaId": "KG"
    }
}

**Impacto**
- Incumplimiento de lógica de negocio en el control de acceso no autorizado.
- Riesgo de Seguridad y fraude por suplantación de identidad, que afectan directamente:
  - Pedidos de ofertas, stock de inventarios, licitaciones.
  - Auditorías con resultados no confiables.
  - Impacto en gastos y presupuestos.

**ID**: BUG-US-02-09
**Módulo**: US-03 – Visualizar Solicitud
**Título**: El endpoint de Visualización get/solicitudes/[id] permite que el Aprobador vea el detalle de solicitudes fuera de su ámbito de aprobación (por estado y centro) 
**Severidad**: Crítica
**Prioridad**: Alta
**Tipo**: Seguridad
**Estado**: Abierto
**Regla de Negocio Afectada**: RN04 Ámbito de aprobación del aprobador

**Pasos para reproducir**

1. Enviar petición al endpoint get/solicitudes/[id] con la combianción:
   - x-user-id: User Aprobador
   - Id: PR-2026-0021
   - Estado de la solicitud "Creada"
   - Centro no autorizado para el aprobador (Ej.: 2000)

**Resultado Esperado**

1. Status Code 403
2. Mensaje de error: "No tiene permisos para ver los detalles de esta solicitud"

**Resultado Obtenido**

1. Status Code 200
2. Se obtiene la data de la solicitud en estado "Creada" y perteneciente al Centro: 2000 no autorizado al aprobador 

**Evidencia**

**Response**
{
    "success": true,
    "data": {
        "id": "PR-2026-0021",
        "tipo": "MATERIAL",
        "descripcion": "Error Técnico 500",
        "cantidad": 1234,
        "fechaCreacion": "9/4/2026",
        "fechaEntrega": "8/9/2026",
        "estado": "Creada",
        "usuarioId": "b7641ae3-52db-4ac6-abe1-ccc3e09c9b0b",
        "centroId": "2000",
        "almacenId": "ALM3",
        "materialId": "MAT-0002",
        "servicioId": null,
        "unidadMedidaId": "UN",
        "centro": {
            "id": "2000",
            "nombre": "Centro de Producción Norte"
        },
        "almacen": {
            "id": "ALM3",
            "nombre": "Almacén Planta Norte 2000",
            "centroId": "2000"
        },
        "material": {
            "id": "MAT-0002",
            "nombre": "Pintura Epóxica Gris",
            "descripcion": "Pintura para suelos industriales"
        },
        "servicio": null,
        "unidadMedida": {
            "id": "UN",
            "nombre": "Unidades"
        },
        "usuario": {
            "nombre": "Eileen Solicitante QA",
            "id": "b7641ae3-52db-4ac6-abe1-ccc3e09c9b0b"
        },
        "itemComprableNombre": "Pintura Epóxica Gris",
        "usuarioSolicitante": "Eileen Solicitante QA"
    }
}

**Impacto**

- Incumplimiento de la lógica del negocio de Control de Acceso por rol y ámbito (RBAC).
- Falla de seguridad (IDOR) que permite que un usuario con rol Aprobador tenga acceso a recursos no autorizados, violando la confidencialidad de la información.
- Riesgo de fuga de datos críticos y confidenciales del negocio.

**ID**: BUG-US-02-10
**Módulo**: US-04 – Listar Solicitudes
**Título**: Falta de controles de paginación en el listado de solicitudes
**Severidad**: Baja
**Prioridad**: Media
**Tipo**: UX
**Estado**: Abierto

**Pasos para reproducir**

1. Acceder al listado de solicitudes del usuario Administrador Técnico/Funcional

**Resultado Esperado**

1. Deben cargar las primeras 25 solicitudes.
2. Se deben habilitar el botón "Siguiente" y a partir de la segunda página el botón "Anterior"
3. La última página debe deshabilitar el botón siguiente.

**Resultado Obtenido**

1. Se muestra el listado de más de 25 solicitudes.
2. No existen los controles de paginación "Siguiente" y "Anterior"

**Evidencia**

- Se adjuntan capturas de la UI

**Impacto**

- Degradación de la experiencia de usuario en la medida en que aumentan las solicitudes en el sistema.
- Riesgo de Performance en la carga de listado.
- Sobrecarga innecesaria en el sistema.


## 4. Análisis global y Conclusión

Los defectos identificados revelan una **vulnerabilidad estructural en la arquitectura de seguridad y validación**. Se observan validaciones del Frontend que no fueron implementadas en la API (Backend), la cual ha quedado expuesta a inyecciones de datos inválidos y accesos no autorizados.

**Conclusión del Equipo de QA:**

El módulo **NO ES APTO para el paso a producción**. Se requiere un rediseño prioritario de la capa de autorización (filtros de usuario en base de datos) y un refuerzo en el manejo de excepciones de la API antes de proceder con un nuevo ciclo de pruebas.

