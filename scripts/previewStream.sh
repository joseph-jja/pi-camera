#! /bin/sh
 
FOREVER_LOG="/tmp/forever.log"

ffmpeg -i pipe: -an -filter_threads 1 -c:v copy -s 640x480 -f mpjpeg -

