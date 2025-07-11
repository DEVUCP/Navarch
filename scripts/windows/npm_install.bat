cd ..
cd ..

if not exist "front-end\node_modules" (
    echo Installing front-end dependencies...
    cd front-end
    call npm install
    cd ..
)

if not exist "api\node_modules" (
    echo Installing back-end dependencies...
    cd api
    call npm install
    cd ..
)

call npm install -g serve

cd scripts
cd windows