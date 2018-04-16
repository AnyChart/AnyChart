#!/usr/bin/env bash

########################################################################################################################
#
# Define functions for Travis Build Script
#
########################################################################################################################


function build_export_server(){
    echo "--"
    echo Building and uploading export server
    echo "--"

    Run "git clone https://github.com/AnyChart/export-server.git out/export-server"
    Run "cp out/anychart-bundle.min.js out/export-server/resources/js/anychart-bundle.min.js"
    Run "cd out/export-server"
    Run "lein uberjar"
    Run "cd ../../"
    Run "scp -i ~/.ssh/id_rsa out/export-server/target/export-server-standalone.jar $STATIC_HOST_SSH_STRING:/apps/static/cdn/releases/${VERSION}/anychart-export-server-${VERSION}.jar"
    Run "rm -rf out/export-server"
    echo
}

