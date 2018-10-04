#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################
function upload_all_files(){
    CDN_PATH_="/apps/static/cdn/${MOCK_CDN_PATH}"
    
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
      mkdir -p ${CDN_PATH_}releases/${VERSION} && rm -rf ${CDN_PATH_}releases/${VERSION}/*\" "
    echo

    ####################################################################################################################
    #
    #  Upload files
    #
    ####################################################################################################################
    echo Uploading files
    Run "scp -i ~/.ssh/id_rsa dist/${INSTALL_PACKAGE_NAME} $STATIC_HOST_SSH_STRING:${CDN_PATH_}releases/${VERSION}/${INSTALL_PACKAGE_NAME}"
    echo

    ####################################################################################################################
    #
    #  unzip files on server
    #
    ####################################################################################################################
    echo Unzipping files
    Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
    unzip -q -o ${CDN_PATH_}releases/${VERSION}/${INSTALL_PACKAGE_NAME} -d ${CDN_PATH_}releases/${VERSION}/\" "

    Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
        cp ${CDN_PATH_}releases/${VERSION}/js/modules.json ${CDN_PATH_}releases/${VERSION}/index.json\" "
    echo


    ####################################################################################################################
    #
    #  unzip files on server
    #
    ####################################################################################################################
    if [ ${IS_RELEASE_BUILD} = "true" ]; then
        echo Copy prod legacy files
        Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
        mkdir -p ${CDN_PATH_}themes/${VERSION} &&
        rm -rf ${CDN_PATH_}themes/${VERSION} &&
        cp -r ${CDN_PATH_}releases/${VERSION}/themes ${CDN_PATH_}themes/${VERSION} &&
        mkdir -p ${CDN_PATH_}schemas/${VERSION} &&
        cp ${CDN_PATH_}releases/${VERSION}/json-schema.json ${CDN_PATH_}schemas/${VERSION}/json-schema.json &&
        cp ${CDN_PATH_}releases/${VERSION}/xml-schema.xsd ${CDN_PATH_}schemas/${VERSION}/xml-schema.xsd \" "
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
        rm -rf ${CDN_PATH_}releases/v${MAJOR_VERSION} &&
        cp -r ${CDN_PATH_}releases/${VERSION} ${CDN_PATH_}releases/v${MAJOR_VERSION} \" "
        echo
    fi

    if [ ${IS_RC_BUILD} = "true" ]; then
        echo Create RC version
        Run "ssh -i ~/.ssh/id_rsa  $STATIC_HOST_SSH_STRING \"
        rm -rf ${CDN_PATH_}releases/rc &&
        cp -r ${CDN_PATH_}releases/${VERSION} ${CDN_PATH_}releases/rc \" "
        echo
    fi
}