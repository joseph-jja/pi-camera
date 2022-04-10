#! /bin/sh

npx js-beautify -r *.js

find ./ -type f -name 'libs/*.js' -exec npx js-beautify -r {} \;
find ./ -type f -name 'xhrActions/*.js' -exec npx js-beautify -r {} \;
