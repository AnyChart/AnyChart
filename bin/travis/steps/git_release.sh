#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################


function git_release(){
    echo "--"
    echo Publishing GIT release
    echo "--"
    
    Run "python ./bin/travis/utils/upload_github_release.py ${GITHUB_TOKEN}"
    echo

    skype_send status "GIT RELEASE"
}

function git_check_variables(){
    GITHUB_TAG_INFO=$(curl https://api.github.com/repos/AnyChart/AnyChart/tags?access_token=${GITHUB_TOKEN})
    if [[ "${GITHUB_TAG_INFO}" != *"\"name\": \"v${VERSION}\""* ]]; then
        echo Github tag doesn\'t exist, create it and try again. Travis restart button is recommented.
        exit 1
    fi

    GITHUB_RELEASE_INFO=$(curl https://api.github.com/repos/AnyChart/AnyChart/releases/tags/v${VERSION}?access_token=${GITHUB_TOKEN})
    if [[ "${GITHUB_RELEASE_INFO}" != *"\"message\": \"Not Found\""* ]]; then
        echo Github release exists, remove it and try again. Travis restart button is recommented.
        exit 1
    fi
}