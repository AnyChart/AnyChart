#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################

function legacy_7x_magic(){
    echo "--"
    echo "Legacy Module"
    echo "--"


    ####################################################################################################################
    #
    # 7.x version DEV structure
    #
    ####################################################################################################################
    if [ ${IS_RELEASE_BUILD} = "false" ]; then
        echo Copy dev legacy files
        Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
        rm -rf /apps/static/js/${VERSION} &&
        cp -r /apps/static/cdn/releases/${VERSION}/js /apps/static/js/${VERSION} &&
        cp /apps/static/cdn/releases/${VERSION}/commit-hash.txt /apps/static/js/${VERSION}/commit-hash.txt &&
        rm -rf /apps/static/css/${VERSION} &&
        cp -r /apps/static/cdn/releases/${VERSION}/css /apps/static/css/${VERSION} \" "
        echo
    fi

    ####################################################################################################################
    #
    # 7.x version CAT structure
    #
    ####################################################################################################################
    if [ "${VERSION}" != "${TRAVIS_BRANCH}" ]; then
        echo Copy CAT legacy files
        Run "ssh -i ~/.ssh/id_rsa  $STATIC_HOST_SSH_STRING \"
        rm -rf /apps/static/cdn/releases/${TRAVIS_BRANCH} &&
        cp -r /apps/static/cdn/releases/${VERSION} /apps/static/cdn/releases/${TRAVIS_BRANCH} &&
        mv /apps/static/cdn/releases/${TRAVIS_BRANCH}/${INSTALL_PACKAGE_NAME} /apps/static/cdn/releases/${TRAVIS_BRANCH}/anychart-installation-package-${TRAVIS_BRANCH}.zip \" "
        echo
    fi

    ####################################################################################################################
    #
    #  Legacy release
    #
    ####################################################################################################################
    if [ ${IS_RELEASE_BUILD} = "true" ]; then
        echo Copy prod legacy files
        Run "ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING \"
        rm -rf /apps/static/cdn/js/${VERSION} &&
        cp -r /apps/static/cdn/releases/${VERSION}/js /apps/static/cdn/js/${VERSION} &&
        rm -rf /apps/static/cdn/css/${VERSION} &&
        cp -r /apps/static/cdn/releases/${VERSION}/css /apps/static/cdn/css/${VERSION} \" "
        echo
    fi

}