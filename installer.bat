@echo off
setlocal
echo === Running setup scripts... ===

REM Navigate to the scripts\windows directory
cd scripts\windows || (
    echo ❌ Error: scripts\windows not found
    pause
    exit /b 1
)

REM === Check and set up Minecraft server ===
echo [1/4] Running check_minecraft_server.bat...
call check_minecraft_server.bat
IF ERRORLEVEL 1 (
    echo ❌ check_minecraft_server.bat failed
    pause
    goto :EOF
)

REM === Install dependencies ===
echo [2/4] Running install_dependencies.bat...
call install_dependencies.bat
IF ERRORLEVEL 1 (
    echo ❌ install_dependencies.bat failed
    pause
    goto :EOF
)

REM Return to project root (2 levels up)
cd ..\.. || (
    echo ❌ Failed to return to project root
    pause
    goto :EOF
)

echo ✅ All scripts completed successfully.
:EOF
pause
exit /b