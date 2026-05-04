# Módulo: Gestión de Solicitudes de Compra (SAP MM MVP)

# 1. Introducción

El presente documento describe el Plan de Pruebas para el MVP PR Flow, específicamente del **Módulo Gestión de Solicitudes de Compras**.

Este módulo constituye el núcleo funcional del sistema y comprende las funcionalidades de creación, modificación, visualización y listado de solicitudes de compras, conforme a las reglas de negocio definidas en la **EPIC-01** y el modelo de dominio del proyecto. El plan establece el enfoque general y lineamientos que regirán el proceso de pruebas asociadas a este módulo.

# 2. Objetivo

Definir la estrategia, alcance, tipos y técnicas de pruebas que permitan verificar que el módulo cumple con:
* Los requisitos funcionales definidos.
* Las reglas de negocio establecidas.
* Las restricciones de seguridad funcional y control de acceso por centro y rol.

# 3. Alcance Funcional y Limitaciones Técnicas del Ciclo 01

Las pruebas se realizan en etapa temprana donde la lógica de seguridad y estados es experimental, dado que los Módulos de Gestión de Estados y Autenticación y Seguridad se encuentran aún en fase de desarrollo. Debido al estado actual del MVP, se adoptó una estrategia de Mocks de Identidad, que nos permite validar la robustez del backend ante intentos de acceso no autorizados por Rol, asegurando que la lógica de negocio esté protegida incluso antes de la implementación del módulo de Autenticación real. 

El objetivo de estas pruebas es validar que el flujo principal (Core) funciona correctamente bajo las reglas de negocio definidas y las consideraciones del proyecto.

## ✅ Incluido

- Validación funcional completa del módulo (UI).
- Validación de la robustez de la API y la integridad de los datos maestros.
- Validación de reglas de negocio.
- Pruebas Smoke, Regresión y Confirmación.
- Validación de performance básico.
- Pruebas de Autorización: Se validará la restricción de acciones (Crear/Modificar) mediante la simulación de roles en el header. La falta de cumplimiento de estas restricciones en la UI o API será reportada como defecto de Seguridad.
- Pruebas de Visibilidad: Se verificará la segregación de registros por Rol y Centro. Cualquier desviación donde un rol acceda a estados o datos no permitidos (ej: Aprobador viendo estado 'Creada') se documentará como un hallazgo de Privacidad.
  

## ❌ No Incluido

- Pruebas de carga, estrés o pentesting.
- Integraciones externas reales.
- Migraciones de datos
- Pruebas unitarias.
- Validación de transiciones de estado (EPIC-02), limitándose el alcance a la asignación automática del estado inicial 'Creada' al momento del guardado.
- Se excluyen pruebas de infraestructura de seguridad (AuthN), gestión de tokens y persistencia de sesión activa.

# 4. Estrategias de Prueba

## 4.1. Enfoque General

Se aplicará un enfoque combinado de:

 * **Pruebas de caja negra**
 * **Pruebas de caja gris**
 * **Priorización basada en riesgo**

## 4.2. Pruebas Funcionales

  - Flujo Principal (Creación, Listado, Visualización y Modificación)
  - Validación de interacción del usuario
  - Navegación
  - Mensajes

## 4.3. Pruebas de Seguridad (Simuladas)

  - Visibilidad por rol y centro
  - Acceso a recursos ajenos

## 4.4. API Testing

   - Endpoints (GET, POST, PATCH)
   - Status codes
   - Validación de contratos
   - Consistencia request/response
   - Validaciones de reglas de negocio a nivel de servicio (no solo UI)   

## 4.5. Database Testing

   - Validación de constraints
   - Integridad referencial
   - Persistencia
   - Reglas de negocio en DB

## 4.6. Pruebas No Funcionales (Básicas)

  - Validación de tiempos de respuesta
  - Validación manual en entorno controlado

## 4.7. Testing basado en Riesgo

### 4.7.1. Clasificación de Riesgo

**Alto Riesgo**
- Creación de solicitudes (flujo principal)
- Validación de Reglas de Negocio Críticas:
    - Duplicidad
    - Centro no Autorizado
    - Solicitud de Material sin Almacén
    - Almacén no autorizado a Centro 
- Seguridad (roles, acceso por ID ajeno)
- Persistencia

**Riesgo Medio**
- Modificación de solicitudes

**Bajo Riesgo**
- Listado de solicitudes
- Comportamiento visual de la UI
- Mensajes informativos

### 4.7.2. Priorización de Ejecución

 1. Alto riesgo
 2. Riesgo medio
 3. Bajo riesgo

# 5. Técnicas de Diseño

  - Partición de equivalencias
  - Análisis de valores límite
  - Tabla de decisiones
  - Testing exploratorio

# 6. Estrategia de Ejecución de Pruebas

## 6.1. Flujo de Ejecución

  - Ejecución priorizada por riesgo
  - Validación incremental por capas

## 6.2. Pruebas Smoke

Al inicio de cada ciclo de pruebas se ejecutarán pruebas Smoke para validar la estabilidad básica del módulo. Se verificará:

* El sistema se encuentra disponible y operativo
* El módulo carga adecuadamente.
* Los catálogos y datos maestros requeridos se encuentran disponibles (seed).
* El flujo de Creación de Solicitud (Happy Path) funciona adecuadamente.
* El Mock de autenticación (Selector de Usuarios en la UI) está disponible y funciona adecuadamente

Solo si estas pruebas son satisfactorias se continuará con la ejecución completa.

## 6.3. Pruebas Funcionales

Las pruebas funcionales se ejecutarán priorizando por riesgo e impacto en el negocio, siguiendo el siguiente orden:
*	Flujos principales (Happy Path).
*	Validación de reglas críticas de negocio.
*	Escenarios alternativos.
*	Escenarios negativos.
*	Validaciones de límites y valores extremos.

## 6.4. Testing Exploratorio

Se realizará testing exploratorio con el objetivo de identificar:
*	Inconsistencias en la experiencia de usuario.
*	Mensajes incorrectos o poco claros.
*	Comportamientos no previstos.
*	Desviaciones no contempladas en los escenarios formales.
*   Tiempos de respuesta básicos en funcionalidades críticas.   

## 6.5. Consideraciones sobre funcionalidades no implementadas

Los Módulos de Seguridad (autenticación real) y Gestión de Estados no se encuentran  implementados en este fase. Sin embargo, se consideran de **alto riesgo**, por lo que:

- Se validarán mediante mecanismos de simulación (mock de usuario, headers x-user-id)
- Se ejecutarán pruebas parciales enfocadas en la lógica de autorización y restricciones actuales por rol
- Se identifican como áreas críticas para validación futura en fases posteriores

# 7. Estrategia de datos de prueba

## 7.1. Usuarios (Mocks de Identidad)

| Rol         | Username                | Centro Autorizado | Estado  |
| ----------- | ----------------------- | ----------------- | ------- | 
| Solicitante | `eileen_solic_01`       | 1000, 2000        | Activo  | 
| Aprobador   | `aprobador_centro_1000` | 1000              | Activo  | 
| Admin (ATF) | `atf_admin_01`          | Global            | Activo  | 
| Inactivo    | `user_inactivo_01`      | 1000              | Inactivo| 


## 7.2. Datos de Negocio

  - Estados: Creada, En Revisión
  - Centros y almacenes
  - Duplicidad (Item + Centro + Fecha, estado ≠ Rechazada)

## 7.3. Datos por Campo

   - ID válido / inválido
   - Descripción (límites)
   - Cantidad (decimales, negativos, overflow)
   - Fecha (pasado/futuro/formato)
   - Unidad de medida
   - Tipo (Material vs Servicio)

## 7.4. Datos para pruebas no funcionales

   - Dataset mínimo
   - Dataset moderado   

# 8. Cobertura de Pruebas API (Endpoints)

| Endpoint              | Método | Escenario      | Status  |
| --------------------- | ------ | -------------- | ------- |
| /api/solicitudes      | POST   | Happy Path     | 201     |
| /api/solicitudes      | POST   | Validaciones   | 400     |
| /api/solicitudes      | POST   | Duplicidad     | 400     |
| /api/solicitudes      | POST   | Seguridad      | 401/403 |
| /api/solicitudes/[id] | GET    | Consulta       | 200/404 |
| /api/solicitudes/[id] | PATCH  | Modificación   | 200/400 |
| /api/catalogos        | GET    | Datos maestros | 200     |

# 9. Ambiente de Pruebas

  - UI: Navegador Chrome
  - API: Postman
  - Infraestructura: Vercel
  - DB: Prisma Studio
  - Mock Autenticación

# 10. Matriz de Trazabilidad

| US    | AC    | Escenario                                                                      | TC   | Tipo de Prueba |
| ----- | ----- | ------------------------------------------------------------------------------ | ---- | -------------- |
| US-01 | AC01  | Crear solicitud de Material exitosamente con almacén y estado inicial “Creada” | TC01 | FUNCIONAL      |
| US-01 | AC02  | Crear solicitud de Servicio exitosamente sin almacén y estado inicial “Creada” | TC02 | FUNCIONAL      |
| US-01 | AC01  | Intento de creación de Material sin Almacén                                    | TC03 | FUNCIONAL      |
| US-01 | AC03  | Crear solicitud con campos obligatorios vacíos                                 | TC04 | FUNCIONAL      |
| US-01 | AC04a | Validación de Descripción fuera de límite (mínimo)                             | TC05 | FUNCIONAL      |
| US-01 | AC04a | Validación de Descripción fuera de límite (máximo)                             | TC06 | FUNCIONAL      |
| US-01 | AC04a | Validación de Descripción con datos inválidos (basura)                         | TC07 | FUNCIONAL      |
| US-01 | AC04b | Validación de Cantidad ≤ 0                                                     | TC08 | FUNCIONAL      |
| US-01 | AC04b | Validación de Cantidad no numérica                                             | TC09 | FUNCIONAL      |
| US-01 | AC04b | Validación de Cantidad con exceso de decimales                                 | TC10 | FUNCIONAL      |
| US-01 | AC04b | Validación de Cantidad excediendo límite de enteros                            | TC11 | FUNCIONAL      |
| US-01 | AC04c | Validación de Fecha de Entrega en el pasado                                    | TC12 | FUNCIONAL      |
| US-01 | AC04c | Validación de Formato de Fecha inválido                                        | TC13 | FUNCIONAL      |
| US-01 | AC06a | Intento de creación con usuario sin rol "Solicitante"                          | TC14 | SEGURIDAD      |
| US-01 | AC06a | Intento de creación para Centro no autorizado                                  | TC15 | SEGURIDAD      |
| US-01 | AC05  | Crear solicitud con Almacén no perteneciente al Centro                         | TC16 | FUNCIONAL      |
| US-01 | AC05  | Validación de duplicidad (Ítem + Centro + Fecha, estado ≠ Rechazada)           | TC17 | FUNCIONAL      |
| US-01 | AC06b | Intento de creación con usuario INACTIVO                                       | TC18 | SEGURIDAD      |
| US-01 | AC06b | Intento de creación con usuario NO autenticado                                 | TC19 | SEGURIDAD      |
| US-01 | AC07a | Concurrencia en el guardado (doble intento)                                    | TC20 | NO FUNCIONAL   |
| US-01 | AC06b | Intento de creación con sesión expirada                                        | TC21 | SEGURIDAD      |
| US-01 | AC07a | Error técnico inesperado durante la creación                                   | TC22 | NO FUNCIONAL   |
| US-01 | AC07b | Verificación de tiempo de respuesta (< 2s) y feedback de guardado              | TC23 | NO FUNCIONAL   |

| US    | AC    | Escenario                                                       | TC   | Tipo de Prueba |
| ----- | ----- | --------------------------------------------------------------- | ---- | -------------- |
| US-02 | AC01  | Modificar solicitud exitosamente (Happy Path)                   | TC01 | FUNCIONAL      |
| US-02 | AC02a | Intentar modificar con rol no autorizado (Aprobador/Admin)      | TC02 | SEGURIDAD      |
| US-02 | AC03a | Modificar solicitud con campos obligatorios vacíos              | TC03 | FUNCIONAL      |
| US-02 | AC03b | Validación de descripción fuera de límite (mínimo)              | TC04 | FUNCIONAL      |
| US-02 | AC03b | Validación de descripción fuera de límite (máximo)              | TC05 | FUNCIONAL      |
| US-02 | AC03c | Validación de cantidad menor o igual a cero                     | TC06 | FUNCIONAL      |
| US-02 | AC03c | Validación de cantidad con formato no numérico                  | TC07 | FUNCIONAL      |
| US-02 | AC03c | Validación de cantidad con exceso de decimales (>3)             | TC08 | FUNCIONAL      |
| US-02 | AC03c | Validación de cantidad excediendo límite de enteros             | TC09 | FUNCIONAL      |
| US-02 | AC03d | Validación de fecha de entrega en el pasado                     | TC10 | FUNCIONAL      |
| US-02 | AC03d | Validación de formato de fecha inválido                         | TC11 | FUNCIONAL      |
| US-02 | AC04  | Verificar inmutabilidad de campos clave (ítem, centro, almacén) | TC12 | FUNCIONAL      |
| US-02 | AC05  | Intentar modificar solicitud con ID inexistente                 | TC13 | SEGURIDAD      |
| US-02 | AC02b | Intentar modificar solicitud perteneciente a otro usuario       | TC14 | SEGURIDAD      |
| US-02 | AC02c | Intentar modificar sin autenticación activa                     | TC15 | SEGURIDAD      |
| US-02 | AC02c | Intentar modificar con usuario en estado inactivo               | TC16 | SEGURIDAD      |
| US-02 | AC07  | Validar bloqueo por duplicidad tras modificación                | TC17 | FUNCIONAL      |
| US-02 | AC08a | Verificar restricción de edición por estado en la interfaz (UI) | TC18 | FUNCIONAL      |
| US-02 | AC08b | Verificar bloqueo de acceso directo por URL por estado          | TC19 | SEGURIDAD      |
| US-02 | AC09  | Manejo de error inesperado durante la persistencia              | TC20 | NO FUNCIONAL   |
| US-02 | AC09  | Verificación de tiempo de respuesta (Performance < 2s)          | TC21 | NO FUNCIONAL   |

| US    | AC    | Escenario                                                   | TC   | Tipo de Prueba |
| ----- | ----- | ----------------------------------------------------------- | ---- | -------------- |
| US-03 | AC01a | Visualizar solicitud propia (Creada)                        | TC01 | FUNCIONAL      |
| US-03 | AC01a | Visualizar solicitud propia (Estados finales)               | TC02 | FUNCIONAL      |
| US-03 | AC01b | Visualizar solicitud ámbito Aprobador (Revisión)            | TC03 | FUNCIONAL      |
| US-03 | AC01b | Visualizar solicitud ámbito Aprobador (Estados finales)     | TC04 | FUNCIONAL      |
| US-03 | AC01c | Visualizar solicitud como Administrador                     | TC05 | FUNCIONAL      |
| US-03 | AC02  | Detalle tipo Material (Campos mínimos)                      | TC06 | FUNCIONAL      |
| US-03 | AC02  | Detalle tipo Servicio (Sin Almacén)                         | TC07 | FUNCIONAL      |
| US-03 | AC04  | Visibilidad Dinámica de Botones de Acción (Estados Finales) | TC08 | SEGURIDAD      |
| US-03 | AC05  | Intento visualización solicitante inexistente               | TC09 | FUNCIONAL      |
| US-03 | AC03  | Intento visualización Usuario Inactivo                      | TC10 | SEGURIDAD      |
| US-03 | AC03  | Intento visualización sin autenticación (URL)               | TC11 | SEGURIDAD      |
| US-03 | AC03  | Intento visualización sin autenticación (API)               | TC12 | SEGURIDAD      |
| US-03 | AC03  | Intento visualización ID ajeno (Privacidad)                 | TC13 | SEGURIDAD      |
| US-03 | AC03  | Intento con ID formato inválido                             | TC14 | SEGURIDAD      |
| US-03 | AC03  | Intento con ID inexistente                                  | TC15 | SEGURIDAD      |
| US-03 | AC06  | Verificación de Performance (< 2s)                          | TC16 | NO FUNCIONAL   |
| US-03 | AC07  | Consistencia de datos Backend vs UI                         | TC17 | NO FUNCIONAL   |

| US    | AC    | Escenario                                                         | TC   | Tipo de Prueba |
| ----- | ----- | ----------------------------------------------------------------- | ---- | -------------- |
| US-04 | AC01a | Listar solicitudes propias como Solicitante                       | TC01 | FUNCIONAL      |
| US-04 | AC01b | Listar solicitudes en ámbito como Aprobador                       | TC02 | FUNCIONAL      |
| US-04 | AC01c | Listar todas las solicitudes como Administrador Técnico/Funcional | TC03 | FUNCIONAL      |
| US-04 | AC02  | Visualizar mensaje de listado vacío                               | TC04 | FUNCIONAL      |
| US-04 | AC03  | Verificar ordenamiento por defecto del listado                    | TC05 | FUNCIONAL      |
| US-04 | AC03  | Verificar paginación correcta del listado                         | TC06 | FUNCIONAL      |
| US-04 | AC04  | Acceder al detalle de una solicitud desde el listado              | TC07 | FUNCIONAL      |
| US-04 | AC05  | Listado de solicitudes con campos mínimos                         | TC08 | FUNCIONAL      |
| US-04 | AC06  | Intentar acceder al listado con usuario no autorizado (API)       | TC09 | SEGURIDAD      |
| US-04 | AC06  | Intentar acceder al listado con usuario no autenticado (API)      | TC10 | SEGURIDAD      |
| US-04 | AC06  | Intentar acceder al listado con usuario Inactivo (API)            | TC11 | SEGURIDAD      |
| US-04 | AC06  | Intentar acceder al listado con Sesión Expirada (API)             | TC12 | SEGURIDAD      |
| US-04 | AC06  | Intentar acceder al listado con usuario no autorizado (UI)        | TC13 | SEGURIDAD      |
| US-04 | AC06  | Intentar acceder al listado con usuario Inactivo (UI)             | TC14 | SEGURIDAD      |
| US-04 | AC06  | Intentar acceder al listado con Sesión Expirada (UI)              | TC15 | SEGURIDAD      |
| US-04 | AC07  | Validar tiempo de respuesta al cargar el listado                  | TC16 | NO FUNCIONAL   |
| US-04 | AC08  | Verificar truncamiento de descripciones largas en el listado      | TC17 | NO FUNCIONAL   |
| US-04 | AC08  | Validar consistencia del estado visualizado                       | TC18 | NO FUNCIONAL   |

# 11. Criterios de Entrada

*	Módulo disponible.
*	Los requisitos funcionales y reglas de negocio están definidos y aprobados.
*	El ambiente de pruebas está disponible y configurado.
*	Los datos de prueba necesarios han sido preparados.
*	Los casos de prueba han sido diseñados y revisados.
*	La herramienta de gestión de defectos se encuentra disponible.

# 12. Criterios de Salida

*   **90%** de cobertura de casos ejecutados.
*   **95%** umbral de aceptación.
*   **0** defectos críticos o bloqueantes abiertos.
*   **100%** de casos críticos ejecutados
*   Defectos de severidad media o baja se encuentran corregidos, diferidos o aceptados formalmente.
*	  Se hayan ejecutado pruebas de confirmación y regresión asociadas a los defectos corregidos.
*   Informe final aprobado.

# 13. Gestión de Defectos

En caso de detectarse defectos críticos bloqueantes, se suspenderá la ejecución de pruebas sobre la funcionalidad afectada hasta su corrección. Posteriormente se ejecutarán pruebas de confirmación y regresión asociadas.

## 13.1. Clasificación de Defectos

**Severidad**

- **S1/Crítica:** El sistema no cumple su función principal y no existe un workaround para continuar (ej: No se crea la solicitud cuando presionas Guardar)
- **S2/Mayor:** Fallo en una funcionalidad crítica del sistema y aún así continúa estable (ej: Fallo en regla de negocio de duplicidad y aún asi crea la solicitud).
- **S3/Menor:** Errores visuales, pero en el backend persiste todo correctamente (ej:variación de colores, desalineamiento de textos, fuentes incosistentes). 
- **S4/Trivial:** El sistema funciona correctamente y existen detalles casi "Nulos" que podrían pasar desapercibidos, pues no generan incomodidad al usuario.

**Prioridad**

- **P1-Inmediata:** Si el defecto compromete la entrega o bloquea la ejecución de las pruebas, debe solucionarse de inmediato.
- **P2-Alta** El defecto se encuentra en una funcionalidad crítica, debe solucionarse antes de terminar el Sprint.
- **P3-Media** El defecto no afecta funcionalidades o reglas de negocio críticas, no bloquea pruebas ni compromete la entrega, puede planificarse para el próximo sprint.
- **P4-Baja** El defecto entonces puede transferirse pues funcionalmente no compromete nada en el Sprint, puede solucionarse más adelante

# 14. Riesgos

## 14.1. Riesgos de Requerimientos

**Alcance No Controlado (Scope Creep)**
Cambios en reglas de negocio o funcionalidades sin actualización del plan de pruebas o cronograma, generando retrasos y retrabajo.

**Mitigación:**
- Validación y congelamiento del alcance antes de iniciar pruebas.
- Actualización del Test Plan ante cambios aprobados.

**Ambigüedad en requisitos**
Interpretación incorrecta de criterios de aceptación o reglas de negocio, especialmente en desarrollos generados por IA.

**Mitigación:**
- Revisión previa de historias y criterios antes del desarrollo.
- Refinamiento continuo y validación temprana mediante pruebas exploratorias.
- Validación de inconsistencias documentales.

## 14.2. Riesgos Técnicos

**Rendimiento insuficiente:**
El sistema puede presentar degradación en tiempos de respuesta al aumentar el volumen de datos.

**Mitigación:**
- Validación temprana de tiempos de respuesta básicos.
- Pruebas con volúmenes moderados de datos simulados.

**Calidad del código generado por IA:**
Código difícil de mantener o propenso a errores no detectados.

**Mitigación:**
- Pruebas funcionales exhaustivas.
- Regresión frecuente tras modificaciones.

**Incompatibilidad futura con integraciones externas:**
Posible dificultad al integrar el módulo con APIs o sistemas externos.

**Mitigación:**
- Documentación clara de reglas y estructuras actuales.
- Validación de consistencia de datos.

**Inconsistencia en los Datos Maestros (Seed):** 
Sin un entorno estable, los datos de prueba (Materiales/Servicios/Centros/Almacenes/Unidades de Medida) podrían cambiar durante el desarrollo, invalidando los casos de prueba ya diseñados.

**Mitigación:**
- Congelamiento de los scripts de seed al inicio de cada ciclo de pruebas.

## 14.3. Riesgos de Seguridad

**Configuración incorrecta de permisos:**
Usuarios podrían acceder a funcionalidades no autorizadas.

**Mitigación:**
- Pruebas exhaustivas por rol y estado.
- Validación cruzada de restricciones backend y frontend.

**Exposición de datos sensibles:**
Visualización indebida de solicitudes de otros usuarios.

**Mitigación:**
- Pruebas de acceso cruzado entre roles.
- Validación de filtros por centro y propietario.

**Brecha de Seguridad por Simulación:**
El uso de un selector de usuarios para simular roles podría ocultar fallos de lógica que solo aparecerían con un sistema de autenticación real.

**Mitigación:** 
- Validar manualmente la consistencia del header x-user-id en todas las capas (UI -> API -> DB).

# 15. Roles y Responsabilidades

**Líder QA**

- Definir y aprobar la Estrategia y el Plan de Pruebas.
- Supervisar el diseño y ejecución de casos de prueba.
- Gestionar riesgos de calidad.
- Aprobar el cierre del ciclo de pruebas.

**QA**

- Diseñar los casos de prueba.
- Ejecutar pruebas funcionales y no funcionales básicas.
- Reportar y dar seguimiento a defectos.
- Ejecutar pruebas de confirmación y regresión.

**Desarrollo (Dev)**

- Implementar las funcionalidades.
- Ejecutar pruebas unitarias.
- Corregir defectos reportados.
- Entregar nuevas versiones para validación.

**Product Owner (PO)**

- Validar requisitos y criterios de aceptación.
- Ejecutar o coordinar pruebas UAT.
- Aprobar la liberación del módulo.

**Scrum Master**

- Facilitar la coordinación entre equipos.
- Asegurar que el proceso de pruebas pueda ejecutarse sin impedimentos.

> Es importante destacar que el MVP se realizó por una misma persona acompañada de la IA, para agilizar, apoyar y revisar consistencia en el proceso de documentación y para la implementación de la UX. Pero se decidió reflejar los roles involucrados para ofrecer un matiz más orientado a proyectos reales.

# 16. Entregables

Como resultado del proceso de pruebas del módulo Gestión de Solicitudes de Compra se generarán los siguientes entregables:

- **Plan de Pruebas del Módulo (Test Plan).**
- **Casos de Prueba documentados.**
- **Reporte de Ejecución de Pruebas**, incluyendo estado (aprobado, fallido, bloqueado) y cobertura.
- **Registro de Defectos**, con su respectivo seguimiento y clasificación por severidad.
- **Evidencias de Prueba**, cuando aplique (capturas, logs, documentación de validación).
- **Informe Final de Pruebas**, incluyendo:
  - Resumen de ejecución.
  - Estado final de defectos.
  - Riesgo residual.
  - Recomendación de liberación.