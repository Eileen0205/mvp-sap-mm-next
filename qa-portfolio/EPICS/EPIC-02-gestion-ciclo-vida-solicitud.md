# EPIC-02 | Gestión del Ciclo de Vida de las Solicitudes (Estados)

## 1. Descripción

Esta épica se enfoca en controlar el ciclo de vida de una Solicitud de Compra, gestionando sus estados a lo largo de todo su ciclo de vida.

Asume la existencia de la Solicitud de Compra definida en **EPIC-01** y actúa sobre solicitudes ya creadas, aportando gobernanza al sistema y evitando inconsistencias de estado.

## 2. Objetivo

Asegurar que las solicitudes evolucionen únicamente a través de **transiciones válidas**, definidas por reglas de negocio claras, reflejando un flujo controlado y alineado con el proceso estándar de SAP MM.

Esta épica establece la base para un control funcional del proceso de compras dentro del alcance del MVP.

## 3. Alcance funcional (Scope)

Incluye:

- Asignación automática del estado inicial de la solicitud.
- Cambio de estado de la solicitud según reglas y permisos.
- Validación de transiciones permitidas y bloqueo de transiciones no permitidas.

Excluye explícitamente para el MVP:

- Workflows avanzados.
- Múltiples aprobadores.
- Históricos detallados de cambios de estado.

## 4. Relación con otras épicas

- Depende de:
  - **EPIC-01 | Gestión de Solicitudes de Compra (Core Funcional)**  
    (para operar sobre solicitudes ya creadas).
  - **EPIC-03 | Gestión de Usuarios y Seguridad**  
    (para permisos por roles y autenticación para determinar quién puede cambiar estados).

- Complementa:
  - **EPIC-01**, aportando el modelo de estados y las reglas de transición.

## 5. DoR (Definition of Ready)

Esta épica hereda el DoR global del MVP.  
Cada Historia de Usuario asociada debe cumplir:

- Las reglas de negocio asociadas a estados y transiciones están claramente definidas.
- Los criterios de aceptación describen transiciones válidas e inválidas.
- Se han identificado escenarios negativos (transiciones no permitidas, intentos de edición en estados finales, etc.).
- Las dependencias con EPIC-01 (solicitud creada) y EPIC-03 (roles/seguridad) están indicadas.
- El alcance se limita al flujo de estados definido para el MVP.

Si alguno de estos puntos no se cumple, la historia permanece en **Refinamiento**.

## 6. DoD (Definition of Done)

Una Historia de Usuario de esta épica se considera **Done** cuando:

- Las transiciones de estado están claramente definidas y controladas en la implementación.
- Se bloquean transiciones no permitidas según las reglas del proceso.
- Se respeta estrictamente el flujo de estados definido para el MVP:
  - Creada → En Revisión → Aprobada  
  - Creada → En Revisión → Rechazada
- Las restricciones de edición por estado están correctamente aplicadas (no se editan solicitudes en estados finales).
- Los criterios de aceptación cubren transiciones válidas e inválidas.
- Existen escenarios Gherkin que validan el comportamiento del flujo (felices y negativos).
- No existen defectos funcionales críticos abiertos asociados a estados o transiciones.

## 7. Módulo incluido en la épica

### 7.1. Gestión del Ciclo de Vida de la Solicitud (Estados)

**Objetivo**  
Controlar el ciclo de vida de la Solicitud de Compra mediante estados simples y reglas claras, garantizando que cada solicitud evolucione de forma consistente.

**Principal problema que resuelve**  
Controla el ciclo de vida de cada solicitud de compra, evitando cambios de estado incoherentes, transiciones inválidas y modificaciones sobre solicitudes ya cerradas.

**Usuarios principales**

- **Solicitante**: usuario que origina y gestiona la solicitud de compra.
- **Aprobador**: usuario que revisa y decide sobre la solicitud.

**Justificación para el MVP**

- Permite demostrar control de flujos, trazabilidad y validación de reglas de negocio.
- Proporciona escenarios de testing claros y fáciles de implementar (transiciones válidas vs. inválidas).
- Aporta madurez funcional al MVP sin introducir complejidad técnica excesiva.

## 8. Estados y transiciones del MVP

### 8.1. Estados definidos

- **Creada**  
  La solicitud ha sido creada por el Solicitante y aún puede ser modificada.

- **En Revisión**  
  La solicitud ha sido enviada para evaluación por un Aprobador.

- **Aprobada**  
  La solicitud ha sido aprobada y queda cerrada funcionalmente.

- **Rechazada**  
  La solicitud ha sido rechazada por el Aprobador y se considera cerrada.

### 8.2. Transiciones PERMITIDAS (MVP)

- → Creada 
  - Acción: Crear solicitud  
  - Quién: Solicitante

- → Creada → En Revisión  
  - Acción: Enviar a revisión  
  - Quién: Solicitante

- En Revisión → Aprobada  
  - Acción: Aprobar  
  - Quién: Aprobador

- En Revisión → Rechazada  
  - Acción: Rechazar  
  - Quién: Aprobador

### 8.3. Transiciones NO PERMITIDAS (MVP)

Ejemplos:

- Creada → Aprobada  
  Motivo: Debe pasar por estado "En Revisión".

- Creada → Rechazada  
  Motivo: Debe pasar por estado "En Revisión".

- En Revisión → Creada  
  Motivo: Evita ciclos y regresiones no controladas.

- Aprobada → (cualquier otro estado)  
  Motivo: "Aprobada" es estado final.

- Rechazada → (cualquier otro estado)  
  Motivo: "Rechazada" es estado final.

### 8.4. Reglas de Control de Estado

- Cada solicitud mantiene un único estado activo en todo momento.
- Las transiciones deben ser atómicas (no parciales).
- El sistema debe garantizar consistencia entre frontend, backend y persistencia.
- Todas las validaciones de estado deben ejecutarse en backend (no confiar en frontend).

### 8.5. Acotaciones

- El **estado inicial** "Creada" se asigna automáticamente al crear la solicitud.
- No se permiten transiciones desde estados finales ("Aprobada", "Rechazada").
- Una solicitud solo puede ser modificada en estado "Creada".
- En estados "En Revisión", "Aprobada" o "Rechazada", la solicitud es de solo lectura.

Para más detalle sobre las acciones permitidas/no permitidas por rol, ver también **EPIC-03 | Gestión de Usuarios y Seguridad**.

## 9. Funcionalidades seleccionadas (Features)

### 9.1. Asignación de Estado Inicial

**Descripción**  
Al crear una solicitud , el sistema asigna automáticamente el estado inicial "Creada".

**Justificación**

- Automatismo simple pero clave.
- Permite validar lógica de negocio básica.
- Es la base para todo el flujo posterior de estados.

**Dependencias**

- Gestión de Solicitudes de Compra (EPIC-01).

### 9.2. Cambio de Estado de la Solicitud

**Descripción**  
Permite gestionar los cambios de estado definidos en el MVP ("Creada", "En Revisión", "Aprobada", "Rechazada") según el rol del usuario (Solicitante y/o Aprobador).

**Justificación**

- Representa el flujo natural del proceso SAP MM.
- Introduce escenarios de transición y control.
- Muy alineado con testing de flujos y reglas de negocio.

**Dependencias**

- Autenticación y Roles (EPIC-03).
- Gestión de Solicitudes de Compra (EPIC-01).

### 9.3. Validación de Transiciones de Estado

**Descripción**  
Valida cada intento de cambio de estado y bloquea transiciones no permitidas según las reglas del MVP.

**Justificación**

- Permite definir y validar reglas de negocio de forma explícita y auditables.
- Ideal para escenarios negativos y de borde.
- Aporta madurez funcional al MVP sin complejidad técnica innecesaria.

**Dependencias**

- Cambio de Estado de la Solicitud.

## 10. Historias de Usuario asociadas

### US-05 | PR-Flow | GE | Asignar el estado inicial a la solicitud

**Descripción (Cómo, Quiero, Para)**  
Cómo: Sistema  
Quiero: Asignar el estado inicial a la solicitud  
Para: Garantizar el control del ciclo de vida.

**Criterio de aceptación (escenario principal)**  
Given se crea una nueva solicitud  
When el sistema registra la solicitud  
Then se asigna automáticamente el estado `Creada`.

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `GestionDeEstados`, `AsignacionDeEstadoInicial`

### US-06 | PR-Flow | GE | Cambiar el estado de la solicitud

**Descripción (Cómo, Quiero, Para)**  
Cómo: Usuario con rol (Solicitante y/o Aprobador)  
Quiero: Cambiar el estado de la solicitud  
Para: Reflejar su avance en el proceso.

**Criterio de aceptación (escenario principal)**  
Given la solicitud está en un estado válido  
And el usuario tiene permisos  
When solicita un cambio de estado permitido  
Then el estado se actualiza correctamente.

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `GestionDeEstados`, `CambioDeEstado`

### US-07 | PR-Flow | GE | Validar las transiciones de estado

**Descripción (Cómo, Quiero, Para)**  
Cómo: Sistema  
Quiero: Validar las transiciones de estado  
Para: Evitar cambios no permitidos.

**Criterio de aceptación (escenario principal)**  
Given la solicitud tiene un estado actual  
When se intenta una transición no válida  
Then el sistema bloquea el cambio  
And mantiene el estado actual.

**Metadatos**  
- Prioridad: Alta  
- Labels: `PRFlow`, `GestionDeEstados`, `ValidarTransicionesDeEstado`