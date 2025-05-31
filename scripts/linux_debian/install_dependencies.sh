#!/bin/bash

echo "Checking dependencies..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "Node.js is installed"
    node --version
else
    echo "Node.js is not installed. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js has been installed"
fi

# Check NPM
if command -v npm >/dev/null 2>&1; then
    echo "NPM is installed"
    npm --version
else
    echo "NPM is not installed. Installing..."
    # npm should come with Node.js, but in case it doesn't:
    sudo apt-get install -y npm
    echo "NPM has been installed"
fi

# Check Java (OpenJDK 17+)
if command -v java >/dev/null 2>&1; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    JAVA_MAJOR=$(echo $JAVA_VERSION | cut -d. -f1)
    if [ "$JAVA_MAJOR" -ge 17 ]; then
        echo "OpenJDK 17 or above is installed"
        java -version
    else
        echo "Java version is less than 17. Installing OpenJDK 17..."
        sudo apt-get install -y openjdk-17-jdk
        echo "OpenJDK 17 has been installed"
    fi
else
    echo "Java is not installed. Installing OpenJDK 17..."
    sudo apt-get install -y openjdk-17-jdk
    echo "OpenJDK 17 has been installed"
fi
