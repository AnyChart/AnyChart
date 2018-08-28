#!/usr/bin/env bash

########################################################################################################################
#
# Include module with functions
#
########################################################################################################################
. ./bin/travis/utils/mock.sh

########################################################################################################################
#
# Define Variables
#
########################################################################################################################
# DRY_RUN                                   # from travis_build_debugger.sh
# DRY_RUN_RELEASE                           # from travis_build_debugger.sh

COMMIT_HASH=$(git rev-parse --short HEAD)   # hash commit for Develop Version
BUILD_VERSION=$(python build.py version)    # 3 digit version (for ex. 8.3.0)
IS_RELEASE_BUILD=false                      # if Release make NPM, git tag, git realse etc
IS_RC_BUILD=false                           # if it is a RC release
IS_DEV_BUILD=false                          # build without geoData (drop CDN without latest)
VERSION=''

#### Define version
if [ "${TRAVIS_BRANCH}" = "master" ] || [ ${DRY_RUN_RELEASE} ]; then
    #TRAVIS_BRANCH =>    master (release) OR Dry-Run
    VERSION=${BUILD_VERSION}
    IS_RELEASE_BUILD=true

    STEP_CHECK_VARIABLES=true
    STEP_BUILD_DIST=false
    STEP_UPLOAD_STATIC=true
    STEP_DROP_CDN=true

    STEP_EXPORT_SERVER=true
    STEP_DOWNLOAD_EXTERNAL=true

    STEP_NPM_RELEASE=false
    STEP_GIT_RELEASE=true

    ####  Be sure u wanna uncomment this
    #STEP_LEGACY_7x=true

elif [[ "${TRAVIS_BRANCH}" =~ ^([0-9]+\.[0-9]+\.[0-9]+[-rc]+[0-9]+)$ ]]; then
    #TRAVIS_BRANCH =>      8.3.0-rc0 it is RC build
    VERSION=${TRAVIS_BRANCH}
    IS_RC_BUILD=true
    
    STEP_CHECK_VARIABLES=true
    STEP_BUILD_DIST=false
    STEP_UPLOAD_STATIC=true
    STEP_DROP_CDN=true

    STEP_EXPORT_SERVER=true
    STEP_DOWNLOAD_EXTERNAL=true

elif [[ "${TRAVIS_BRANCH}" =~ ^v([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    #TRAVIS_BRANCH =>     v8.3.0 it is a tag. Drop build
    echo 'No build needed for TAG'
    echo 'exit...'
    exit 0;
else
    #TRAVIS_BRANCH =>  `develop` OR any other brunch
    VERSION=${TRAVIS_BRANCH}
    IS_DEV_BUILD=true

    STEP_BUILD_DIST=true
    STEP_UPLOAD_STATIC=true
    STEP_DROP_CDN=true

fi
INSTALL_PACKAGE_NAME=anychart-installation-package-${VERSION}.zip

echo
echo '################################'
echo 'VARIABLES:'
echo Version: ${VERSION}
echo Branch: ${TRAVIS_BRANCH}
echo Commit Hash: ${COMMIT_HASH}
echo Is release build: ${IS_RELEASE_BUILD}
echo Is RC build: ${IS_RC_BUILD}
echo Is develop build: ${IS_DEV_BUILD}
echo '################################'
echo


########################################################################################################################
#
# Include Steps
#
########################################################################################################################
if [ "${STEP_CHECK_VARIABLES}" = "true" ]; then . ./bin/travis/steps/check_vars.sh; fi
if [ "${STEP_BUILD_DIST}" = "true" ]; then . ./bin/travis/steps/build_dist.sh; fi
if [ "${STEP_UPLOAD_STATIC}" = "true" ]; then . ./bin/travis/steps/upload_static.sh; fi
if [ "${STEP_DROP_CDN}" = "true" ]; then . ./bin/travis/steps/drop_cdn.sh; fi
if [ "${STEP_NPM_RELEASE}" = "true" ]; then . ./bin/travis/steps/npm_release.sh; fi
if [ "${STEP_GIT_RELEASE}" = "true" ]; then . ./bin/travis/steps/git_release.sh; fi
if [ "${STEP_EXPORT_SERVER}" = "true" ]; then . ./bin/travis/steps/export_server.sh; fi
if [ "${STEP_DOWNLOAD_EXTERNAL}" = "true" ]; then . ./bin/travis/steps/download_external.sh; fi
if [ "${STEP_LEGACY_7x}" = "true" ]; then . ./bin/travis/steps/legacy_binaries.sh; fi


check_variables
download_resources
build_dist

########################################################################################################################
#
#  Clear all big files/data for non release branch
#
########################################################################################################################
if [ ${IS_DEV_BUILD} = "true" ] || [ ${IS_RC_BUILD} = "true" ]; then
    echo "--"
    echo Removeing geodata
    echo "--"

    Run "rm -rf dist/geodata"
    echo
fi

########################################################################################################################
#
# Upload all binaries (JS/CSS/Themes etc for ACDVF & Graphics) on static
#
########################################################################################################################
upload_all_files
legacy_7x_magic

########################################################################################################################
#
# Drop CDN cache for uploaded files (for all builds)
#
########################################################################################################################
drop_cdn_cache


########################################################################################################################
#
#  MAKE RELEASES
#
########################################################################################################################
if [ ${IS_RELEASE_BUILD} = "true" ] || [ ${IS_RC_BUILD} = "true" ]; then

    ####################################################################################################################
    #
    # EXPORT SERVER BUILD
    #
    ####################################################################################################################
    build_export_server

    ####################################################################################################################
    #
    # GITHUB RELEASE
    #
    ####################################################################################################################
    git_release

    ####################################################################################################################
    #
    # NPM RELEASE
    #
    ####################################################################################################################
    npm_release

fi
