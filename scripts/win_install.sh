#!/usr/bin/env bash

echo '>> INSTALL [WINDOWS]'
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
