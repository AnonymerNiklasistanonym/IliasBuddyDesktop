#!/usr/bin/env bash

# PNG export: Declare an array with the image sizes
array=( 512 )
for i in "${array[@]}"
do
	# Export each size as a `png` favicon from `favicon.svg`
	inkscape ".\favicon.svg" --export-png="favicon_"$i".png" --export-width=$i --export-height=$i --without-gui
done

# ICO export:
magick convert favicon_512.png -define icon:auto-resize=16,32,48,64,96,128,256 favicon.ico
