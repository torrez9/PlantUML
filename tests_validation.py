"""
========================================================================================
DiagramCraft Studio - Suite de Pruebas Automatizadas de Validación y Calidad
Autor: Jose
Descripción:
Valida al 110% los mecanismos de seguridad (Path Traversal, nombres reservados Windows,
límites de carga), el motor de renderizado local offline, decodificación y paridad
bilingüe completa (Español / Inglés).
========================================================================================
"""

import unittest
import os
import re
import json
from encoder import render_diagram, encode_plantuml, decode_plantuml, is_local_engine_available
from app import app, is_safe_filename, resolve_safe_filepath, WINDOWS_RESERVED_NAMES

class TestDiagramCraftStudio(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

    def test_local_engine_available(self):
        """Verifica que el motor 100% local (Java + plantuml.jar) esté detectado y disponible."""
        available = is_local_engine_available()
        self.assertTrue(available, "El motor local JAR de PlantUML debe estar disponible y detectado.")

    def test_render_svg_local(self):
        """Prueba renderizado local offline a formato vectorial SVG."""
        code = "@startuml\nAlice -> Bob : Hola Local\n@enduml"
        success, content, ctype = render_diagram(code, "svg")
        self.assertTrue(success, "La compilación local de SVG debe ser exitosa.")
        self.assertEqual(ctype, "image/svg+xml")
        self.assertIn(b"<svg", content)

    def test_render_png_local(self):
        """Prueba renderizado local offline a formato de mapa de bits PNG."""
        code = "@startuml\nBob -> Alice : Confirmado Local\n@enduml"
        success, content, ctype = render_diagram(code, "png")
        self.assertTrue(success, "La compilación local de PNG debe ser exitosa.")
        self.assertEqual(ctype, "image/png")
        self.assertTrue(content.startswith(b"\x89PNG\r\n\x1a\n"))

    def test_render_txt_local(self):
        """Prueba renderizado local offline a formato texto arte ASCII."""
        code = "@startuml\nAlice -> Bob : Test ASCII\n@enduml"
        success, content, ctype = render_diagram(code, "txt")
        self.assertTrue(success, "La compilación local de ASCII TXT debe ser exitosa.")
        self.assertEqual(ctype, "text/plain; charset=utf-8")
        self.assertTrue(len(content) > 0)

    def test_windows_reserved_names_rejected(self):
        """Valida que nombres reservados de Windows sean bloqueados tajantemente."""
        for name in WINDOWS_RESERVED_NAMES:
            self.assertFalse(is_safe_filename(name), f"Debe bloquear el nombre reservado {name}")
            self.assertFalse(is_safe_filename(f"{name}.puml"), f"Debe bloquear el nombre reservado {name}.puml")
            self.assertFalse(is_safe_filename(f"{name.lower()}.puml"), f"Debe bloquear el nombre reservado en minúscula {name.lower()}.puml")

    def test_path_traversal_protection(self):
        """Valida que intentos de fuga de directorio (Path Traversal) arrojen excepción."""
        malicious_names = [
            "../hack.puml",
            "..\\hack.puml",
            "/etc/passwd",
            "C:\\Windows\\System32\\calc.exe",
            "....//....//escape.puml",
            "sub/../../secret.puml"
        ]
        for bad_name in malicious_names:
            self.assertFalse(is_safe_filename(bad_name), f"is_safe_filename debe rechazar {bad_name}")
            with self.assertRaises(ValueError):
                resolve_safe_filepath(bad_name)

    def test_api_render_empty_code_validation(self):
        """Valida que peticiones con código vacío devuelvan error HTTP 400."""
        res = self.client.post("/api/render", json={"code": "   ", "format": "svg"})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])

    def test_api_render_oversized_code_validation(self):
        """Valida que códigos que superen el límite de tamaño sean rechazados con 413."""
        oversized = "@startuml\n" + ("A -> B : x\n" * 100000) + "@enduml"
        res = self.client.post("/api/render", json={"code": oversized, "format": "svg"})
        self.assertIn(res.status_code, [413, 400])

    def test_bidirectional_encoding(self):
        """Verifica codificación y decodificación exacta compatible con PlantUML y DiagramCraft."""
        original = "@startuml\nBob -> Alice : Local Test 2026\n@enduml"
        encoded = encode_plantuml(original)
        self.assertTrue(encoded.startswith("~1"))
        decoded = decode_plantuml(encoded)
        self.assertEqual(decoded.strip(), original.strip())

    def test_i18n_dictionary_parity(self):
        """Verifica que el diccionario de internacionalización tenga paridad exacta entre ES y EN."""
        i18n_path = os.path.join(os.path.dirname(__file__), "static", "js", "i18n.js")
        with open(i18n_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extraer el bloque del objeto I18N
        match = re.search(r'const\s+I18N\s*=\s*(\{[\s\S]*?\n\};)', content)
        self.assertIsNotNone(match, "Debe existir la constante I18N en i18n.js")

        # Verificar que ambas secciones ('es' y 'en') estén presentes
        self.assertIn("es: {", content)
        self.assertIn("en: {", content)

if __name__ == "__main__":
    unittest.main()
