# MVP Gestión de Solicitudes de Compra (SAP MM) - QA Portfolio

Este repositorio representa un hito clave en mi portafolio profesional como **QA Funcional**. Se trata de un MVP (Producto Mínimo Viable) inspirado en el flujo de Solicitudes de Compra de SAP MM (`ME51N`), diseñado para demostrar capacidades en análisis funcional, diseño de pruebas bajo enfoque *Shift-Left* y validación de reglas de negocio complejas.

## 📂 Estructura del Proyecto

El proyecto está organizado bajo una arquitectura que separa la estrategia de calidad del producto desarrollado:

### 1. [qa-portfolio/](./qa-portfolio/)
Contiene toda la documentación técnica y estratégica desde la perspectiva de QA:
*   **[MODELO-DOMINIO/](./qa-portfolio/MODELO-DOMINIO/)**: Definición de entidades, reglas de negocio y ciclo de vida de los estados.
*   **[EPICS/](./qa-portfolio/EPICS/)**: Definición del alcance funcional del MVP.
*   **[HISTORIAS_USUARIO/](./qa-portfolio/HISTORIAS_USUARIO/)**: Historias de usuario refinadas con criterios de aceptación en formato Gherkin.
*   **[QA/](./qa-portfolio/QA/)**: Plan de Pruebas Funcionales (FTP), consideraciones generales de calidad y matrices de prueba.

### 2. [system-under-test/](./system-under-test/)
Contiene la implementación técnica de la aplicación (SUT - System Under Test):
*   **Frontend**: Next.js + Tailwind CSS (inspirado en la estética industrial de SAP).
*   **Backend**: API Routes de Next.js.
*   **Persistencia**: PostgreSQL con Prisma ORM.

---

## 🚀 Cómo ejecutar el Sistema Bajo Prueba (SUT)

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
5.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🎯 Objetivo del Portafolio
Evidenciar el dominio de:
*   **Análisis de Requerimientos**: Transformación de procesos de negocio (SAP) en documentación técnica testeable.
*   **Diseño de Pruebas**: Aplicación de técnicas de caja negra, valores límite y partición de equivalencias.
*   **QA Shift-Left**: Colaboración temprana en la definición de reglas de negocio para prevenir defectos.
*   **API Testing**: Validación de contratos y lógica de negocio en la capa de servicios.

---
**Contacto**: Eileen - Profesional en Ingeniería Informática enfocada en QA Funcional.
