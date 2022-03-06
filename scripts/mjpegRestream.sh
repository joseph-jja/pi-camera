#!/bin/bash

LIBCAMERA_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
     kill -9 "$LIBCAMERA_PID"
fi

WIDTH=""
HEIGHT=""
FRAMERATE="-filter:v fps=10"
EXTRA_ARGS=""
BITRATE="-b:a 384000"
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
    elif [ "$IN_ARGS" == "--bitrate" ]; then
        shift
        BITRATE=$1
    fi
    shift
done

# set with and height
if [ "$WIDTH" != "" ]; then
    if [ "$HEIGHT" != "" ]; then
        EXTRA_ARGS="$EXTRA_ARGS -s $WIDTHx$HEIGHT"
    fi
fi

# rtsp connection
#$EXTRA_ARGS -vcodec libvpx -qmin 0 -qmax 50 -crf 10 -b:v 1M -an -
# -f mpjpeg
ffmpeg -t 30 -i "rtsp://127.0.0.1:10000/stream1" \
    $EXTRA_ARGS -c:v libx264 -q:v 5 -f h264 -an -
