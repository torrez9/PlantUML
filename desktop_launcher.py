"""
========================================================================================
DiagramCraft Studio - Lanzador de Escritorio (Desktop Launcher)
Autor: Jose
Descripción:
Inicia el servidor Flask local de DiagramCraft y abre automáticamente la interfaz
en el navegador web predeterminado del sistema.
========================================================================================
"""

import sys
import os
import time
import webbrowser
import threading
from app import app, is_local_engine_available

def open_browser(port):
    time.sleep(1.2)
    webbrowser.open(f"http://127.0.0.1:{port}")

def main():
    port = int(os.environ.get("PORT", 5000))
    local_ok = is_local_engine_available()

    print("=" * 65)
    print("  DiagramCraft Studio - Edición de Escritorio")
    print(f"  Autor: Jose | Licencia: MIT (Open Source)")
    print(f"  Motor local: {'100% OFFLINE (Java + JAR)' if local_ok else 'Servidor Remoto'}")
    print(f"  Iniciando en: http://127.0.0.1:{port}")
    print("=" * 65)

    # Abrir navegador automáticamente en un hilo paralelo
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    # Ejecutar servidor Flask
    app.run(host="127.0.0.1", port=port, debug=False)

if __name__ == "__main__":
    main()
