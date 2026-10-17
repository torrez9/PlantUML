"""
========================================================================================
Aplicación: DiagramCraft Studio
Edición: Código Abierto y Uso Gratuito Local (100% Offline & Open Source)
Framework: Flask 3.0+
Descripción: Servidor web y API REST para diseñar, previsualizar, exportar y gestionar
diagramas PlantUML de forma 100% LOCAL sin depender de internet ni de servicios externos.
========================================================================================
"""

import os
import re
import base64
import io
from flask import Flask, render_template, request, jsonify, Response, send_file
from encoder import (
    render_diagram,
    encode_plantuml,
    decode_plantuml,
    is_local_engine_available,
    DEFAULT_SERVER_URL
)

# Inicialización de la aplicación Flask
app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # Caracteres especiales y acentos en respuestas JSON

# Directorio local para almacenamiento persistente de diagramas
SAVED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_diagrams")
os.makedirs(SAVED_DIR, exist_ok=True)

# --------------------------------------------------------------------------------------
# Plantillas y diagramas iniciales de demostración locales
# --------------------------------------------------------------------------------------
SAMPLE_DIAGRAMS = {
    "01_Diagrama_Secuencia_Local.puml": """@startuml
!theme cerulean
autonumber
title Diagrama de Secuencia - Renderizado 100% Local Offline

actor "Usuario" as User
boundary "Interfaz DiagramCraft" as Web
control "Servidor Flask Local" as Flask
entity "Motor PlantUML JAR" as Engine

User -> Web : Escribe o pega código / cadena codificada
activate Web
Web -> Flask : POST /api/render {code, format}
activate Flask
Flask -> Flask : Detecta si requiere decodificación
Flask -> Engine : Ejecuta java -jar plantuml.jar (Pipe Local)
activate Engine
Engine --> Flask : Genera SVG / PNG nativo
deactivate Engine
Flask --> Web : Retorna gráfico vectorial directamente
deactivate Flask
Web --> User : Muestra diagrama en el lienzo interactivo
deactivate Web
@enduml""",

    "02_Arquitectura_Microservicios_Local.puml": """@startuml
!theme materia
title Arquitectura de Sistema Local Desconectado

package "DiagramCraft Studio (Host Local)" {
    [Navegador Web / SPA] as Browser
    [Servidor Flask (Python 3.12)] as FlaskServer
    [Motor Local PlantUML (Java JRE 21)] as LocalEngine
    folder "Carpeta saved_diagrams/" as Storage
}

Browser --> FlaskServer : HTTP :5000 (Localhost / LAN)
FlaskServer --> LocalEngine : Proceso Local Subprocess
FlaskServer --> Storage : Lectura y Escritura de archivos .puml
@enduml""",

    "03_Diagrama_Clases_Local.puml": """@startuml
!theme cerulean
skinparam classAttributeIconSize 0
title Diagrama de Clases del Motor Local

interface RenderEngine {
  +render(code: String, format: String): byte[]
  +isAvailable(): Boolean
}

class LocalJarEngine {
  -javaPath: String
  -jarPath: String
  +render(code: String, format: String): byte[]
  +isAvailable(): Boolean
}

class DiagramController {
  -savedDir: String
  +renderPreview(req: Request): Response
  +download(format: String): File
  +decodeInput(encoded: String): String
}

class DiagramDecoder {
  -alphabet: String
  +decode64(data: String): byte[]
  +inflate(compressed: byte[]): String
}

RenderEngine <|.. LocalJarEngine : implementa
DiagramController --> RenderEngine : usa
DiagramController --> DiagramDecoder : utiliza
@enduml""",

    "04_Diagrama_Entidad_Relacion_Local.puml": """@startuml
!theme cerulean
title Diagrama Entidad-Relación (ERD) Local

entity "USUARIO" as user {
  * id : UUID <<PK>>
  --
  * email : VARCHAR(255) <<UNIQUE>>
  * nombre : VARCHAR(120)
  * password_hash : VARCHAR(255)
  * creado_en : TIMESTAMP
}

entity "PROYECTO" as proj {
  * id : UUID <<PK>>
  --
  * usuario_id : UUID <<FK>>
  * nombre_proyecto : VARCHAR(100)
  * descripcion : TEXT
}

entity "DIAGRAMA" as diag {
  * id : UUID <<PK>>
  --
  * proyecto_id : UUID <<FK>>
  * titulo : VARCHAR(150)
  * codigo_fuente : TEXT
  * actualizado_en : TIMESTAMP
}

user ||--o{ proj : "administra"
proj ||--|{ diag : "contiene"
@enduml""",

    "05_Ejemplo_Codigo_Codificado.puml": """@startuml
!theme vibrant
title Prueba de Decodificación y Renderizado Local
node "Cadena Codificada" as Enc
node "Decodificador Python" as Dec
node "Lienzo SVG Local" as View

Enc -> Dec : Envía datos comprimidos
Dec -> View : Renderiza diagrama 100% offline
@enduml"""
}

# Crear ejemplos iniciales en disco
for filename, content in SAMPLE_DIAGRAMS.items():
    filepath = os.path.join(SAVED_DIR, filename)
    if not os.path.exists(filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip())

# --------------------------------------------------------------------------------------
# Rutas Principales
# --------------------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")

# --------------------------------------------------------------------------------------
# API REST de Renderizado, Decodificación y Descargas
# --------------------------------------------------------------------------------------

@app.route("/api/status", methods=["GET"])
def api_status():
    """
    Informa sobre el estado del motor local (Java + plantuml.jar).
    """
    local_ready = is_local_engine_available()
    return jsonify({
        "success": True,
        "engine": "local_jar" if local_ready else "remote_fallback",
        "is_offline": local_ready,
        "message": "Motor 100% Local (Java + plantuml.jar)" if local_ready else "Motor Remoto de Contingencia"
    })

@app.route("/api/decode", methods=["POST"])
def api_decode():
    """
    Decodifica una cadena o URL de PlantUML y retorna el código fuente en texto plano.
    """
    data = request.get_json(force=True) or {}
    raw_input = data.get("encoded", "").strip()

    if not raw_input:
        return jsonify({"success": False, "error": "No se proporcionó cadena para decodificar."}), 400

    decoded = decode_plantuml(raw_input)
    return jsonify({
        "success": True,
        "code": decoded
    })

@app.route("/api/render", methods=["POST"])
def api_render():
    """
    Renderiza el diagrama de forma 100% LOCAL.
    Acepta tanto código fuente PlantUML como cadenas codificadas o URLs.
    """
    data = request.get_json(force=True) or {}
    raw_code = data.get("code", "").strip()
    output_format = data.get("format", "svg").lower()
    server_url = data.get("server_url", DEFAULT_SERVER_URL)

    if not raw_code:
        return jsonify({"success": False, "error": "El código PlantUML no puede estar vacío."}), 400

    # Auto-decodificar si se suministró una cadena codificada
    decoded_code = decode_plantuml(raw_code)

    # Renderizar diagrama (prioriza 100% el motor local)
    success, content, content_type = render_diagram(decoded_code, output_format, server_url)
    encoded = encode_plantuml(decoded_code)

    if not success:
        error_msg = content.decode("utf-8", errors="replace")
        return jsonify({
            "success": False,
            "error": error_msg,
            "decoded_code": decoded_code,
            "encoded": encoded
        }), 400

    is_local = is_local_engine_available()

    if output_format == "svg":
        svg_text = content.decode("utf-8", errors="replace")
        return jsonify({
            "success": True,
            "format": "svg",
            "content": svg_text,
            "decoded_code": decoded_code,
            "encoded": encoded,
            "engine": "local_offline" if is_local else "remote"
        })
    elif output_format == "png":
        b64 = base64.b64encode(content).decode("ascii")
        return jsonify({
            "success": True,
            "format": "png",
            "base64": b64,
            "decoded_code": decoded_code,
            "encoded": encoded,
            "engine": "local_offline" if is_local else "remote"
        })
    else:  # txt
        txt_content = content.decode("utf-8", errors="replace")
        return jsonify({
            "success": True,
            "format": "txt",
            "content": txt_content,
            "decoded_code": decoded_code,
            "encoded": encoded,
            "engine": "local_offline" if is_local else "remote"
        })

@app.route("/api/download", methods=["POST"])
def api_download():
    """
    Genera la descarga directa del archivo compilado en el formato seleccionado.
    """
    raw_code = request.form.get("code", "").strip()
    output_format = request.form.get("format", "png").lower()
    custom_filename = request.form.get("filename", "diagrama").strip()
    server_url = request.form.get("server_url", DEFAULT_SERVER_URL)
    scale = request.form.get("scale", "1").strip()

    safe_filename = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', custom_filename)
    if not safe_filename:
        safe_filename = "diagrama"

    # Decodificar si venía codificado
    code = decode_plantuml(raw_code)

    if output_format == "puml":
        return Response(
            code,
            mimetype="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{safe_filename}.puml"'}
        )

    # Soporte para escala en PNG local
    rendered_code = code
    if scale in ["2", "3", "4"] and output_format == "png":
        if "scale " not in rendered_code:
            rendered_code = re.sub(r'(@start[a-z]+)', rf'\1\nscale {scale}', rendered_code, count=1)

    success, content, content_type = render_diagram(rendered_code, output_format, server_url)
    if not success:
        return Response("Error generando archivo para descarga.", status=500, mimetype="text/plain")

    ext_map = {"svg": "svg", "png": "png", "txt": "txt"}
    ext = ext_map.get(output_format, "png")
    final_name = f"{safe_filename}.{ext}" if not safe_filename.endswith(f".{ext}") else safe_filename

    return send_file(
        io.BytesIO(content),
        mimetype=content_type,
        as_attachment=True,
        download_name=final_name
    )

# --------------------------------------------------------------------------------------
# Gestión Local de Diagramas en Disco
# --------------------------------------------------------------------------------------

@app.route("/api/diagrams", methods=["GET"])
def list_diagrams():
    files = []
    if os.path.exists(SAVED_DIR):
        for fname in sorted(os.listdir(SAVED_DIR)):
            if fname.endswith((".puml", ".wsd", ".txt")):
                path = os.path.join(SAVED_DIR, fname)
                size = os.path.getsize(path)
                mtime = os.path.getmtime(path)
                files.append({
                    "filename": fname,
                    "size": size,
                    "updated_at": mtime
                })
    return jsonify({"success": True, "diagrams": files})

@app.route("/api/diagrams/<filename>", methods=["GET"])
def get_diagram(filename):
    safe_name = os.path.basename(filename)
    filepath = os.path.join(SAVED_DIR, safe_name)
    if not os.path.exists(filepath):
        return jsonify({"success": False, "error": "Diagrama no encontrado."}), 404

    with open(filepath, "r", encoding="utf-8") as f:
        code = f.read()

    return jsonify({"success": True, "filename": safe_name, "code": code})

@app.route("/api/diagrams", methods=["POST"])
def save_diagram():
    data = request.get_json(force=True) or {}
    name = data.get("name", "").strip()
    code = data.get("code", "")

    if not name:
        return jsonify({"success": False, "error": "Debe especificar un nombre para el diagrama."}), 400
    if not code:
        return jsonify({"success": False, "error": "El código del diagrama no puede estar vacío."}), 400

    if not name.endswith(".puml"):
        name += ".puml"

    safe_name = os.path.basename(name)
    filepath = os.path.join(SAVED_DIR, safe_name)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(code)

    return jsonify({
        "success": True,
        "message": f"Diagrama '{safe_name}' guardado exitosamente en disco.",
        "filename": safe_name
    })

@app.route("/api/diagrams/<filename>", methods=["DELETE"])
def delete_diagram(filename):
    safe_name = os.path.basename(filename)
    filepath = os.path.join(SAVED_DIR, safe_name)
    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({"success": True, "message": f"Diagrama '{safe_name}' eliminado correctamente."})
    return jsonify({"success": False, "error": "Diagrama no encontrado."}), 404

# --------------------------------------------------------------------------------------
# Punto de entrada
# --------------------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    local_ok = is_local_engine_available()
    print("=" * 65)
    print("  DiagramCraft Studio (Open Source & 100% Local Offline)")
    print(f"  Motor de renderizado: {'100% LOCAL (Java + plantuml.jar)' if local_ok else 'Servidor Remoto'}")
    print(f"  Servidor iniciado en: http://127.0.0.1:{port}")
    print(f"  Carpeta de diagramas: {SAVED_DIR}")
    print("=" * 65)
    app.run(host="0.0.0.0", port=port, debug=True)
