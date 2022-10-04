#! /bin/bash

ffmpeg -i $1 -ss 00:00:00 -t 00:00:$2 -r 30 -c copy $1.mjpeg
mv $1.mjpeg $1
