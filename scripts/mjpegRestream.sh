#!/bin/bash

/bin/bash $HOME/pi-camera/scripts/killall.sh

IP_ADDRESS=`echo $IP_ADDR`
if [ "$IP_ADDRESS" == "" ]; then
    echo "IP Address IP_ADDR not set, exiting!"
    exit -1
fi

# rtsp connection
# for preview we want to not overload the server
# no logs 1 thread, low res,
ffmpeg -loglevel quiet -filter_threads 1 \
    -i "rtsp://$IP_ADDRESS:10000/stream1" \
    -s 640x480 -filter:v fps=10 \
    -c:v mjpeg -q:v 1 -f mpjpeg -an -
//    -c:v libvpx-vp9 -q:v 1 -f webm -an -
