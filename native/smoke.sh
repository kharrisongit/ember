#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
LDR_OUTPUT="$PWD/native/simulator" native/build.sh --simulator
RUNTIME=$(xcrun simctl list runtimes -j | python3 -c 'import json,sys; r=[r for r in json.load(sys.stdin)["runtimes"] if r["isAvailable"] and r["name"].startswith("iOS")]; print(r[-1]["identifier"])')
DEVICE=$(xcrun simctl create DragonriderSmoke com.apple.CoreSimulator.SimDeviceType.iPhone-16 "$RUNTIME")
trap 'xcrun simctl shutdown "$DEVICE" >/dev/null 2>&1 || true; xcrun simctl delete "$DEVICE" >/dev/null 2>&1 || true' EXIT
xcrun simctl boot "$DEVICE"
xcrun simctl bootstatus "$DEVICE" -b
xcrun simctl install "$DEVICE" native/simulator/Payload/Dragonrider.app
CONTAINER=$(xcrun simctl get_app_container "$DEVICE" com.kharrison.lastdragonrider data)
for MODE in write read; do
    rm -f "$CONTAINER/Documents/NativeSmoke.json"
    xcrun simctl launch "$DEVICE" com.kharrison.lastdragonrider "--native-smoke-$MODE"
    for ((i=0;i<120;i++)); do
        [ -f "$CONTAINER/Documents/NativeSmoke.json" ] && break
        sleep 1
    done
    python3 - "$CONTAINER/Documents/NativeSmoke.json" <<'PY'
import json,sys
report=json.load(open(sys.argv[1]));print(report)
assert report['ok'] and report['native'] and report['scripts']>50, report
PY
    xcrun simctl io "$DEVICE" screenshot native/build/dragonrider-screenshot.png
    xcrun simctl terminate "$DEVICE" com.kharrison.lastdragonrider
 done
