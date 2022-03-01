#!/bin/bash

LIBCAMERA_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
     kill -9 "$LIBCAMERA_PID"
fi

ffmpeg -i "rtsp://192.168.50.100:10000/stream1" \
    -vf "setpts=N/30" -fflags nobuffer -flags low_delay -framedrop \
    -c:v mjpeg -q:v 1 -f mpjpeg -an -
