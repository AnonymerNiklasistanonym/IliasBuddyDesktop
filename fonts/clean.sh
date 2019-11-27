#!/usr/bin/env bash

# [CLEAN] Zip file downloads
find -type f -iname '*.zip' -delete

# [CLEAN] Extract font files
find -type f -iname '*.woff2' -delete
