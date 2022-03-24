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

# needs -o FILENAME.raw also -t 2000 - f
/usr/bin/libcamera-raw --nopreview \$EXTRA_ARGS
