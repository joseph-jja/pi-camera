#!/bin/bash
#
#  resample a file
#  used to resample bin 2x2 to 1x1
#  useful for lrgb with l in 1x1 and rgb in 2x2
#
version="1.2.1" #$(siril-cli --version |awk '{print $2}')
ext=fit
FILE=$1
SCRIPT=crop_script.ssf

CROP_AMOUNT=10
DOUBLE_CROP_AMOUNT=`expr 2 \* $CROP_AMOUNT`
WIDTH=1936
HEIGHT=1096
DRIZZLE_WIDTH=`expr $WIDTH \* 2`
DRIZZLE_HEIGHT=`expr $HEIGHT \* 2`

CROP_WIDTH=`expr $WIDTH - $DOUBLE_CROP_AMOUNT`
CROP_HEIGHT=`expr $HEIGHT - $DOUBLE_CROP_AMOUNT`
DRIZZLE_CROP_WIDTH=`expr $DRIZZLE_WIDTH - $DOUBLE_CROP_AMOUNT`
DRIZZLE_CROP_HEIGHT=`expr $DRIZZLE_HEIGHT - $DOUBLE_CROP_AMOUNT`

echo "requires $version" > $SCRIPT

# 1936x1096
for FILE in `ls *_stacked.fit`; do 
    CROP_FILE=`echo $FILE | sed 's/\.fit/-cropped.fit/'` 
    cp $FILE $CROP_FILE
    echo $CROP_FILE
    echo "load $CROP_FILE" >> $SCRIPT
    echo "crop $CROP_AMOUNT $CROP_AMOUNT $CROP_WIDTH $CROP_HEIGHT" >> $SCRIPT
    echo "save $CROP_FILE" >> $SCRIPT
done

# 3872x2192
for FILE in `ls *_stacked_drizzle*.fit`; do 
    CROP_FILE=`echo $FILE | sed 's/\.fit/-cropped.fit/'` 
    cp $FILE $CROP_FILE
    echo $CROP_FILE
    echo "load $CROP_FILE" >> $SCRIPT
    echo "crop $CROP_AMOUNT $CROP_AMOUNT $DRIZZLE_CROP_WIDTH $DRIZZLE_CROP_HEIGHT" >> $SCRIPT
    echo "save $CROP_FILE" >> $SCRIPT
done


# 1936x1096

#siril-cli -s $SCRIPT
#rm $SCRIPT

