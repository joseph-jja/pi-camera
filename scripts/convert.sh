
I=0
for FILE in `ls *.mjpeg`; do 

    I=$((I+1))
    BASE=`echo $FILE | sed 's/.mjpeg//g' `
    #ffmpeg -i $FILE -r 60 images/$BASE-0$I-%4d.png
    ffmpeg -i $BASE.mjpeg -r 30 -c copy $BASE.mp4

done
