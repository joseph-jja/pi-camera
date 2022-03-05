#!/bin/bash

WIDTH=""
HEIGHT=""
FRAMERATE="-filter:v fps=10"
EXTRA_ARGS=""
FILENAME="/tmp/capture.mjpeg"
TIMEOUT=15
while [[ $# -gt 0 ]]; do
    IN_ARGS="$1"
    if [ "$IN_ARGS" == "--width" ]; then
        shift
        WIDTH=$1
    elif [ "$IN_ARGS" == "--height" ]; then
        shift
        HEIGHT=$1
    elif [ "$IN_ARGS" == "--framerate" ]; then
        shift
        FRAMERATE=$1
        EXTRA_ARGS="$EXTRA_ARGS -filter:v fps=$FRAMERATE"
    elif [ "$IN_ARGS" == "--filename" ]; then
        shift
        FILENAME="$1"
    elif [ "$IN_ARGS" == "--timeout" ]; then
        shift
        TIMEOUT=$1
    fi
    shift
done

echo "Timeout: $TIMEOUT"
echo "Args: $EXTRA_ARGS"
echo "Filename: $FILENAME"
ffmpeg -y  -t $TIMEOUT -i tcp://127.0.0.1:10000 \
    $EXTRA_ARGS -c:v mjpeg -q:v 1 -f mpjpeg -an "$FILENAME"
