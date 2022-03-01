#!/bin/bash

LIBCAMERA_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
     kill -9 "$LIBCAMERA_PID"
fi

IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
ffmpeg -i "rtsp://$IP_ADDRESS:10000/stream1" \
    -c:v mjpeg -q:v 1 -f mpjpeg -an -
