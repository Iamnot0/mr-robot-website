#!/bin/bash
set -e
echo "Current directory: $(pwd)"
echo "Listing contents:"
ls -la
echo "Changing to website/fronted directory..."
cd website/fronted
echo "Current directory after cd: $(pwd)"
echo "Listing contents of website/fronted:"
ls -la
echo "Checking if public/index.html exists:"
ls -la public/
echo "Installing dependencies..."
npm install
echo "Building project..."
npm run build
echo "Build completed. Listing build directory:"
ls -la build/
