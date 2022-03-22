#! /bin/sh

LIBCAMERA_PID=`ps -ef |grep libcamera-vid | grep -v grep | awk '{print $2}'`
if [ "$LIBCAMERA_PID" != "" ] ; then
    kill -9 $LIBCAMERA_PID
fi
VLC_PID=`ps -ef |grep vlc | grep -v grep | awk '{print $2}'`
if [ "$VLC_PID" != "" ] ; then
    kill -9 $VLC_PID
fi
FFMPPEG_PID=`ps -ef |grep ffmpeg | grep -v grep | awk '{print $2}'`
if [ "$FFMPPEG_PID" != "" ] ; then
    kill -9 $FFMPPEG_PID
fi
