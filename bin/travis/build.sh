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

#### Set Steps
STEP_BUILD_DIST=true
STEP_UPLOAD_STATIC=true
STEP_DROP_CDN=true

STEP_EXPORT_SERVER=false
STEP_NPM_RELEASE=false
STEP_GIT_RELEASE=false
STEP_DOWNLOAD_EXTERNAL=false
STEP_LEGACY_7x=false

#### Define version
if [ "${TRAVIS_BRANCH}" = "master" ] || [ ${DRY_RUN_RELEASE} ]; then
    VERSION=${BUILD_VERSION}
    IS_RELEASE_BUILD=true

    STEP_NPM_RELEASE=true
    STEP_GIT_RELEASE=true

    STEP_EXPORT_SERVER=true
    STEP_DOWNLOAD_EXTERNAL=true

    ####  Be sure u wanna uncomment this
    #STEP_LEGACY_7x=true

elif [[ "${TRAVIS_BRANCH}" =~ ^([0-9]+\.[0-9]+\.[0-9]+[-rc]+[0-9]+)$ ]]; then
    # 8.3.0-rc0 it is RC build
    VERSION=${TRAVIS_BRANCH}
    IS_RC_BUILD=true

    STEP_BUILD_DIST=false

    STEP_EXPORT_SERVER=true
    STEP_DOWNLOAD_EXTERNAL=true

    STEP_NPM_RELEASE=false
    STEP_GIT_RELEASE=false

elif [[ "${TRAVIS_BRANCH}" =~ ^v([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    # v8.3.0 it is a tag. Drop build
    echo 'No build needed for TAG'
    echo 'exit...'
    exit 0;
else
    VERSION=${TRAVIS_BRANCH}
    IS_DEV_BUILD=true

    STEP_NPM_RELEASE=false
    STEP_GIT_RELEASE=false
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
if [ "${STEP_BUILD_DIST}" = "true" ]; then . ./bin/travis/steps/build_dist.sh; fi
if [ "${STEP_UPLOAD_STATIC}" = "true" ]; then . ./bin/travis/steps/upload_static.sh; fi
if [ "${STEP_DROP_CDN}" = "true" ]; then . ./bin/travis/steps/drop_cdn.sh; fi
if [ "${STEP_NPM_RELEASE}" = "true" ]; then . ./bin/travis/steps/npm_release.sh; fi
if [ "${STEP_GIT_RELEASE}" = "true" ]; then . ./bin/travis/steps/git_release.sh; fi
if [ "${STEP_EXPORT_SERVER}" = "true" ]; then . ./bin/travis/steps/export_server.sh; fi
if [ "${STEP_DOWNLOAD_EXTERNAL}" = "true" ]; then . ./bin/travis/steps/download_external.sh; fi
if [ "${STEP_LEGACY_7x}" = "true" ]; then . ./bin/travis/steps/legacy_binaries.sh; fi


if [ ${IS_RELEASE_BUILD} = "true" ] || [ ${IS_RC_BUILD} = "true" ]; then
    echo "--"
    echo Fetching release build variables
    echo "--"

    ALL_VERSIONS_IS_SET=$(python build.py version -v)
    if [ "${ALL_VERSIONS_IS_SET}" != "Ok" ]; then
        echo "Wrong version set in one of the project files, check them all!"
        echo ${ALL_VERSIONS_IS_SET}
        exit 1
    fi

    npm_check_variables
    git_check_variables

    # used to create latest build
    MAJOR_VERSION=$(python build.py version -m)

    echo
fi

########################################################################################################################
#
# build binary files
#
########################################################################################################################
build_dist



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

    ####################################################################################################################
    #
    #  Download Docs & Demos
    #
    ####################################################################################################################
    download_resources

fi

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
