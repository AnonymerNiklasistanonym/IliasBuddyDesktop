#!/usr/bin/env bash

cd images/favicon/
./clean.sh
cd ../../
cd fonts/
./clean.sh
cd ../

rm -rf dist
rm -rf node_modules
rm -rf package-lock.json
