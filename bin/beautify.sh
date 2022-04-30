#! /bin/sh

npx js-beautify -r *.js

npx js-beautify -r js/*.js
npx js-beautify -r libs/*.js
npx js-beautify -r xhrActions/*.js
