#!/usr/bin/env bash

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo 'Error: npm is not installed. (https://nodejs.org/en/download/current/)' >&2
  exit 1
fi

# Install node modules
npm install

# OTHER THINGS

# Create favicons
cd images/favicon/
if ./createFaviconFiles.sh ; then
    echo "Favicons created"
else
    echo "Favicons creation failed"
    exit 1
fi
cd ../../

# Download fonts
cd fonts/
if ./downloadFonts.sh ; then
    echo "Fonts were downloaded"
else
    echo "Font dowload failed"
    exit 1
fi
cd ../
