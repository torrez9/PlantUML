@echo off
chcp 65001 >nul
title DiagramCraft Studio - Compilador de Setup.exe

echo =================================================================
echo   DiagramCraft Studio - Generador Local de Setup.exe
echo   Autor: Jose
echo   Modo: Ventana Nativa de Escritorio (Sin Terminal, Estilo Draw.io)
echo =================================================================
echo.

echo [1/3] Verificando e instalando dependencias (PyInstaller y PyWebView)...
python -m pip install --upgrade pip
python -m pip install pyinstaller -r requirements.txt

echo.
echo [2/3] Empaquetando aplicación nativa de escritorio con PyInstaller...
pyinstaller --noconfirm --onedir --windowed --noconsole ^
    --name "DiagramCraft" ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --add-data "bin;bin" ^
    --hidden-import "clr" ^
    --hidden-import "pythonnet" ^
    --hidden-import "webview" ^
    desktop_launcher.py

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la compilación con PyInstaller.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compilando instalador Setup.exe con Inno Setup...
if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" (
    "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" installer.iss
) else if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" (
    "%ProgramFiles%\Inno Setup 6\ISCC.exe" installer.iss
) else (
    echo [AVISO] Inno Setup no está instalado localmente en tu sistema.
    echo Puedes descargar Inno Setup gratuito desde: https://jrsoftware.org/isdl.php
    echo O simplemente sube un tag a GitHub (git tag v1.0.1 ^&^& git push origin v1.0.1)
    echo para que GitHub Actions compile el Setup.exe en la nube automáticamente.
)

echo.
echo =================================================================
echo Proceso finalizado. El ejecutable nativo reside en: dist\DiagramCraft\DiagramCraft.exe
echo =================================================================
pause
