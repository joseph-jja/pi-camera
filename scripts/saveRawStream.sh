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
echo "Running script ... "
echo "IP Address: $IP_ADDRESS ..."
echo "Options: $EXTRA_ARGS ..."

# needs -o FILENAME.raw at a minimum
# we will use 30000 for 30 seconds of data at a time 
/usr/bin/libcamera-raw --nopreview -t 30000 $EXTRA_ARGS
