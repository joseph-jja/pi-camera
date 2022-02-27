#! /bin/sh

kill -9 `ps -ef |grep libcamera-vid | awk '{print $2}'`
kill -9 `ps -ef |grep vlc | awk '{print $2}'`

EXTRA_ARGS=""
while [[ $# -gt 0 ]]; do
    EXTRA_ARGS="$EXTRA_ARGS $1"
    shift
done
/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | cvlc \
    stream:///dev/stdin --sout '#rtp{sdp=rtsp://:10000/stream1}' :demux=h264
