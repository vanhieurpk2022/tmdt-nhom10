@echo off
chcp 65001 > nul
echo ===================================================
echo     Khoi dong Oilia Chatbot FastAPI Service
echo ===================================================

cd /d "%~dp0"

if exist ".venv\Scripts\uvicorn.exe" (
    echo [INFO] Dang su dung moi truong ao .venv...
    ".venv\Scripts\uvicorn.exe" app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    echo [INFO] Dang su dung Python he thong...
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
)

pause

