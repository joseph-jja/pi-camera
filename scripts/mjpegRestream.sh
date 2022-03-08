#!/bin/bash

LIBCAMERA_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
     kill -9 "$LIBCAMERA_PID"
fi

IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`

# rtsp connection
# for preview we want to not overload the server
# no logs 1 thread, low res,
ffmpeg -loglevel quiet -filter_threads 1 \
    -i "rtsp://$IP_ADDRESS:10000/stream1" \
    -s 640x480 -filter:v fps=10 \
    -c:v mjpeg -q:v 1 -f mpjpeg -an -
