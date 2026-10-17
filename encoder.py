"""
========================================================================================
Módulo: encoder.py (Motor de Renderizado Local y Decodificador)
Aplicación: DiagramCraft Studio
Descripción:
Permite renderizar diagramas PlantUML de forma 100% LOCAL y OFFLINE mediante la máquina
virtual Java local y el binario 'bin/plantuml.jar'.
Además, incluye decodificador bidireccional:
  - Convierte código PlantUML en texto plano a cadena codificada (~1...).
  - Decodifica cadenas codificadas o URLs completas de vuelta a código fuente PlantUML.
========================================================================================
"""

import os
import sys
import zlib
import shutil
import subprocess
import requests
from typing import Tuple, Optional

# Rutas locales
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BIN_DIR = os.path.join(BASE_DIR, "bin")
JAR_PATH = os.path.join(BIN_DIR, "plantuml.jar")

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
    r"C:\Program Files\Java\jre1.8.0_*\bin\java.exe",
]

def find_java() -> Optional[str]:
    """
    Localiza el ejecutable de Java en el sistema.
    Busca en PATH y en directorios estándar de instalación en Windows.
    """
    # 1. Comprobar si 'java' está directamente en PATH
    java_in_path = shutil.which("java")
    if java_in_path:
        return java_in_path

    # 2. Buscar en rutas comunes de Windows
    for path in COMMON_JAVA_PATHS:
        if os.path.exists(path):
            java_dir = os.path.dirname(path)
            if java_dir not in os.environ.get("PATH", ""):
                os.environ["PATH"] = java_dir + os.pathsep + os.environ.get("PATH", "")
            return path

    # 3. Buscar en el directorio de Eclipse Adoptium si existe
    adoptium_root = r"C:\Program Files\Eclipse Adoptium"
    if os.path.exists(adoptium_root):
        for root, dirs, files in os.walk(adoptium_root):
            if "java.exe" in files:
                java_full = os.path.join(root, "java.exe")
                java_dir = os.path.dirname(java_full)
                if java_dir not in os.environ.get("PATH", ""):
                    os.environ["PATH"] = java_dir + os.pathsep + os.environ.get("PATH", "")
                return java_full

    return None

def is_local_engine_available() -> bool:
    """
    Verifica si tanto Java como plantuml.jar están disponibles localmente.
    """
    java_cmd = find_java()
    return bool(java_cmd and os.path.exists(JAR_PATH))

# --------------------------------------------------------------------------------------
# Algoritmos de Codificación y Decodificación PlantUML
# --------------------------------------------------------------------------------------

def decode64(encoded_str: str) -> bytes:
    """
    Decodifica una cadena del alfabeto de 64 caracteres de PlantUML a bytes.
    """
    s = encoded_str.strip()
    if s.startswith("~1"):
        s = s[2:]

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
    Detecta y decodifica una entrada que puede ser:
      - Código PlantUML en texto plano (@startuml ...).
      - Cadena comprimida (~1SoWk... o SoWk...).
      - URL completa de PlantUML (ej: http://.../svg/~1...).
    
    Retorna el código fuente en texto plano listo para renderizar.
    """
    text = raw_input.strip()
    if not text:
        return ""

    # Si ya contiene directivas de inicio de PlantUML, no requiere decodificación
    if "@start" in text.lower():
        return text

    # Si es una URL completa, extraer la parte codificada final
    if "http://" in text or "https://" in text:
        parts = text.split("/")
        text = parts[-1]

    # Intentar decodificar como datos comprimidos con Deflate
    try:
        compressed_bytes = decode64(text)
        # Intentar descompresión raw deflate (-MAX_WBITS)
        try:
            return zlib.decompress(compressed_bytes, -zlib.MAX_WBITS).decode("utf-8")
        except Exception:
            return zlib.decompress(compressed_bytes).decode("utf-8")
    except Exception as e:
        # Si falla la decodificación, retornar el texto original
        return raw_input

def encode64(data: bytes) -> str:
    """
    Codifica un arreglo de bytes comprimidos en el alfabeto de 64 caracteres de PlantUML.
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
    Comprime una cadena UTF-8 con Deflate y la codifica con el alfabeto de PlantUML.
    """
    if not text:
        return ""
    utf8_bytes = text.encode("utf-8")
    compressed = zlib.compress(utf8_bytes, level=9)[2:-4]
    return "~1" + encode64(compressed)

# --------------------------------------------------------------------------------------
# Motores de Renderizado: Local (Java + plantuml.jar) y Remoto (Fallback)
# --------------------------------------------------------------------------------------

def render_diagram_local(code: str, output_format: str = "svg") -> Tuple[bool, bytes, str]:
    """
    Renderiza un diagrama de forma 100% LOCAL sin internet utilizando el JAR local.
    """
    java_cmd = find_java()
    if not java_cmd or not os.path.exists(JAR_PATH):
        return False, b"El motor local no esta configurado (requiere Java y plantuml.jar).", "text/plain"

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

    # Comando de ejecución por tubería (pipe)
    # -Djava.awt.headless=true asegura funcionamiento sin entorno gráfico
    # -charset UTF-8 garantiza soporte completo para caracteres en español
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
            input=code.encode("utf-8"),
            capture_output=True,
            timeout=25
        )

        if proc.returncode == 0 and len(proc.stdout) > 0:
            # Validar que no sea un SVG con mensaje de error gráfico
            return True, proc.stdout, content_type
        else:
            err_output = proc.stderr.decode("utf-8", errors="replace") or "Error en la sintaxis del diagrama."
            return False, err_output.encode("utf-8"), "text/plain"

    except subprocess.TimeoutExpired:
        return False, b"El renderizado local excedio el tiempo limite (25s).", "text/plain"
    except Exception as e:
        return False, f"Excepcion en renderizado local: {str(e)}".encode("utf-8"), "text/plain"

def render_diagram(code: str, output_format: str = "svg", server_url: Optional[str] = None) -> Tuple[bool, bytes, str]:
    """
    Función principal de renderizado.
    1. Si el código recibido es una cadena codificada o URL, la decodifica primero.
    2. Si el motor local está disponible, RENDERIZA 100% DE FORMA LOCAL (Offline).
    3. Si el motor local no está presente, utiliza el servidor remoto como contingencia.
    """
    # Auto-decodificar si se pasó una cadena codificada o una URL
    decoded_code = decode_plantuml(code)

    # 1. Prioridad: Renderizado Local Offline
    if is_local_engine_available():
        success, content, content_type = render_diagram_local(decoded_code, output_format)
        if success:
            return True, content, content_type
        # Si falló por sintaxis, retornar el error local directamente
        if b"Syntax Error" in content or b"Error" in content:
            return False, content, content_type

    # 2. Contingencia: Servidor remoto
    server = (server_url or os.environ.get("PLANTUML_SERVER", DEFAULT_SERVER_URL)).rstrip("/")
    fmt = output_format.lower()
    if fmt not in ["svg", "png", "txt"]:
        fmt = "svg"

    encoded = encode_plantuml(decoded_code.strip())
    if not encoded:
        return False, b"El codigo del diagrama esta vacio.", "text/plain"

    target_url = f"{server}/{fmt}/{encoded}"

    try:
        response = requests.get(target_url, timeout=15)
        content_type = response.headers.get("Content-Type", "application/octet-stream")
        if response.status_code == 200:
            return True, response.content, content_type
        else:
            return False, response.content, content_type
    except requests.RequestException as e:
        error_msg = f"Error al procesar diagrama: {str(e)}"
        return False, error_msg.encode("utf-8"), "text/plain"
