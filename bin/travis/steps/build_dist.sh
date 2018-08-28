#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################

function build_dist(){
    skype_send status "Start build binaries"
    
    echo "--"
    echo Building binaries. Copy them to ./dist/
    echo "--"
    
    echo Copying wrappers from bin to dist
    Run "cp ./bin/sources/binaries_wrapper_end.txt ./dist/binaries_wrapper_end.txt"
    Run "cp ./bin/sources/binaries_wrapper_start.txt ./dist/binaries_wrapper_start.txt"
    echo
    
    Run "sh ./bin/build_all_binaries.sh"
    # copy bin/wrappers files
    
    if [ ${IS_RELEASE_BUILD} = "true" ] || [ ${IS_RC_BUILD} = "true" ]; then
        ####################################################################################################################
        #
        #  Check dist files (if its actual)
        #
        ####################################################################################################################
        GIT_STATUS=$(git status)
        if [[ "${GIT_STATUS}" =~ dist/themes/.+ ]]; then
            echo "Theme files has changes, looks like you forgot update theme files in dist folder"
            exit 1
        fi
        
        if [[ "${GIT_STATUS}" =~ dist/js/.+ ]]; then
            echo JavaScript files has changes, looks like you forgot update JavaScript files in dist folder
            exit 1
        fi
        
        if [[ "${GIT_STATUS}" =~ dist/css/.+ ]]; then
            echo CSS files has changes, looks like you forgot update CSS files in dist folder
            exit 1
        fi
        
    fi
}

