@echo off
title DiagramCraft Studio - Open Source Local Diagram Engine
echo ========================================================
echo       DiagramCraft Studio (Open Source & Free Local)
echo ========================================================
echo.

python -m pip install -r requirements.txt --quiet
echo Servidor iniciado en http://127.0.0.1:5000 ...
start http://127.0.0.1:5000
python app.py
pause
