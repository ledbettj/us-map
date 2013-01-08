#!/usr/bin/env bash
BUILD_DIR="./public"

if [ -h "$BUILD_DIR" ]; then
  rm "$BUILD_DIR"
elif [ -d "$BUILD_DIR" ]; then
  rm -rf "$BUILD_DIR";
fi

r.js -o ./app.build.js
