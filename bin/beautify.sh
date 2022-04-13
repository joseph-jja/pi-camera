#! /bin/sh

npx js-beautify -r *.js

find ./ -type f -name 'libs/*' -exec npx js-beautify -r {} \;
find ./ -type f -name 'xhrActions/*' -exec npx js-beautify -r {} \;
