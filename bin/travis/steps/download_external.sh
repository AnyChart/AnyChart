#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################

function download_docs(){
    echo "--"
    echo Downloading docs
    echo "--"

    Run "wget https://docs.anychart.com/download -O docs.zip"
    Run "unzip -q docs.zip -d docs"
    Run "rm docs.zip"
    echo
}

function download_demos(){
    echo "--"
    echo Downloading demos
    echo "--"

    Run "wget https://playground.anychart.com/gallery/latest/download -O demos.zip"
    Run "unzip -q demos.zip -d demos"
    Run "rm demos.zip"
    echo
}

function download_fonts(){
    echo "--"
    echo Download fonts
    echo "--"

    Run "git clone --depth 1 git@github.com:AnyChart/fonts.git ../out/fonts"
    Run "rm -rf fonts"
    Run "mv ../out/fonts/dist ./fonts"

    Run "zip -q -r anychart-fonts-${VERSION}.zip fonts"
    # Run "git clone git@github.com:AnyChart/chart-editor.git --depth 1"
    echo
}

function download_chart_editor(){
    echo "--"
    echo Download Chart Editor
    echo "--"

    Run "git clone --depth 1 git@github.com:AnyChart/chart-editor.git ../out/chart-editor"

    Run "cp ../out/chart-editor/dist/anychart-editor.min.js ./js/anychart-editor.min.js"
    Run "cp ../out/chart-editor/dist/anychart-editor.css ./css/anychart-editor.css"
    Run "cp ../out/chart-editor/dist/anychart-editor.min.css ./css/anychart-editor.min.css"

    echo
}

function download_resources(){
    Run "cd dist"

    # download_docs
    # download_demos
    download_fonts
    download_chart_editor

    Run "cd .."
    echo
}
