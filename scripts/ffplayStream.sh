#! /bin/sh

IP_ADRESS="192.168.50.100"
if [ "$1" != "" ]; then
    IP_ADRESS="$1"
fi

ffplay -loglevel quiet -i "rtsp://$IP_ADRESS:10000/stream1" \
    -vf "setpts=N/30" -fflags nobuffer -flags low_delay -framedrop
