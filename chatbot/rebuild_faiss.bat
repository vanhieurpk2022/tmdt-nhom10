@echo off
chcp 65001 > nul
echo ===================================================
echo     Build lai FAISS Vector DB cho Oilia Chatbot
echo ===================================================

cd /d "%~dp0"

if exist ".venv\Scripts\python.exe" (
    echo [INFO] Dang su dung moi truong ao .venv...
    ".venv\Scripts\python.exe" build_index.py
) else (
    echo [INFO] Dang su dung Python he thong...
    python build_index.py
)

pause

