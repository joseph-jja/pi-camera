#! /bin/sh

FOREVER_LOG="/tmp/forever.log"

#/bin/bash $HOME/pi-camera/scripts/killall.sh

# use tcp and avoice vlc
IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
echo "Running script ... " >> $FOREVER_LOG
echo "IP Address: $IP_ADDRESS ..." >> $FOREVER_LOG
echo "Options: $EXTRA_ARGS ..." >> $FOREVER_LOG

fmpeg -i "$1" -o "$1.mp4"
