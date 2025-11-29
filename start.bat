@echo off
echo.
echo ==========================================
echo  Group 6二手电鸡交易市场 - 本地服务器启动
echo ==========================================
echo.

REM 检查是否安装了Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] 使用Python启动本地服务器...
    echo [INFO] 访问地址: http://localhost:8000
    echo [INFO] 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查是否安装了Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] 使用Node.js启动本地服务器...
    echo [INFO] 正在安装http-server...
    npm install -g http-server
    echo [INFO] 访问地址: http://localhost:8080
    echo [INFO] 按 Ctrl+C 停止服务器
    echo.
    http-server -p 8080
    goto :end
)

REM 如果都没有安装，直接用浏览器打开
echo [INFO] 未检测到Python或Node.js，直接打开HTML文件
echo [INFO] 建议安装Python或Node.js以获得更好的开发体验
echo.
start index.html

:end
pause 