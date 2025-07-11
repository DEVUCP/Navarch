@echo off
echo Checking for Minecraft server JAR...

IF NOT EXIST "..\..\server\server.jar" (
    echo server.jar not found. Setting up Minecraft server...

    REM Create server directory
    mkdir "..\..\server"

    echo Fetching latest Minecraft version info...
    powershell -Command "$versionData = Invoke-RestMethod 'https://launchermeta.mojang.com/mc/game/version_manifest.json'; $latest = $versionData.latest.release; $versionInfo = $versionData.versions | Where-Object { $_.id -eq $latest }; if (-not $versionInfo) { Write-Error 'Could not find version info'; exit 1 }; $versionJson = Invoke-RestMethod $versionInfo.url; $serverJarUrl = $versionJson.downloads.server.url; echo Latest version: $latest; echo Downloading server.jar from $serverJarUrl...; Invoke-WebRequest $serverJarUrl -OutFile '..\..\server\server.jar'; if (-not (Test-Path '..\..\server\server.jar')) { Write-Error 'Download failed'; exit 1 }"
    
    IF ERRORLEVEL 1 (
        echo Failed to fetch or download server.jar
        exit /b 1
    )
    
    echo Minecraft server.jar downloaded successfully.
) ELSE (
    echo server.jar already exists.
)