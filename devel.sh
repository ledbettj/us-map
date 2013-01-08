#!/usr/bin/env bash

BUILD_DIR="./public"

if [ -d "$BUILD_DIR" ]; then
  rm -rf "$BUILD_DIR";
fi

if [ ! -h "$BUILD_DIR" ]; then
  ln -s "./src" "$BUILD_DIR"
fi
