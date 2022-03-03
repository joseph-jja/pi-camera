#! /bin/sh

LIBCAMERA_PID=`ps -ef |grep libcamera-vid | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
    kill -9 "$LIBCAMERA_PID"
fi
VLC_PID=`ps -ef |grep vlc | grep -v grep | awk '{print $2}'`
if [ "$VLC_PID" != "" ] ; then
    kill -9 "$VLC_PID"
fi

EXTRA_ARGS=""
FRAMERATE=10
while [[ $# -gt 0 ]]; do
    IN_ARGS="$1"
    EXTRA_ARGS="$IN_ARGS $1"
    if [ "$IN_ARGS" == "--framerate" ]; then
        shift
        FRAMERATE=$1
        EXTRA_ARGS="$EXTRA_ARGS $FRAMERATE"
    fi
    shift
done

IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
echo "Running script ... IP Address: $IP_ADDRESS ..."
/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | /usr/bin/cvlc \
    --no-audio stream:///dev/stdin --sout '#rtp{sdp=rtsp://:10000/stream1}' :demux=h264
#/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | ffmpeg \
#    -i pipe: -f mpegts -listen 1 "http://127.0.0.1:10000/stream1"
