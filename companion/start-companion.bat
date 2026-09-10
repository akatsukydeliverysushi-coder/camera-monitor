@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale Node.js 18 ou superior e tente novamente.
  pause
  exit /b 1
)
echo.
echo ============================================
echo       CAMERA MONITOR - COMPANION LOCAL
echo ============================================
echo.
echo Servico: http://127.0.0.1:8787
echo Nao feche esta janela enquanto usar o video.
echo.
node server.js
pause
