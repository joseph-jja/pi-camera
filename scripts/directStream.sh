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
 
# use tcp and avoice vlc
IP_ADDRESS=`env |grep IP_ADDR | sed 's/IP_ADDR=//g'`
#echo "Running script ... "
#echo "IP Address: $IP_ADDRESS ..."
#echo "Options: $EXTRA_ARGS ..."

/usr/bin/libcamera-vid --codec mjpeg $EXTRA_ARGS --nopreview -t 0 --inline -o - |
    ffmpeg -i pipe: -an -filter_threads 1 -s 640x480 -filter:v fps=10 \
    -c:v mjpeg -q:v 1 -f mpjpeg -
