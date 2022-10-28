

# $1 is size like 1920x1080
# $2 is input file xxx without file extension
# $3 is framerate
ffmpeg -f rawvideo -vcodec rawvideo -s $1 -r $3 -pix_fmt yuv420p -i $2.yuv -c:v libx264 -preset ultrafast -qp 0 $2.mp4

