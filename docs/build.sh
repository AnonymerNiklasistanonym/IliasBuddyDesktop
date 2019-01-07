#!/usr/bin/env bash

./clean.sh

# IMPORTANT
# -----------------------------------------------------------------------------------------
# Don't forget to activate the virtual environment, if you installed the packages with it.
# -----------------------------------------------------------------------------------------

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo 'Error: npm is not installed.' >&2
  exit 1
fi

# Check if mkdocs is installed
if ! [ -x "$(command -v mkdocs)" ]; then
  echo 'Error: mkdocs is not installed. Look at the "build-docs" documentation page.' >&2
  exit 1
fi

echo '>> BUILD [DOCUMENTATION]'

# Build TODO page
npm run todo-page

# Build documentation with instructions
mkdocs build

# Build source code documentation
npm run typedoc
