#!/bin/bash

LIBCAMERA_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
     kill -9 "$LIBCAMERA_PID"
fi

WIDTH=""
HEIGHT=""
FRAMERATE="-filter:v fps=10"
EXTRA_ARGS=""
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
    fi
    shift
done

#if [ "$WIDTH" != "" ]; then
    #if [ "$HEIGHT" != "" ]; then
        #EXTRA_ARGS="$EXTRA_ARGS -vf scale=$WIDTH:$HEIGHT"
    #fi
#fi

# tcp connection
ffmpeg -t 15 -i "rtsp://127.0.0.1:10000/stream1" \
    $EXTRA_ARGS -c:v mjpeg -q:v 1 -f mpjpeg -an -
