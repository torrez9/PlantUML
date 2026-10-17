"""
========================================================================================
Módulo: encoder.py (Motor de Renderizado Local y Decodificador Robusto)
Aplicación: DiagramCraft Studio
Autor: Jose
Licencia: Código Abierto (MIT)
Descripción:
Permite renderizar diagramas de forma 100% LOCAL y OFFLINE con validaciones estrictas
y control exhaustivo de excepciones.
Soporta:
  - Extracción detallada de errores de sintaxis y números de línea.
  - Protección contra timeouts y desbordamiento de memoria.
  - Decodificación bidireccional segura.
========================================================================================
"""

import os
import sys
import zlib
import re
import shutil
import subprocess
import requests
from typing import Tuple, Optional, Dict, Any

# Rutas locales
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BIN_DIR = os.path.join(BASE_DIR, "bin")
JAR_PATH = os.path.join(BIN_DIR, "plantuml.jar")

# Límites de seguridad
MAX_CODE_LENGTH = 1_000_000  # 1 MB máximo de código
SUBPROCESS_TIMEOUT_SECONDS = 25  # Timeout máximo por diagrama

# Servidor remoto opcional como fallback
DEFAULT_SERVER_URL = "https://www.plantuml.com/plantuml"

# Alfabeto estándar de 64 caracteres de PlantUML
PLANTUML_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
DECODE_MAP = {c: i for i, c in enumerate(PLANTUML_ALPHABET)}

# Rutas comunes de Java en Windows
COMMON_JAVA_PATHS = [
    r"C:\Program Files\Eclipse Adoptium\jre-21.0.12.101-hotspot\bin\java.exe",
    r"C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot\bin\java.exe",
    r"C:\Program Files\Java\jre-21\bin\java.exe",
    r"C:\Program Files\Java\jdk-21\bin\java.exe",
]

def find_java() -> Optional[str]:
    """
    Localiza de forma segura el ejecutable de Java en el sistema.
    """
    # 1. Comprobar si 'java' está en PATH
    java_in_path = shutil.which("java")
    if java_in_path and os.path.isfile(java_in_path):
        return java_in_path

    # 2. Comprobar rutas fijas comunes
    for path in COMMON_JAVA_PATHS:
        if os.path.isfile(path):
            java_dir = os.path.dirname(path)
            if java_dir not in os.environ.get("PATH", ""):
                os.environ["PATH"] = java_dir + os.pathsep + os.environ.get("PATH", "")
            return path

    # 3. Explorar el directorio de Adoptium
    adoptium_root = r"C:\Program Files\Eclipse Adoptium"
    if os.path.isdir(adoptium_root):
        try:
            for root, dirs, files in os.walk(adoptium_root):
                if "java.exe" in files:
                    full_path = os.path.join(root, "java.exe")
                    if os.path.isfile(full_path):
                        return full_path
        except (PermissionError, OSError):
            pass

    return None

def is_local_engine_available() -> bool:
    """
    Verifica con validación estricta si Java y plantuml.jar existen y son ejecutables.
    """
    java_cmd = find_java()
    return bool(java_cmd and os.path.isfile(JAR_PATH) and os.path.getsize(JAR_PATH) > 1000)

# --------------------------------------------------------------------------------------
# Algoritmos de Codificación y Decodificación con Manejo de Excepciones
# --------------------------------------------------------------------------------------

def decode64(encoded_str: str) -> bytes:
    """
    Decodifica una cadena del alfabeto de 64 caracteres de PlantUML a bytes.
    Protegido contra caracteres no válidos o cadenas truncadas.
    """
    s = encoded_str.strip()
    if s.startswith("~1"):
        s = s[2:]

    # Filtrar únicamente caracteres pertenecientes al alfabeto
    s = re.sub(r'[^0-9A-Za-z\-_]', '', s)

    data = []
    length = len(s)
    for i in range(0, length, 4):
        c1 = DECODE_MAP.get(s[i], 0)
        c2 = DECODE_MAP.get(s[i + 1], 0) if i + 1 < length else 0
        c3 = DECODE_MAP.get(s[i + 2], 0) if i + 2 < length else 0
        c4 = DECODE_MAP.get(s[i + 3], 0) if i + 3 < length else 0

        b1 = (c1 << 2) | (c2 >> 4)
        b2 = ((c2 & 0x0F) << 4) | (c3 >> 2)
        b3 = ((c3 & 0x03) << 6) | c4

        data.append(b1)
        if i + 2 < length:
            data.append(b2)
        if i + 3 < length:
            data.append(b3)

    return bytes(data)

def decode_plantuml(raw_input: str) -> str:
    """
    Detecta y decodifica de forma segura cadenas comprimidas o URLs completas.
    Si la entrada no es una cadena codificada válida, retorna el texto original intacto.
    """
    if not isinstance(raw_input, str):
        return ""

    text = raw_input.strip()
    if not text:
        return ""

    # Si ya contiene directivas normales de inicio, no decodificar
    if "@start" in text.lower():
        return text

    # Si es una URL completa, extraer el componente codificado final
    if "http://" in text or "https://" in text:
        parts = text.split("/")
        text = parts[-1]

    try:
        compressed_bytes = decode64(text)
        if not compressed_bytes:
            return raw_input

        try:
            return zlib.decompress(compressed_bytes, -zlib.MAX_WBITS).decode("utf-8", errors="replace")
        except zlib.error:
            return zlib.decompress(compressed_bytes).decode("utf-8", errors="replace")
    except Exception:
        return raw_input

def encode64(data: bytes) -> str:
    """
    Codifica un flujo de bytes en el alfabeto PlantUML.
    """
    res = []
    length = len(data)
    for i in range(0, length, 3):
        b1 = data[i]
        b2 = data[i + 1] if i + 1 < length else 0
        b3 = data[i + 2] if i + 2 < length else 0

        c1 = b1 >> 2
        c2 = ((b1 & 0x03) << 4) | (b2 >> 4)
        c3 = ((b2 & 0x0F) << 2) | (b3 >> 6)
        c4 = b3 & 0x3F

        res.append(PLANTUML_ALPHABET[c1])
        res.append(PLANTUML_ALPHABET[c2])
        if i + 1 < length:
            res.append(PLANTUML_ALPHABET[c3])
        if i + 2 < length:
            res.append(PLANTUML_ALPHABET[c4])

    return "".join(res)

def encode_plantuml(text: str) -> str:
    """
    Comprime con Deflate nivel 9 y codifica a formato PlantUML.
    """
    if not text or not isinstance(text, str):
        return ""
    try:
        utf8_bytes = text.encode("utf-8")
        compressed = zlib.compress(utf8_bytes, level=9)[2:-4]
        return "~1" + encode64(compressed)
    except Exception:
        return ""

# --------------------------------------------------------------------------------------
# Motor de Renderizado Local Robusto con Manejo de Excepciones
# --------------------------------------------------------------------------------------

def parse_plantuml_error(err_text: str) -> Dict[str, Any]:
    """
    Parsea las líneas de error arrojadas por PlantUML para extraer número de línea y causa.
    """
    error_info = {
        "line": None,
        "message": "Error de sintaxis en el diagrama."
    }

    lines = [l.strip() for l in err_text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        # Comprobar patrones de línea: ej. "ERROR \n 5 \n Syntax Error"
        if line.upper() == "ERROR" and i + 1 < len(lines):
            next_line = lines[i + 1]
            if next_line.isdigit():
                error_info["line"] = int(next_line)
                if i + 2 < len(lines):
                    error_info["message"] = f"Línea {next_line}: {lines[i + 2]}"
                break
        elif "line" in line.lower():
            match = re.search(r'line\s*([0-9]+)', line, re.IGNORECASE)
            if match:
                error_info["line"] = int(match.group(1))
                error_info["message"] = line
                break

    return error_info

def render_diagram_local(code: str, output_format: str = "svg") -> Tuple[bool, bytes, str]:
    """
    Ejecuta el renderizado 100% LOCAL con validaciones estrictas y protección contra errores.
    """
    # 1. Validación de tamaño de entrada
    if len(code) > MAX_CODE_LENGTH:
        return False, b"El codigo del diagrama supera el tamano maximo permitido (1 MB).", "text/plain"

    java_cmd = find_java()
    if not java_cmd or not os.path.exists(JAR_PATH):
        return False, b"El motor local no esta disponible (Java o plantuml.jar no encontrados).", "text/plain"

    fmt = output_format.lower()
    flag_map = {
        "svg": "-tsvg",
        "png": "-tpng",
        "txt": "-ttxt"
    }
    flag = flag_map.get(fmt, "-tsvg")
    mime_map = {
        "svg": "image/svg+xml",
        "png": "image/png",
        "txt": "text/plain; charset=utf-8"
    }
    content_type = mime_map.get(fmt, "image/svg+xml")

    # Comando seguro
    cmd = [
        java_cmd,
        "-Djava.awt.headless=true",
        "-jar", JAR_PATH,
        "-pipe",
        flag,
        "-charset", "UTF-8"
    ]

    try:
        proc = subprocess.run(
            cmd,
            input=code.encode("utf-8", errors="replace"),
            capture_output=True,
            timeout=SUBPROCESS_TIMEOUT_SECONDS
        )

        if proc.returncode == 0 and len(proc.stdout) > 0:
            return True, proc.stdout, content_type
        else:
            err_output = proc.stderr.decode("utf-8", errors="replace") or proc.stdout.decode("utf-8", errors="replace")
            err_parsed = parse_plantuml_error(err_output)
            final_err_msg = err_parsed["message"] if err_parsed["line"] else (err_output or "Error en la compilación del diagrama.")
            return False, final_err_msg.encode("utf-8"), "text/plain"

    except subprocess.TimeoutExpired:
        return False, f"Tiempo de espera agotado ({SUBPROCESS_TIMEOUT_SECONDS}s). El diagrama es demasiado complejo.".encode("utf-8"), "text/plain"
    except OSError as e:
        return False, f"Error del sistema operativo al invocar Java: {str(e)}".encode("utf-8"), "text/plain"
    except Exception as e:
        return False, f"Excepción imprevista en el motor local: {str(e)}".encode("utf-8"), "text/plain"

def render_diagram(code: str, output_format: str = "svg", server_url: Optional[str] = None) -> Tuple[bool, bytes, str]:
    """
    Punto de entrada universal de renderizado.
    Prioriza el motor local y maneja decodificación automática y contingencias.
    """
    if not isinstance(code, str) or not code.strip():
        return False, b"El codigo del diagrama no puede estar vacio.", "text/plain"

    # Decodificar automáticamente si la entrada viene comprimida o en formato URL
    decoded = decode_plantuml(code)

    # 1. Intentar renderizado local (Offline)
    if is_local_engine_available():
        success, content, content_type = render_diagram_local(decoded, output_format)
        if success:
            return True, content, content_type
        # Si falló por sintaxis o timeout, retornar el error local
        return False, content, content_type

    # 2. Servidor remoto de contingencia si no hubiera Java
    server = (server_url or os.environ.get("PLANTUML_SERVER", DEFAULT_SERVER_URL)).rstrip("/")
    fmt = output_format.lower() if output_format.lower() in ["svg", "png", "txt"] else "svg"

    encoded = encode_plantuml(decoded.strip())
    if not encoded:
        return False, b"No fue posible codificar el diagrama.", "text/plain"

    target_url = f"{server}/{fmt}/{encoded}"

    try:
        response = requests.get(target_url, timeout=15)
        content_type = response.headers.get("Content-Type", "application/octet-stream")
        if response.status_code == 200:
            return True, response.content, content_type
        else:
            return False, response.content, content_type
    except requests.RequestException as e:
        return False, f"Error al conectar con servidor de contingencia: {str(e)}".encode("utf-8"), "text/plain"
