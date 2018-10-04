#!/usr/bin/env bash

########################################################################################################################
#
#  Utility functions
#
########################################################################################################################


if [ ${DRY_RUN} ] && [ ${DRY_RUN} -eq 1 ]; then
  echo '##############################'
  echo '     IT IS A DRY RUN'
  echo '##############################'
fi

Run ()
{
    echo ">$*"
    
    if [ ${DRY_RUN} ] && [ ${DRY_RUN} -eq 1 ]; then
        return 0
    fi

    eval "$@"
}

########################################################################################################################
#
# File with empty functions
#
########################################################################################################################
check_variables(){
    echo
    echo '<<<<<  MISS: check variables >>>>>'
    echo
}

npm_release(){
    echo
    echo '<<<<<  MISS: npm release >>>>>'
    echo
}
npm_check_variables(){
    echo
    echo '<<<<<  MISS: npm variables >>>>>'
    echo
}


git_release(){
    echo
    echo '<<<<<  MISS: git release >>>>>'
    echo
}
git_check_variables(){
    echo
    echo '<<<<<  MISS: git variables >>>>>'
    echo
}


build_dist(){
    echo
    echo '<<<<<  MISS: Build Binaries Module >>>>>'
    echo
}


build_export_server(){
    echo
    echo '<<<<<  MISS: Export Server Module >>>>>'
    echo
}


drop_cdn_cache(){
    echo
    echo '<<<<<  MISS: CDN-Drop Module >>>>>'
    echo
}

download_resources(){
    echo
    echo '<<<<<  MISS: Download (Docs/Demos/Fonts) Module >>>>>'
    echo
}


upload_all_files(){
    echo
    echo '<<<<<  MISS: Upload module >>>>>'
    echo
}


legacy_7x_magic(){
    echo
    echo '<<<<<  MISS: Legacy Module >>>>>'
    echo
}