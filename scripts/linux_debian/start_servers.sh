#!/bin/bash

# List of common terminal emulators
TERMINALS=("gnome-terminal" "xfce4-terminal" "konsole" "xterm" "lxterminal" "tilix" "mate-terminal" "kitty")

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

echo "Starting frontend server..."
"$TERMINAL" -- bash -c "cd ../../front-end && npm start; exec bash" &
