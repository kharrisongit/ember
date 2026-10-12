#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION="${LDR_VERSION:-1.0.0}"
BUILD="${LDR_BUILD:-1}"
OUT="${LDR_OUTPUT:-$PWD/native/build}"
SDK=iphoneos
TARGET=arm64-apple-ios15.0
EXTRA=()
PREPARE=()
if [ "${1:-}" = "--simulator" ]; then
    SDK=iphonesimulator
    TARGET="$(uname -m)-apple-ios15.0-simulator"
    EXTRA=(-D DEBUG)
    PREPARE=(--simulator)
fi
APP="$OUT/Payload/Dragonrider.app"
mkdir -p "$APP"
python3 native/prepare.py "$APP" "$VERSION" "$BUILD" ${PREPARE[@]+"${PREPARE[@]}"}
swift native/make-icons.swift "$OUT/Payload/Assets.xcassets/AppIcon.appiconset"
xcrun --sdk "$SDK" swiftc -parse-as-library -swift-version 5 -O ${EXTRA[@]+"${EXTRA[@]}"} \
    -target "$TARGET" -sdk "$(xcrun --sdk "$SDK" --show-sdk-path)" \
    native/Sources/*.swift -o "$APP/Dragonrider"
xcrun ibtool --compile "$APP/LaunchScreen.storyboardc" native/Resources/LaunchScreen.storyboard \
    --target-device iphone --target-device ipad --minimum-deployment-target 15.0
xcrun actool "$OUT/Payload/Assets.xcassets" --compile "$APP" --platform "$SDK" \
    --minimum-deployment-target 15.0 --app-icon AppIcon --target-device iphone --target-device ipad \
    --output-partial-info-plist "$OUT/icon-info.plist" >/dev/null
python3 - "$APP/Info.plist" "$OUT/icon-info.plist" <<'PY'
import plistlib,sys,pathlib
p=pathlib.Path(sys.argv[1]);info=plistlib.loads(p.read_bytes())
info.update(plistlib.loads(pathlib.Path(sys.argv[2]).read_bytes()));p.write_bytes(plistlib.dumps(info))
PY
codesign --force --sign - "$APP"
cp "$OUT/Payload/Assets.xcassets/AppIcon.appiconset/icon-1024.png" "$OUT/dragonrider-icon.png"
if [ "$SDK" = iphoneos ]; then
    (cd "$OUT" && zip -qry LastDragonrider.ipa Payload/Dragonrider.app)
fi
