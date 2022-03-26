#! /bin/sh
 
FOREVER_LOG="/tmp/forever.log"

ffmpeg -i pipe: -an -filter_threads 1 -s 640x480 -f mpjpeg -

