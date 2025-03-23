@echo off

echo Running setup scripts...

cd scripts
call install_dependencies.bat
call start_servers.bat
cd ..

echo All scripts completed successfully

pause
