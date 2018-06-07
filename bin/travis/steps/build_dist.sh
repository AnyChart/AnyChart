#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################

function build_dist(){
    echo "--"
    echo Building binaries. Copy them to ./dist/
    echo "--"

    Run "sh ./bin/build_all_binaries.sh"
    # copy bin/wrappers files
    echo Copying wrappers from bin to dist
    Run "cp ./bin/sources/binaries_wrapper_end.txt ./dist/binaries_wrapper_end.txt"
    Run "cp ./bin/sources/binaries_wrapper_start.txt ./dist/binaries_wrapper_start.txt"
    echo

    skype_send status "Build binaries"
}

