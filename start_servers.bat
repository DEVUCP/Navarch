@echo off
setlocal enabledelayedexpansion

:: Check if Node.js is installed
where node >nul 2>&1
if NOT %ERRORLEVEL% EQU 0 (
    echo ❌ Node.js is not installed.
    echo Please run installer.bat to install required packages.
    pause
    goto :eof
)

echo === Checking backend dependencies ===
if not exist "api\node_modules" (
    echo ⚙️ Backend dependencies missing. Running npm_install.bat...
    pushd scripts\windows
    call npm_install.bat
    if ERRORLEVEL 1 (
        echo ❌ npm_install.bat failed for backend
        pause
        popd
        goto :eof
    )
    popd
)

echo === Checking frontend dependencies ===
if not exist "front-end\node_modules" (
    echo ⚙️ Frontend dependencies missing. Running npm_install.bat...
    pushd scripts\windows
    call npm_install.bat
    if ERRORLEVEL 1 (
        echo ❌ npm_install.bat failed for frontend
        pause
        popd
        goto :eof
    )
    popd
)

echo ✅ All dependencies installed.

echo Starting backend server...
start "" cmd /k "cd api && npm start"

echo === Checking frontend ===
if exist "front-end\build" (
    echo 🟢 Frontend build folder exists. Serving...
    start "" cmd /k "cd front-end\build && npx serve"
) else (
    echo 🔧 Frontend build folder not found. Building...
    pushd front-end
    npm run build
    popd
    if exist "front-end\build" (
        echo ✅ Build complete. Serving frontend...
        start "" cmd /k "cd front-end\build && npx serve"
    ) else (
        echo ❌ Frontend build failed.
        pause
    )
)

echo ✅ You can now close this window.
pause
endlocal