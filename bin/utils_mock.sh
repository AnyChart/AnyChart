#!/usr/bin/env bash

########################################################################################################################
#
#  Utility functions
#
########################################################################################################################


if [ ${DRY_RUN} -eq 1 ]; then
  echo '##############################'
  echo '     IT IS A DRY RUN'
  echo '##############################'
fi

Run ()
{
    if [ ${DRY_RUN} -eq 1 ]; then
        echo "$*"
        return 0
    fi

    eval "$@"
}

########################################################################################################################
#
# File with empty functions
#
########################################################################################################################
npm_release(){
    echo
    echo '<<<<<   no npm release >>>>>'
    echo
}
npm_check_variables(){
    echo
    echo '<<<<<   no npm variables >>>>>'
    echo
}


git_release(){
    echo
    echo '<<<<<   no git release >>>>>'
    echo
}
git_check_variables(){
    echo
    echo '<<<<<   no git variables >>>>>'
    echo
}


build_dist(){
    echo
    echo '<<<<<  no Build Binaries Module >>>>>'
    echo
}


build_export_server(){
    echo
    echo '<<<<<  no Export Server Module >>>>>'
    echo
}


drop_cdn_cache(){
    echo
    echo '<<<<<  no CDN-Drop Module >>>>>'
    echo
}

download_resources(){
    echo
    echo '<<<<<  no Download (Docs/Demos/Fonts) Module >>>>>'
    echo
}


upload_all_files(){
    echo
    echo '<<<<<  no Upload module >>>>>'
    echo
}


legacy_7x_magic(){
    echo
    echo '<<<<<  no Legacy Module >>>>>'
    echo
}