#! /bin/sh

IP_ADDRESS=`echo $IP_ADDR`
if [ "$IP_ADDRESS" == "" ]; then
    echo "IP Address IP_ADDR not set, exiting!"
    exit -1
fi

#ffplay -i "rtsp://$IP_ADDRESS:10000/stream1" \
ffplay -loglevel quiet -i "rtsp://$IP_ADDRESS:10000/stream1" \
    -an  \
    -vf "setpts=N/8" -fflags nobuffer -flags low_delay -framedrop
