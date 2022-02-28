#!/bin/bash

ffmpeg -i "rtsp://192.168.50.100:10000/channel=1&stream=0.sdp" -c:v mjpeg -q:v 1 -f mpjpeg -an -
