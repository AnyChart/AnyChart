#!/usr/bin/env bash

########################################################################################################################
#
#  Script for making public release or RC automatically
#
#  To make it call from root path
#    ./bin/deploy_release.sh
#
########################################################################################################################




########################################################################################################################
#
#  Declare Variables
#
########################################################################################################################
IS_DRY_RUN=false
IS_RC=false
VERSION=$1
CURRENT_BRANCH=$(git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')

########################################################################################################################
#
#  Helper Functions
#
########################################################################################################################

function incorrect_version_input(){
    echo 'You should enter version like (d is digit):'
    echo ' d.d.d    to make public release'
    echo ' d.d.d-rc to make release candidate'
    exit 1
}

function run ()
{
    echo
    if ${IS_DRY_RUN}; then
        echo "$*"
        return 0
    fi
    eval "$@"
}


########################################################################################################################
#
#  Check input version
#
########################################################################################################################

if [ ! ${VERSION} ]; then incorrect_version_input; fi

if [[ ! "${VERSION}" =~ ^([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    if [[ ! ${VERSION} =~ ^([0-9]+\.[0-9]+\.[0-9]+[-rc]+[0-9]+)$ ]]; then
        incorrect_version_input
    else
        IS_RC=true
    fi
fi

########################################################################################################################
#
#  Main body
#
########################################################################################################################

echo "Your version is $VERSION"
echo "IS_RC: ${IS_RC}"

if ${IS_DRY_RUN}; then
  echo '##############################'
  echo '     IT IS A DRY RUN'
  echo '##############################'
fi

CHANGES=$(git diff --name-only)
if [ "$CHANGES" ] && [ ${IS_RC} == "false" ]; then
    echo
    echo 'ABORTED! Files not commited. Commit them (commit will be reseted for save commit number).'
    echo $CHANGES
    exit 1
fi
########################################################################################################################
#
#  Check target branch. `master` for release, `develop` for RC
#
########################################################################################################################

if [ ${IS_RC} == "true" ] &&  [ ! ${CURRENT_BRANCH} == 'develop' ]; then
    echo
    echo "FAILED: You shouldn't deploy the RC from non 'develop' branch!"
    exit 1
fi

if [ ${IS_RC} == "false" ] &&  [ ! ${CURRENT_BRANCH} == 'master' ]; then
    echo
    echo "FAILED: You shouldn't deploy the RELEASE from non 'master' branch!"
    exit 1
fi

########################################################################################################################
#
#  Get index.d.ts
#
########################################################################################################################

indexDTSurl="http://api.anychart.stg/si/v8/index.d.ts"
if $IS_RC; then indexDTSurl='http://api.anychart.stg/si/develop/index-develop.d.ts'; fi

echo
echo " -- Download ${indexDTSurl}"
run "curl ${indexDTSurl} -o ./dist/index.d.ts"

minimal_size=1000
actual_size=$(du -k ./dist/index.d.ts | cut -f 1)

if [[ $minimal_size -ge $actual_size ]]; then
    echo
    echo 'FAILED: index.d.ts is too small'
    exit 1
fi

########################################################################################################################
#
#  Change version
#
########################################################################################################################

echo
echo " -- Change version in files"
run "./build.py version -s ${VERSION}"

ALL_VERSIONS_IS_SET=$(python build.py version -v)
if [ ${IS_RC} = "true" ]; then ALL_VERSIONS_IS_SET=$(python build.py version -v); fi

if [ "${ALL_VERSIONS_IS_SET}" != "Ok" ]; then
    echo "Wrong version set in one of the project files, check them all!"
    echo ${ALL_VERSIONS_IS_SET}
    exit 1
fi

########################################################################################################################
#
#  Build binaries
#
########################################################################################################################

echo
echo " -- Build binaries"
run "sh ./bin/build_all_binaries.sh"



if [ ${IS_RC} = "true" ]; then
    ####################################################################################################################
    #
    #  Make RC release
    #
    ####################################################################################################################

    echo
    echo ' -- checkout new branch (for deploy to CDN over travis)'
    run "git checkout -b ${VERSION}"

    echo
    echo ' -- commit and push (travis make cdn)'
    run "git commit -am 'release ${VERSION}' && git push origin ${VERSION}"

    echo
    echo ' -- make npm release'
    run "sh ./bin/npm_release_preview.sh ${VERSION} true"

    echo
    echo " -- get back to 'develop' branch"
    run "git checkout -"

    echo
    echo " -- sleep 2 minutes before branch delete(travis issue)"
    run "sleep 2m"

    echo
    echo " -- delete branch from local and origin"
    run "git branch -D ${VERSION} && git push origin :${VERSION}"
else
    ####################################################################################################################
    #
    #  Make public release
    #
    ####################################################################################################################
    echo
    echo ' -- reset head (reset commit number for travis)'
    run "git reset HEAD~1"
    run "git add ."
    run "git commit -am 'Release ${VERSION}'"

    echo
    echo ' -- create tag'
    run "git tag v$VERSION"

    echo
    echo " -- push tags befor branch (travis' issue)"
    run "git push --tags"

    echo
    echo ' -- travis make release automaticaly'
    run "git push origin master"
fi
