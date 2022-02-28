#! /bin/sh

LIBCAMERA_PID=`ps -ef |grep libcamera-vid | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" } ; then 
    kill -9 "$LIBCAMERA_PID"
fi
VLC_PID=`ps -ef |grep vlc | awk '{print $2}'`
if [ "$VLC_PID" != "" } ; then 
    kill -9 "$VLC_PID"
fi

EXTRA_ARGS=""
while [[ $# -gt 0 ]]; do
    EXTRA_ARGS="$EXTRA_ARGS $1"
    shift
done
echo 'running script...'
/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | /usr/bin/cvlc \
    stream:///dev/stdin --sout '#rtp{sdp=rtsp://:10000/stream1}' :demux=h264
