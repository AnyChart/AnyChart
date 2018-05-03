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

    Run "git clone $1 out/export-server"
    Run "cp out/anychart-bundle.min.js out/export-server/resources/js/anychart-bundle.min.js"
    Run "cd out/export-server"
    Run "lein uberjar"

    echo
    echo "-- Deploy export server"
    echo

    Run "git commit -am 'update anychart bundle'"
    Run "git push -u origin master"
    Run "cd ../../"

    echo
}

function build_export_server(){

    es_clone_and_build "https://github.com/AnyChart/export-server.git"

    Run "scp -i ~/.ssh/id_rsa out/export-server/target/export-server-standalone.jar $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/${VERSION}/anychart-export-server-${VERSION}.jar"
    Run "rm -rf out/export-server"

    es_clone_and_build "https://github.com/AnyChart/export-server-private.git"
    Run "rm -rf out/export-server"

    echo
}
