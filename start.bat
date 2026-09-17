@echo off
title 好去處 Backend
cd /d "%~dp0backend"
call :find_python
if "%PYTHON%"=="" (
    echo 搵唔到 Python，請確保 Python 已安裝
    pause
    exit /b 1
)

echo ┌─────────────────────────────┐
echo │  🔀 好去處 Backend 啟動中...  │
echo └─────────────────────────────┘
echo.

"%PYTHON%" -m pip install -q -r requirements.txt 2>nul

echo 啟動 Server...
echo   手機同一個 Wi-Fi 下打開 Safari →
echo   http://<你電腦IP>:5678
echo.
echo 例如：http://192.168.1.100:5678
echo.
echo 按 Ctrl+C 停止 Server
echo ─────────────────────────────
"%PYTHON%" app.py
pause

:find_python
set PYTHON=
where python3 >nul 2>&1 && set PYTHON=python3 && goto :eof
where python >nul 2>&1 && set PYTHON=python && goto :eof
goto :eof