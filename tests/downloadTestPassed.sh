#!/usr/bin/env bash

./clean.sh

# Check if wget is installed
if ! [ -x "$(command -v wget)" ]; then
  echo 'Error: wget is not installed. (Windows: https://eternallybored.org/misc/wget/)' >&2
  exit 1
fi

# Pikachu meme downloads
wget -O tests_passed_original.txt "https://pastebin.com/raw/V95NgBBp"
wget -O tests_passed_small_color.txt "https://pastebin.com/raw/jmM8hhnz"
