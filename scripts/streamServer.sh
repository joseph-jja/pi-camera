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
while [[ $# -gt 0 ]]; do
    IN_ARGS="$1"
    EXTRA_ARGS="$EXTRA_ARGS $IN_ARGS"
    shift
done

FRAMERATE=8
IS_FRAMERATE=false
for IN_ARG in $EXTRA_ARGS; do
    if [ "$IS_FRAMERATE" == "true" ]; then
        FRAMERATE=$IN_ARG
        IS_FRAMERATE=false
    elif [ "$IN_ARG" == "--framerate" ]; then
        IS_FRAMERATE=true
    fi
done

# use tcp and avoice vlc
IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
echo "Running script ... "
echo "IP Address: $IP_ADDRESS ..."
echo "Options: $EXTRA_ARGS ..."
#/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline --listen -o tcp://192.168.50.100:10000
/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | /usr/bin/cvlc \
    --no-audio stream:///dev/stdin --sout '#rtp{sdp=rtsp://127.0.0.1:10000/stream1}' :demux=h264
#/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | ffmpeg \
#    -i pipe: -f mpegts -listen 1 "http://127.0.0.1:10000/stream1"
