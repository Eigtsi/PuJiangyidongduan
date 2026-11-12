@echo off
chcp 65001 >nul 2>&1
title 浦江水晶产业园 - 移动端

echo.
echo  ================================
echo   浦江水晶产业园 移动端
echo  ================================
echo.

pushd "%~dp0"
if errorlevel 1 (
    echo  [错误] 无法进入项目目录
    pause
    exit /b
)

if not exist "node_modules\" (
    echo  正在安装依赖...
    call npm install
    echo.
)

echo  停止旧服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":5173"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo  正在启动服务器，浏览器稍后自动打开...
echo  地址: http://localhost:5173
echo  ================================

rem 延迟打开浏览器，等 Vite 启动完成，避免「无法访问」
start "" /min cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:5173"

call npm run dev

pause
