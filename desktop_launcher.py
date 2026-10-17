"""
========================================================================================
DiagramCraft Studio - Lanzador de Aplicación de Escritorio Nativa (Estilo Draw.io)
Autor: Jose
Licencia: MIT (Open Source)
Descripción:
Ejecuta DiagramCraft Studio en una ventana nativa de escritorio de Windows (WebView2)
sin barras de URL del navegador, sin pestañas adicionales al refrescar (F5),
y sin ventanas de terminal en segundo plano.
========================================================================================
"""

import sys
import os
import time
import socket
import logging
import threading

# Silenciar registros de depuración de Werkzeug en modo escritorio nativo
logging.getLogger('werkzeug').setLevel(logging.ERROR)

from app import app, is_local_engine_available

def find_free_port(start_port=5000) -> int:
    """Busca un puerto libre dinámicamente para evitar conflictos."""
    for port in range(start_port, start_port + 50):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    return start_port

def run_flask_server(port: int):
    """Ejecuta el servidor web de DiagramCraft en un hilo demonio."""
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)

def main():
    port = find_free_port(5000)
    app_url = f"http://127.0.0.1:{port}"

    # Iniciar servidor Flask en segundo plano
    server_thread = threading.Thread(target=run_flask_server, args=(port,), daemon=True)
    server_thread.start()

    # Breve pausa para asegurar inicialización de socket
    time.sleep(0.5)

    # Intentar abrir con ventana de escritorio nativa (Edge WebView2)
    try:
        import webview
        # Crear ventana nativa estilo Draw.io Desktop
        window = webview.create_window(
            title="DiagramCraft Studio",
            url=app_url,
            width=1380,
            height=860,
            min_size=(960, 640),
            confirm_close=False,
            easy_drag=False
        )
        webview.start(private_mode=False)
        sys.exit(0)
    except Exception as e:
        # Fallback de contingencia: abrir Edge o Chrome en modo aplicación nativa (--app)
        edge_candidate = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        chrome_candidate = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        
        target_browser = None
        if os.path.isfile(edge_candidate):
            target_browser = edge_candidate
        elif os.path.isfile(chrome_candidate):
            target_browser = chrome_candidate

        if target_browser:
            import subprocess
            subprocess.Popen([target_browser, f"--app={app_url}"])
        else:
            import webbrowser
            webbrowser.open(app_url)

        # Mantener el proceso vivo en el hilo principal mientras el usuario use la app
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            sys.exit(0)

if __name__ == "__main__":
    main()
