# Plan de Pruebas Funcionales (FTP) - EPIC-01
## Módulo: Gestión de Solicitudes de Compra (SAP MM MVP)

## 1. Introducción

El presente documento describe el Plan de Pruebas para el MVP Gestión de Compras, específicamente del **Módulo Gestión de Solicitudes de Compras**.

Este módulo constituye el núcleo funcional del sistema y comprende las funcionalidades de creación, modificación, visualización y listado de solicitudes de compras, conforme a las reglas de negocio definidas en la **EPIC-01** y el modelo de dominio del proyecto. El plan establece el enfoque general y lineamientos que regirán el proceso de pruebas asociadas a este módulo.

## 2. Objetivo
Definir la estrategia, alcance, tipos y técnicas de pruebas que permitan verificar que el módulo cumple con:
*   Los requisitos funcionales definidos.
*   Las reglas de negocio establecidas.
*   Las restricciones de seguridad y control de acceso al sistema.

## 3. Alcance de las Pruebas (Scope)

### ✅ Incluido
*   Validación funcional completa del módulo.
*   Validación de reglas de negocio y seguridad funcional básica.
*   Escenarios positivos (Happy Path) y negativos.
*   Pruebas de regresión y de humo (Smoke Tests).
*   Pruebas de confirmación de defectos corregidos.
*   Validación de tiempos de respuesta básicos (Performance MVP < 2 segundos).

### ❌ No Incluido
*   Pruebas de carga, estrés o penetración avanzada.
*   Integraciones con sistemas externos reales.
*   Migraciones de datos o pruebas unitarias (fuera del rol QA Funcional).

## 4. Estrategias de Prueba

### 4.1. Enfoque General
Se aplicará un enfoque de **pruebas de caja negra**, priorizando los flujos críticos (creación, modificación, visualización y listado).

### 4.2. Técnicas de Diseño
*   **Partición de equivalencias y valores límite:** Aplicado críticamente en los campos de **Cantidad** (formatos decimales) y **Fecha de Entrega** (hoy vs pasado) para asegurar la integridad de la solicitud.
*   **Testing basado en estados:** Vital para validar que una solicitud no se salte pasos (ej. de `Creada` a `Aprobada`) y que las restricciones de edición se activen correctamente según el ciclo de vida de la solicitud definida en el MVP.
*   **Testing exploratorio:** Para validar la experiencia de usuario (UX) y comportamientos no documentados.

### 4.3. Pruebas No Funcionales básicas
*	Validación de tiempos de respuesta básicos para operaciones críticas (guardado y listado).
*	Verificación manual en entorno controlado, comparando el comportamiento observado con los tiempos aceptables definidos para el MVP.

## 5. Ciclo de Vida de Pruebas

El proceso de pruebas se ejecutará en ciclos iterativos siguiendo el siguiente orden:

### 5.1.	Pruebas Smoke

Al inicio de cada ciclo de pruebas se ejecutarán pruebas Smoke para validar la estabilidad básica del módulo. Se verificará que:
*	El proceso de autenticación funciona correctamente.
*	Los módulos cargan adecuadamente.
*	Los catálogos y datos maestros requeridos se encuentran disponibles.
*	La navegación básica entre funcionalidades es posible.

Solo si estas pruebas son satisfactorias se continuará con la ejecución completa.

### 5.2.	Pruebas Funcionales

Las pruebas funcionales se ejecutarán priorizando por riesgo e impacto en el negocio, siguiendo el siguiente orden:
*	Flujos principales (Happy Path).
*	Validación de reglas críticas de negocio.
*	Escenarios alternativos.
*	Escenarios negativos.
*	Validaciones de límites y valores extremos.

### 5.3.	Testing Exploratorio
Se realizará testing exploratorio con el objetivo de identificar:
*	Inconsistencias en la experiencia de usuario.
*	Mensajes incorrectos o poco claros.
*	Comportamientos intermitentes.
*	Desviaciones no contempladas en los escenarios formales.
*   Tiempos de respuesta básicos en funcionalidades críticas.

### 5.4.	Gestión de Defectos
En caso de detectarse defectos críticos bloqueantes, se suspenderá la ejecución de pruebas sobre la funcionalidad afectada hasta su corrección. Posteriormente se ejecutarán pruebas de confirmación y regresión asociadas.

#### 5.4.1  Clasificación de Defectos

**Severidad**

- **S1/Crítica:** El sistema no cumple su función principal y no existe un workaruond para continuar (ej: No se crea la solicitud cuando presionas Guardar)
- **S2/Mayor:** Fallo en una funcionalidad crítica del sistema y aún asi continúa estable (ej: Fallo en regla de negocio de duplicidad y aún asi crea la solicitud).
- **S3/Menor:** Errores visuales, pero en el backend persiste todo correctamente (ej:variación de colores, aliniación desalineada, fuentes incosistentes). 
- **S4/Trivial:** El sistema funciona correctamente y existen aquellos detalles casi "Nulos" que podrían pasar desapercibidos, pues no generan incomodidad al usuario.

**Prioridad**

- **P1-Inmediata:** Si el defecto compromete la entrega o bloquea la ejecución de las pruebas, debe solucionarse de inmediato.
- **P2-Alta** El defecto se encuentra en una funcionalidad crítica, debe solucionarse antes de terminar el Sprint.
- **P3-Media** El defecto no afecta funcionalidades o reglas de negocio críticas, no bloquea pruebas ni compromete la entrega, puede planificarse para el próximo sprint.
- **P4-Baja** El defecto entonces puede transferirse pues funcionalmente no compromete nada en el Sprint, puede solucionarse más adelante.

### 5.5.	Pruebas de Regresión
•	Se ejecutará regresión parcial al finalizar cada sprint o iteración.
•	Se ejecutará regresión completa antes de la liberación final del módulo.

### 5.6 Criterios de Suspensión
La ejecución de pruebas se suspenderá si se cumple alguna de las siguientes condiciones:

* Fallo crítico en el **Smoke Test** (ej. no se puede iniciar sesión).
* Detección de un defecto **Bloqueante** en el flujo principal (ej. no se puede guardar ninguna solicitud).
* Inestabilidad del ambiente de pruebas que impida la navegación fluida.

### 5.7 Criterios de Reanudación
Las pruebas se retomarán una vez que:
* El equipo de desarrollo confirme la corrección del defecto bloqueante o crítico.
* Se verifique la estabilidad del ambiente mediante un nuevo **Smoke Test** exitoso.

## 6. Ambiente de Pruebas
Las pruebas del **módulo Gestión de Solicitudes de Compra** se ejecutarán en un entorno de desarrollo o simulación controlado.

Dado que el MVP no contempla despliegues en múltiples ambientes, las validaciones se realizarán bajo las siguientes condiciones:
*	Ejecución manual de pruebas.
*	Navegador web moderno (por ejemplo, Chrome).
*	Entorno local o simulado.
*	Base de datos de prueba con datos controlados y previamente definidos.
*	Sin integración con sistemas externos.

No se contemplan pruebas en ambientes productivos ni en entornos con múltiples usuarios concurrentes.

## 7. Datos de Prueba

### 7.1. Usuarios (Combinaciones de Roles y Estados y permisos sobre Centro)

| Rol         | Estado            | Centro             |
| :---        | :---              | :---               |
| Solicitante | Activo / Inactivo | Con y Sin permisos |
| Aprobador   | Activo / Inactivo | Con y Sin permisos |
| Admin TF    | Activo / Inactivo | Global             |
| Invitado    | -                 | Sin acceso         |

> **Nota:** El rol "Invitado" se utiliza para validar el bloqueo de acceso a usuarios no autenticados.

### 7.2. Solicitudes, Maestros y Duplicados

*   **Estados:** Creada, En Revisión, Rechazada, Aprobada.
*   **Maestros:** Centros válidos/inválidos, Almacenes asociados/no asociados, visibilidad dinámica según tipo.
*   **Duplicados:** Variaciones para validar duplicidad (Mismo Item, Centro y Fecha en estados distintos de Rechazada).

### 7.3. Estrategia de Datos por Campo

Se utilizarán los siguientes criterios para la preparación de datos de prueba:

| Campo                  | Pruebas de Valor (Equivalencia/Límites)                                                                         |
| :---                   | :---                                                                                                            |
| **Identificador (ID)** | Formato válido (PR-2026-0001), Inexistente, Formato inválido (ABC-123).                                         |
| **Descripción**        | Mínimo (10 char), Máximo (40 char), Fuera de rango (<10 o >40), Solo espacios, DAtos basura (ej: "aaaghterplt") |
| **Cantidad**           | Enteros (10), Decimales válidos (10.123), Exceso decimales (10.1234), Negativos, Cero                           |
| **Fecha de Entrega**   | Hoy (Límite inferior), Futuro, Pasado (Ayer), Formato erróneo (32/13/2025).                                     |
| **Unidad de Medida**   | Válidas (KG, HR, HR), Inválidas (AAAA), Vacío.                                                                  |
| **Item Comprable**     | Material (requiere Almacén), Servicio (oculta Almacén).                                                         |


### 7.4. Datos para pruebas no funcionales básicas
*	Conjunto mínimo de solicitudes.
*	Conjunto moderado de solicitudes (para evaluar tiempos de carga del listado).

## 8. Criterios de Entrada

*	Módulo liberado para validación.
*	Los requisitos funcionales y reglas de negocio se encuentran definidos y aprobados.
*	El ambiente de pruebas está disponible y configurado.
*	Los datos de prueba necesarios han sido preparados.
*	Los casos de prueba han sido diseñados y revisados.
*	La herramienta de gestión de defectos se encuentra disponible.


## 9.  Criterios de Salida
*   **100%** de casos de prueba ejecutados.
*   **0** defectos críticos o bloqueantes abiertos.
*   Defectos de severidad media o baja se encuentren corregidos, diferidos o aceptados formalmente.
*	Se hayan ejecutado pruebas de confirmación y regresión asociadas a los defectos corregidos.
*   Informe final de pruebas generado y aprobado.

## 10. Riesgos

### 10.1 Riesgos de Requerimientos

#### Alcance No Controlado (Scope Creep)
Cambios en reglas de negocio o funcionalidades sin actualización del plan de pruebas o cronograma, generando retrasos y retrabajo.

**Mitigación:**
- Validación y congelamiento del alcance antes de iniciar pruebas.
- Actualización del Test Plan ante cambios aprobados.

#### Ambigüedad en requisitos
Interpretación incorrecta de criterios de aceptación o reglas de negocio, especialmente en desarrollos generados por IA.

**Mitigación:**
- Revisión previa de historias y criterios antes del desarrollo.
- Refinamiento continuo y validación temprana mediante pruebas exploratorias.
- Validación de inconsistencias documentales.

### 10.2 Riesgos Técnicos

#### Rendimiento insuficiente
El sistema puede presentar degradación en tiempos de respuesta al aumentar el volumen de datos.

**Mitigación:**
- Validación temprana de tiempos de respuesta básicos.
- Pruebas con volúmenes moderados de datos simulados.

#### Calidad del código generado por IA
Código difícil de mantener o propenso a errores no detectados.

**Mitigación:**
- Pruebas funcionales exhaustivas.
- Regresión frecuente tras modificaciones.

#### Incompatibilidad futura con integraciones externas
Posible dificultad al integrar el módulo con APIs o sistemas externos.

**Mitigación:**
- Documentación clara de reglas y estructuras actuales.
- Validación de consistencia de datos.

### 10.3 Riesgos de Seguridad

#### Configuración incorrecta de permisos
Usuarios podrían acceder a funcionalidades no autorizadas.

**Mitigación:**
- Pruebas exhaustivas por rol y estado.
- Validación cruzada de restricciones backend y frontend.

#### Transiciones de estado no autorizadas
Modificación indebida del estado inicial o transición incorrecta entre estados.

**Mitigación:**
- Testing basado en estados.
- Validación negativa de transiciones inválidas.

#### Exposición de datos sensibles
Visualización indebida de solicitudes de otros usuarios.

**Mitigación:**
- Pruebas de acceso cruzado entre roles.
- Validación de filtros por centro y propietario.

## 11. Roles y Responsabilidades

### Líder QA
- Definir y aprobar la Estrategia y el Plan de Pruebas.
- Supervisar el diseño y ejecución de casos de prueba.
- Gestionar riesgos de calidad.
- Aprobar el cierre del ciclo de pruebas.

### QA
- Diseñar los casos de prueba.
- Ejecutar pruebas funcionales y no funcionales básicas.
- Reportar y dar seguimiento a defectos.
- Ejecutar pruebas de confirmación y regresión.

### Desarrollo (Dev)
- Implementar las funcionalidades.
- Ejecutar pruebas unitarias.
- Corregir defectos reportados.
- Entregar nuevas versiones para validación.

### Product Owner (PO)
- Validar requisitos y criterios de aceptación.
- Ejecutar o coordinar pruebas UAT.
- Aprobar la liberación del módulo.

### Scrum Master
- Facilitar la coordinación entre equipos.
- Asegurar que el proceso de pruebas pueda ejecutarse sin impedimentos.

> Es importante destacar que el MVP se realizó por una misma persona acompañada de la IA, para agilizar, apoyar y revisar consistencia en el proceso de documentación y para la implementación de la UX. Pero se decidió reflejar los roles involucrados para ofrecer un matiz más orientado a proyectos reales.

## 12. Entregables

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