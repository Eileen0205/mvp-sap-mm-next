# INFORME FINAL DE PRUEBAS (TEST SUMMARY REPORT) - EPIC-01
## Proyecto: MVP Gestión de Solicitudes de Compra (SAP MM)

**Fecha:** 8 de abril de 2026  
**Responsable:** Eileen - Lead QA Engineer  
**Estado Final:** 🔴 **NO APTO PARA PRODUCCIÓN**

---

## 1. Resumen Ejecutivo
Se ha finalizado el ciclo de pruebas funcionales y de integración para la **EPIC-01: Gestión de Solicitudes de Compra**. El objetivo principal era validar la integridad del proceso de creación, listado y visualización de solicitudes bajo reglas de negocio SAP.

Aunque el flujo principal (Happy Path) es operativo, se han identificado **vulnerabilidades críticas en la arquitectura de seguridad (RBAC)** y una **falta de robustez en el Backend** que comprometen la integridad de los datos y la privacidad de los usuarios. Por tales motivos, se recomienda detener el despliegue hasta que se apliquen las correcciones detalladas en este informe.

---

## 2. Métricas de Ejecución

| Métrica | Valor | Observación |
| :--- | :--- | :--- |
| **Total Casos de Prueba (TCs)** | 15 | Basados en la US-01 a la US-04. |
| **TCs Ejecutados** | 15 (100%) | Cobertura total del plan actual. |
| **TCs Aprobados (Passed)** | 9 (60%) | Principalmente Happy Paths y Humo. |
| **TCs Fallidos (Failed)** | 6 (40%) | Concentrados en Seguridad y Formatos. |
| **Defectos Detectados** | 6 | 2 Críticos, 3 Mayores, 1 Menor. |
| **Eficacia de Automatización** | 100% | Automatización de la US-01 (Postman). |

**Tasa de éxito (Yield Rate): 60%** (Umbral mínimo requerido para producción: 95%).

---

## 3. Análisis de Calidad por Pilares

### 🔐 Seguridad y Privacidad (Riesgo Crítico)
Se materializó el riesgo de **Broken Access Control**. El sistema no aplica filtros de propiedad en el Backend, permitiendo que un Solicitante visualice y modifique (parcialmente) registros de otros usuarios. Asimismo, no se respeta la Segregación de Funciones (SoD), permitiendo al rol Aprobador crear solicitudes.

### 🧬 Integridad de Datos (Riesgo Mayor)
El sistema presenta fallos de precisión financiera al redondear automáticamente decimales en el campo "Cantidad". Además, se detectó una regresión en la transición de estados, impidiendo el flujo normal del negocio hacia la fase de Revisión.

### 🚀 Robustez del Backend (Riesgo Mayor)
Existe una dependencia crítica de las validaciones del Frontend. Ante la ausencia de controles en la UI (pruebas vía API/Postman), el Backend colapsa con **Errores 500 (Internal Server Error)** al recibir datos que exceden los límites de la base de datos.

---

## 4. Hallazgos Estrella (Top Defects)

1.  **B-01 (Privacidad):** Exposición total de la base de datos en el listado a cualquier usuario.
2.  **B-02 (RBAC):** Aprobador con permisos de creación (Fallo de Segregación de Funciones).
3.  **B-03 (Robustez):** Crash del servidor (500) ante descripciones largas.
4.  **B-REG (Regresión):** Bloqueo en el cambio de estado a "En Revisión".

---

## 5. Conclusiones y Recomendaciones Técnicas

El MVP ha servido para identificar que la **capa de simulación de identidad (Mock)** no es eficiente y oculta fallos estructurales que solo una auditoría de "Caja Gris" (API + DB) pudo revelar.

**Acciones Requeridas:**
1.  **Prioridad 1:** Implementar filtros de `usuarioId` en todos los endpoints de consulta y modificación.
2.  **Prioridad 1:** Implementar validaciones preventivas (Middleware) en el Backend para longitudes y tipos de datos.
3.  **Prioridad 2:** Unificar el contrato de respuesta (JSON Schema) para incluir `data: null` en errores.
4.  **Prioridad 3:** Corregir el bug visual de desincronización de nombres en la UI.

**Veredicto Final:** Se deniega la certificación de calidad para la EPIC-01. El sistema requiere un refuerzo de arquitectura antes de ser expuesto a usuarios reales.
