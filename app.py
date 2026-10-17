"""
========================================================================================
Aplicación: DiagramCraft Studio
Autor: Jose
Edición: Código Abierto y Uso Gratuito Local (100% Offline & Open Source)
Framework: Flask 3.0+
Descripción:
Servidor web y API REST con validaciones exhaustivas, protección contra vulnerabilidades
(Path Traversal, inyección de nombres reservados en Windows, desbordamiento de carga)
y manejo de excepciones para garantizar estabilidad al 110%.
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
    MAX_CODE_LENGTH,
    DEFAULT_SERVER_URL
)

# Inicialización de Flask
app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # Límite máximo de petición HTTP: 2 MB

# Directorio local seguro para almacenamiento de diagramas
SAVED_DIR = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_diagrams"))
os.makedirs(SAVED_DIR, exist_ok=True)

# Lista de nombres reservados en sistemas de archivos Windows
WINDOWS_RESERVED_NAMES = {
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
}

ALLOWED_FORMATS = {"svg", "png", "txt", "puml"}
ALLOWED_SCALES = {"1", "2", "3", "4"}

def is_safe_filename(filename: str) -> bool:
    """
    Valida estrictamente que el nombre de archivo no contenga rutas relativas,
    caracteres maliciosos ni nombres reservados por el sistema operativo.
    """
    if not filename or len(filename) > 120:
        return False

    base_name = os.path.basename(filename)
    if base_name != filename:
        return False  # Intento de path traversal

    stem = os.path.splitext(base_name)[0].upper()
    if stem in WINDOWS_RESERVED_NAMES:
        return False

    # Caracteres permitidos: alfanuméricos, guión bajo, guión medio, punto y espacio
    return bool(re.match(r'^[a-zA-Z0-9_\-\. ]+$', base_name))

def resolve_safe_filepath(filename: str) -> str:
    """
    Resuelve la ruta completa y verifica que resida estrictamente dentro de SAVED_DIR.
    Lanza ValueError si se detecta cualquier intento de escape o nombre inválido.
    """
    if not filename or not isinstance(filename, str):
        raise ValueError("Nombre de archivo inválido.")

    clean_name = filename.strip()
    if not is_safe_filename(clean_name):
        raise ValueError(f"Nombre de archivo inválido o no permitido: {clean_name}")

    full_path = os.path.realpath(os.path.join(SAVED_DIR, clean_name))
    real_saved_dir = os.path.realpath(SAVED_DIR)

    # Verificación estricta de prefijo de directorio para evitar Path Traversal
    if not full_path.startswith(real_saved_dir + os.sep) and full_path != real_saved_dir:
        raise ValueError("Acceso a directorio fuera del área permitida denegado.")

    return full_path

# --------------------------------------------------------------------------------------
# Plantillas Iniciales de Demostración Local
# --------------------------------------------------------------------------------------
SAMPLE_DIAGRAMS = {
    "01_Diagrama_Secuencia_Local.puml": """@startuml
!theme cerulean
autonumber
title Diagrama de Secuencia - Renderizado 100% Local Offline

actor "Usuario" as User
boundary "Interfaz DiagramCraft" as Web
control "Servidor Flask Local" as Flask
entity "Motor Local JAR" as Engine

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
    [Motor Local (Java JRE 21)] as LocalEngine
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

# Inicializar ejemplos en disco
for filename, content in SAMPLE_DIAGRAMS.items():
    try:
        filepath = os.path.join(SAVED_DIR, filename)
        if not os.path.exists(filepath):
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content.strip())
    except Exception as e:
        print(f"Nota: No se pudo escribir ejemplo inicial {filename}: {e}")

# --------------------------------------------------------------------------------------
# Manejo Global de Errores y Excepciones HTTP (Bilingüe / Robustez al 110%)
# --------------------------------------------------------------------------------------

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        "success": False,
        "error": "Petición inválida o parámetros incorrectos. / Bad request or invalid parameters.",
        "status_code": 400
    }), 400

@app.errorhandler(404)
def resource_not_found(error):
    return jsonify({
        "success": False,
        "error": "El recurso o archivo solicitado no fue encontrado. / The requested resource was not found.",
        "status_code": 404
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "success": False,
        "error": "Método HTTP no permitido para esta ruta. / HTTP method not allowed for this route.",
        "status_code": 405
    }), 405

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        "success": False,
        "error": "La carga enviada supera el límite máximo permitido (2 MB). / Payload exceeds the 2 MB limit.",
        "status_code": 413
    }), 413

@app.errorhandler(422)
def unprocessable_entity(error):
    return jsonify({
        "success": False,
        "error": "No se pudo procesar la sintaxis del diagrama enviado. / Unprocessable diagram syntax.",
        "status_code": 422
    }), 422

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "error": "Error interno del servidor en DiagramCraft Studio. / Internal server error in DiagramCraft Studio.",
        "status_code": 500
    }), 500

# --------------------------------------------------------------------------------------
# Rutas Principales
# --------------------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/status", methods=["GET"])
def api_status():
    """
    Retorna el estado de operatividad del motor local (Java + plantuml.jar).
    """
    try:
        local_ready = is_local_engine_available()
        return jsonify({
            "success": True,
            "engine": "local_jar" if local_ready else "remote_fallback",
            "is_offline": local_ready,
            "message": "Motor 100% Local Offline Activo (Java + JAR)" if local_ready else "Motor Remoto de Contingencia"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error al verificar estado del motor: {str(e)}"
        }), 500

@app.route("/api/decode", methods=["POST"])
def api_decode():
    """
    Decodifica una cadena o URL de PlantUML de forma segura.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        raw_input = data.get("encoded", "")

        if not raw_input or not isinstance(raw_input, str):
            return jsonify({"success": False, "error": "Debe proporcionar una cadena de texto válida."}), 400

        if len(raw_input) > MAX_CODE_LENGTH:
            return jsonify({"success": False, "error": "La cadena supera el límite máximo de tamaño."}), 413

        decoded = decode_plantuml(raw_input)
        return jsonify({
            "success": True,
            "code": decoded
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error al decodificar: {str(e)}"}), 500

@app.route("/api/render", methods=["POST"])
def api_render():
    """
    Renderiza un diagrama validando formato, tamaño y manejando excepciones de compilación.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        raw_code = data.get("code", "")
        output_format = str(data.get("format", "svg")).lower().strip()
        server_url = data.get("server_url", DEFAULT_SERVER_URL)

        # Validación 1: Presencia de código
        if not raw_code or not isinstance(raw_code, str) or not raw_code.strip():
            return jsonify({"success": False, "error": "El código del diagrama no puede estar vacío."}), 400

        # Validación 2: Tamaño de código
        if len(raw_code) > MAX_CODE_LENGTH:
            return jsonify({"success": False, "error": "El código del diagrama supera el límite de 1 MB."}), 413

        # Validación 3: Formato permitido
        if output_format not in {"svg", "png", "txt"}:
            output_format = "svg"

        # Decodificación automática preventiva
        decoded_code = decode_plantuml(raw_code)

        # Compilación en motor local
        success, content, content_type = render_diagram(decoded_code, output_format, server_url)
        encoded = encode_plantuml(decoded_code)

        if not success:
            error_msg = content.decode("utf-8", errors="replace")
            return jsonify({
                "success": False,
                "error": error_msg,
                "decoded_code": decoded_code,
                "encoded": encoded
            }), 422

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

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Excepción durante el renderizado: {str(e)}"
        }), 500

@app.route("/api/download", methods=["POST"])
def api_download():
    """
    Endpoint para descarga directa con validaciones de nombre, escala y formato.
    """
    try:
        raw_code = request.form.get("code", "")
        output_format = request.form.get("format", "png").lower().strip()
        custom_filename = request.form.get("filename", "diagrama").strip()
        server_url = request.form.get("server_url", DEFAULT_SERVER_URL)
        scale = request.form.get("scale", "1").strip()

        # Validación 1: Formato
        if output_format not in ALLOWED_FORMATS:
            output_format = "png"

        # Validación 2: Escala
        if scale not in ALLOWED_SCALES:
            scale = "1"

        # Validación 3: Sanitización de nombre de archivo
        safe_filename = re.sub(r'[^a-zA-Z0-9_\-\. ]', '_', custom_filename).strip()
        if not safe_filename or not is_safe_filename(safe_filename):
            safe_filename = "diagrama"

        # Validación 4: Presencia de código
        if not raw_code:
            return Response("El código del diagrama no puede estar vacío.", status=400, mimetype="text/plain")

        code = decode_plantuml(raw_code)

        # Descarga de código fuente (.puml)
        if output_format == "puml":
            final_puml_name = f"{safe_filename}.puml" if not safe_filename.endswith(".puml") else safe_filename
            return Response(
                code,
                mimetype="text/plain; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="{final_puml_name}"'}
            )

        # Aplicar factor de escala a PNG si se seleccionó 2x, 3x o 4x
        rendered_code = code
        if scale in {"2", "3", "4"} and output_format == "png":
            if "scale " not in rendered_code:
                rendered_code = re.sub(r'(@start[a-z]+)', rf'\1\nscale {scale}', rendered_code, count=1)

        success, content, content_type = render_diagram(rendered_code, output_format, server_url)
        if not success:
            err_msg = content.decode("utf-8", errors="replace")
            return Response(f"Error generando archivo para descarga: {err_msg}", status=500, mimetype="text/plain")

        ext_map = {"svg": "svg", "png": "png", "txt": "txt"}
        ext = ext_map.get(output_format, "png")
        final_name = f"{safe_filename}.{ext}" if not safe_filename.endswith(f".{ext}") else safe_filename

        return send_file(
            io.BytesIO(content),
            mimetype=content_type,
            as_attachment=True,
            download_name=final_name
        )

    except Exception as e:
        return Response(f"Error procesando solicitud de descarga: {str(e)}", status=500, mimetype="text/plain")

# --------------------------------------------------------------------------------------
# Gestión Local de Diagramas con Protección Estricta
# --------------------------------------------------------------------------------------

@app.route("/api/diagrams", methods=["GET"])
def list_diagrams():
    """
    Lista los diagramas almacenados en la carpeta local salvaguardando la seguridad.
    """
    try:
        files = []
        if os.path.exists(SAVED_DIR):
            for fname in sorted(os.listdir(SAVED_DIR)):
                if fname.endswith((".puml", ".wsd", ".txt")) and is_safe_filename(fname):
                    path = os.path.join(SAVED_DIR, fname)
                    if os.path.isfile(path):
                        files.append({
                            "filename": fname,
                            "size": os.path.getsize(path),
                            "updated_at": os.path.getmtime(path)
                        })
        return jsonify({"success": True, "diagrams": files})
    except Exception as e:
        return jsonify({"success": False, "error": f"Error al listar diagramas: {str(e)}"}), 500

@app.route("/api/diagrams/<filename>", methods=["GET"])
def get_diagram(filename):
    """
    Obtiene el contenido de un diagrama validando estrictamente contra Path Traversal.
    """
    try:
        filepath = resolve_safe_filepath(filename)
        if not os.path.isfile(filepath):
            return jsonify({"success": False, "error": "Diagrama no encontrado."}), 404

        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            code = f.read()

        return jsonify({"success": True, "filename": os.path.basename(filepath), "code": code})
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Error al leer diagrama: {str(e)}"}), 500

@app.route("/api/diagrams", methods=["POST"])
def save_diagram():
    """
    Guarda o actualiza un diagrama en disco con validaciones de nombre y contenido.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        raw_name = data.get("name", "")
        code = data.get("code", "")

        if not raw_name or not isinstance(raw_name, str) or not raw_name.strip():
            return jsonify({"success": False, "error": "Debe especificar un nombre válido para el diagrama."}), 400

        if not code or not isinstance(code, str) or not code.strip():
            return jsonify({"success": False, "error": "El código del diagrama no puede estar vacío."}), 400

        if len(code) > MAX_CODE_LENGTH:
            return jsonify({"success": False, "error": "El código del diagrama excede el límite de tamaño permitido."}), 413

        clean_name = raw_name.strip()
        if not clean_name.endswith(".puml"):
            clean_name += ".puml"

        filepath = resolve_safe_filepath(clean_name)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code)

        safe_basename = os.path.basename(filepath)
        return jsonify({
            "success": True,
            "message": f"Diagrama '{safe_basename}' guardado exitosamente en disco.",
            "filename": safe_basename
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Error al guardar diagrama: {str(e)}"}), 500

@app.route("/api/diagrams/<filename>", methods=["DELETE"])
def delete_diagram(filename):
    """
    Elimina un diagrama validando seguridad de ruta.
    """
    try:
        filepath = resolve_safe_filepath(filename)
        if os.path.isfile(filepath):
            os.remove(filepath)
            return jsonify({
                "success": True,
                "message": f"Diagrama '{os.path.basename(filepath)}' eliminado correctamente."
            })
        return jsonify({"success": False, "error": "Diagrama no encontrado."}), 404
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Error al eliminar diagrama: {str(e)}"}), 500

# --------------------------------------------------------------------------------------
# Punto de Entrada
# --------------------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    local_ok = is_local_engine_available()
    print("=" * 65)
    print("  DiagramCraft Studio (Open Source & 100% Local Offline)")
    print(f"  Motor de renderizado: {'100% LOCAL OFFLINE (Java + JAR)' if local_ok else 'Servidor Remoto'}")
    print(f"  Servidor iniciado en: http://127.0.0.1:{port}")
    print(f"  Carpeta de diagramas: {SAVED_DIR}")
    print("=" * 65)
    app.run(host="0.0.0.0", port=port, debug=True)
