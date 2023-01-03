
I=0
for FILE in `ls *.mjpeg *.avi *.h264 *.ts *.yuv`; do 

    I=$((I+1))
    BASE=`echo $FILE | sed 's/.mjpeg//g' | sed 's/.avi//g' | sed 's/.h264//g' | sed 's/.ts//g' | sed 's/.yuv//g'  `
    #ffmpeg -i $FILE -r 60 images/$BASE-0$I-%4d.png
    ffmpeg -i $FILE -r 30 -c copy $BASE.mp4

done
