#!/usr/bin/env bash

./clean.sh

# Check if wget is installed
if ! [ -x "$(command -v wget)" ]; then
  echo 'Error: wget is not installed. (Windows: https://eternallybored.org/misc/wget/)' >&2
  exit 1
fi

# Check if unzip is installed
if ! [ -x "$(command -v unzip)" ]; then
  echo 'Error: unzip is not installed.' >&2
  exit 1
fi



# Zip file downloads
wget -O zippedFilesOpenSans.zip "http://google-webfonts-helper.herokuapp.com/api/fonts/open-sans?download=zip&subsets=latin&variants=regular&formats=woff2"
wget -O zippedFilesRoboto.zip "http://google-webfonts-helper.herokuapp.com/api/fonts/roboto?download=zip&subsets=latin&variants=regular&formats=woff2"

# Extract font files
unzip zippedFilesOpenSans.zip
unzip zippedFilesRoboto.zip

# Remove unnecessary files
rm -f zippedFilesOpenSans.zip
rm -f zippedFilesRoboto.zip

# Fira Code Regular Part
wget -O zippedFilesFiraCode.zip "https://github.com/tonsky/FiraCode/releases/download/1.206/FiraCode_1.206.zip"
unzip zippedFilesFiraCode.zip -d FiraCodeFilesExtracted
mv FiraCodeFilesExtracted/woff2/FiraCode-Regular.woff2 FiraCode-Regular.woff2
rm -f zippedFilesFiraCode.zip
rm -rf FiraCodeFilesExtracted
