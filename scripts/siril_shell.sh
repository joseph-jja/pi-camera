#!/bin/bash
#
#  resample a file
#  used to resample bin 2x2 to 1x1
#  useful for lrgb with l in 1x1 and rgb in 2x2
#
version=$(siril --version |awk '{print $2}')
ext=fits

siril-cli -i ~/.siril/siril.cfg -s - <<ENDSIRIL >/dev/null 2>&1
requires $version
setext $ext
load $1
resample 2.0
save $1
close
ENDSIRIL
