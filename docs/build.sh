#!/usr/bin/env bash

./clean.sh

echo '>> BUILD [DOCUMENTATION]'

# Build documentation with instructions
cd mkdocs
mkdocs build
cd ..

# Build source code documentation
typedoc --tsconfig ../tsconfig.json

# Copy typedoc to final documentation
cp -r typedoc mkdocs/site/typedoc
