#!/bin/bash

echo Building binary JS files
python ./build.py compile --output ./dist/js

echo Building binary CSS files
python ./build.py css --output ./dist/css

echo Building binary Themes files
python ./build.py themes --output ./dist/themes

cd libs/graphicsjs
python build.py plain
python build.py compile
cd ../../
cp libs/graphicsjs/out/graphics.js dist/js/graphics.js
cp libs/graphicsjs/out/graphics.min.js dist/js/graphics.min.js