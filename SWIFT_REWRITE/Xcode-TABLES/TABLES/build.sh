#!/bin/bash

rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/TABLES-*
xcodebuild build \
  -project TABLES.xcodeproj \
  -scheme TABLES \
  -destination 'platform=macOS' \
  MACOSX_DEPLOYMENT_TARGET=12.0 \
  -derivedDataPath build/ \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_ENTITLEMENTS=""
