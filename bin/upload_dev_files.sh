git rev-parse HEAD >> ./out/commit-hash.txt
cp ./bin/binaries_wrapper_end.txt ./out/binaries_wrapper_end.txt
cp ./bin/binaries_wrapper_start.txt ./out/binaries_wrapper_start.txt
cd ./out/
zip -r upload.zip *
ssh $STATIC_HOST_SSH_STRING "mkdir -p /apps/static/js/$TRAVIS_BRANCH/parts && mkdir -p /apps/static/css/$TRAVIS_BRANCH"
scp upload.zip $STATIC_HOST_SSH_STRING:/apps/static/js/$TRAVIS_BRANCH/upload.zip
ssh $STATIC_HOST_SSH_STRING "unzip -o /apps/static/js/$TRAVIS_BRANCH/upload.zip -d /apps/static/js/$TRAVIS_BRANCH/ && mv /apps/static/js/$TRAVIS_BRANCH/*.css /apps/static/css/$TRAVIS_BRANCH/"
curl -X POST $TESTS_HOST/ci_test --data "branch=$TRAVIS_BRANCH&commit=$TRAVIS_COMMIT"