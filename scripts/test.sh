#!/usr/bin/env bash

echo
echo "Running unit tests..."
echo

glob() {
  ../../scripts/glob.js $1
}

setPackage() {
  cd ./packages/$1
  export TS_NODE_PROJECT="./test/tsconfig.json"
}

runTests() {
  setPackage $1
  input=$(echo $(glob $2))
  npx nyc --reporter=lcov --reporter=text-summary ava $input
  cd ../.. # Return to the original working directory
}

export NODE_ENV=test

case $PKG in
  "@magic-sdk/provider")
    runTests provider $1
    ;;

  "@magic-sdk/types")
    runTests types $1
    ;;

  "@magic-sdk/react-native")
    runTests react-native $1
    ;;

  "magic-sdk")
    runTests web $1
    ;;

  *)
    runTests provider $1
    runTests types $1
    runTests react-native $1
    runTests web $1
    ;;
esac
