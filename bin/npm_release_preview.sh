#!/bin/bash

########################################################################################################################
#
#  Script for making npm RC release of main component
#
#  To make it trun from root path
#    ./bin/npm_release_preview 8.3.0-rc1
#
########################################################################################################################

VERSION=$1
RUN_FROM_AUTODEPLOY=$2

if [ ! $RUN_FROM_AUTODEPLOY ]; then
    echo "Pull develop"
    git checkout -- .
    git pull origin develop

    echo ""
    echo "Download latest index.d.ts"
    curl http://api.anychart.stg/si/develop/index-develop.d.ts --output  ./dist/index.d.ts

    echo ""
    echo "Build binaries"
    ./bin/build_release.sh

    echo ""
    echo "Change version (package.json)"
    python -c "import sys, re
    with open(\"./package.json\", \"r+\") as f:
        text = f.read()
        text = re.sub('\"version\": \"%s\"' % '([0-9]+\.[0-9]+\.[0-9]+)', '\"version\": \"%s\"' % '$VERSION', text)
        f.seek(0)
        f.write(text)
        f.close()"
    echo "npm publish --tag "${VERSION//\./}
    npm publish --tag ${VERSION//\./}

    echo ""
    echo "Commit all changes"
    git checkout -- package.json
    git commit -am "release npm $VERSION"
    git push origin develop
else
    echo "npm publish --tag "${VERSION//\./}
    npm publish --tag ${VERSION//\./}
fi