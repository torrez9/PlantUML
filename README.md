# DiagramCraft Studio

[![Autor: Jose](https://img.shields.io/badge/Autor-Jose-blue.svg)](https://github.com/)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![Modo: 100% Local Offline](https://img.shields.io/badge/Motor-100%25%20Local%20Offline-success.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Uso%20Gratuito%20Local-orange.svg)](LICENSE)

**DiagramCraft Studio** es una plataforma integral de modelado, diseño y generación de diagramas técnicos desarrollada y creada por **Jose**. Diseñada como software de **código abierto y uso gratuito local**, permite trabajar de forma 100% desconectada (offline), garantizando total privacidad, velocidad instantánea y cero dependencias de servicios externos o servidores en la nube.

---

## Tabla de Contenidos

- [Sobre el Proyecto y Autor](#sobre-el-proyecto-y-autor)
- [Características Principales](#características-principales)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instrucciones de Instalación y Arranque](#instrucciones-de-instalación-y-arranque)
  - [Opción 1: Arranque Rápido en 1 Clic (Windows)](#opción-1-arranque-rápido-en-1-clic-windows)
  - [Opción 2: Ejecución desde Consola / Terminal](#opción-2-ejecución-desde-consola--terminal)
  - [Opción 3: Entorno Virtual Aislado (venv)](#opción-3-entorno-virtual-aislado-venv)
- [Catálogo de Diagramas Soportados](#catálogo-de-diagramas-soportados)
  - [Diagramas UML](#diagramas-uml)
  - [Diagramas No-UML y Arquitectura](#diagramas-no-uml-y-arquitectura)
- [Capacidad de Decodificación y Renderizado Local](#capacidad-de-decodificación-y-renderizado-local)
- [Ejemplos Listos para Probar](#ejemplos-listos-para-probar)
- [Exportación y Formatos](#exportación-y-formatos)
- [Atajos de Teclado y Controles](#atajos-de-teclado-y-controles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Licencia y Créditos](#licencia-y-créditos)

---

## Sobre el Proyecto y Autor

- **Creador y Desarrollador Principal**: **Jose**
- **Propósito**: Proveer a desarrolladores, ingenieros de software, arquitectos y estudiantes una herramienta local, potente, libre de suscripciones y completamente independiente de plataformas en la nube.
- **Privacidad Absoluta**: Los diagramas se compilan y almacenan exclusivamente en el disco duro del usuario (`saved_diagrams/`).
- **Diseño Técnico**: Interfaz limpia basada en iconos vectoriales SVG profesionales, temas visuales oscuros y claros, y sin distracciones.

---

## Características Principales

1. **Motor de Compilación 100% Local (Offline)**:
   - Utiliza Java y el motor binario integrado en `bin/plantuml.jar`.
   - Compilación por tubería nativa (`stdin`/`stdout`) sin generar archivos temporales innecesarios.
   - Cero peticiones de red: no requiere internet ni expone tus datos a servidores de terceros.

2. **Decodificador Inteligente Bidireccional**:
   - Detecta si pegas código fuente en texto plano, cadenas comprimidas en base64 (`~1...`) o URLs completas de diagramas.
   - Descomprime y traduce automáticamente a código legible en el editor al momento de renderizar.

3. **Editor Reactivo Profesional**:
   - Numeración de líneas sincronizada, conteo de caracteres y líneas.
   - Sangría estándar con tecla `Tab` (2 espacios).
   - Interruptor de auto-renderizado mientras escribes o manual mediante `Ctrl + Enter`.

4. **Lienzo Interactivo con Zoom y Paneo Continuo**:
   - Zoom suave con rueda del ratón (`wheel`) y botones de ampliación/reducción.
   - Paneo libre arrastrando el diagrama con el ratón.
   - Visualización intercambiable entre **SVG** (vectorial de alta definición), **PNG** (imagen) y **ASCII** (texto plano).

5. **Exportaciones de Alta Resolución (UHD / 4K)**:
   - Descarga directa en **PNG** con selector de escala (`1x` Estándar, `2x` HD, `3x` Ultra HD).
   - Descarga en **SVG** vectorial sin pérdida de nitidez.
   - Descarga en **TXT** (arte ASCII para terminales).
   - Descarga del código fuente para control de versiones en Git.
   - Exportación directa a **PDF** mediante el diálogo de impresión integrado.

---

## Requisitos del Sistema

- **Sistema Operativo**: Windows 10/11, distribuciones GNU/Linux o macOS.
- **Python**: Versión 3.10, 3.11 o 3.12.
- **Java**: Java JRE/JDK 11, 17 o 21 (Eclipse Temurin JRE 21 ya instalado localmente).
- **Librerías Python**:
  - `Flask >= 3.0.0`
  - `requests >= 2.31.0`
- **Navegador Web**: Cualquier navegador moderno (Chrome, Edge, Firefox, Brave, Safari, etc.).

---

## Instrucciones de Instalación y Arranque

### Opción 1: Arranque Rápido en 1 Clic (Windows)

En la carpeta raíz del proyecto, haz doble clic en el archivo:
```text
run.bat
```
El script instalará las dependencias si faltan, abrirá tu navegador y pondrá en marcha **DiagramCraft Studio** en `http://127.0.0.1:5000`.

---

### Opción 2: Ejecución desde Consola / Terminal

1. Abre tu terminal en la carpeta del proyecto:
   ```bash
   cd c:\Users\Jose\Desktop\Proyectos\PlantUML
   ```

2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

3. Inicia el servidor de DiagramCraft Studio:
   ```bash
   python app.py
   ```

4. Abre tu navegador web en:
   ```text
   http://127.0.0.1:5000
   ```

---

### Opción 3: Entorno Virtual Aislado (venv)

```bash
# Crear entorno virtual
python -m venv venv

# Activar en Windows PowerShell:
.\venv\Scripts\Activate.ps1
# O en CMD:
.\venv\Scripts\activate.bat

# Instalar dependencias
pip install -r requirements.txt

# Iniciar aplicación
python app.py
```

---

## Catálogo de Diagramas Soportados

DiagramCraft Studio incluye más de 22 plantillas de modelado técnico:

### Diagramas UML
- **Secuencia**: Flujos temporales de llamadas, respuestas, condiciones y autonumeración.
- **Casos de Uso**: Actores, fronteras de sistema y relaciones `<<include>>` / `<<extend>>`.
- **Clases**: Interfaces, clases abstractas, visibilidad (`+`, `-`, `#`), herencia y composición.
- **Actividad (Calles / Swimlanes)**: Procesos de negocio con carriles por departamento.
- **Componentes**: Módulos desacoplados, microservicios, brokers de eventos y bases de datos.
- **Estado**: Máquinas de estados finitos con estados compuestos y guardas.
- **Objetos**: Instancias reales en memoria con valores de ejecución.
- **Despliegue**: Nodos de red, balanceadores, contenedores y réplicas en la nube.
- **Tiempo (Timing)**: Señales digitales y conmutaciones sincronizadas por reloj.
- **Entidad-Relación (ERD)**: Esquemas de bases de datos relacionales con notación Crow's Foot.

### Diagramas No-UML y Arquitectura
- **Redes (nwdiag)**: Topologías de red, direccionamiento IP, DMZ y subredes privadas.
- **Wireframes UI (Salt)**: Prototipado y maquetación de pantallas, formularios y tablas.
- **Archimate**: Arquitectura empresarial combinando negocio, aplicaciones y tecnología.
- **Gantt**: Cronogramas de gestión de proyectos, dependencias entre fases e hitos.
- **Mapas Mentales (MindMap)**: Árboles conceptuales para sesiones de lluvia de ideas.
- **WBS (EDT)**: Desglose jerárquico de trabajo para entregables de proyectos.
- **Regex**: Grafos de caminos y autómatas para expresiones regulares complejas.
- **EBNF**: Diagramas de ferrocarril para gramáticas formales y compiladores.
- **JSON Data**: Árbol gráfico interactivo para inspeccionar datos estructurados en JSON.
- **YAML Data**: Visualización en árbol de manifiestos y configuraciones YAML.
- **Arquitectura C4**: Diagramas de contexto y contenedores bajo el modelo C4 de Simon Brown.

---

## Capacidad de Decodificación y Renderizado Local

DiagramCraft Studio cuenta con una capacidad única: puedes pegar directamente una cadena comprimida de PlantUML (como `~1SoWk...`) o una URL completa, y el sistema:
1. Detecta la codificación automáticamente.
2. La desinfla con el algoritmo Deflate.
3. Rellena el editor con el código fuente en texto claro.
4. Compila el diagrama de inmediato con el motor local offline.

También puedes usar la opción en el menú: **"Personalizar ▾" > "Decodificar Cadena / URL"**.

---

## Ejemplos Listos para Probar

Dentro del botón **"Mis Diagramas"** encontrarás ejemplos pre-cargados listos para ejecutar y modificar:

1. `01_Diagrama_Secuencia_Local.puml`: Flujo completo de llamadas locales.
2. `02_Arquitectura_Microservicios_Local.puml`: Diagrama de componentes del sistema desconectado.
3. `03_Diagrama_Clases_Local.puml`: Diseño orientado a objetos de DiagramCraft.
4. `04_Diagrama_Entidad_Relacion_Local.puml`: Modelo entidad-relación relacional con Crow's Foot.
5. `05_Ejemplo_Codigo_Codificado.puml`: Demostración de renderizado y decodificación.

---

## Exportación y Formatos

- **PNG con Escalas**:
  - `1x` (Resolución Estándar para pantallas comunes).
  - `2x` (Alta Definición HD para pantallas Retina o 2K).
  - `3x` (Ultra HD / 4K para documentos impresos y publicaciones de máxima fidelidad).
- **SVG Vectorial**: Gráfico en vectores escalable al infinito sin pixelación.
- **TXT ASCII**: Representación en arte de texto plano para terminales y documentación en código.
- **PDF**: Generación directa a documento PDF mediante el diálogo de impresión del navegador.
- **Código Fuente**: Descarga del archivo `.puml` para versionar en repositorios Git.

---

## Atajos de Teclado y Controles

| Atajo / Control | Acción |
|---|---|
| `Ctrl + Enter` | Compilar y renderizar inmediatamente el diagrama en el lienzo. |
| `Ctrl + S` | Guardar el diagrama en la carpeta local `saved_diagrams/`. |
| `Tab` | Insertar sangría de 2 espacios en el editor. |
| `Rueda del Ratón` | Zoom continuo (acercar / alejar) en el lienzo del diagrama. |
| `Clic y Arrastrar` | Paneo libre para desplazarse por diagramas grandes. |
| Botones `+` / `-` / `🎯` | Acercar, alejar o restablecer el zoom a su escala 1:1. |

---

## Estructura del Proyecto

```text
DiagramCraft/
|-- app.py                  # Servidor backend Flask y API REST local
|-- encoder.py              # Motor local de compilación (Java + JAR) y decodificador
|-- requirements.txt        # Dependencias de Python (Flask, requests)
|-- run.bat                 # Script de arranque en 1 clic para Windows
|-- README.md               # Manual de usuario y documentación técnica
|-- LICENSE                 # Licencia de código abierto MIT (Jose, 2026)
|
|-- bin/
|   `-- plantuml.jar        # Motor binario nativo para compilación offline
|
|-- saved_diagrams/         # Carpeta de persistencia local para tus diagramas
|   |-- 01_Diagrama_Secuencia_Local.puml
|   |-- 02_Arquitectura_Microservicios_Local.puml
|   |-- 03_Diagrama_Clases_Local.puml
|   |-- 04_Diagrama_Entidad_Relacion_Local.puml
|   `-- 05_Ejemplo_Codigo_Codificado.puml
|
|-- templates/
|   `-- index.html          # Interfaz web principal con diseño responsive y modales
|
`-- static/
    |-- css/
    |   `-- style.css       # Sistema de diseño, variables CSS y modo oscuro/claro
    `-- js/
        |-- templates.js    # Catálogo de plantillas para diagramas UML y No-UML
        `-- app.js          # Controlador frontend: lienzo, zoom continuo, descargas
```

---

## Licencia y Créditos

Este software ha sido desarrollado y creado por **Jose**. Se distribuye bajo los términos de la **Licencia MIT**, permitiendo su uso gratuito, libre modificación, estudio y redistribución tanto para proyectos personales como comerciales.

Para más información, consulta el archivo [LICENSE](LICENSE).
