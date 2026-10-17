/**
 * ======================================================================================
 * Biblioteca de Plantillas: templates.js
 * Aplicación: DiagramCraft Studio
 * Creador y Desarrollador: Jose
 * Licencia: Código Abierto y Uso Gratuito Local (MIT)
 * Descripción: Catálogo exhaustivo de plantillas listas para usar en DiagramCraft Studio.
 * Incluye todos los tipos de diagramas UML estándar, diagramas de arquitectura,
 * modelado de procesos, datos (JSON/YAML), gramáticas, diagramas de red y maquetación UI.
 * ======================================================================================
 */

const DIAGRAM_TEMPLATES = {
    // ==================================================================================
    // 1. DIAGRAMAS UML ESTÁNDAR
    // ==================================================================================
    
    // --- 1.1 Diagrama de Secuencia ---
    sequence: {
        id: "sequence",
        name: "Secuencia",
        category: "uml",
        badge: "UML",
        description: "Interacción temporal entre componentes, actores y bases de datos con llamadas y retornos.",
        code: `@startuml
!theme cerulean
autonumber
title Flujo de Autenticación y Autorización en DiagramCraft Studio

actor "Cliente Web" as Client
boundary "API Gateway" as Gateway
control "Servicio de Auth" as Auth
database "PostgreSQL DB" as DB
database "Redis Cache" as Cache

Client -> Gateway : POST /api/v1/auth/login {email, password}
activate Gateway

Gateway -> Auth : Validar Credenciales
activate Auth

Auth -> DB : SELECT id, password_hash, rol FROM usuarios WHERE email = ?
activate DB
DB --> Auth : Registro de usuario
deactivate DB

Auth -> Auth : Verificar hash con Argon2id / Bcrypt

alt Credenciales Válidas
    Auth -> Cache : SETEX session:user_id 3600 {token_data}
    activate Cache
    Cache --> Auth : OK
    deactivate Cache
    
    Auth --> Gateway : 200 OK + JWT Token (Access & Refresh)
    Gateway --> Client : 200 OK { token, expires_in: 3600 }
else Credenciales Inválidas
    Auth --> Gateway : 401 Unauthorized { error: "Credenciales erróneas" }
    Gateway --> Client : 401 Unauthorized
end

deactivate Auth
deactivate Gateway
@enduml`
    },

    // --- 1.2 Diagrama de Casos de Uso ---
    usecase: {
        id: "usecase",
        name: "Casos de Uso",
        category: "uml",
        badge: "UML",
        description: "Relación entre actores del negocio, límites del sistema y casos de uso con relaciones include/extend.",
        code: `@startuml
!theme materia
left to right direction
skinparam packageStyle rectangle

actor "Cliente" as Customer
actor "Administrador" as Admin
actor "Pasarela de Pagos" as PaymentGateway
actor "Servicio de Correo" as EmailService

rectangle "Sistema de Comercio Electrónico" {
    usecase "Registrarse en Plataforma" as UC_Reg
    usecase "Explorar Catálogo de Productos" as UC_Catalog
    usecase "Gestionar Carrito de Compras" as UC_Cart
    usecase "Tramitar Pedido (Checkout)" as UC_Checkout
    usecase "Procesar Pago Seguro" as UC_Pay
    usecase "Aplicar Cupón de Descuento" as UC_Coupon
    usecase "Enviar Notificación por Email" as UC_Notify
    usecase "Gestionar Inventario" as UC_Inventory
    usecase "Generar Reportes Financieros" as UC_Reports
}

Customer --> UC_Reg
Customer --> UC_Catalog
Customer --> UC_Cart
Customer --> UC_Checkout

UC_Checkout ..> UC_Pay : <<include>>
UC_Checkout ..> UC_Notify : <<include>>
UC_Checkout <.. UC_Coupon : <<extend>>

UC_Pay --> PaymentGateway
UC_Notify --> EmailService

Admin --> UC_Inventory
Admin --> UC_Reports
@enduml`
    },

    // --- 1.3 Diagrama de Clases ---
    class: {
        id: "class",
        name: "Clases",
        category: "uml",
        badge: "UML",
        description: "Estructura estática orientada a objetos: clases abstractas, interfaces, visibilidad y herencia.",
        code: `@startuml
!theme cerulean
skinparam classAttributeIconSize 0

interface Renderizable {
    +render(formato: FormatoSalida): bytes
    +obtenerDimensiones(): Dimension
}

abstract class DiagramaBase {
    #id: UUID
    #titulo: String
    #codigoFuente: String
    #creadoEn: DateTime
    +compilar(): Boolean
    +{abstract} exportar(ruta: String): void
}

class DiagramaUML {
    -tipoUML: TipoDiagrama
    -temaEstilo: String
    +aplicarTema(tema: String): void
    +exportar(ruta: String): void
}

class DiagramaNoUML {
    -motorSintaxis: String
    +exportar(ruta: String): void
}

class ExportadorArchivos {
    +generarPNG(diagrama: DiagramaBase, dpi: Integer): File
    +generarSVG(diagrama: DiagramaBase): File
    +generarASCII(diagrama: DiagramaBase): File
}

enum FormatoSalida {
    PNG
    SVG
    ASCII_TXT
    PUML_SOURCE
}

DiagramaBase <|-- DiagramaUML
DiagramaBase <|-- DiagramaNoUML
Renderizable <|.. DiagramaBase
ExportadorArchivos ..> DiagramaBase : procesa
ExportadorArchivos ..> FormatoSalida : utiliza
@enduml`
    },

    // --- 1.4 Diagrama de Actividad (Swimlanes / Calles) ---
    activity: {
        id: "activity",
        name: "Actividad (Calles)",
        category: "uml",
        badge: "UML",
        description: "Flujo de trabajo detallado con bifurcaciones condicionales y división por carriles (swimlanes).",
        code: `@startuml
!theme vibrant
title Proceso de Aprobación de Crédito

|Cliente|
start
:Llenar solicitud de crédito en línea;
:Adjuntar comprobantes de ingresos;

|#LightSkyBlue|Sistema de Créditos|
:Validar formato de documentos;
if (¿Documentos completos?) then (No)
    :Notificar solicitud incompleta;
    |Cliente|
    :Reenviar documentos corregidos;
    |Sistema de Créditos|
endif

:Consultar score en Buró de Crédito;
if (¿Score >= 700?) then (Sí)
    :Aprobación automática pre-calificada;
else (No)
    |#AntiqueWhite|Oficial de Riesgo|
    :Revisar historial crediticio manualmente;
    if (¿Riesgo Aceptable?) then (Sí)
        :Aprobar crédito con tasa ajustada;
    else (No)
        :Rechazar solicitud con motivo;
        |Cliente|
        :Recibir notificación de rechazo;
        stop
    endif
endif

|Sistema de Créditos|
:Generar contrato digital;

|Cliente|
:Firmar contrato electrónicamente;

|#LightSkyBlue|Sistema de Créditos|
:Dispersar fondos a cuenta bancaria;
stop
@enduml`
    },

    // --- 1.5 Diagrama de Componentes ---
    component: {
        id: "component",
        name: "Componentes",
        category: "uml",
        badge: "UML",
        description: "Estructura modular del sistema con puertos, interfaces y microservicios conectados.",
        code: `@startuml
!theme cerulean

package "Capa de Presentación" {
    [Single Page Application (React/Vue)] as SPA
    [App Móvil (Flutter/Kotlin)] as MobileApp
}

package "Puerta de Entrada" {
    [Reverse Proxy / WAF] as Proxy
    [API Gateway (Traefik/Kong)] as Gateway
}

package "Ecosistema de Microservicios" {
    component [Auth Service] as AuthService
    component [Billing Service] as BillingService
    component [DiagramCraft Local Engine] as RenderService
    component [Notification Worker] as WorkerService
}

database "PostgreSQL Cluster" as MainDB
database "Redis In-Memory Cache" as CacheDB
queue "RabbitMQ / Kafka" as EventQueue

SPA --> Proxy : HTTPS :443
MobileApp --> Proxy : HTTPS :443
Proxy --> Gateway : HTTP Interno

Gateway --> AuthService : Valida Token JWT
Gateway --> BillingService : REST / gRPC
Gateway --> RenderService : Render Request

RenderService --> CacheDB : Consulta caché de SVG
BillingService --> MainDB : Guarda transacciones
BillingService --> EventQueue : Emite evento "PagoExitoso"
EventQueue --> WorkerService : Procesa y envía correo
@enduml`
    },

    // --- 1.6 Diagrama de Estado ---
    state: {
        id: "state",
        name: "Estado",
        category: "uml",
        badge: "UML",
        description: "Máquina de estados finitos con estados compuestos, eventos de transición y condiciones de guarda.",
        code: `@startuml
!theme materia
title Ciclo de Vida de una Orden de Compra

[*] --> Creada : Carrito confirmado

state Creada {
    [*] --> EsperandoPago
    EsperandoPago --> ValidandoTarjeta : Token de pago recibido
}

Creada --> Pagada : [Fondos suficientes] / Generar recibo
Creada --> Cancelada : [Timeout 30 min] / Liberar inventario

state Pagada {
    [*] --> PreparandoPedido
    PreparandoPedido --> Empacado : Control de calidad superado
    Empacado --> ListoParaDespacho : Etiqueta de envío generada
}

Pagada --> EnTransito : Recolectado por empresa de mensajería

state EnTransito {
    [*] --> EnRuta
    EnRuta --> IntentoEntregaFallido : Destinatario ausente
    IntentoEntregaFallido --> EnRuta : Reprogramar segundo intento
}

EnTransito --> Entregada : Firma digital del receptor
EnTransito --> EnDevolucion : Superados 3 intentos de entrega

EnDevolucion --> Reembolsada : Mercancía retorna a almacén

Cancelada --> [*]
Entregada --> [*]
Reembolsada --> [*]
@enduml`
    },

    // --- 1.7 Diagrama de Objetos ---
    object: {
        id: "object",
        name: "Objetos",
        category: "uml",
        badge: "UML",
        description: "Instancias concretas en memoria de clases con valores de atributos en tiempo de ejecución.",
        code: `@startuml
!theme cerulean

object "adminUser : Usuario" as u1 {
    id = "usr_001"
    nombre = "Jose (Creador)"
    email = "jose@diagramcraft.local"
    rol = "SUPER_ADMIN"
    activo = true
}

object "servidorLocal : DiagramCraftEngine" as s1 {
    host = "127.0.0.1"
    puerto = 5000
    modoOffline = true
}

object "diagSecuencia : Diagrama" as d1 {
    codigoId = "diag_9942"
    titulo = "Flujo de Inicio de Sesión"
    formato = "SVG"
    tamanoBytes = 4128
}

object "diagGantt : Diagrama" as d2 {
    codigoId = "diag_9943"
    titulo = "Planificación Q4"
    formato = "PNG"
    tamanoBytes = 18450
}

u1 --> d1 : creó
u1 --> d2 : creó
s1 --> d1 : procesó y renderizó
s1 --> d2 : procesó y renderizó
@enduml`
    },

    // --- 1.8 Diagrama de Despliegue ---
    deployment: {
        id: "deployment",
        name: "Despliegue",
        category: "uml",
        badge: "UML",
        description: "Infraestructura de hardware y software, nodos de red, contenedores y balanceadores de carga.",
        code: `@startuml
!theme cerulean

node "Dispositivo del Cliente" {
    artifact "Navegador Web (Chrome/Firefox)" as Browser
}

cloud "Nube AWS / GCP" {
    node "Balanceador de Carga (Application Load Balancer)" as ALB

    node "Cluster Kubernetes (EKS / GKE)" {
        node "Pod: Frontend Nginx" {
            artifact "DiagramCraft Web UI" as UI
        }

        node "Pod: Backend Flask (3 réplicas)" {
            artifact "Gunicorn WSGI" as Gunicorn
            artifact "DiagramCraft API App" as FlaskApp
            Gunicorn --> FlaskApp
        }
    }

    node "Servicio de Base de Datos Gestionada" {
        database "PostgreSQL Multi-AZ" as Postgres
    }

    node "Almacenamiento de Objetos" {
        folder "Amazon S3 Bucket (Exportaciones)" as S3
    }
}

Browser --> ALB : HTTPS :443 (TLS 1.3)
ALB --> UI : Balanceo de tráfico HTTP
UI --> FlaskApp : Peticiones /api/render
FlaskApp --> Postgres : Persistencia de metadatos
FlaskApp --> S3 : Almacenar imágenes exportadas
@enduml`
    },

    // --- 1.9 Diagrama de Tiempo (Timing) ---
    timing: {
        id: "timing",
        name: "Tiempo (Timing)",
        category: "uml",
        badge: "UML",
        description: "Representación precisa de transiciones de estado a lo largo de una línea temporal.",
        code: `@startuml
!theme vibrant
title Diagrama de Tiempo - Sincronización de Procesos

robust "Cliente Web" as Web
robust "Servidor Flask" as Server
concise "Estado de Sesión" as Session

@0
Web is Inactivo
Server is Esperando
Session is Desconectado

@100
Web is EnviandoCredenciales
Server is Esperando

@150
Web is EsperandoRespuesta
Server is ValidandoCredenciales
Session is Autenticando

@300
Server is GenerandoToken
Session is Conectado

@350
Web is Conectado
Server is EnEspera
Session is Activo

@550
Web is CerrandoSesion
Server is RevocandoToken

@650
Web is Inactivo
Server is EnEspera
Session is Desconectado
@enduml`
    },

    // --- 1.10 Diagrama Entidad-Relación (ERD) ---
    erd: {
        id: "erd",
        name: "Entidad-Relación (ERD)",
        category: "uml",
        badge: "Datos",
        description: "Diseño relacional de bases de datos con claves primarias (PK), foráneas (FK) y notación Crow's Foot.",
        code: `@startuml
!theme cerulean
skinparam linetype ortho

entity "USUARIO" as user {
  * id : UUID <<PK>>
  --
  * email : VARCHAR(255) <<UNIQUE>>
  * nombre : VARCHAR(120)
  * password_hash : VARCHAR(255)
  * rol : VARCHAR(30)
  * creado_en : TIMESTAMP
}

entity "PROYECTO" as proj {
  * id : UUID <<PK>>
  --
  * usuario_id : UUID <<FK>>
  * nombre_proyecto : VARCHAR(100)
  * descripcion : TEXT
  * es_publico : BOOLEAN
}

entity "DIAGRAMA" as diag {
  * id : UUID <<PK>>
  --
  * proyecto_id : UUID <<FK>>
  * titulo : VARCHAR(150)
  * tipo_diagrama : VARCHAR(50)
  * codigo_fuente : TEXT
  * version : INT
  * actualizado_en : TIMESTAMP
}

entity "EXPORTACION" as exp {
  * id : UUID <<PK>>
  --
  * diagrama_id : UUID <<FK>>
  * formato : VARCHAR(10)
  * url_descarga : VARCHAR(500)
  * descargado_en : TIMESTAMP
}

user ||--o{ proj : "crea y administra"
proj ||--|{ diag : "contiene"
diag ||--o{ exp : "genera"
@enduml`
    },

    // ==================================================================================
    // 2. DIAGRAMAS NO UML (ARQUITECTURA, REDES, GESTIÓN, DATOS)
    // ==================================================================================

    // --- 2.1 Diagrama de Red (nwdiag) ---
    network: {
        id: "network",
        name: "Red (nwdiag)",
        category: "non_uml",
        badge: "Redes",
        description: "Topología física y lógica de direccionamiento IP en subredes empresariales con nwdiag.",
        code: `@startuml
nwdiag {
  network DMZ {
    address = "192.168.1.0/24"

    firewall [address = "192.168.1.1"];
    lb01 [address = "192.168.1.10", shape = "box"];
    lb02 [address = "192.168.1.11", shape = "box"];
  }

  network Servicios_App {
    address = "10.0.1.0/24"

    lb01 [address = "10.0.1.10"];
    app_flask01 [address = "10.0.1.21"];
    app_flask02 [address = "10.0.1.22"];
    app_flask03 [address = "10.0.1.23"];
  }

  network Datos_Segura {
    address = "10.0.2.0/24"

    app_flask01 [address = "10.0.2.21"];
    app_flask02 [address = "10.0.2.22"];
    db_master [address = "10.0.2.100", shape = "database"];
    db_replica [address = "10.0.2.101", shape = "database"];
    redis_cache [address = "10.0.2.150", shape = "database"];
  }
}
@enduml`
    },

    // --- 2.2 Wireframe / Prototipo UI (Salt) ---
    wireframe: {
        id: "wireframe",
        name: "Wireframe UI (Salt)",
        category: "non_uml",
        badge: "UI/UX",
        description: "Maquetación de pantallas, interfaces de usuario, tablas y cuadros de diálogo.",
        code: `@startsalt
{+
  {* &Archivo | &Editar | &Diagramas | &Exportar | &Ayuda }
  {/ <b>Editor Visual</b> | Historial | Configuraciones }
  {
    <b>DiagramCraft Studio</b> (Desarrollado por Jose)
    Panel de Control y Exportación de Diagramas
    [X] Renderizado Automático al Escribir
    [X] Motor 100% Local Offline (Java + JAR)
  }
  ---
  {
    "Nombre del Diagrama: " | "Diagrama_Arquitectura_2026   "
    "Tipo de Diagrama:   " | ^UML Secuencia^UML Clases^Gantt^Mapa Mental^JSON^
    "Formato de Salida:  " | (X) PNG Alta Calidad | () SVG Vectorial | () ASCII
  }
  ---
  {
    [ Renderizar (Ctrl+Enter) ] | [ Descargar Archivo ] | [ Guardar ]
  }
}
@endsalt`
    },

    // --- 2.3 Archimate ---
    archimate: {
        id: "archimate",
        name: "Archimate",
        category: "non_uml",
        badge: "Arquitectura",
        description: "Modelado de arquitectura empresarial uniendo capas de negocio, aplicaciones e infraestructura.",
        code: `@startuml
!theme cerulean
!include <archimate/Archimate>

title Arquitectura Empresarial: DiagramCraft Studio

Business_Actor(user, "Desarrollador / Arquitecto")
Business_Service(bs_render, "Servicio de Modelado Visual")
Business_Process(bp_design, "Diseño de Arquitectura de Software")

Application_Service(app_api, "API REST de Renderizado")
Application_Component(app_flask, "Servidor Flask DiagramCraft")
Application_Component(app_storage, "Gestor de Archivos Locales")

Technology_Service(infra_python, "Entorno de Ejecución Python 3.12")
Technology_Node(infra_host, "Servidor Local Desconectado")

Rel_Flow(user, bs_render, "Interactúa con")
Rel_Aggregation(bs_render, bp_design)
Rel_Serving(app_api, bp_design)
Rel_Realization(app_flask, app_api)
Rel_Composition(app_flask, app_storage)
Rel_Serving(infra_python, app_flask)
Rel_Realization(infra_host, infra_python)
@enduml`
    },

    // --- 2.4 Diagrama de Gantt ---
    gantt: {
        id: "gantt",
        name: "Gantt (Cronograma)",
        category: "non_uml",
        badge: "Proyectos",
        description: "Cronograma de actividades, hitos clave, duraciones y dependencias entre tareas.",
        code: `@startgantt
!theme cerulean
language es
Project starts 2026-10-01

[Definición de Requisitos y Alcance] lasts 4 days

[Diseño de Interfaz DiagramCraft] lasts 6 days
[Diseño de Interfaz DiagramCraft] starts at [Definición de Requisitos y Alcance]'s end

[Desarrollo Motor Local Java/Python] lasts 10 days
[Desarrollo Motor Local Java/Python] starts at [Diseño de Interfaz DiagramCraft]'s end

[Desarrollo Frontend Interactivo] lasts 8 days
[Desarrollo Frontend Interactivo] starts at [Diseño de Interfaz DiagramCraft]'s end

[Integración y Biblioteca de Plantillas] lasts 5 days
[Integración y Biblioteca de Plantillas] starts at [Desarrollo Frontend Interactivo]'s end

[Pruebas de Exportación PNG y SVG] lasts 4 days
[Pruebas de Exportación PNG y SVG] starts at [Desarrollo Motor Local Java/Python]'s end

[Hito: Lanzamiento DiagramCraft v2.0] happens at [Pruebas de Exportación PNG y SVG]'s end
@endgantt`
    },

    // --- 2.5 Mapa Mental (MindMap) ---
    mindmap: {
        id: "mindmap",
        name: "Mapa Mental",
        category: "non_uml",
        badge: "Ideas",
        description: "Árbol conceptual para lluvia de ideas, jerarquías de conocimiento y planeación estratégica.",
        code: `@startmindmap
!theme vibrant
* DiagramCraft Studio (Por Jose)
** 1. Motor 100% Local Offline
*** Java JRE 21 Integrado
*** Compilación por Tubería JAR
*** Decodificador Automático
*** Cero Dependencia de Red
** 2. Capacidades de Diagramación
*** 10 Tipos UML Estándar
*** 12 Tipos No-UML
*** Múltiples Temas Visuales
** 3. Formatos de Exportación
*** Imagen PNG (1x, 2x, 3x UHD)
*** Vectorial SVG Sin Pérdida
*** Documento PUML Fuente
*** Arte ASCII para Terminal
** 4. Experiencia Interactiva
*** Zoom y Paneo con Ratón
*** Modo Oscuro y Modo Claro
*** Atajos de Teclado (Ctrl+Enter)
@endmindmap`
    },

    // --- 2.6 WBS (Estructura de Desglose de Trabajo) ---
    wbs: {
        id: "wbs",
        name: "WBS (EDT)",
        category: "non_uml",
        badge: "Estructura",
        description: "Descomposición jerárquica orientada al producto de los entregables de un proyecto.",
        code: `@startwbs
!theme cerulean
* DiagramCraft Studio - Proyecto de Software
** 1. Análisis y Configuración
*** 1.1 Verificación de Python 3.12 y JRE 21
*** 1.2 Estructura Modular y Binarios
** 2. Capa Backend (Flask + Motor Local)
*** 2.1 Módulo encoder.py local
*** 2.2 Endpoints de Renderizado y Decodificación
*** 2.3 Sistema de Descargas Multi-formato
*** 2.4 Almacenamiento local en disco
** 3. Capa Frontend (Web UI)
*** 3.1 Editor de Código con Atajos
*** 3.2 Lienzo SVG con Paneo y Zoom
*** 3.3 Barra de Categorías Dinámica
*** 3.4 Gestor de Temas y Modales
** 4. Despliegue y Pruebas
*** 4.1 Script Windows run.bat
*** 4.2 Documentación README y Licencia MIT
@endwbs`
    },

    // --- 2.7 Expresiones Regulares (Regex) ---
    regex: {
        id: "regex",
        name: "Regex (Expresión Regular)",
        category: "non_uml",
        badge: "Sintaxis",
        description: "Representación gráfica de máquinas de estados y caminos posibles de expresiones regulares complejas.",
        code: `@startregex
^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$
@endregex`
    },

    // --- 2.8 EBNF (Gramática Formal) ---
    ebnf: {
        id: "ebnf",
        name: "EBNF (Gramática)",
        category: "non_uml",
        badge: "Gramática",
        description: "Diagramas de ferrocarril para definir la sintaxis y reglas de un lenguaje de programación o DSL.",
        code: `@startebnf
title Gramática BNF para Sentencia SQL SELECT

sentencia_select = "SELECT" , lista_columnas , "FROM" , nombre_tabla , [ clausula_where ] , [ clausula_order ] ;
lista_columnas   = "*" | columna , { "," , columna } ;
clausula_where   = "WHERE" , condicion ;
clausula_order   = "ORDER BY" , columna , [ "ASC" | "DESC" ] ;
columna          = identificador ;
nombre_tabla     = identificador ;
@endebnf`
    },

    // --- 2.9 Visualización de JSON ---
    json: {
        id: "json",
        name: "JSON Data",
        category: "non_uml",
        badge: "Datos",
        description: "Árbol gráfico y jerárquico para inspeccionar y documentar estructuras de datos JSON complejas.",
        code: `@startjson
!theme cerulean
{
  "aplicacion": "DiagramCraft Studio",
  "version": "2.0.0",
  "autor": "Jose",
  "licencia": "MIT (Código Abierto)",
  "servidor": {
    "framework": "Flask 3.0",
    "puerto": 5000,
    "modo_offline": true,
    "host": "127.0.0.1"
  },
  "caracteristicas": {
    "motor_local": "100% Offline (Java + JAR)",
    "auto_render": true,
    "zoom_interactivo": true,
    "temas_personalizados": [
      "cerulean",
      "materia",
      "vibrant",
      "sketchy"
    ],
    "formatos_exportables": [
      "PNG",
      "SVG",
      "TXT",
      "PUML"
    ]
  },
  "estadisticas": {
    "diagramas_uml": 10,
    "diagramas_no_uml": 12,
    "total_plantillas": 22
  }
}
@endjson`
    },

    // --- 2.10 Visualización de YAML ---
    yaml: {
        id: "yaml",
        name: "YAML Data",
        category: "non_uml",
        badge: "Datos",
        description: "Visualización gráfica en formato de árbol jerárquico de archivos de configuración YAML.",
        code: `@startyaml
!theme materia
apiVersion: apps/v1
kind: Deployment
metadata:
  name: diagramcraft-service
  namespace: local
  labels:
    app: diagramcraft-studio
    author: jose
spec:
  replicas: 1
  selector:
    matchLabels:
      app: diagramcraft-studio
  template:
    metadata:
      labels:
        app: diagramcraft-studio
    spec:
      containers:
        - name: diagramcraft-app
          image: diagramcraft:latest
          ports:
            - containerPort: 5000
          env:
            - name: DIAGRAMCRAFT_OFFLINE
              value: "true"
@endyaml`
    },

    // --- 2.11 Arquitectura C4 (Modelo C4) ---
    c4: {
        id: "c4",
        name: "Arquitectura C4",
        category: "non_uml",
        badge: "C4",
        description: "Diagrama de contenedores de arquitectura según el estándar C4 Model de Simon Brown.",
        code: `@startuml
!include <C4/C4_Container>
!theme cerulean

title Diagrama de Contenedores C4 - DiagramCraft Studio (Por Jose)

Person(usuario, "Desarrollador / Usuario", "Crea, edita y exporta diagramas de software de forma local")

System_Boundary(c1, "DiagramCraft Studio (Host Local)") {
    Container(spa, "Frontend Web SPA", "HTML5, CSS3, JavaScript Vanilla", "Editor con números de línea, controles de zoom continuo y descargas directas")
    Container(flask_api, "Servidor Backend Flask", "Python 3.12, Flask 3.0", "Maneja endpoints REST, decodificación Deflate y compilación local")
    ContainerDb(archivos_locales, "Directorio Local de Diagramas", "saved_diagrams/*.puml", "Persistencia de archivos en disco local")
    Container(motor_local, "Motor Local de Renderizado", "Java JRE 21 + JAR Nativo", "Compila el código de forma 100% offline a SVG, PNG y ASCII")
}

Rel(usuario, spa, "Usa la interfaz web", "Navegador Web")
Rel(spa, flask_api, "Solicita render y descarga", "JSON / HTTP POST")
Rel(flask_api, archivos_locales, "Lee y escribe diagramas .puml", "Sistema de Archivos")
Rel(flask_api, motor_local, "Ejecuta compilación por tubería local", "Subprocess stdin/stdout")
@enduml`
    }
};
