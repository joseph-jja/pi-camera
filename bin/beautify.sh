#! /bin/sh

find ./ -depth 1 -name '*.js' -exec npx js-beautify -r {} \;
find ./ -depth 1 -name 'ijs/*.js' -exec npx js-beautify -r {} \;
