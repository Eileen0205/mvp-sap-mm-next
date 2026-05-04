
# MVP Gestión de Solicitudes de Compra (Inspirado en SAP MM) - QA Portfolio

Proyecto de QA Engineering orientado a la validación end-to-end de un MVP inspirado en el flujo de Solicitudes de Compra de SAP MM (ME51N). Con el objetivo de simular un entorno real de testing, que permitiera identificar defectos en reglas de negocio, seguridad y consistencia de datos, fascilitando la toma de decisiones de calidad basadas en evidencia (GO/NO-GO).

## Contexto del Sistema

Sistema orientado a la gestión del proceso previo a la compra de materiales o servicios, desde la creación de la solicitud hasta su aprobación o rechazo (Inspirado en transacciones de SAP MM).

En sistemas empresariales, es común que:

- Las validaciones existan solo en frontend
- Se omitan controles de acceso en API (RBAC)
- Existan inconsistencias entre UI, API y Base de Datos

Este proyecto simula ese escenario y demuestra cómo un enfoque QA estructurado permite:

- Detectar fallos críticos antes de producción
- Identificar vulnerabilidades de seguridad (IDOR, bypass de autenticación)
- Evaluar la calidad del sistema mediante métricas y criterios objetivos

## Stack Tecnológico 

- **Testing & QA:** Jira, AgilTest, Gherkin, Markdown, Postman
- **Frontend:** Next.js 15, React, Tailwind CSS, Shadcn UI (Generado por IA) 
- **Backend:** Node.js (Next.js API Routes) (Generado por IA)  
- **Base de Datos:** PostgreSQL + Prisma ORM  
- **Control de Versiones:** Git & GitHub  

## Alcance del Testing

   **Shift-Left Testing**: Análisis de requerimientos y refinamiento de US desde la fase de diseño.
   **Black & Gray Box Testing**: Validación funcional y técnica de la API y persistencia.
   **Data Integrity**: Verificación de constraints y reglas de negocio a nivel de Base de Datos (PostgreSQL/Prisma).
   **Security Testing (RBAC)**: Validación de control de acceso por roles y centros (Simulado)

## Resumen Cuantitativo

Se definieron 3 Épicas principales, de las cuales se seleccionó la EPIC-01(Core) como **Caso de Estudio** y en la cual se definieron los siguientes artefactos y se cumplieron las siguientes métricas:

**Artefactos:**
 - Modelo Dominio
 - Diagrama Dominio + Diagrama de Flujo de estados
 - 4 Historias de Usuarios
 - Consideraciones Generales QA para EPIC
 - Plan de Pruebas
 - Casos de Pruebas documentados
 - Informe de reporte de Bugs
 - Informe Final de Pruebas

 **Métricas:**

Para una cobertura de **criterios de aceptación** del 100%.

 - 76 TCs diseñados
 - 71 TCs ejecutados
 - 5 TCs bloqueados
 - 49 TCs Pass
 - 22 TCs Fail
 - 69% de éxito en la EPIC

**Distribución de Defectos (Severidad):**

 - 6 críticos (Seguridad y Privacidad)
 - 13 mayores (Robustez e Integridad)
 - 3 menores (Usabilidad) 

**Estado Final:** **NO APTO PARA PRODUCCIÓN (NO-GO)**

- El 69% de éxito refleja una alta tasa de fallos en las funcionalidades core
- La presencia de defectos críticos en seguridad e integridad invalida cualquier despliegue
- Los TCs bloqueados indican dependencias funcionales no resueltas (EPIC-02 y EPIC-03)

Los resultados obtenidos en las pruebas realizadas y las métricas evaluadas justifican la decisión final de **NO-GO**

 ## Estrategia de Testing

 - Se aplicó un enfoque **Shift-Left** para detectar defectos en etapas tempranas del ciclo de desarrollo.
 - Se utilizaron varias **técnicas** para maximizar cobertura de pruebas como: 
    - **Particiones de Equivalencia & Valores Límite**: Optimización de entradas en formularios (ej. Cantidades y Fechas), validando comportamientos en fronteras críticas.
    - **Tablas de Decisión**: Validación de lógica de negocio compleja (reglas de aprobación según rol y estado).
    - **Transición de Estados**: Control estricto del ciclo de vida de la solicitud (Creada → En Revisión → Aprobado/Rechazado).
 - Para optimizar el tiempo de desarrollo (Guiado por IA) del MVP, se aplicó un enfoque de priorización (riesgo, impacto):
    - Flujos Críticos: Pruebas exhaustivas en la creación y persistencia de solicitudes (Core del negocio).
    - Validaciones de reglas de negocio críticas (duplicidad, centro no autorizado, solicitud de material sin almacén).
    - Validación de campos y formatos para garantizar la integridad de tipos en la persistencia.
    - Validaciones de Seguridad (RBAC) para roles, usuario inactivo, no autenticado, acceso por ID ajeno (Simulado).
    
## Estrategia de API

Se implementó un flujo de validación de servicios para asegurar la integridad de los datos y la resiliencia del frontend y el backend.
   
   - Endpoints (GET, POST, PATCH, PUT)
   - Status codes
   - Validación de contratos y tipos de datos
   - Consistencia request/response
   - Validación de reglas de negocio a nivel de servicio (No solo UI)

## Estrategia de Validación de Base de Datos

Se implementó una validación a nivel de persistencia con el objetivo de garantizar la **integridad y consistencia de los datos**, actuando como última capa de control ante posibles fallos en frontend o backend.

- **Validación de persistencia real:**  
    
    -  Verificación en Prisma Studio que los datos se almacenan correctamente tras las operaciones (CREATE / UPDATE). Se definieron consultas SQL, para el caso de que se realizara consulta directa a la BD.
    - Validación de restricciones a nivel de base de datos (constraints):
        - Claves primarias (PK)
        - Relaciones (FK)
        - Restricciones de unicidad (ej: prevención de duplicados)
        - Campos obligatorios (NOT NULL)
    - Validación de que reglas clave (como la no duplicidad por combinación de campos) se refuerzan también a nivel de base de datos, evitando inconsistencias por bypass de API.
    - Verificación de relaciones correctas entre entidades (ej: Centro–Almacén, Usuario–Solicitud).

## Uso de IA en el Proyecto

La IA fue utilizada como herramienta de apoyo (copiloto) para:
 - Acelerar tareas operativas
 - Mejorar la calidad de los artefactos
 - Proponer mejoras y escenarios de pruebas adicionales

 **Generación del Entorno de Pruebas (SUT):**

Para este laboratorio, utilicé IA (Vercel + v0 / Gemini) como motor de desarrollo. A partir de mis definiciones de negocio y diagramas, la IA generó el sistema funcional. Mi labor técnica fue la supervisión de que el código generado permitiera ejecutar el plan de pruebas definido y la validación de sus fallos.
 
El criterio funcional y la estretegia de testing fueron definidos manualmente desde el rol de QA.

## Lecciones Aprendidas

- Importancia de validar siempre en backend
- Riesgos de confiar únicamente en UI
- Impacto real de defectos de seguridad (IDOR)
- Importancia de que QA se integre desde inicio (Shift-Left)
- Importancia de un manejo de errores y feedback al usuario eficiente

##  Estructura del Proyecto

El proyecto está organizado bajo una arquitectura que separa la estrategia de calidad del producto desarrollado:
 
📂 qa-portafolio-sap-mm (Raíz del repositorio)
    ├── qa-documentacion/         # Artefactos de QA, Estrategia y Reportes
    │   ├── API/                  # Colecciones de Postman y documentación de Endpoints
    │   ├── EPICS/                # Documentación maestra de módulos de negocio
    │   ├── HISTORIAS_USUARIO/    # User Stories detalladas en formato Gherkin
    │   ├── MODELO-DOMINIO/       # Diagramas UML y reglas de negocio (Core)
    │   └── QA/                   # Planes de Pruebas, Reporte de Bugs e Informes
    ├── system-under-test/        # Prototipo funcional (SUT) generado por IA
    └── README.md                 # Resumen ejecutivo y métricas del proyecto

## Cómo ejecutar el Sistema Bajo Prueba (SUT)

Si deseas levantar la aplicación localmente para ejecutar pruebas manuales o exploratorias:

1.  Navega a la carpeta del sistema:
    ```bash
    cd system-under-test
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura las variables de entorno (`.env`) para la base de datos PostgreSQL.
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
5.  Abre [http://localhost:3000] en tu navegador.

**Contacto**:

📩 [LinkedIn](tu-link) | 💻 [GitHub Portfolio](tu-link)
Profesional en Ingeniería Informática enfocada en QA Engineer.


