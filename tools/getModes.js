const beautify = require('js-beautify');

const basedir = process.cwd(),
    getModes = require(`${basedir}/libs/libcamera/modes`);

getModes().then(results => {
    console.log(beautify(JSON.stringify(results)));
}).catch(err => {
    console.error(err);
});