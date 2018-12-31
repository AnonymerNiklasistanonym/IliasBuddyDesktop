#!/usr/bin/env bash

cd site/
python -mwebbrowser http://localhost:8000
python -m http.server 8000
