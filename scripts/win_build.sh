#!/usr/bin/env bash

echo '>> BUILD [WINDOWS]'

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo 'Error: npm is not installed. (https://nodejs.org/en/download/current/)' >&2
  exit 1
fi

cd ..
npm run build-win
