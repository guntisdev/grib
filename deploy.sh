#!/bin/bash

# Exit script on error
set -e

# Build web files
cd web/
npm run build
cd ..

# Deploy to fly
fly deploy