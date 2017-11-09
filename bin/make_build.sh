#!/bin/bash

# ---- Variables (for all builds) --------------------------------------------------------------------------------------
COMMIT_HASH=$(git rev-parse --short HEAD)
BUILD_VERSION=$(python build.py version)

if [ "${TRAVIS_BRANCH}" = "master" ]; then
    VERSION=${BUILD_VERSION}
elif [ "${TRAVIS_BRANCH}" = "develop" ]; then
    VERSION=${BUILD_VERSION}-${COMMIT_HASH}
elif [[ "${TRAVIS_BRANCH}" =~ ^RC-([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    RC_VERSION=${BASH_REMATCH[1]}
    if [ "${BUILD_VERSION}" = "${RC_VERSION}" ]; then
        VERSION=$(python build.py version)
    else
        VERSION=${TRAVIS_BRANCH}
    fi
else
    VERSION=${TRAVIS_BRANCH}
fi
INSTALL_PACKAGE_NAME=anychart-installation-package-${VERSION}.zip

echo Version: ${VERSION}
echo Branch: ${TRAVIS_BRANCH}
echo Commit Hash: ${COMMIT_HASH}
# ---- Variables (for all builds) --------------------------------------------------------------------------------------


# ---- Variables (release builds only) ---------------------------------------------------------------------------------
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    echo Fetching release build variables
    # check equal to ""
    NPM_VERSION_INFO=$(npm view anychart@${VERSION})

    # check contains "message": "Not Found"
    GITHUB_RELEASE_INFO=$(curl https://api.github.com/repos/AnyChart/AnyChart/releases/tags/v7.14.8?access_token=${GITHUB_TOKEN})

    # check contains "name": "v8.0.0"
    GITHUB_TAG_INFO=$(curl https://api.github.com/repos/AnyChart/AnyChart/tags?access_token=${GITHUB_TOKEN})

    # check equal to "anychart"
    NPM_USER=$(npm whoami)

    # check equal to "Ok"
    ALL_VERSIONS_IS_SET=$(python build.py version -v)

    # used to create latest build
    MAJOR_VERSION=$(python build.py version -m)

fi
# ---- Variables (release builds only) ---------------------------------------------------------------------------------


# ---- Blocker Checks (release builds only) ----------------------------------------------------------------------------
if [ "${TRAVIS_BRANCH}" = "master" ]; then

    if [ "${NPM_USER}" != "anychart" ]; then
        echo Wrong NPM user
        exit 1
    fi

    if [ "${ALL_VERSIONS_IS_SET}" != "Ok" ]; then
        echo Wrong version set in one of the project files, check them all!
        exit 1
    fi

    if [ "${NPM_VERSION_INFO}" != "" ]; then
        echo NPM version exists, you have to increase version number
        exit 1
    fi

    if [ "${GITHUB_TAG_INFO}" != *"\"name\": \"v${VERSION}\""* ]; then
        echo Gthub tag doesn\'t exist, create it and try again. Travis restart button is recommented.
        exit 1
    fi

    if [ "${GITHUB_RELEASE_INFO}" != *"\"message\": \"Not Found\""* ]; then
        echo Github release exists, remove it and try again. Travis restart button is recommented.
        exit 1
    fi

fi
# ---- Blocker Checks (release builds only) ----------------------------------------------------------------------------


# ---- Build binary files (for all builds) -----------------------------------------------------------------------------
# build binary files
sh ./bin/build_release.sh

# copy bin files
echo Copying wrappers from bin to dist
cp ./bin/binaries_wrapper_end.txt ./dist/binaries_wrapper_end.txt
cp ./bin/binaries_wrapper_start.txt ./dist/binaries_wrapper_start.txt
# ---- Build binary files (for all builds) -----------------------------------------------------------------------------


# ---- One more check, should be executed right after binaries build (release builds only) -----------------------------
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    GIT_STATUS=$(git status)
    if [[ "${GIT_STATUS}" =~ dist/themes/.+ ]]; then
        echo Theme files has changes, looks like you forgot update theme files in dist folder
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
# ---- One more check, should be executed right after binaries build (release builds only) -----------------------------


# ---- Clear binary files to reduce result size (dev builds only) ------------------------------------------------------
if [ "${TRAVIS_BRANCH}" != "master" ]; then
    echo Removeing geodata
    rm -rf dist/geodata
fi
# ---- Clear binary files to reduce result size (dev builds only) ------------------------------------------------------


# ---- Build binary files (release builds only) ------------------------------------------------------------------------
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    cd dist
    echo Downloading docs and demos

    # download docs
    wget https://docs.anychart.com/download -O docs.zip
    unzip -q docs.zip -d docs
    rm docs.zip

    # download demos
    wget https://playground.anychart.com/gallery/latest/download -O demos.zip
    unzip -q demos.zip -d demos
    rm demos.zip

    # make fonts zip file
    zip -q -r anychart-fonts-${VERSION}.zip fonts

    cd ..
fi
# ---- Build binary files (release builds only) ------------------------------------------------------------------------


# ---- Upload binary files (for all builds) ----------------------------------------------------------------------------
# zip files
echo Zipping dist files
cd dist
zip -q -r ${INSTALL_PACKAGE_NAME} *
cd ..

# ensure target directory exists and clean
# as far as CDN always serve removed content, we are free to clean entire folder
ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING "
mkdir -p /apps/static/cdn/releases/${VERSION} &&
rm -rf /apps/static/cdn/releases/${VERSION}/*"

# upload files
echo Uploading files
scp -i ~/.ssh/id_rsa dist/${INSTALL_PACKAGE_NAME} $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/${VERSION}/${INSTALL_PACKAGE_NAME}

# unzip files
echo Unzipping files
ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING "unzip -q -o /apps/static/cdn/releases/${VERSION}/anychart-installation-package-${VERSION}.zip -d /apps/static/cdn/releases/${VERSION}/"

ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING "
    cp /apps/static/cdn/releases/${VERSION}/js/modules.json /apps/static/cdn/releases/${VERSION}/index.json"

# ---- Upload binary files (for all builds) ----------------------------------------------------------------------------


# ---- Copy dev legacy files (dev builds only) -------------------------------------------------------------------------
# 7.x version DEV structure
echo Copy dev legacy files
if [ "${TRAVIS_BRANCH}" != "master" ]; then
    ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING "
    rm -rf /apps/static/js/${VERSION} &&
    cp -r /apps/static/cdn/releases/${VERSION}/js /apps/static/js/${VERSION} &&
    cp /apps/static/cdn/releases/${VERSION}/commit-hash.txt /apps/static/js/${VERSION}/commit-hash.txt &&
    rm -rf /apps/static/css/${VERSION} &&
    cp -r /apps/static/cdn/releases/${VERSION}/css /apps/static/css/${VERSION}"
fi

# 7.x version CAT structure
echo Copy CAT legacy files
if [ "${VERSION}" != "${TRAVIS_BRANCH}" ]; then
    ssh -i ~/.ssh/id_rsa  $STATIC_HOST_SSH_STRING "
    rm -rf /apps/static/cdn/releases/${TRAVIS_BRANCH} &&
    cp -r /apps/static/cdn/releases/${VERSION} /apps/static/cdn/releases/${TRAVIS_BRANCH}"
fi
# ---- Copy dev legacy files (dev builds only) -------------------------------------------------------------------------


# ---- Copy release legacy files (release builds only) -----------------------------------------------------------------
echo Copy release legacy files
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    echo Copy prod legacy files
    ssh -i ~/.ssh/id_rsa $STATIC_HOST_SSH_STRING "
    rm -rf /apps/static/cdn/js/${VERSION} &&
    cp -r /apps/static/cdn/releases/${VERSION}/js /apps/static/cdn/js/${VERSION} &&
    rm -rf /apps/static/cdn/css/${VERSION} &&
    cp -r /apps/static/cdn/releases/${VERSION}/css /apps/static/cdn/css/${VERSION} &&
    rm -rf /apps/static/cdn/themes/${VERSION} &&
    cp -r /apps/static/cdn/releases/${VERSION}/themes /apps/static/cdn/themes/${VERSION} &&
    mkdir -p /apps/static/cdn/schemas/${VERSION} &&
    cp /apps/static/cdn/releases/${VERSION}/json-schema.json /apps/static/cdn/schemas/${VERSION}/json-schema.json &&
    cp /apps/static/cdn/releases/${VERSION}/xml-schema.xsd /apps/static/cdn/schemas/${VERSION}/xml-schema.xsd"
fi
# ---- Copy release legacy files (release builds only) -----------------------------------------------------------------


# ---- Create latest version (release builds only) ---------------------------------------------------------------------
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    echo Create latest version
    ssh -i ~/.ssh/id_rsa  $STATIC_HOST_SSH_STRING "
    rm -rf /apps/static/cdn/releases/${MAJOR_VERSION}.x.x &&
    cp -r /apps/static/cdn/releases/${VERSION} /apps/static/cdn/releases/${MAJOR_VERSION}.x.x"
fi
# ---- Create latest version (release builds only) ---------------------------------------------------------------------


# ---- Drop CDN cache for uploaded files (for all builds) --------------------------------------------------------------
echo Dropping CDN cache
python ./bin/drop_cdn_cache.py ${VERSION} ${CDN_ALIASE} ${CDN_CONSUMER_KEY} ${CDN_CONSUMER_SECRET} ${CDN_ZONE_ID}
# ---- Drop CDN cache for uploaded files (for all builds) --------------------------------------------------------------


# ---- Release tasks (release builds only) -----------------------------------------------------------------------------
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    # make NPM release
    echo Publishing NPM release
    npm publish

    # build export server
    echo Building and uploading export server
    git clone https://github.com/AnyChart/export-server.git out/export-server
    cp out/anychart-bundle.min.js out/export-server/resources/js/anychart-bundle.min.js
    cd out/export-server
    lein uberjar
    cd ../../
    scp -i ~/.ssh/id_rsa out/export-server/target/export-server-standalone.jar $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/${VERSION}/anychart-export-server-${VERSION}.jar
    rm -rf out/export-server

    # make github release
    echo Publishing Github release
    python ./bin/upload_github_release.py ${GITHUB_TOKEN}
fi


# ---- Release tasks (release builds only) -----------------------------------------------------------------------------