#! /bin/sh

FOREVER_LOG="/tmp/forever.log"

echo "Preview has started ..." >> /tmp/forever.log
# ffmpeg -i pipe: -an -filter_threads 1 -s 640x480 -qscale:v 10 -f mpeg2video -
ffmpeg -i pipe: -an -filter_threads 1 -s 640x480 -f mpjpeg -
