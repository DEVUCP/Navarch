@echo off

echo Checking dependencies...

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js is installed
    node --version
) else (
    echo Node.js is not installed. Installing...
    curl -o node-installer.msi https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
    msiexec /i node-installer.msi /qn
    del node-installer.msi
    echo Node.js has been installed
)

:: Check NPM
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo NPM is installed
    npm --version
) else (
    echo NPM is not installed. Installing...
    :: NPM comes with Node.js, but if somehow it's missing
    curl -o npm.ps1 https://npmjs.org/install.ps1
    powershell.exe -ExecutionPolicy Bypass -File npm.ps1
    del npm.ps1
    echo NPM has been installed
)

:: Check OpenJDK 17
where java >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
    set JAVA_VERSION=%JAVA_VERSION:"=%
    for /f "delims=. tokens=1" %%a in ("%JAVA_VERSION%") do set JAVA_MAJOR=%%a
    if !JAVA_MAJOR! GEQ 17 (
        echo OpenJDK 17 or above is installed
        java -version
    ) else (
        echo OpenJDK 17 or above is not installed. Installing...
        curl -o jdk17.zip https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip
        powershell.exe -Command "Expand-Archive -Path jdk17.zip -DestinationPath 'C:\Program Files\Java'"
        del jdk17.zip
        :: Set JAVA_HOME environment variable
        setx JAVA_HOME "C:\Program Files\Java\jdk-17.0.2" /M
        :: Add to PATH
        setx PATH "%PATH%;%JAVA_HOME%\bin" /M
        echo OpenJDK 17 has been installed
    )
) else (
    echo Java is not installed. Installing...
    curl -o jdk17.zip https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip
    powershell.exe -Command "Expand-Archive -Path jdk17.zip -DestinationPath 'C:\Program Files\Java'"
    del jdk17.zip
    :: Set JAVA_HOME environment variable
    setx JAVA_HOME "C:\Program Files\Java\jdk-17.0.2" /M
    :: Add to PATH
    setx PATH "%PATH%;%JAVA_HOME%\bin" /M
    echo OpenJDK 17 has been installed
)