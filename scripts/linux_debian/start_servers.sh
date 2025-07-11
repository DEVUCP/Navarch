#!/bin/bash

# List of common terminal emulators
TERMINALS=("gnome-terminal" "xfce4-terminal" "konsole" "xterm" "lxterminal" "tilix" "mate-terminal" "kitty" "alacritty" "wezterm")

# Find a supported terminal
for term in "${TERMINALS[@]}"; do
    if command -v "$term" >/dev/null 2>&1; then
        TERMINAL="$term"
        break
    fi
done

if [ -z "$TERMINAL" ]; then
    echo "No supported terminal emulator found. Please install one of the following: ${TERMINALS[*]}"
    exit 1
fi

echo "Starting backend server..."
"$TERMINAL" -- bash -c "cd ../../api && npm start; exec bash" &

echo "=== Checking frontend build ==="
if [ -d "../../front-end/build" ]; then
    echo "Frontend build folder exists. Serving..."
    "$TERMINAL" -- bash -c "cd ../../front-end/build && npx serve; exec bash" &
else
    echo "Frontend build folder not found. Building..."
    (
        cd ../../front-end || exit 1
        npm run build
    )

    if [ -d "../../front-end/build" ]; then
        echo "Build complete. Serving frontend..."
        "$TERMINAL" -- bash -c "cd ../../front-end/build && npx serve; exec bash" &
    else
        echo "Frontend build failed."
    fi
fi