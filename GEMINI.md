
# Guía para IA y Colaboradores – MVP Gestión de Solicitudes de Compra (SAP MM)

# Mi contexto real

Soy una profesional con formación en Ingeniería Informática que, tras varios años fuera de la industria, está enfocada en reinsertarse en el mundo IT, específicamente en un perfil de QA Funcional, apoyada en mi experiencia y en el acompañamiento de la IA durante esta etapa de autopreparación.

Como parte de este objetivo, estoy construyendo un portafolio profesional cuyo primer hito es un MVP centrado en la gestión de solicitudes de compra inspirado en SAP MM, donde pueda evidenciarmis capacidades como QA Funcional.

# 1. Dominio de Negocio (MVP)

Gestión del Proceso de Solicitudes de Compra (Purchase Requisition – SAP MM)

📄 Descripción del dominio
Sistema orientado a la gestión del proceso previo a la compra de materiales o servicios, desde la creación de la solicitud hasta su aprobación o rechazo.

Inspirado directamente en transacciones SAP MM:
•	ME51N – Crear solicitud de compra
•	ME52N – Modificar solicitud
•	ME53N – Visualizar solicitud

## Fuera de alcance del MVP

Este MVP se centra exclusivamente en el **proceso de gestión de solicitudes de compra en SAP MM** (creación, modificación, visualización, listado y ciclo de vida básico de estados).

Para mantener el foco y evitar ampliar el alcance de forma innecesaria, quedan explícitamente **fuera de alcance**:

- Integración real con un sistema SAP productivo u otros sistemas externos.
- Procesos posteriores a la solicitud de compra (por ejemplo: pedidos de compra, recepción de mercancías, facturas, contabilidad).
- Cálculo detallado de impuestos, condiciones de precio avanzadas y escenarios contables complejos.
- Gestión completa de proveedores (alta, evaluación, segmentación, integración con portales de proveedores, etc.).
- Estrategias de release y despliegue avanzadas (CI/CD completo, pipelines complejos).
- Pruebas de rendimiento, carga o seguridad a nivel profesional (en esta fase se priorizan pruebas funcionales sobre el flujo de solicitudes de compra). 
- Sin embargo, el MVP sí incluye:
  - Validaciones básicas de seguridad funcional, tales como control de acceso por rol, restricción de visualización de recursos no autorizados (ej. 403/404), manejo seguro de sesión y no exposición de información técnica en mensajes de error.
- No se contemplan pruebas de rendimiento avanzadas tales como pruebas de carga, estrés, benchmarking o análisis de capacidad.
 - No obstante, el MVP sí establece criterios básicos de rendimiento en condiciones normales de operación (ej. tiempo máximo de carga del detalle de una solicitud de hasta 2 segundos), los cuales serán verificados mediante pruebas funcionales.

Estas áreas podrían considerarse en fases posteriores del portafolio, pero no forman parte del alcance del MVP actual.  

# 2. Módulos del Negocio (Fundamentales e Indispensables)

  - Módulo 1 (Core Funcional) : Gestión de Solicitud de Compra
  - Módulo 2: Gestión del Ciclo de Vida de la Solicitud (Estados)
  - Módulo 3: Autenticación y Roles  
  - Módulo 4: Gestión de Usuarios (Simplificado) 

# 3. Identificación de Funcionalidades (Críticas e Indispensables)

- Crear Solicitud de Compra
- Modificar Solicitud de Compra
- Visualizar Solicitud de Compra
- Listar Solicitudes de Compra
- Asignación de Estado Inicial
- Cambio de Estado de la Solicitud
- Validación de Transiciones de Estado
- Inicio de Sesión
- Control de Acceso por Rol
- Restricción de Acceso a Funcionalidades

Cada funcionalidad se detalla en historias de usuario dentro de las siguientes categorías:

   - PR-Flow | GSC: Gestión de Solicitudes de Compra.
   - PR-Flow | GE: Gestión de Estados.
   - PR-Flow | AR: Autenticación y Roles.
   - PR-Flow | USER: Gestión de Usuarios (simplificado).

# 4. Generación de primeras Historias de Usuario (v1)

    - Todas las historias tienen prioridad Alta por ser núcleo del MVP.
    - Los criterios de aceptación incluyen reglas básicas, dejando espacio para refinamiento posterior.
    - El lenguaje está pensado para ser testeable por QA y alineado a procesos SAP MM (PR).

## Resumen de Historias de Usuario del Flujo de Solicitudes de Compra (PR-Flow)

- **PR-Flow \| GSC \| Crear una solicitud de compra**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Usuario Solicitante  
    - Quiero: Crear una solicitud de compra  
    - Para: Registrar una necesidad de material o servicio  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given el usuario está autenticado  
    - And accede al formulario de creación  
    - When completa los campos obligatorios con datos válidos  
    - Then la solicitud se registra correctamente  
    - And se asigna el estado inicial "Creada"  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, GestionDeSolicitudesDeCompra, CrearSolicitudDeCompra  

- **PR-Flow \| GSC \| Modificar una solicitud de compra**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Usuario Solicitante  
    - Quiero: Modificar una solicitud de compra  
    - Para: Actualizar la información registrada  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given existe una solicitud en estado "Creada"  
    - And el usuario tiene permisos  
    - When modifica los datos permitidos  
    - Then los cambios se guardan correctamente  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, GestionDeSolicitudesDeCompra, ModificarSolicitudDeCompra  

- **PR-Flow \| GSC \| Visualizar una solicitud de compra**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Usuario  
    - Quiero: Visualizar una solicitud de compra  
    - Para: Consultar su información y estado  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given existe una solicitud registrada  
    - When el usuario accede al detalle  
    - Then el sistema muestra toda la información asociada  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, GestionDeSolicitudesDeCompra, VisualizarSolicitudDeCompra  

- **PR-Flow \| GSC \| Listar solicitudes de compra**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Usuario  
    - Quiero: Listar solicitudes de compra  
    - Para: Tener una visión general de las solicitudes registradas  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given el usuario está autenticado  
    - When accede al listado de solicitudes  
    - Then el sistema muestra las solicitudes disponibles según su rol  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, GestionDeSolicitudesDeCompra, ListarSolicitudesDeCompra  

## Resumen de Historias de Usuario de Gestión del Ciclo de Vida de la Solicitud (Estados) (PR-Flow | GE)

- **PR-Flow \| GE \| Asignar el estado inicial a la solicitud**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Sistema  
    - Quiero: Asignar el estado inicial a la solicitud  
    - Para: Garantizar el control del ciclo de vida  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given se crea una nueva solicitud  
    - When el sistema registra la solicitud  
    - Then se asigna automáticamente el estado "Creada"  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, GestionDeEstados, AsignacionDeEstadoInicial  

- **PR-Flow \| GE \| Cambiar el estado de la solicitud**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Usuario Autorizado  
    - Quiero: Cambiar el estado de la solicitud  
    - Para: Reflejar su avance en el proceso  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given la solicitud está en un estado válido  
    - And el usuario tiene permisos  
    - When solicita el cambio de estado permitido  
    - Then el estado se actualiza correctamente  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, GestionDeEstados, CambioDeEstado  

- **PR-Flow \| GE \| Validar las transiciones de estado**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Sistema  
    - Quiero: Validar las transiciones de estado  
    - Para: Evitar cambios no permitidos  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given la solicitud tiene un estado actual  
    - When se intenta una transición no válida  
    - Then el sistema bloquea el cambio y mantiene el estado  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, GestionDeEstados, ValidarTransicionesDeEstado  

## Resumen de Historias de Usuario de Autenticación y Roles (PR-Flow | AR)

- **PR-Flow \| AR \| Iniciar sesión en el sistema**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Usuario  
    - Quiero: Iniciar sesión en el sistema  
    - Para: Acceder a las funcionalidades disponibles  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given el usuario está en la pantalla de login  
    - When ingresa credenciales válidas  
    - Then el sistema permite el acceso  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, AutenticacionYRoles, InicioDeSesion  

- **PR-Flow \| AR \| Controlar el acceso por rol**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Sistema  
    - Quiero: Controlar el acceso por rol  
    - Para: Restringir funcionalidades según permisos  
  - **Criterios de Aceptación (Gherkin)**:  
    - Given el usuario ha iniciado sesión  
    - When accede a una funcionalidad  
    - Then el sistema permite o bloquea el acceso según su rol  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, AutenticacionYRoles, ControlDeAccesoPorRol  

## Resumen de Historias de Usuario de Gestión de Usuarios (PR-Flow | USER)

- **PR-Flow \| USER \| Dar de alta un usuario**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Administrador  
    - Quiero: Dar de alta un usuario  
    - Para: Permitir el acceso al sistema  
  - **Criterios de Aceptación (Given–When–Then)**:  
    - Given el administrador accede al formulario  
    - And completa los datos obligatorios  
    - When guarda el registro  
    - Then el usuario se crea correctamente  
  - **Prioridad**: Alta  
  - **Labels**: PRFlow, UsuariosSimplificado, AltaDeUsuario  

- **PR-Flow \| USER \| Consultar usuarios registrados**  
  - **Descripción (Cómo, Quiero, Para)**:  
    - Cómo: Administrador  
    - Quiero: Consultar usuarios registrados  
    - Para: Visualizar los usuarios del sistema  
  - **Criterios de Aceptación (Given–When–Then)**:  
    - Given existen usuarios registrados  
    - When accede al listado  
    - Then el sistema muestra los usuarios disponibles  
  - **Prioridad**: Media  
  - **Labels**: PRFlow, UsuariosSimplificado, ConsultaDeUsuarios  

# 5. Roles y responsabilidades (MVP)

Roles principales definidos:

- **Solicitante**  
  Crea y gestiona sus propias Solicitudes de Compra.
- **Aprobador**  
  Revisa y decide sobre las solicitudes (Aprobar / Rechazar) según el flujo de estados.
- **Administrador Técnico/Funcional**  
  Gestiona usuarios y roles (alta, consulta, edición básica) y da soporte al sistema.

Las reglas detalladas de cada rol y sus permisos se encuentran en:

- `DOCS/MODELO-DOMINIO/modelo-dominio-epic-01.md`

# 6. DoR y DoD (nivel MVP)

## Definition of Ready (DoR) – Global

Una Historia de Usuario se considera **Ready** cuando:

- Las reglas de negocio asociadas están claramente definidas.
- Los criterios de aceptación están completos y son verificables.
- Se han identificado escenarios negativos y casos de validación básicos.
- Las dependencias funcionales con otros módulos/historias están indicadas.
- El alcance está alineado con el MVP (no incluye funcionalidades futuras/avanzadas).

Si algo de esto no se cumple, la historia permanece en **Refinamiento**.

## Definition of Done (DoD) – Global

Una Historia de Usuario se considera **Done** cuando:

- La funcionalidad cumple lo definido en la épica y la US.
- Las reglas de negocio están documentadas y aplicadas.
- Los campos obligatorios se validan correctamente.
- Los criterios de aceptación están implementados y cubiertos.
- Existen escenarios funcionales en Gherkin (al menos uno feliz y uno negativo).
- No hay defectos funcionales críticos abiertos.
- No se introduce funcionalidad fuera del alcance del MVP.

Los matices específicos por épica están en cada archivo de `DOCS/EPICS`.

# 7. Enfoque de QA y Shift-Left Testing

Este proyecto prioriza QA desde el inicio:

- Cada US incluye:
  - Reglas de negocio.
  - Criterios de aceptación en Gherkin (Given–When–Then).
  - Consideraciones QA (casos negativos, bordes, coherencia de datos).
- La implementación debe:
  - Respetar estas reglas y criterios.
  - Incluir validaciones de negocio antes del guardado.
  - Evitar estados o datos inconsistentes (especialmente en estados y seguridad).

Cuando la IA proponga cambios, se espera que:

1. Verifique el impacto en reglas de negocio y estados.
2. Sugiera escenarios de prueba alineados con los criterios de aceptación.
3. Señale posibles huecos de cobertura o riesgos.
4. La IA debe evitar introducir cambios que amplíen el alcance funcional del MVP sin validarlo explícitamente conmigo.

# 8. Convenciones de git para este proyecto

## Rama principal

 - `main`  
  Debe contener solo documentación y funcionalidad aceptada para el MVP.

  Estructura esperada (alto nivel):

  - `DOCS/`
   - `API/`
   - `EPICS/`
   - `HISTORIAS_USUARIO_REFINADAS/`
   - `MODELO-DOMINIO/`
   - `QA/`
  - `README.md`
  - `GEMINI.md`

### Mensajes de commit

Formato sugerido:

| Tipo      | Cuándo usarlo                 |
| ----------| ------------------------------|
| `docs`    | Cambios en documentación      |
| `feat`    | Nuevo contenido funcional     |
| `qa`      | Escenarios, criterios, pruebas|
| `refactor`| Mejora sin cambiar alcance    |
| `chore`   | Orden, estructura, limpieza   |


- `docs: agregar EPICs finalizadas del MVP SAP-MM`
- `chore: inicializar documentación base del proyecto`
- `refactor: mejorar redacción y consistencia de US y EPICs`
- etc.

## Ramas por EPICAS

Formato sugerido:

- `feature/EPIC-01-refinar-historias-usuario`
- `feature/EPIC-02-refinar-historias-usuario`
- `feature/EPIC-03-refinar-historias-usuario`
- etc.

Cada rama se asocia a una Epica concreta (EPIC-XX) definida en las épicas y en Jira.

### Mensajes de commit

Formato sugerido:

- `feat: documentar EPIC-01 creación de solicitud de compra`
- `feat: documentar EPIC-02 gestión de estados`
- `feat: documentar EPIC-03 gestión de usuarios y seguridad`


Reglas:

- Cada commit debe tener un objetivo pequeño y claro.
- Siempre que sea posible, debe referenciar la EPIC correspondiente (EPIC-XX).
- Evitar commits tipo “cambios varios” sin contexto.

# 9. Flujo de trabajo por Historia de Usuario

Para cada US (ej. **US-01 | Crear Solicitud de Compra**):

1. **Refinamiento**
   - Verificar DoR global.
   - Completar reglas de negocio, criterios de aceptación (Gherkin) y consideraciones QA.

2. **Plan técnico (alto nivel)**
   - Identificar bloques:
     - Modelo/datos,
     - UI/formularios,
     - Validaciones,
     - Persistencia (real o simulada),
     - Estados y seguridad si aplica.

3. **Implementación en git**
   - Crear rama:  
     `git checkout -b feature/US-01-crear-solicitud-compra`
   - Hacer commits pequeños, alineados con pasos funcionales (modelo, UI, validaciones, etc.).

4. **Verificación**
   - Ejecutar los escenarios Gherkin definidos para la US (felices y negativos).
   - Revisar que no se rompan reglas globales (estados, seguridad).

5. **Integración**
   - Al finalizar, fusionar la rama en `main` una vez que la US cumple el DoD.

# 10. Cómo debe colaborar la IA en este proyecto

Cuando se pida ayuda a la IA, se espera que:

1. **Al trabajar con Historias de Usuario**
   - Revise y mejore:
     - Descripción (Cómo, Quiero, Para).
     - Reglas de negocio.
     - Criterios de aceptación (Gherkin).
     - Consideraciones QA.
   - Proponga:
     - Tareas técnicas derivadas.
     - Casos de prueba adicionales o de borde.

2. **Al trabajar con código**
   - Respete siempre:
     - Las reglas de negocio definidas en las épicas.
     - El modelo de estados de la solicitud.
     - Las reglas de seguridad y roles del MVP.
     - Siempre que use reglas de negocio o de estados, la IA debe indicar de qué épica o documento (`DOCS/EPICS/...`) las está tomando.
   - Sugiera:
     - Refactors que mejoren claridad sin cambiar reglas funcionales.
     - Validaciones y controles adicionales si detecta huecos.
  
3. **Al trabajar con git**
   - Proponga nombres de ramas y mensajes de commit siguiendo las convenciones anteriores.
   - Ayude a dividir cambios grandes en commits lógicos.

Lenguaje preferido para las respuestas de la IA: **español**, tono técnico y conciso.