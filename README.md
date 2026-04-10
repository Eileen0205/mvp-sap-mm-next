# MVP Gestión de Solicitudes de Compra (SAP MM) - QA Portfolio

Este repositorio representa un hito clave en mi portafolio profesional como **QA Engineer**. Se trata de un MVP (Producto Mínimo Viable) inspirado en el flujo de Solicitudes de Compra de SAP MM (`ME51N`), diseñado para demostrar capacidades en análisis funcional, diseño de pruebas bajo enfoque *Shift-Left*, validación de reglas de negocio complejas y testing de las distintas capas (UI, API y Base de Datos).

## Contexto del Sistema

Sistema orientado a la gestión del proceso previo a la compra de materiales o servicios, desde la creación de la solicitud hasta su aprobación o rechazo (Inspirado en transacciones de SAP MM). Con un flujo principal claro y definido de Creación, Listado, Visualización y Modificación, respetando para ello las reglas de neogcio definidas, las transiciones de estados y los roles (Solicitante Aprobador y Administrador) con permisos relacionados a cada función dentro del flujo. 

## Alcance del Testing

- Análisis y definición del dominio.
- Análisis y refinamiento de requisitos.
- Diseño y refinamiento de Épicas y de Historias de Usuario (Gherkin).
- Diseño y ejecución de Casos de Prueba.
- Validación de transición de estados.
- API Testing (status code, contrato, reglas de negocio, persistencia).
- Validación en base de datos.
- Pruebas negativas y escenarios límites.

## Resumen Cuantitativo (Métricas)

Se definieron:
 - 3 Épicas principales. De las cuales se tomó para el caso de estudio la EPIC-01: Core Funcional Gestión de solicitudes de compra.
 - 4 Historias de Usuarios
 - 77 casos de pruebas
 - % cobertura de criterios de aceptación
 - X reglas de negocio críticas validadas
 - X endpoints cubiertos
 - X consultas SQL aplicadas

 ## Estrategia de Testing

 - Enfoque Shift-Left para garantizar un producto de calidad desde el inicio y permite reducir costos y tiempo en desarrollo al corregir fallos desde el inicio de la planificación
 - Se utilizaron varias técnicas para asegurar un cobertura de pruebas 
    - Particiones de Equivalencia & Valores Límite: Optimización de entradas en formularios (ej. Cantidades y Fechas), validando comportamientos en fronteras críticas.
    - Tablas de Decisión: Validación de lógica de negocio compleja (reglas de aprobación según rol y estado).
    - Transición de Estados: Control estricto del ciclo de vida de la solicitud (Creada → En Revisión → Aprobado/Rechazado).
 - Para optimizar el tiempo de desarrollo (Guiado por IA) del MVP, se aplicó un enfoque de priorización (riesgo, impacto):
    - Flujos Críticos: Pruebas exhaustivas en la creación y persistencia de solicitudes (Core del negocio).
    - Validaciones de reglas de negocio críticas (duplicidad, centro no autorizado, solicitud de material sin almacén).
    - Validación de campos y formatos para garantizar la integridad de tipos en la persistencia.
    - Validaciones de Seguridad (RBAC) para roles, usuario inactivo, no autenticado, acceso por ID ajeno.
    
## Estrategia de API

Se implementó un flujo de validación de servicios para asegurar la integridad de los datos y la resiliencia del frontend.
   
   - Endpoints (GET, POST, PATCH)
   - Status codes
   - Validación de contratos
   - Consistencia request/response

## Validación en la base de datos



## Uso de IA en el Proyecto

La IA fue utilizada como herramienta de apoyo (copiloto) para acelerar tareas operativas y mejorar la calidad de los artefactos, manteniendo siempre el criterio funcional y de QA como eje principal. Fue la encargada de la implementación del prototipo funcional con Vercel + vO.

##  Estructura del Proyecto

El proyecto está organizado bajo una arquitectura que separa la estrategia de calidad del producto desarrollado:

### 1. [qa-portfolio/](./qa-portfolio/)
Contiene toda la documentación técnica y estratégica desde la perspectiva de QA:
*   **[MODELO-DOMINIO/](./qa-portfolio/MODELO-DOMINIO/)**: Definición de entidades, reglas de negocio y ciclo de vida de los estados.
*   **[EPICS/](./qa-portfolio/EPICS/)**: Definición del alcance funcional del MVP.
*   **[HISTORIAS_USUARIO/](./qa-portfolio/HISTORIAS_USUARIO/)**: Historias de usuario refinadas con criterios de aceptación en formato Gherkin.
*   **[QA/](./qa-portfolio/QA/)**: Plan de Pruebas Funcionales (FTP), consideraciones generales de calidad y matrices de prueba.

### 2. [system-under-test/](./system-under-test/)
Contiene la implementación técnica de la aplicación (SUT - System Under Test) guiada por la IA:
*   **Frontend**: Next.js + Tailwind CSS (inspirado en la estética industrial de SAP).
*   **Backend**: API Routes de Next.js.
*   **Persistencia**: PostgreSQL con Prisma ORM.


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


Proyecto desarrollado como ejercicio integral de calidad, que me proporcionó un Laboratorio QA perfecto para demostrar capacidades analíticas y técnicas dirigidas al rol QA Engineer.
 
**Contacto**: Eileen - Profesional en Ingeniería Informática enfocada en QA Engineer.
