#!/usr/bin/env bash

./clean.sh

echo '>> BUILD [DOCUMENTATION]'

# Build documentation with instructions
mkdocs build

# Build source code documentation
typedoc --tsconfig ../tsconfig.json

# Copy typedoc to final documentation
# cp -r typedoc site/typedoc
