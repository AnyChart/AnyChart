#!/bin/bash

export VERSION=$1

echo "Pull develop"
git pull origin develop

echo ""build.py
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

echo ""
echo "NPM release "$VERSION
npm release --tag $VERSION

echo ""
echo "Discard all changes"
git checkout -- .
git clean -df