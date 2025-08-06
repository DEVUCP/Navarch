@echo off
setlocal enabledelayedexpansion

echo Checking dependencies...
echo.

:: -------------------------------
:: Check Node.js
:: -------------------------------
echo Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js is installed.
    node --version
) else (
    echo Node.js is not installed. Installing...
    winget install --silent --accept-package-agreements --accept-source-agreements OpenJS.NodeJS
)
echo.

:: -------------------------------
:: Check Java JDK (21+)
:: -------------------------------
echo Checking for JDK...
where java >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo JDK is installed.
    java -version
) else (
    for /f "tokens=3" %%i in ('java --version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
    set JAVA_VERSION=!JAVA_VERSION:"=!
    for /f "delims=. tokens=1" %%a in ("!JAVA_VERSION!") do set JAVA_MAJOR=%%a

    if !JAVA_MAJOR! GEQ 21 (
        echo Java JDK !JAVA_VERSION! is installed.
        java --version
    ) else (
        echo Detected Java version: !JAVA_VERSION!
        echo Java JDK 21 or above is not installed.
        call :InstallJava
    )
)
goto :eof

:: -------------------------------
:: Java Install Function
:: -------------------------------
:InstallJava
echo Installing OpenJDK 21...
start /wait "" winget install EclipseAdoptium.Temurin.21.JDK --silent --accept-package-agreements --accept-source-agreements
if %ERRORLEVEL% EQU 0 (
    echo OpenJDK 21 has been installed successfully.
) else (
    echo Failed to install OpenJDK 21.
)
goto :eof


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