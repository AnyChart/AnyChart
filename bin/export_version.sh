#!/usr/bin/env bash

if [ "${TRAVIS_BRANCH}" = "master" ]; then
    export ANYCHART_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
else
    export ANYCHART_VERSION="${TRAVIS_BRANCH}"
fi
