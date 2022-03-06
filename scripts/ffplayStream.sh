

ffplay -i "rtsp://192.168.50.100:10000/stream1" \
    -vf "setpts=N/30" -fflags nobuffer -flags low_delay -framedrop

