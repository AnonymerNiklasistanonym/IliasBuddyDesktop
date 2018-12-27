#!/usr/bin/env bash

cd images/favicon/
./clean.sh
cd ../../
cd fonts/
./clean.sh
cd ../
cd tests/
./clean.sh
cd ../

rm -rf dist
rm -rf node_modules
rm -rf package-lock.json

echo "Don't forget that there is still data left in the registry/AppData directory/etc.!"
echo "Check for further information the scripts in the directory './scripts'"
