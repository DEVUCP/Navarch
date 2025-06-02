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

:: Check OpenJDK 21
where java >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
    set JAVA_VERSION=%JAVA_VERSION:"=%
    for /f "delims=. tokens=1" %%a in ("%JAVA_VERSION%") do set JAVA_MAJOR=%%a
    if !JAVA_MAJOR! GEQ 21 (
        echo OpenJDK 21 or above is installed
        java -version
    ) else (
        echo OpenJDK 21 or above is not installed. Installing...
        curl -o jdk21.zip https://download.java.net/java/GA/jdk21.0.1/415e3f918a1f4062a0074a2794853d0d/12/GPL/openjdk-21.0.1_windows-x64_bin.zip
        powershell.exe -Command "Expand-Archive -Path jdk21.zip -DestinationPath 'C:\Program Files\Java'"
        del jdk21.zip
        :: Set JAVA_HOME environment variable
        setx JAVA_HOME "C:\Program Files\Java\jdk-21.0.1" /M
        :: Add to PATH
        setx PATH "%PATH%;%JAVA_HOME%\bin" /M
        echo OpenJDK 21 has been installed
    )
) else (
    echo Java is not installed. Installing...
    curl -o jdk21.zip https://download.java.net/java/GA/jdk21.0.1/415e3f918a1f4062a0074a2794853d0d/12/GPL/openjdk-21.0.1_windows-x64_bin.zip
    powershell.exe -Command "Expand-Archive -Path jdk21.zip -DestinationPath 'C:\Program Files\Java'"
    del jdk21.zip
    :: Set JAVA_HOME environment variable
    setx JAVA_HOME "C:\Program Files\Java\jdk-21.0.1" /M
    :: Add to PATH
    setx PATH "%PATH%;%JAVA_HOME%\bin" /M
    echo OpenJDK 21 has been installed
)

@REM :: Check OpenJDK 17
@REM where java >nul 2>&1
@REM if %ERRORLEVEL% EQU 0 (
@REM     for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
@REM     set JAVA_VERSION=%JAVA_VERSION:"=%
@REM     for /f "delims=. tokens=1" %%a in ("%JAVA_VERSION%") do set JAVA_MAJOR=%%a
@REM     if !JAVA_MAJOR! GEQ 17 (
@REM         echo OpenJDK 17 or above is installed
@REM         java -version
@REM     ) else (
@REM         echo OpenJDK 17 or above is not installed. Installing...
@REM         curl -o jdk17.zip https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip
@REM         powershell.exe -Command "Expand-Archive -Path jdk17.zip -DestinationPath 'C:\Program Files\Java'"
@REM         del jdk17.zip
@REM         :: Set JAVA_HOME environment variable
@REM         setx JAVA_HOME "C:\Program Files\Java\jdk-17.0.2" /M
@REM         :: Add to PATH
@REM         setx PATH "%PATH%;%JAVA_HOME%\bin" /M
@REM         echo OpenJDK 17 has been installed
@REM     )
@REM ) else (
@REM     echo Java is not installed. Installing...
@REM     curl -o jdk17.zip https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip
@REM     powershell.exe -Command "Expand-Archive -Path jdk17.zip -DestinationPath 'C:\Program Files\Java'"
@REM     del jdk17.zip
@REM     :: Set JAVA_HOME environment variable
@REM     setx JAVA_HOME "C:\Program Files\Java\jdk-17.0.2" /M
@REM     :: Add to PATH
@REM     setx PATH "%PATH%;%JAVA_HOME%\bin" /M
@REM     echo OpenJDK 17 has been installed
@REM )