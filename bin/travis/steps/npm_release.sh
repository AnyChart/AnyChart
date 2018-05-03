#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################


function npm_release(){
    echo "--"
    echo Publishing NPM release
    echo "--"

    Run "npm publish"
    echo
}

function npm_check_variables(){
    NPM_USER=$(npm whoami)
    if [ "${NPM_USER}" != "anychart" ]; then
        echo Wrong NPM user
        exit 1
    fi

    NPM_VERSION_INFO=$(npm view anychart@${VERSION})
    if [ "${NPM_VERSION_INFO}" != "" ]; then
        echo NPM version exists, you have to increase version number
        exit 1
    fi
}