#!/bin/bash

# Check and install Minecraft server if needed
echo "Checking for Minecraft server JAR..."

if [ ! -f "../../server/server.jar" ]; then
    echo "server.jar not found. Setting up Minecraft server..."

    mkdir -p ../../server || { echo "Failed to create server directory"; exit 1; }

    # Get the latest release metadata from Mojang
    echo "Fetching latest Minecraft version info..."
    VERSION_JSON=$(curl -fsSL https://launchermeta.mojang.com/mc/game/version_manifest.json) || { echo "Failed to download version manifest"; exit 1; }

    LATEST_VERSION=$(echo "$VERSION_JSON" | grep -oP '"release":\s*"\K[^"]+')
    VERSION_URL=$(echo "$VERSION_JSON" | grep -oP '"url":\s*"\K[^"]+(?=")' | head -n 1)

    if [ -z "$VERSION_URL" ]; then
        echo "Could not determine latest version URL"
        exit 1
    fi

    echo "Latest version: $LATEST_VERSION"
    echo "Fetching server JAR URL..."

    SERVER_JSON=$(curl -fsSL "$VERSION_URL") || { echo "Failed to download version JSON"; exit 1; }

    SERVER_JAR_URL=$(echo "$SERVER_JSON" | grep -oP '"server":\s*{\s*"sha1":\s*".*?",\s*"size":\s*\d+,\s*"url":\s*"\K[^"]+')

    if [ -z "$SERVER_JAR_URL" ]; then
        echo "Could not find server.jar download URL"
        exit 1
    fi

    echo "Downloading server.jar..."
    curl -fsSL "$SERVER_JAR_URL" -o ../../server/server.jar || { echo "Failed to download server.jar"; exit 1; }

    echo "Minecraft server.jar downloaded successfully."
else
    echo "server.jar already exists."
fi
