#!/bin/bash

echo "Running setup scripts..."

# Navigate to the appropriate scripts directory
cd scripts/linux_debian || { echo "scripts/linux_debian not found"; exit 1; }

# Run dependency installation script
./install_dependencies.sh || { echo "install_dependencies.sh failed"; exit 1; }

# Run npm install script
./npm_install.sh || { echo "npm_install.sh failed"; exit 1; }

# Navigate to scripts directory to start servers
cd ../ || { echo "scripts directory not found"; exit 1; }
./start_servers.sh || { echo "start_servers.sh failed"; exit 1; }

# Return to project root
cd .. || { echo "Failed to return to project root"; exit 1; }

echo "All scripts completed successfully."
read -rp "Press enter to continue..."
