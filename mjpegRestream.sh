#!/bin/bash

LIBCAMERA_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
     kill -9 "$LIBCAMERA_PID"
fi

WIDTH=""
HEIGHT=""
EXTRA_ARGS=""
while [[ $# -gt 0 ]]; do
    IN_ARGS="$1"
    if [ "$IN_ARGS" == "--width" ]; then 
        shift
        WIDTH=$1 
    elif [ "$IN_ARGS" == "--height" ]; then 
        shift
        HEIGHT=$1 
    fi
    shift
done

if [ "$WIDTH" != "" ]; then 
    if [ "$HEIGHT" != "" ]; then 
        EXTRA_ARGS="$EXTRA_ARGS -vf scale=$WIDTH:$HEIGHT"
    fi
fi

IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
ffmpeg -i "rtsp://$IP_ADDRESS:10000/stream1" \
    $EXTRA_ARGS -c:v mjpeg -q:v 1 -f mpjpeg -an -
