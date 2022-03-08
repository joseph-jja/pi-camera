#!/bin/bash

NOW=`date +%Y%m%d%M%H%M%S`

WIDTH=""
HEIGHT=""
FRAMERATE="-filter:v fps=10"
EXTRA_ARGS=""
FILENAME="$HOME/images/capture-$NOW.mjpeg"
TIMEOUT=30
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

if [ "$WIDTH" != "" ]; then
    if [ "$HEIGHT" != "" ]; then
        SIZE=`echo "$WIDTH:$HEIGHT" | sed 's/\:/x/'`
        EXTRA_ARGS="$EXTRA_ARGS -s $SIZE"
    fi
fi

IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`

echo "Timeout: $TIMEOUT"
echo "Args: $EXTRA_ARGS"
echo "Filename: $FILENAME"
ffmpeg -y  -t $TIMEOUT -i "rtsp://$IP_ADDRESS:10000/stream1" \
    $EXTRA_ARGS -c:v mjpeg -q:v 1 -f mpjpeg -an "$FILENAME"
