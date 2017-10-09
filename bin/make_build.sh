#!/bin/bash

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

echo Version: ${VERSION}
echo Branch: ${TRAVIS_BRANCH}
echo Commit: ${COMMIT_HASH}

# we can build release files only in case of dev release
if [ "${TRAVIS_BRANCH}" != "master" ]; then
    # build release files
    echo Building release files: JS, CSS, Themes
    python ./build.py compile --output ./dist/js
    python ./build.py css --output ./dist/css
    python ./build.py themes --output ./dist/themes
else
    echo Skip release files build step, take files from the dist folder as is
fi

# copy bin files
echo Copying wrappers from bin to dist
cp ./bin/binaries_wrapper_end.txt ./dist/binaries_wrapper_end.txt
cp ./bin/binaries_wrapper_start.txt ./dist/binaries_wrapper_start.txt

# go to dist directory
cd ./dist/

# don't download docs/demos and remove geodata for dev builds to reduce folder size
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    echo Downloading docs and demos

    # download docs
    wget https://docs.anychart.com/download -O docs.zip
    unzip -q docs.zip -d docs
    rm docs.zip

    # download demos
    wget https://playground.anychart.com/gallery/latest/download -O demos.zip
    unzip -q demos.zip -d demos
    rm demos.zip
else
    rm -rf geodata
fi

# zip files
zip -q -r installation-package.zip *

# ensure release paths exists and clean
# as far as cdn always serve removed content, we are free to clean entire folder
ssh $STATIC_HOST_SSH_STRING "
mkdir -p /apps/static/cdn/releases/${VERSION} &&
rm -rf /apps/static/cdn/releases/${VERSION}/*"

if [ "${TRAVIS_BRANCH}" = "master" ]; then
    ssh $STATIC_HOST_SSH_STRING "
    mkdir -p /apps/static/cdn/releases &&
    rm -rf /apps/static/cdn/releases/latest"
fi

# upload content
scp installation-package.zip $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/${VERSION}/installation-package.zip

# copy unzip release files and copy to latest
ssh $STATIC_HOST_SSH_STRING "unzip -q -o /apps/static/cdn/releases/${VERSION}/installation-package.zip -d /apps/static/cdn/releases/${VERSION}/"

# copy legacy files by version and latest
ssh $STATIC_HOST_SSH_STRING "
rm -rf /apps/static/cdn/js/${VERSION} &&
cp -r /apps/static/cdn/releases/${VERSION}/js /apps/static/cdn/js/${VERSION} &&
rm -rf /apps/static/cdn/css/${VERSION} &&
cp -r /apps/static/cdn/releases/${VERSION}/css /apps/static/cdn/css/${VERSION} &&
rm -rf /apps/static/cdn/themes/${VERSION} &&
cp -r /apps/static/cdn/releases/${VERSION}/themes /apps/static/cdn/themes/${VERSION} &&
mkdir -p /apps/static/cdn/schemas/${VERSION} &&
cp /apps/static/cdn/releases/${VERSION}/json-schema.json /apps/static/cdn/schemas/${VERSION}/json-schema.json &&
cp /apps/static/cdn/releases/${VERSION}/xml-schema.xsd /apps/static/cdn/schemas/${VERSION}/xml-schema.xsd"

# copy DEV legacy files by version
if [ "${TRAVIS_BRANCH}" != "master" ]; then
    ssh $STATIC_HOST_SSH_STRING "
    rm -rf /apps/static/js/${VERSION} &&
    cp -r /apps/static/cdn/releases/${VERSION}/js /apps/static/js/${VERSION} &&
    cp /apps/static/cdn/releases/${VERSION}/commit-hash.txt /apps/static/js/${VERSION}/commit-hash.txt &&
    rm -rf /apps/static/css/${VERSION} &&
    cp -r /apps/static/cdn/releases/${VERSION}/css /apps/static/css/${VERSION}"
fi

# drop cdn cache for uploaded files
echo Dropping CDN cache
cd ../
python ./bin/drop_cdn_cache.py ${VERSION} ${CDN_ALIASE} ${CDN_CONSUMER_KEY} ${CDN_CONSUMER_SECRET} ${CDN_ZONE_ID}




