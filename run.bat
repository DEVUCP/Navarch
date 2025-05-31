@echo off

echo Running setup scripts...

cd scripts/windows
call install_dependencies.bat

call npm_install.bat

cd scripts
call start_servers.bat
cd ..

echo All scripts completed successfully
pause