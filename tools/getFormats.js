const beautify = require('js-beautify');

const basedir = process.cwd(),
    gstreamerProcessor = require(`${basedir}/libs/libcamera/gstreamerProcessor`);

gstreamerProcessor().then(results => {
    console.log(beautify(JSON.stringify(results)));
}).catch(err => {
    console.error(err);
});