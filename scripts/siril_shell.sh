#!/bin/bash
#
#  resample a file
#  used to resample bin 2x2 to 1x1
#  useful for lrgb with l in 1x1 and rgb in 2x2
#
version=$(siril --version |awk '{print $2}')
ext=fits
FILE=$1
SCRIPT=/tmp/script.ssf

mkdir process
mkdir out
cp $FILE process/histo.fits
echo "requires $version" > $SCRIPT
echo "cd process" >> $SCRIPT
echo "convert histo -debayer -out=../out" >> $SCRIPT
echo "cd .." >> $SCRIPT
echo "load out/histo_00001.fit" >> $SCRIPT
echo "histo 0" >> $SCRIPT
echo "histo 1" >> $SCRIPT
echo "histo 2" >> $SCRIPT
echo "close" >> $SCRIPT

siril-cli -s $SCRIPT

rm $SCRIPT process/* out/*
