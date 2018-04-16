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

function prepare_fonts(){
    echo "--"
    echo Prepare fonts
    echo "--"

    Run "zip -q -r anychart-fonts-${VERSION}.zip fonts"
    echo
}

function download_resources(){
    Run "cd dist"

    download_docs
    download_demos
    prepare_fonts

    Run "cd .."
    echo
}

