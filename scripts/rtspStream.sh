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
    EXTRA_ARGS="$EXTRA_ARGS $1"
    shift
done

IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
echo "Runningscript ... IP Address: $IP_ADDRESS ..."
#/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | /usr/bin/cvlc \
#    stream:///dev/stdin --sout '#rtp{sdp=rtsp://:10000/stream1}' :demux=h264
/usr/bin/libcamera-vid $EXTRA_ARGS --nopreview -t 0 --inline -o - | ffmpeg \
    -i pipe: -rtsp_flags listen "rtsp://$IP_ADDRESS:10000/stream1"
