#! /bin/sh

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

/usr/bin/libcamera-vid --codec h264 $EXTRA_ARGS --nopreview -t 0 --inline -o - | /usr/bin/cvlc \
    --no-audio stream:///dev/stdin --sout '#rtp{sdp=rtsp://0.0.0.0:10000/stream1}' :demux=h264

#/usr/bin/libcamera-vid --codec mjpeg $EXTRA_ARGS --nopreview -t 0 --inline -o - | /usr/bin/cvlc \
#    --no-audio stream:///dev/stdin --sout '#rtp{sdp=rtsp://0.0.0.0:10000/stream1}' :demux=mpjpeg
