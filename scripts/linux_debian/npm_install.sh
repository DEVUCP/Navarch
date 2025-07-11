@echo off

echo Starting backend server...

start cmd /k "cd ..\..\api && npm start"

echo === Checking frontend ===
if exist "..\..\front-end\build" (
    echo Frontend build folder exists. Serving...
    start "" cmd /k "cd ..\..\front-end\build && npx serve"
) else (
    echo Frontend build folder not found. Building...
    pushd ..\..\front-end
    npm run build
    popd
    if exist "..\..\front-end\build" (
        echo Build complete. Serving frontend...
        start "" cmd /k "cd ..\..\front-end\build && npx serve"
    ) else (
        echo Frontend build failed.
    )
)
