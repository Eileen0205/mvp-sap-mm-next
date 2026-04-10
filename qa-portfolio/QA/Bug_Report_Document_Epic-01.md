# BUG REPORT DOCUMENT FOR EPIC-01

## 1. Resumen

Durante la ejecución de pruebas funcionales del módulo de Solicitudes de Compra (EPIC-01), se identificaron 5 defectos:

- 2 críticos (Seguridad y Privacidad)
- 2 mayores (Robustez e Integridad)
- 1 menor (Usabilidad/Consistencia)

Los defectos más relevantes están relacionados con la falta de validaciones preventivas en el Backend y la ausencia de filtros de autorización (RBAC) en la capa de persistencia, lo que compromete la integridad del sistema SAP MM MVP.

## 2. Listado de defectos

| ID   | Título                                      | Severidad | Estado  |
| ---- | ------------------------------------------- | --------- | ------- |
| B-01 | Exposición de solicitudes ajenas (Privacy)  | Crítica   | Abierto |
| B-02 | Aprobador puede crear solicitudes (RBAC)    | Crítica   | Abierto |
| B-03 | Error 500 ante descripción larga (>40 char) | Mayor     | Abierto |
| B-04 | Redondeo automático de decimales            | Mayor     | Abierto |
| B-05 | Inconsistencia de formato de fecha (GET)    | Menor     | Abierto |

## 3. Detalle de bugs

### Bug B-01 – Exposición de solicitudes ajenas (Data Leakage)
**Descripción:** El endpoint de listado no filtra los resultados por el usuario en sesión, permitiendo que cualquier solicitante visualice las solicitudes de otros usuarios.
**Pasos:**
1. Autenticarse como Usuario A (Solicitante).
2. Crear una solicitud de materiales.
3. Cambiar identidad a Usuario B (Solicitante).
4. Ejecutar `GET /api/solicitudes`.
**Resultado esperado:** El Usuario B solo debe ver sus registros propios (o de su centro autorizado).
**Resultado actual:** El sistema devuelve la lista completa de la base de datos, incluyendo la solicitud del Usuario A.
**Impacto:** Crítico. Vulneración de la privacidad de datos transaccionales y falta de cumplimiento de Reglas de Negocio de visibilidad.

### Bug B-02 – Aprobador puede crear solicitudes (Fallo de RBAC)
**Descripción:** El sistema no restringe la funcionalidad de creación al rol "Solicitante", permitiendo que un usuario con rol "Aprobador" genere registros en la DB.
**Pasos:**
1. Inyectar en el header `x-user-id` el UUID de un usuario con rol APROBADOR.
2. Ejecutar `POST /api/solicitudes` con un payload válido.
**Resultado esperado:** Status 403 Forbidden. El sistema debe impedir la creación por falta de privilegios de rol.
**Resultado actual:** Status 201 Created. La solicitud se guarda con éxito en la base de datos.
**Impacto:** Crítico. Violación de la Segregación de Funciones (SoD) y riesgo de fraude interno en el proceso de compras.

### Bug B-03 – Error 500 ante descripción > 40 caracteres (Crash)
**Descripción:** El backend colapsa cuando se envía una descripción que excede el límite físico de la base de datos (VarChar 40), debido a la falta de validación preventiva en la lógica de la API.
**Pasos:**
1. Ejecutar `POST /api/solicitudes`.
2. Enviar descripción de 60 caracteres.
**Resultado esperado:** Status 400 Bad Request con mensaje de validación amigable.
**Resultado actual:** Status 500 Internal Server Error.
**Impacto:** Mayor. Inestabilidad del servidor y exposición innecesaria de errores técnicos internos al usuario final.

### Bug B-04 – Redondeo automático no autorizado de cantidades
**Descripción:** El sistema redondea automáticamente a 3 decimales cualquier cantidad enviada con precisión superior (ej: 4 decimales), sin notificar al usuario ni rechazar el dato.
**Pasos:**
1. Enviar una cantidad con 4 decimales (ej: 10.4256).
**Resultado esperado:** El sistema debe rechazar el dato por exceso de precisión (RN SAP) o solicitar confirmación de redondeo.
**Resultado actual:** El sistema guarda el valor redondeado (10.426) silenciosamente en la base de datos.
**Impacto:** Mayor. Riesgo de integridad en la gestión de inventarios y discrepancias financieras en un entorno de alta precisión.

### Bug B-05 – Inconsistencia de formato de fecha en consulta (GET)
**Descripción:** El endpoint GET de detalle devuelve la fecha en formato `D/M/YYYY` (ej: 8/4/2026), incumpliendo el estándar de dominio definido `DD/MM/YYYY` (ej: 08/04/2026) y el formato ISO devuelto en la creación.
**Resultado actual:** Omisión de ceros iniciales en días y meses menores a 10.
**Impacto:** Menor. Inconsistencia visual en la interfaz y posibles fallos en sistemas de integración que esperen un formato de fecha estricto.

## 4. Análisis global y Conclusión

Los defectos identificados revelan una **vulnerabilidad estructural en la arquitectura de seguridad y validación**. Se observa una dependencia excesiva de las validaciones del Frontend, dejando la API (Backend) expuesta a inyecciones de datos inválidos y accesos no autorizados.

**Conclusión del Equipo de QA:**
El módulo **NO ES APTO para el paso a producción**. Se requiere un rediseño prioritario de la capa de autorización (filtros de usuario en base de datos) y un refuerzo en el manejo de excepciones de la API antes de proceder con un nuevo ciclo de pruebas.
