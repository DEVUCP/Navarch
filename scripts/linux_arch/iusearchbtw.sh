echo "Do you use arch? [y/n] "
read -r response
response=${response:-y}
if [ "$response" = "y" ]; then
    echo "Do it yourself then."
    exit 0
fi
if[ "$response" = "n" ]; then
    echo "This script is not for you."  
    exit 0
fi