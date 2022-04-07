#! /bin/sh

FOREVER_LOG="/tmp/forever.log"

/bin/bash $HOME/pi-camera/scripts/killall.sh

EXTRA_ARGS=""
while [[ $# -gt 0 ]]; do
    IN_ARGS="$1"
    EXTRA_ARGS="$EXTRA_ARGS $IN_ARGS"
    shift
done

#while $EXTRA_ARGS; do
#    if [ "$OPT" == "--framerate" ]; then
#
#        shift
#    else
#done

# use tcp and avoice vlc
IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
echo "Running script ... " >> $FOREVER_LOG
echo "IP Address: $IP_ADDRESS ..." >> $FOREVER_LOG
echo "Options: $EXTRA_ARGS ..." >> $FOREVER_LOG

/usr/bin/libcamera-still -e jpg $EXTRA_ARGS -t 0 --timelapse 10 --immediate -o -
# |
#    ffmpeg -i pipe: -an -filter_threads 1 -c:v copy -f mpjpeg -
