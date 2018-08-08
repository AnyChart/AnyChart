#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################
function upload_all_files(){
    Run "skype_send status 'Start upload CDN (static)'"

    echo "--"
    echo "Upload files to static server"
    echo "--"

    ####################################################################################################################
    #
    #  zip files
    #
    ####################################################################################################################
    echo Zipping dist files
    Run "cd dist"
    Run "zip -q -r ${INSTALL_PACKAGE_NAME} *"
    Run "cd .."
    echo

    ####################################################################################################################
    #
    # ensure target directory exists and clean
    # as far as CDN always serve removed content, we are free to clean entire folder
    #
    ####################################################################################################################
    echo Create-n-clear dir on static
    Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
      mkdir -p /apps/static/cdn/releases/${VERSION} && rm -rf /apps/static/cdn/releases/${VERSION}/*\" "
    echo

    ####################################################################################################################
    #
    #  Upload files
    #
    ####################################################################################################################
    echo Uploading files
    Run "scp -i ~/.ssh/id_rsa dist/${INSTALL_PACKAGE_NAME} $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/${VERSION}/${INSTALL_PACKAGE_NAME}"
    echo

    ####################################################################################################################
    #
    #  unzip files on server
    #
    ####################################################################################################################
    echo Unzipping files
    Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
    unzip -q -o /apps/static/cdn/releases/${VERSION}/${INSTALL_PACKAGE_NAME} -d /apps/static/cdn/releases/${VERSION}/\" "

    Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
        cp /apps/static/cdn/releases/${VERSION}/js/modules.json /apps/static/cdn/releases/${VERSION}/index.json\" "
    echo


    ####################################################################################################################
    #
    #  unzip files on server
    #
    ####################################################################################################################
    if [ ${IS_RELEASE_BUILD} = "true" ]; then
        echo Copy prod legacy files
        Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
        mkdir -p /apps/static/cdn/themes/${VERSION} &&
        rm -rf /apps/static/cdn/themes/${VERSION} &&
        cp -r /apps/static/cdn/releases/${VERSION}/themes /apps/static/cdn/themes/${VERSION} &&
        mkdir -p /apps/static/cdn/schemas/${VERSION} &&
        cp /apps/static/cdn/releases/${VERSION}/json-schema.json /apps/static/cdn/schemas/${VERSION}/json-schema.json &&
        cp /apps/static/cdn/releases/${VERSION}/xml-schema.xsd /apps/static/cdn/schemas/${VERSION}/xml-schema.xsd \" "
        echo
    fi

    ####################################################################################################################
    #
    #  Create latest version for release
    #
    ####################################################################################################################
    if [ ${IS_RELEASE_BUILD} = "true" ]; then
        echo Create latest version
        Run "ssh -i ~/.ssh/id_rsa  $STATIC_HOST_SSH_STRING \"
        rm -rf /apps/static/cdn/releases/v${MAJOR_VERSION} &&
        cp -r /apps/static/cdn/releases/${VERSION} /apps/static/cdn/releases/v${MAJOR_VERSION} \" "
        echo
    fi

    if [ ${IS_RC_BUILD} = "true" ]; then
        echo Create RC version
        Run "ssh -i ~/.ssh/id_rsa  $STATIC_HOST_SSH_STRING \"
        rm -rf /apps/static/cdn/releases/rc &&
        cp -r /apps/static/cdn/releases/${VERSION} /apps/static/cdn/releases/rc \" "
        echo
    fi
}