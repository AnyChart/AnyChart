#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################

function check_variables(){
    echo "--"
    echo Fetching release build variables
    echo "--"


    ALL_VERSIONS_IS_SET=$(python build.py version -v)
    if [ "${ALL_VERSIONS_IS_SET}" != "Ok" ]; then
        echo "Wrong version set in one of the project files, check them all!"
        echo ${ALL_VERSIONS_IS_SET}
        exit 1
    fi

    echo "check NPM"
    Run "npm_check_variables"
    echo "check GIT"
    Run "git_check_variables"

    # used to create latest build
    MAJOR_VERSION=$(python build.py version -m)

    echo
}

