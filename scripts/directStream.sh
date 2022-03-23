#! /bin/sh

FOREVER_LOG="/tmp/forever.log"

/bin/bash $HOME/pi-camera/scripts/killall.sh

EXTRA_ARGS=""
while [[ $# -gt 0 ]]; do
    IN_ARGS="$1"
    EXTRA_ARGS="$EXTRA_ARGS $IN_ARGS"
    shift
done

# use tcp and avoice vlc
IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
echo "Running script ... " >> $FOREVER_LOG
echo "IP Address: $IP_ADDRESS ..." >> $FOREVER_LOG
echo "Options: $EXTRA_ARGS ..." >> $FOREVER_LOG

/usr/bin/libcamera-vid --codec mjpeg $EXTRA_ARGS --nopreview -t 0 --inline -o - |
    ffmpeg -i pipe: -an -filter_threads 1 -c:v copy -f mpjpeg -
