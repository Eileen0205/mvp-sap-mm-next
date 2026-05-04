# INFORME FINAL DE PRUEBAS (TEST SUMMARY REPORT) - EPIC-01
## Proyecto: MVP Gestión de Solicitudes de Compra (SAP MM)

**Fecha:** 15 de abril de 2026  
**Responsable:** Eileen - QA Engineer  
**Estado Final:** **NO APTO PARA PRODUCCIÓN (NO-GO)**


## 1. Resumen Ejecutivo

Se ha finalizado el ciclo de pruebas funcionales para la **EPIC-01: Gestión de Solicitudes de Compra**. El objetivo era validar la robustez del proceso de creación, modificación y consulta de solicitudes bajo reglas de negocio definidas e inspiradas en SAP MM.

A pesar de que el flujo básico es operativo, el sistema presenta **fallos críticos de seguridad (IDOR/RBAC)** y de **integridad de datos (Timezone Shift)**. La ausencia de los módulos de soporte (EPIC-02 y EPIC-03) ha revelado una arquitectura vulnerable en el Backend. **Mi recomendación profesional es detener el despliegue hasta subsanar los defectos categorizados como Críticos y Mayor.** dada la relevancia que tienen para que el sistema sea robusto y seguro.


## 2. Métricas de Calidad (KPIs)

*   **Total Casos de Prueba (TCs):** 76
*   **Tasa de Ejecución:** 100%
*   **Tasa de Éxito (Yield Rate):** 69% (49 Pass / 22 Fail)
*   **Umbral de Aceptación:** Fallido (Mínimo requerido 90%).

Ver los detalles del análisis de las métricas en el siguiente enlace [Métricas de Calidad EPIC-01](./Métricas_Calidad_EPIC_01.png) 

## 3. Evaluación de Riesgos

### Seguridad y Privacidad (Riesgo Crítico)
*   **Hallazgo:** 
    - Exposición de datos por ID (IDOR).
    - Modificación permitida a usuarios "Inactivos"
*   **Impacto:** Un usuario puede acceder a información sensible de terceros y permite modificar solicitudes violando la confidencialidad del proceso de compras.

### Integridad de Lógica y Datos (Riesgo Mayor)
*   **Hallazgo:** 
    - Desfase de fechas por zona horaria
    - Bloqueo de reintentos sobre solicitudes rechazadas
    - Truncamiento silencioso y redondeo no autorizado en el campo cantidad.
*   **Impacto:** Riesgo de errores en la planificación de suministros, bloqueos operativos para el solicitante y afectaciones en la facturación, stock y decisiones de compras.

### Usabilidad y Experiencia (Riesgo Medio)
*   **Hallazgo:** Ausencia de feedback de éxito/error en transacciones y botones de acción visibles para roles no autorizados.
*   **Impacto:** Incertidumbre en el usuario final y aumento de la carga de soporte técnico por errores de uso.

Para el detalle técnico de los bugs, puede referirse al siguiente enlace [Reporte de Defectos EPIC-01](./Bug_Report_Document_Epic-01.md)

## 4. Trazabilidad de Requerimientos
| ID Historia | Descripción | Resultado de QA |
| :--- | :--- | :--- |
| US-01 | Crear Solicitud | Fallida (Errores Duplicidad, validaciones de formato fecha y cantidad y feedback al usuario)|
| US-02 | Modificar Solicitud | Fallida (Inconsistencia de Fechas (Regresión), Modificación por usuario "Inactivo" y Feedback)|
| US-03 | Visualizar Solicitud | Fallida (Vulnerabilidad IDOR Crítica) |
| US-04 | Listar Solicitudes | Fallida (Fallo en filtrado RBAC y paginación)|


## 5. Conclusiones y Recomendaciones Técnicas

El MVP ha cumplido su propósito de identificar debilidades estructurales antes de la fase de integración. Los hallazgos demuestran que una validación centrada únicamente en el Frontend es insuficiente para sistemas de gestión crítica.

**Recomendaciones para el Equipo de Desarrollo:**
1. **Prioridad 1:** Implementar filtros de propiedad de datos en el Backend para prevenir ataques IDOR.
2. **Prioridad 1:** Estandarizar el manejo de fechas a nivel de servidor (ISO UTC) para evitar el desfase de 24h.
3. **Prioridad 1:** Corregir e implementar validaciones robustas en el campo "Cantidad" para evitar errores en facturacióm stock, decisiones y otros.
4. **Prioridad 1:** Corregir la restricción de duplicidad para que ignore registros en estado "Rechazada".
5. **Prioridad 2:** Implementar mensajes de confirmación (Toasts o Notificaciones) en todas las acciones de persistencia.
6. **Prioridad 2:** Implementar la paginación en el sistema para disminuir la sobrecarga en el sistema y el riesgo de degradación de la experiencia de usuario y Performance.

**Veredicto Final:** El software requiere un ciclo de corrección integral y una nueva ronda de pruebas de regresión.

**Firma:** 
*Eileen - QA Engineer*
