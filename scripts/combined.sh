#! /bin/sh

LIBCAMERA_PID=`ps -ef |grep libcamera-vid | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
    kill -9 "$LIBCAMERA_PID"
fi
VLC_PID=`ps -ef |grep vlc | grep -v grep | awk '{print $2}'`
if [ "$VLC_PID" != "" ] ; then
    kill -9 "$VLC_PID"
fi
FFMPEG_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$FFMPEG_PID" != "" ] ; then
     kill -9 "$FFMPEG_PID"
fi

# all args for libcamera
LIBCAMERA_ARGS=""
while [[ $# -gt 0 ]]; do
    LIBCAMERA_ARGS="$LIBCAMERA_ARGS $1"
    shift
done

# now translate them for ffmpeg
WIDTH=""
HEIGHT=""
FRAMERATE=""
FFMPEG_ARGS=""
CODEC="-c:v mjpeg "
FNAME_CODEC="-f mpjpeg"
while [[ $# -gt 0 ]]; do
    IN_ARGS="$1"
    if [ "$IN_ARGS" == "--width" ]; then
        shift
        WIDTH=$1
    elif [ "$IN_ARGS" == "--height" ]; then
        shift
        HEIGHT=$1
    elif [ "$IN_ARGS" == "--framerate" ]; then
        shift
        FRAMERATE=$1
        FFMPEG_ARGS="$FFMPEG_ARGS fps=$FRAMERATE"
    elif [ "$IN_ARGS" == "--codec" ]; then
        shift
        CODEC_VALUE=$1
        if [ "$CODEC_VALUE" == "h264" ]; then
            #CODEC="-c:v libx264"
            #FNAME_CODEC="-f mp4"
        elif [ "$CODEC_VALUE" == "mjpeg" ]; then
            CODEC="-c:v mjpeg "
            FNAME_CODEC="-f mpjpeg"
        elif [ "$CODEC_VALUE" == "yuv420s" ]; then
            #CODEC=$1
            #FNAME_CODEC=$1
        fi
    fi
    shift
done

if [ "$WIDTH" != "" ]; then
    if [ "$HEIGHT" != "" ]; then
        FFMPEG_ARGS="$FFMPEG_ARGS -vf scale=$WIDTH:$HEIGHT"
    fi
fi

/usr/bin/libcamera-vid $LIBCAMERA_ARGS --nopreview -t 0 --inline -o - | ffmpeg \
    -i pipe: $FFMPEG_ARGS $CODEC -q:v 1 $FNAME_CODEC -an -
