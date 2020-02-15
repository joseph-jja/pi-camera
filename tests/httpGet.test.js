const baseDir = process.cwd();

const httpGet = require(`${baseDir}/libs/httpGet`);

httpGet('www.google.com', '/')
    .then(res => {
        console.log(res);
    }).catch(e => {
        console.error(e);
    });