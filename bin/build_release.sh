#!/bin/bash

echo Building binary JS files
python ./build.py compile --output ./dist/js

echo Building binary CSS files
python ./build.py css --output ./dist/css

echo Building binary Themes files
python ./build.py themes --output ./dist/themes

cd libs/graphicsjs
python build.py
cd ../../
cp libs/graphicsjs/out/graphics.js dist/graphics.js
cp libs/graphicsjs/out/graphics.min.js dist/graphics.min.js