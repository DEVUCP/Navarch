#!/bin/bash

cd ..
cd ..

# Check if front-end dependencies are missing
if [ ! -d "front-end/node_modules" ]; then
    echo "Installing front-end dependencies..."
    cd front-end
    npm install
    cd ..
fi

# Check if back-end dependencies are missing
if [ ! -d "api/node_modules" ]; then
    echo "Installing back-end dependencies..."
    cd api
    npm install
    cd ..
fi

cd scripts
