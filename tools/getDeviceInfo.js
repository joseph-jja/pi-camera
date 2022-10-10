const beautify = require('js-beautify');

const basedir = process.cwd(), 
    gstreamer = require(`${basedir}/libs/libcamera/gstreamer`);

gstreamer().then(results => {
    console.log(beautify(JSON.stringify(results)));
}).catch(err => {
    console.error(err);
});