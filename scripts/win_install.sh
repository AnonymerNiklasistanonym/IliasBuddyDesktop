#!/usr/bin/env bash

echo '>> INSTALL [WINDOWS]'

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo 'Error: npm is not installed. (https://nodejs.org/en/download/current/)' >&2
  exit 1
fi

cd ..
# Remove old build
rm -fr dist
# Build app
npm run build-win
# Execute installer
cd dist
OUTPUT=$(find . -name '*.exe' -print -quit)
echo ${OUTPUT}
"${OUTPUT}"
