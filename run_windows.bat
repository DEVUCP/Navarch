@echo off
setlocal
echo Running setup scripts...

REM Navigate to the appropriate scripts directory
cd scripts\windows || (
    echo scripts\windows not found
    exit /b 1
)

REM Check and set up Minecraft server
call check_minecraft_server.bat
IF ERRORLEVEL 1 (
    echo check_minecraft_server.bat failed
    exit /b 1
)

REM Run dependency installation script
call install_dependencies.bat
IF ERRORLEVEL 1 (
    echo install_dependencies.bat failed
    exit /b 1
)

REM Run npm install script
call npm_install.bat
IF ERRORLEVEL 1 (
    echo npm_install.bat failed
    exit /b 1
)

REM Start servers
call start_servers.bat
IF ERRORLEVEL 1 (
    echo start_servers.bat failed
    exit /b 1
)

cd ..\.. || (
    echo Failed to return to project root
    exit /b 1
)

echo All scripts completed successfully.
pause
