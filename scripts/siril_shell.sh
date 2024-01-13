#!/bin/bash
#
# get hisogram data files from a light frame
# looking at histogram is ideal
# sometimes histogram view is difficult
#
version=$(siril --version |awk '{print $2}')
ext=fits
FILE=$1
SCRIPT=/tmp/script.ssf

mkdir histoin
mkdir histoout

cp $FILE process/histo.fits
echo "requires $version" > $SCRIPT
echo "cd histoin" >> $SCRIPT
echo "convert histo -debayer -out=../histoout" >> $SCRIPT
echo "cd .." >> $SCRIPT
echo "load histoout/histo_00001.fit" >> $SCRIPT
echo "histo 0" >> $SCRIPT
echo "histo 1" >> $SCRIPT
echo "histo 2" >> $SCRIPT
echo "close" >> $SCRIPT

siril-cli -s $SCRIPT

rm $SCRIPT histoin/* histoout/*

# we now should have a histo_red.dat, histo_blue.dat, and histo_blue.dat
# now run node program 
node checkHist.js