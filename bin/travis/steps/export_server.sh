#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################

function es_clone_and_build(){

    echo "--"
    echo "Building and uploading export server: $1"
    echo "--"

    Run "git clone $1 out/export-server --depth 1"
    Run "get_export_server_version"
    Run "perl -pi -e 's,Bundle version \d.\d.\d,Bundle version ${VERSION},g' project.clj"
    Run "cp dist/js/anychart-bundle.min.js out/export-server/resources/js/anychart-bundle.min.js"
    Run "cd out/export-server"
    Run "lein uberjar"

    echo
    echo "-- Deploy export server"
    echo

    Run "git commit -am 'update anychart bundle ${VERSION}'"
    Run "git push -u origin master"
    Run "cd ../../"

    echo
}

function get_export_server_version(){
    if [ -z ${EXP_S_VERSION} ];
    then
        EXP_S_VERSION=$(cat project.clj \
        | grep defproject | head -1 | awk -F: '{ print $1 }' \
        | sed 's/[",\ta-z( ]//g')
    fi
}

function build_export_server(){

    es_clone_and_build "git@github.com:AnyChart/export-server.git"

    Run "scp -i ~/.ssh/id_rsa out/export-server/target/export-server-standalone.jar $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/${VERSION}/anychart-export-server-${VERSION}.jar"
    Run "scp -i ~/.ssh/id_rsa out/export-server/target/export-server-standalone.jar $STATIC_HOST_SSH_STRING:/apps/static/cdn/export-server/export-server{$EXP_S_VERSION}-bundle-${VERSION}.jar"
    Run "rm -rf out/export-server"

    es_clone_and_build "git@github.com:AnyChart/export-server-private.git"
    Run "rm -rf out/export-server"

    echo
}
