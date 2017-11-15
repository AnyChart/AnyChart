#!/bin/bash

# clear out folder
rm -rf out/*

# clear dist folder
rm dist/*.js
rm dist/*.css
rm dist/themes/*

# build js/css files
./build.py compile_each && ./build.py compile_each -d
./build.py compile_each && ./build.py compile_each -d
./build.py compile -m anychart_ui && ./build.py compile -m anychart_ui -d
./build.py compile -m chart_editor && ./build.py compile -m chart_editor -d
./build.py compile -m data_adapter && ./build.py compile -m data_adapter -d
mv out/* dist

# build themes
./build.py themes
mv out/* dist/themes

