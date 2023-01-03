

for FILE in `ls *.mjpeg *.avi *.h264 *.ts *.yuv`; do 

    ffplay -autoexit -t 5 $FILE
done
