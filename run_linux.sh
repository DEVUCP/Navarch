#!/bin/bash

echo "Running setup scripts..."

chmod +x scripts/linux_debian/check_minecraft_server.sh
chmod +x scripts/linux_debian/install_dependencies.sh
chmod +x scripts/linux_debian/npm_install.sh
chmod +x scripts/linux_debian/start_servers.sh



# Navigate to the appropriate scripts directory
cd scripts/linux_debian || { echo "scripts/linux_debian not found"; exit 1; }

# Check and set up Minecraft server
./check_minecraft_server.sh || { echo "check_minecraft_server.sh failed"; exit 1; }

# Run dependency installation script
./install_dependencies.sh || { echo "install_dependencies.sh failed"; exit 1; }

# Run npm install script
./npm_install.sh || { echo "npm_install.sh failed"; exit 1; }

./start_servers.sh || { echo "start_servers.sh failed"; exit 1; }

cd .. || { echo "Failed to return to project root"; exit 1; }

echo "All scripts completed successfully."
read -rp "Press enter to continue..."
