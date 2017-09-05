#!/bin/bash
if [ "${TRAVIS_BRANCH}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ || "${TRAVIS_BRANCH}" = "DVF-3234-minor-build-fixes" ]; then

    # copy bin files
    cp ./bin/binaries_wrapper_end.txt ./dist/binaries_wrapper_end.txt
    cp ./bin/binaries_wrapper_start.txt ./dist/binaries_wrapper_start.txt

    # go to dist directory
    cd ./dist/

    # download docs
    wget https://docs.anychart.com/download -O docs.zip
    unzip -q docs.zip -d docs
    rm docs.zip

    # download demos
    wget https://playground.anychart.com/gallery/7.14.3/download -O demos.zip
    unzip -q demos.zip -d demos
    rm demos.zip

    # zip files
    zip -r installation-package.zip *

    # ensure releases branch exists and clean, as far as cdn always hosts removed content, we are free to remove files
    ssh $STATIC_HOST_SSH_STRING "
    mkdir -p /apps/static/cdn/releases/$TRAVIS_BRANCH &&
    rm -rf /apps/static/cdn/releases/$TRAVIS_BRANCH/* &&
    mkdir -p /apps/static/cdn/releases/latest &&
    rm -rf /apps/static/cdn/releases/latest"

    # upload content
    scp installation-package.zip $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/$TRAVIS_BRANCH/installation-package.zip

    # copy unzip release files and copy to latest
    ssh $STATIC_HOST_SSH_STRING "
    unzip -o /apps/static/cdn/releases/$TRAVIS_BRANCH/installation-package.zip -d /apps/static/cdn/releases/$TRAVIS_BRANCH/ &&
    cp -r /apps/static/cdn/releases/$TRAVIS_BRANCH /apps/static/cdn/releases/latest"

    # copy legacy files by version and latest
    ssh $STATIC_HOST_SSH_STRING "
    cp -r /apps/static/cdn/releases/$TRAVIS_BRANCH/js /apps/static/cdn/js/$TRAVIS_BRANCH &&
    cp -r /apps/static/cdn/releases/$TRAVIS_BRANCH/css /apps/static/cdn/css/$TRAVIS_BRANCH &&
    cp -r /apps/static/cdn/releases/$TRAVIS_BRANCH/themes /apps/static/cdn/themes/$TRAVIS_BRANCH &&
    mkdir -p /apps/static/cdn/schemas/$TRAVIS_BRANCH &&
    cp /apps/static/cdn/releases/$TRAVIS_BRANCH/json-schema.json /apps/static/cdn/schemas/$TRAVIS_BRANCH/json-schema.json &&
    cp /apps/static/cdn/releases/$TRAVIS_BRANCH/xml-schema.xsd /apps/static/cdn/schemas/$TRAVIS_BRANCH/xml-schema.xsd"

    echo $ANYCHART_VERSION >> ./test.txt

    #cd ../
    #./bin/drop_cdn_cache.py $TRAVIS_BRANCH $CDN_ALIASE $CDN_CONSUMER_KEY $CDN_CONSUMER_SECRET $CDN_ZONE_ID
    #./bin/upload_github_release.py $GITHUB_ACCESS_TOKEN
    #npm publish
fi




# todo
# 8. version regexp or develop
# 9. build export server ???
# 10. copy legacy files to latest cp -r /apps/static/cdn/releases/$TRAVIS_BRANCH/js/. /apps/static/cdn/js/latest/c
# 11. uncomment legacy cache drop in drop_cdn_cache.py