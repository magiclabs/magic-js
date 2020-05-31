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
  input=$(echo $(glob $1))
  npx nyc --reporter=lcov --reporter=text-summary ava $input
}

export NODE_ENV=test

case $PKG in
  "@magic-sdk/provider")
    setPackage provider
    runTests $1
    ;;

  "@magic-sdk/types")
    setPackage types
    runTests $1
    ;;

  "@magic-sdk/react-native")
    setPackage react-native
    runTests $1
    ;;

  "magic-sdk")
    setPackage web
    runTests $1
    ;;

  *)
    echo "Please specify the \$PKG variable before running tests."
    exit 1
    ;;
esac
