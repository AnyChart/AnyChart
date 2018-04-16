#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################


function drop_cdn_cache(){
    echo "--"
    echo Dropping CDN cache
    echo "--"

    if [ ${IS_RELEASE_BUILD} = "true" ]; then
        echo "drop cache for /releases/X.X.X/*"
        Run "python ./bin/utils_drop_cdn_cache.py ${VERSION} ${CDN_ALIASE} ${CDN_CONSUMER_KEY} ${CDN_CONSUMER_SECRET} ${CDN_ZONE_ID}"
        Run "python ./bin/utils_drop_cdn_cache.py v${MAJOR_VERSION} ${CDN_ALIASE} ${CDN_CONSUMER_KEY} ${CDN_CONSUMER_SECRET} ${CDN_ZONE_ID}"
    else
        echo "drop cache for /releases/develop/*"
        Run "python ./bin/utils_drop_cdn_cache.py ${TRAVIS_BRANCH} ${CDN_ALIASE} ${CDN_CONSUMER_KEY} ${CDN_CONSUMER_SECRET} ${CDN_ZONE_ID}"
    fi

    if [ "${VERSION}" != "${TRAVIS_BRANCH}" ]; then
        echo "CAT legacy structure"
        Run "python ./bin/utils_drop_cdn_cache.py ${TRAVIS_BRANCH} ${CDN_ALIASE} ${CDN_CONSUMER_KEY} ${CDN_CONSUMER_SECRET} ${CDN_ZONE_ID}"
    fi
    echo
}

